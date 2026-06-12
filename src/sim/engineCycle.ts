/**
 * Crank-angle-resolved engine cycle model (combustion + torque + stress).
 *
 * Per-degree first-law integration of cylinder pressure over the full
 * 720-degree four-stroke cycle: polytropic compression/expansion with a Wiebe
 * heat-release during combustion, intake at charge-cooled manifold pressure,
 * blowdown to back pressure at EVO. Instantaneous torque comes from
 * slider-crank kinematics summed over the active engine's firing order.
 */
import type { EngineDefinition } from '../engines/types'
import { computeFlow } from './flow'

const LHV = 43e6 // J/kg gasoline
const rad = (d: number) => (d * Math.PI) / 180

function pistonX(thetaDeg: number, rCrank: number, rodM: number) {
  const th = rad(thetaDeg)
  const s = rCrank * Math.sin(th)
  return rCrank * (1 - Math.cos(th)) + rodM - Math.sqrt(rodM * rodM - s * s)
}

function cylVolume(thetaDeg: number, vClear: number, aPiston: number, rCrank: number, rodM: number) {
  return vClear + aPiston * pistonX(thetaDeg, rCrank, rodM)
}

function dxdTheta(thetaDeg: number, rCrank: number, rodM: number) {
  const th = rad(thetaDeg)
  const s = rCrank * Math.sin(th)
  return rCrank * Math.sin(th) + (rCrank * rCrank * Math.sin(th) * Math.cos(th)) / Math.sqrt(rodM * rodM - s * s)
}

const wiebe = (x: number) => 1 - Math.exp(-5 * Math.pow(Math.min(Math.max(x, 0), 1), 3))

export interface CycleResult {
  pBar: Float32Array
  vCc: Float32Array
  torque: Float32Array
  imepBar: number
  peakBar: number
  peakDeg: number
  sparkBtdc: number
  burnDeg: number
  fuelMgCyl: number
  meanIndTorqueNm: number
  brakeTorqueNm: number
  peakTorqueNm: number
  minTorqueNm: number
  powerKw: number
  gasForceKn: number
  inertiaForceKn: number
  rodForceKn: number
  rodBearingMpa: number
  partUtil: Record<string, number>
}

export function computeCycle(engine: EngineDefinition, rpm: number, load: number): CycleResult {
  const flow = computeFlow(engine, { rpm, throttle: load })
  const c = engine.cycle
  const aPiston = (Math.PI / 4) * c.boreM * c.boreM
  const rCrank = c.strokeM / 2
  const vDisp = aPiston * c.strokeM
  const vClear = vDisp / (c.compressionRatio - 1)

  const mapPa = flow.mapBar * 1e5
  const exhPa = (1.08 + flow.boostBar * 0.35) * 1e5
  const sparkBtdc = 10 + 18 * (1 - load)
  const spark = -sparkBtdc
  const burnDeg = 42 + 14 * (1 - load)
  const fuelKgCyl = flow.fuelGs / 1000 / (rpm / 120) / c.cylinders
  const qTotal = fuelKgCyl * LHV * 0.74

  const pBar = new Float32Array(721)
  const vCc = new Float32Array(721)
  let p = mapPa
  let xbPrev = 0
  let imepJ = 0
  let peakPa = 0
  let peakDeg = 0

  for (let deg = -360; deg <= 360; deg++) {
    const i = deg + 360
    const v = cylVolume(deg, vClear, aPiston, rCrank, c.rodM)
    vCc[i] = v * 1e6
    if (deg < -180) {
      p = mapPa
    } else if (deg <= 180) {
      const dV = cylVolume(deg + 1, vClear, aPiston, rCrank, c.rodM) - v
      const gamma = deg < 0 ? 1.32 : 1.28
      let dQ = 0
      if (deg >= spark) {
        const xb = wiebe((deg - spark) / burnDeg)
        dQ = qTotal * (xb - xbPrev)
        xbPrev = xb
      }
      p += (-(gamma * p) / v) * dV + ((gamma - 1) / v) * dQ
      if (deg >= 140) p += (exhPa - p) * 0.1
      p = Math.max(p, 0.2e5)
    } else {
      p = exhPa
    }
    pBar[i] = p / 1e5
    if (deg >= -180 && deg < 360) {
      imepJ += (p - 1e5) * (cylVolume(deg + 1, vClear, aPiston, rCrank, c.rodM) - v)
    }
    if (p > peakPa) {
      peakPa = p
      peakDeg = deg
    }
  }
  for (let deg = -360; deg < -180; deg++) {
    imepJ += (mapPa - 1e5) * (
      cylVolume(deg + 1, vClear, aPiston, rCrank, c.rodM) -
      cylVolume(deg, vClear, aPiston, rCrank, c.rodM)
    )
  }
  const imepBar = imepJ / vDisp / 1e5

  const tCyl = new Float32Array(720)
  for (let i = 0; i < 720; i++) {
    const pIdx = (i + 360) % 720
    const degRel = i < 360 ? i : i - 720
    tCyl[i] = (pBar[pIdx === 720 ? 720 : pIdx] * 1e5 - 1e5) * aPiston * dxdTheta(degRel, rCrank, c.rodM)
  }

  const torque = new Float32Array(720)
  let sum = 0
  let peakT = -Infinity
  let minT = Infinity
  for (let deg = 0; deg < 720; deg++) {
    let t = 0
    for (let cyl = 0; cyl < c.cylinders; cyl++) {
      t += tCyl[(deg - engine.geometry.fireDeg[cyl] + 1440) % 720]
    }
    torque[deg] = t
    sum += t
    if (t > peakT) peakT = t
    if (t < minT) minT = t
  }
  const meanIndTorqueNm = sum / 720
  const fmepBar = c.fmep.baseBar + c.fmep.rpmBar * (rpm / c.redlineRpm) + c.fmep.loadBar * load
  const brakeTorqueNm = Math.max(0, meanIndTorqueNm * (1 - fmepBar / Math.max(imepBar, 1)))
  const omega = (rpm * 2 * Math.PI) / 60
  const powerKw = (brakeTorqueNm * omega) / 1000

  const gasForceN = (peakPa - 1e5) * aPiston
  const lambda = rCrank / c.rodM
  const inertiaN = c.recipMassKg * omega * omega * rCrank * (1 + lambda)
  const rodForceN = Math.max(gasForceN - inertiaN * 0.85, inertiaN)
  const rodBearingMpa = rodForceN / (0.052 * 0.024) / 1e6
  const partUtil = engine.partUtil({
    rpm,
    load,
    peakBar: peakPa / 1e5,
    gasForceN,
    peakTorqueNm: peakT,
    flow,
    redline: c.redlineRpm,
  })

  return {
    pBar,
    vCc,
    torque,
    imepBar,
    peakBar: peakPa / 1e5,
    peakDeg,
    sparkBtdc,
    burnDeg,
    fuelMgCyl: fuelKgCyl * 1e6,
    meanIndTorqueNm,
    brakeTorqueNm,
    peakTorqueNm: peakT,
    minTorqueNm: minT,
    powerKw,
    gasForceKn: gasForceN / 1000,
    inertiaForceKn: inertiaN / 1000,
    rodForceKn: rodForceN / 1000,
    rodBearingMpa,
    partUtil,
  }
}

let cacheKey = ''
let cacheVal: CycleResult | null = null
export function getCycle(engine: EngineDefinition, rpm: number, load: number): CycleResult {
  const key = `${engine.meta.id}|${rpm}|${load}`
  if (key !== cacheKey) {
    cacheKey = key
    cacheVal = computeCycle(engine, rpm, load)
  }
  return cacheVal!
}

export const simClock = { thetaDeg: 0 }
