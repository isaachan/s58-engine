/**
 * Crank-angle-resolved engine cycle model (combustion + torque + stress).
 *
 * Per-degree first-law integration of cylinder pressure over the full
 * 720° four-stroke cycle: polytropic compression/expansion with a Wiebe
 * heat-release during combustion, intake at charge-cooled manifold
 * pressure, blowdown to back pressure at EVO. Instantaneous torque comes
 * from slider-crank kinematics summed over all six cylinders with the
 * real S58 firing order (1-5-3-6-2-4). Reciprocating inertia torque is
 * neglected (documented simplification); component stress is reported as
 * utilization of representative design allowables.
 */
import { computeFlow } from './flow'

/* S58 geometry (SI) */
const BORE = 0.084
const STROKE = 0.09
const ROD = 0.144
const CR = 9.3
const A_PISTON = (Math.PI / 4) * BORE * BORE // m²
const R_CRANK = STROKE / 2
const V_DISP = A_PISTON * STROKE // m³ per cylinder
const V_CLEAR = V_DISP / (CR - 1)
const LHV = 43e6 // J/kg gasoline
const M_RECIP = 0.62 // kg piston + pin + small-end share

/** crank pin phase per cylinder (deg) — gives firing order 1-5-3-6-2-4 */
export const PIN_ANGLES = [0, 240, 120, 120, 240, 0]
/** firing TDC of each cylinder within the 720° cycle (deg) */
export const FIRE_DEG = [0, 480, 240, 600, 120, 360]

const rad = (d: number) => (d * Math.PI) / 180

/** piston travel from TDC [m] at crank angle θ from that cylinder's TDC */
function pistonX(thetaDeg: number) {
  const th = rad(thetaDeg)
  const s = R_CRANK * Math.sin(th)
  return R_CRANK * (1 - Math.cos(th)) + ROD - Math.sqrt(ROD * ROD - s * s)
}

function cylVolume(thetaDeg: number) {
  return V_CLEAR + A_PISTON * pistonX(thetaDeg)
}

/** dx/dθ [m/rad] — torque arm of the slider-crank */
function dxdTheta(thetaDeg: number) {
  const th = rad(thetaDeg)
  const s = R_CRANK * Math.sin(th)
  return R_CRANK * Math.sin(th) + (R_CRANK * R_CRANK * Math.sin(th) * Math.cos(th)) / Math.sqrt(ROD * ROD - s * s)
}

const wiebe = (x: number) => 1 - Math.exp(-5 * Math.pow(Math.min(Math.max(x, 0), 1), 3))

export interface CycleResult {
  /** cylinder pressure [bar], index = θ+360 for θ ∈ [-360, 360] from firing TDC */
  pBar: Float32Array
  /** cylinder volume [cc], same indexing */
  vCc: Float32Array
  /** total instantaneous crank torque [N·m], index = crank deg 0..719 of the cycle */
  torque: Float32Array
  imepBar: number
  peakBar: number
  peakDeg: number // ATDC
  sparkBtdc: number
  burnDeg: number
  fuelMgCyl: number
  meanIndTorqueNm: number
  brakeTorqueNm: number
  peakTorqueNm: number
  minTorqueNm: number
  powerKw: number
  // stress readouts
  gasForceKn: number
  inertiaForceKn: number
  rodForceKn: number
  rodBearingMpa: number
  /** 0..1+ utilization of design allowable per part id */
  partUtil: Record<string, number>
}

export function computeCycle(rpm: number, load: number): CycleResult {
  const flow = computeFlow({ rpm, throttle: load })
  const mapPa = flow.mapBar * 1e5
  const exhPa = (1.08 + flow.boostBar * 0.35) * 1e5
  const sparkBtdc = 10 + 18 * (1 - load) // more advance at part load
  const spark = -sparkBtdc
  const burnDeg = 42 + 14 * (1 - load)
  const fuelKgCyl = flow.fuelGs / 1000 / (rpm / 120) / 6 // per cylinder per cycle
  // combustion efficiency × closed-cycle wall heat losses (lumped knockdown)
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
    const v = cylVolume(deg)
    vCc[i] = v * 1e6
    if (deg < -180) {
      p = mapPa // intake stroke
    } else if (deg <= 180) {
      // closed cycle: compression, burn, expansion, blowdown
      const dV = cylVolume(deg + 1) - v
      const gamma = deg < 0 ? 1.32 : 1.28
      let dQ = 0
      if (deg >= spark) {
        const xb = wiebe((deg - spark) / burnDeg)
        dQ = qTotal * (xb - xbPrev)
        xbPrev = xb
      }
      p += (-(gamma * p) / v) * dV + ((gamma - 1) / v) * dQ
      if (deg >= 140) p += (exhPa - p) * 0.1 // EVO blowdown
      p = Math.max(p, 0.2e5)
    } else {
      p = exhPa // exhaust stroke
    }
    pBar[i] = p / 1e5
    if (deg >= -180 && deg < 360) imepJ += (p - 1e5) * (cylVolume(deg + 1) - v)
    if (p > peakPa) {
      peakPa = p
      peakDeg = deg
    }
  }
  // include intake stroke pumping at MAP
  for (let deg = -360; deg < -180; deg++) {
    imepJ += (mapPa - 1e5) * (cylVolume(deg + 1) - cylVolume(deg))
  }
  const imepBar = imepJ / V_DISP / 1e5

  /* single-cylinder torque over its own 720° cycle (0 = firing TDC) */
  const tCyl = new Float32Array(720)
  for (let c = 0; c < 720; c++) {
    const pIdx = (c + 360) % 720 // map cycle position → pressure index
    const degRel = c < 360 ? c : c - 720
    tCyl[c] = (pBar[pIdx === 720 ? 720 : pIdx] * 1e5 - 1e5) * A_PISTON * dxdTheta(degRel)
  }
  /* superpose six cylinders */
  const torque = new Float32Array(720)
  let sum = 0
  let peakT = -Infinity
  let minT = Infinity
  for (let deg = 0; deg < 720; deg++) {
    let t = 0
    for (let cyl = 0; cyl < 6; cyl++) {
      t += tCyl[(deg - FIRE_DEG[cyl] + 1440) % 720]
    }
    torque[deg] = t
    sum += t
    if (t > peakT) peakT = t
    if (t < minT) minT = t
  }
  const meanIndTorqueNm = sum / 720
  const fmepBar = 0.35 + 1.15 * (rpm / 7200) + 0.15 * load
  const brakeTorqueNm = Math.max(0, meanIndTorqueNm * (1 - fmepBar / Math.max(imepBar, 1)))
  const omega = (rpm * 2 * Math.PI) / 60
  const powerKw = (brakeTorqueNm * omega) / 1000

  /* component loads */
  const gasForceN = (peakPa - 1e5) * A_PISTON
  const lambda = R_CRANK / ROD
  const inertiaN = M_RECIP * omega * omega * R_CRANK * (1 + lambda)
  const rodForceN = Math.max(gasForceN - inertiaN * 0.85, inertiaN) // fired TDC vs overlap TDC
  const rodBearingMpa = rodForceN / (0.052 * 0.024) / 1e6

  const partUtil: Record<string, number> = {
    'cylinder-block': peakPa / 1e5 / 170,
    'cylinder-head': gasForceN / 150e3,
    crankshaft: peakT / 2600,
    'harmonic-damper': (rpm / 7200) * 0.55 + load * 0.1,
    'timing-chain': (rpm / 7200) * 0.5 + load * 0.15,
    'camshaft-intake': (rpm / 7200) * 0.35 + load * 0.2,
    'camshaft-exhaust': (rpm / 7200) * 0.35 + load * 0.25,
    'vanos-unit': 0.25 + load * 0.15,
    'valve-cover': 0.06,
    'timing-cover': 0.06,
    'intake-manifold': flow.boostBar / 2.4 + 0.08,
    'throttle-body': flow.boostBar / 2.6 + 0.08,
    'turbo-front': flow.exhaustTempC / 1000,
    'turbo-rear': flow.exhaustTempC / 1000,
    'exhaust-manifold-front': flow.exhaustTempC / 1060,
    'exhaust-manifold-rear': flow.exhaustTempC / 1060,
    'fuel-rail': 0.2 + load * 0.5,
    'injector-set': 0.15 + load * 0.55,
    'hp-fuel-pump': 0.2 + load * 0.55,
    'hp-fuel-pump-2': 0.2 + load * 0.55,
    valvetronic: 0.15 + (rpm / 7200) * 0.3 + load * 0.1,
    'coolant-pump-electric': 0.15 + load * 0.35,
    'oil-spray-nozzles': 0.1 + load * 0.3 + (rpm / 7200) * 0.2,
    'water-pump': 0.1 + (rpm / 7200) * 0.45,
    'thermostat-housing': flow.coolantOutC / 118,
    'oil-pump': 0.1 + (rpm / 7200) * 0.5,
    'oil-filter-housing': flow.oilBar / 6,
    'oil-pan': 0.07,
  }
  const pistonUtil = peakPa / 1e5 / 155 + (rpm / 7200) * 0.18
  for (let i = 1; i <= 6; i++) partUtil[`piston-${i}`] = pistonUtil

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

/* memoized accessor so 3D code can read the current cycle every frame for free */
let cacheKey = ''
let cacheVal: CycleResult | null = null
export function getCycle(rpm: number, load: number): CycleResult {
  const key = `${rpm}|${load}`
  if (key !== cacheKey) {
    cacheKey = key
    cacheVal = computeCycle(rpm, load)
  }
  return cacheVal!
}

/** shared sim clock, advanced by SimDriver inside the canvas (deg, 0..720) */
export const simClock = { thetaDeg: 0 }
