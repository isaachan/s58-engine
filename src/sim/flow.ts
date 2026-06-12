/**
 * Lumped-parameter (1D) fluid model.
 *
 * This is NOT CFD: each circuit is treated as a quasi-steady network driven by
 * engine speed and throttle, using ideal-gas relations and simple pump/heat
 * balances. It is deterministic and tuned to produce realistic magnitudes for
 * training (MAF, boost, turbo speed, coolant ΔT, oil pressure).
 */
import type { EngineDefinition } from '../engines/types'

export interface FlowInputs {
  rpm: number
  throttle: number // 0..1
}

export interface FlowResult {
  // air path
  boostBar: number // gauge boost after charge cooler [bar]
  mapBar: number // absolute manifold pressure [bar]
  mafGs: number // mass air flow [g/s]
  chargeTempC: number // post-charge-cooler temp [°C]
  turboKrpm: number // turbo shaft speed [krpm]
  // exhaust
  exhaustGs: number // exhaust mass flow [g/s]
  exhaustTempC: number // pre-turbine temp [°C]
  // combustion side-products used by readouts
  fuelGs: number
  powerKw: number
  // coolant
  coolantLpm: number
  coolantDeltaC: number // temp rise across the engine
  coolantOutC: number
  // oil
  oilBar: number
  oilLpm: number
  // particle animation speeds (scene-units/sec, purely visual scaling)
  vIntake: number
  vExhaust: number
  vCoolant: number
  vOil: number
}

const R_AIR = 287 // J/(kg·K)
const AMBIENT_BAR = 1.013

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const smooth = (t: number) => {
  const x = clamp(t, 0, 1)
  return x * x * (3 - 2 * x)
}

export function computeFlow(engine: EngineDefinition, { rpm, throttle }: FlowInputs): FlowResult {
  const p = engine.flow
  const rpmNorm = rpm / p.redlineRpm
  const t = clamp(throttle, 0, 1)
  const spool = smooth((rpm - p.spool.startRpm) / p.spool.spanRpm)
  const boostBar = p.peakBoostBar * t * spool
  // naturally aspirated engines set peakBoostBar = 0; guard the boost-fraction divisor
  const boostFrac = p.peakBoostBar > 0 ? boostBar / p.peakBoostBar : 0
  const mapBar = t < 0.05 ? 0.45 + 0.5 * rpmNorm : AMBIENT_BAR * (0.35 + 0.65 * t) + boostBar

  const chargeTempC = 25 + boostBar * 26 // air-to-water cooler outlet
  const rho = (mapBar * 1e5) / (R_AIR * (chargeTempC + 273.15)) // kg/m³
  const ve = p.ve.base + p.ve.spoolGain * spool
  const mafKgS = (p.displacementM3 * (rpm / 120)) * rho * ve // 4-stroke: rpm/2 per min
  const mafGs = mafKgS * 1000

  // mixture: stoich at cruise, enriched under boost
  const afr = 14.7 - p.afrEnrich * smooth(boostFrac)
  const fuelGs = mafGs / afr
  const powerKw = fuelGs * 1e-3 * 43000 * p.brakeEff

  const exhaustGs = mafGs + fuelGs
  const exhaustTempC = 480 + 420 * (0.3 * rpmNorm + 0.7 * t)
  const turboKrpm = p.peakBoostBar > 0 ? 18 + (p.turboMaxKrpm - 18) * Math.sqrt(boostFrac) * (0.55 + 0.45 * t) : 0

  // coolant: mechanical-equivalent pump curve, heat ≈ brake power rejected to coolant
  const coolantLpm = 25 + 215 * rpmNorm
  const coolantKgS = coolantLpm / 60 // ~1 kg/L
  const heatKw = powerKw * 0.65 + 4
  const coolantDeltaC = clamp(heatKw / (coolantKgS * 4.186), 0.5, 25)
  const coolantOutC = 88 + coolantDeltaC * 0.5

  // oil: map-controlled variable pump, regulated ceiling
  const oilBar = clamp(1.2 + rpmNorm * 4.6, 1.2, 4.6)
  const oilLpm = 8 + rpmNorm * 55

  const peakSpool = smooth((p.redlineRpm - p.spool.startRpm) / p.spool.spanRpm)
  const peakMapBar = AMBIENT_BAR * (0.35 + 0.65) + p.peakBoostBar
  const peakChargeTempC = 25 + p.peakBoostBar * 26
  const peakRho = (peakMapBar * 1e5) / (R_AIR * (peakChargeTempC + 273.15))
  const peakVe = p.ve.base + p.ve.spoolGain * peakSpool
  const peakMafGs = p.displacementM3 * (p.redlineRpm / 120) * peakRho * peakVe * 1000

  return {
    boostBar,
    mapBar,
    mafGs,
    chargeTempC,
    turboKrpm,
    exhaustGs,
    exhaustTempC,
    fuelGs,
    powerKw,
    coolantLpm,
    coolantDeltaC,
    coolantOutC,
    oilBar,
    oilLpm,
    // visual speeds: tuned so idle crawls and redline rushes
    vIntake: 0.25 + (mafGs / (peakMafGs * 1.4)) * 2.6,
    vExhaust: 0.3 + (exhaustGs / (peakMafGs * 1.5)) * 3.2,
    vCoolant: 0.15 + (coolantLpm / 240) * 1.4,
    vOil: 0.12 + (oilLpm / 63) * 1.1,
  }
}
