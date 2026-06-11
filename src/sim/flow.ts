/**
 * Lumped-parameter (1D) fluid model of the S58.
 *
 * This is NOT CFD: each circuit is treated as a quasi-steady network driven by
 * engine speed and throttle, using ideal-gas relations and simple pump/heat
 * balances. It is deterministic and tuned to produce realistic magnitudes for
 * training (MAF, boost, turbo speed, coolant ΔT, oil pressure).
 */

export interface FlowInputs {
  rpm: number // 800..7200
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

const DISPLACEMENT_M3 = 2.993e-3
const R_AIR = 287 // J/(kg·K)
const AMBIENT_BAR = 1.013

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const smooth = (t: number) => {
  const x = clamp(t, 0, 1)
  return x * x * (3 - 2 * x)
}

export function computeFlow({ rpm, throttle }: FlowInputs): FlowResult {
  const t = clamp(throttle, 0, 1)
  // turbos need exhaust energy: boost builds from ~1500 rpm, full by ~3500
  const spool = smooth((rpm - 1400) / 2100)
  const boostBar = 1.7 * t * spool // S58 peak ≈ 1.7 bar gauge
  const mapBar = t < 0.05 ? 0.45 + 0.5 * (rpm / 7200) : AMBIENT_BAR * (0.35 + 0.65 * t) + boostBar

  const chargeTempC = 25 + boostBar * 26 // air-to-water cooler outlet
  const rho = (mapBar * 1e5) / (R_AIR * (chargeTempC + 273.15)) // kg/m³
  const ve = 0.78 + 0.08 * spool // volumetric efficiency (calibrated to ~430 g/s peak MAF)
  const mafKgS = (DISPLACEMENT_M3 * (rpm / 120)) * rho * ve // 4-stroke: rpm/2 per min
  const mafGs = mafKgS * 1000

  // mixture: stoich at cruise, enriched under boost
  const afr = 14.7 - 2.2 * smooth(boostBar / 1.7)
  const fuelGs = mafGs / afr
  const powerKw = fuelGs * 1e-3 * 43000 * 0.28 // LHV gasoline, ~28% brake efficiency (≈410 kW peak)

  const exhaustGs = mafGs + fuelGs
  const exhaustTempC = 480 + 420 * (0.3 * (rpm / 7200) + 0.7 * t)
  const turboKrpm = 18 + 140 * Math.sqrt(boostBar / 1.7) * (0.55 + 0.45 * t)

  // coolant: mechanical-equivalent pump curve, heat ≈ brake power rejected to coolant
  const coolantLpm = 25 + 215 * (rpm / 7200)
  const coolantKgS = coolantLpm / 60 // ~1 kg/L
  const heatKw = powerKw * 0.65 + 4
  const coolantDeltaC = clamp(heatKw / (coolantKgS * 4.186), 0.5, 25)
  const coolantOutC = 88 + coolantDeltaC * 0.5

  // oil: map-controlled variable pump, regulated ceiling
  const oilBar = clamp(1.2 + (rpm / 7200) * 4.6, 1.2, 4.6)
  const oilLpm = 8 + (rpm / 7200) * 55

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
    vIntake: 0.25 + (mafGs / 600) * 2.6,
    vExhaust: 0.3 + (exhaustGs / 640) * 3.2,
    vCoolant: 0.15 + (coolantLpm / 240) * 1.4,
    vOil: 0.12 + (oilLpm / 63) * 1.1,
  }
}

/* ------------------------- circuit particle paths ------------------------- */
/* World-space waypoints threaded through the actual part positions. */

export type CircuitId = 'intake' | 'exhaust' | 'coolant' | 'oil'

export interface CircuitDef {
  id: CircuitId
  name: string
  color: string
  closed: boolean
  count: number
  pts: [number, number, number][]
}

export const CIRCUITS: CircuitDef[] = [
  {
    id: 'intake',
    name: 'Intake air',
    color: '#54b8ff',
    closed: false,
    count: 240,
    // airbox → compressor → charge pipe around the front → throttle → plenum → runner → port
    pts: [
      [-2.7, 0.35, -1.5],
      [-1.6, 0.4, -1.35],
      [-0.62, 0.44, -1.18], // front compressor inlet
      [-1.5, 0.55, -1.0],
      [-2.15, 0.55, -0.2],
      [-2.2, 0.6, 0.85],
      [-1.55, 0.62, 1.3],
      [-1.18, 0.62, 1.28], // throttle body
      [-0.5, 0.66, 1.12], // plenum traverse
      [0.45, 0.66, 1.1],
      [0.8, 0.6, 0.85],
      [0.78, 0.52, 0.55], // runner into the head
      [0.76, 0.45, 0.25],
    ],
  },
  {
    id: 'exhaust',
    name: 'Exhaust gas',
    color: '#ff7a3c',
    closed: false,
    count: 240,
    // port → manifold → turbine → downpipe rearward
    pts: [
      [-0.74, 0.5, -0.3],
      [-0.75, 0.45, -0.62],
      [-0.86, 0.42, -1.02], // front turbine
      [-0.8, 0.15, -1.3],
      [-0.45, -0.3, -1.55],
      [0.6, -0.55, -1.7],
      [1.8, -0.6, -1.75],
    ],
  },
  {
    id: 'coolant',
    name: 'Coolant',
    color: '#3ce6b0',
    closed: true,
    count: 260,
    // pump → block gallery → head → thermostat → radiator loop → pump
    pts: [
      [-1.82, -0.05, 0.42], // water pump
      [-0.9, 0.18, 0.56],
      [0.6, 0.25, 0.56],
      [1.35, 0.5, 0.35],
      [0.9, 0.82, 0.3], // through the head
      [-0.6, 0.82, 0.32],
      [-1.78, 0.34, 0.56], // thermostat
      [-2.5, 0.45, 0.85], // radiator out
      [-2.85, 0.05, 0.55],
      [-2.5, -0.25, 0.35], // radiator return
    ],
  },
  {
    id: 'oil',
    name: 'Oil',
    color: '#ffc34d',
    closed: true,
    count: 230,
    // sump → pickup/pump → front gallery riser → filter → cam gallery → drainback
    pts: [
      [-0.65, -0.92, 0], // sump
      [0.45, -0.64, 0.05], // pump
      [-0.3, -0.3, 0.35],
      [-1.3, 0.3, 0.45],
      [-1.28, 1.0, 0.45], // oil filter housing
      [-0.6, 1.16, 0.15], // cam gallery
      [0.7, 1.14, 0.0],
      [1.35, 0.6, -0.05],
      [0.9, -0.2, -0.05], // drainback
      [0.1, -0.7, -0.05],
    ],
  },
]
