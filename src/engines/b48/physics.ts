import type { CyclePhysics, FlowPhysics, PartUtilCtx, SoundParams } from '../types'

export const cycle: CyclePhysics = {
  boreM: 0.082,
  strokeM: 0.0946,
  rodM: 0.1407,
  compressionRatio: 10.2,
  recipMassKg: 0.48,
  cylinders: 4,
  idleRpm: 750,
  redlineRpm: 6500,
  fmep: { baseBar: 0.32, rpmBar: 1.05, loadBar: 0.13 },
}

export const flow: FlowPhysics = {
  displacementM3: 1.998e-3,
  peakBoostBar: 1.3,
  spool: { startRpm: 1300, spanRpm: 1900 },
  ve: { base: 0.78, spoolGain: 0.07 },
  afrEnrich: 2.0,
  brakeEff: 0.29,
  redlineRpm: 6500,
  turboMaxKrpm: 170,
}

export const sound: SoundParams = {
  firesPerRev: 2,
  redlineRpm: 6500,
}

export const stressParts: [string, string][] = [
  ['piston-1', 'stress.part.pistons'],
  ['crankshaft', 'stress.part.crankshaft'],
  ['cylinder-head', 'stress.part.head'],
  ['cylinder-block', 'stress.part.block'],
  ['turbo', 'stress.part.turbos'],
  ['exhaust-manifold', 'stress.part.exhaust'],
  ['timing-chain', 'stress.part.timing'],
  ['intake-manifold', 'stress.part.intake'],
  ['hp-fuel-pump', 'stress.part.fuel'],
]

export const movingPartIds = [
  'crankshaft',
  'harmonic-damper',
  'camshaft-intake',
  'camshaft-exhaust',
  'vanos-unit',
  'timing-chain',
  'piston-1',
  'piston-2',
  'piston-3',
  'piston-4',
]

export function partUtil({ rpm, load, peakBar, gasForceN, peakTorqueNm, flow, redline }: PartUtilCtx) {
  const util: Record<string, number> = {
    'cylinder-block': peakBar / 160,
    'cylinder-head': gasForceN / 125e3,
    crankshaft: peakTorqueNm / 1900,
    'harmonic-damper': (rpm / redline) * 0.5 + load * 0.1,
    'timing-chain': (rpm / redline) * 0.46 + load * 0.14,
    'camshaft-intake': (rpm / redline) * 0.34 + load * 0.18,
    'camshaft-exhaust': (rpm / redline) * 0.34 + load * 0.24,
    'vanos-unit': 0.24 + load * 0.14,
    'valve-cover': 0.06,
    'timing-cover': 0.06,
    'intake-manifold': flow.boostBar / 1.9 + 0.08,
    'throttle-body': flow.boostBar / 2.0 + 0.08,
    turbo: flow.exhaustTempC / 980,
    'exhaust-manifold': flow.exhaustTempC / 1020,
    'fuel-rail': 0.2 + load * 0.5,
    'injector-set': 0.15 + load * 0.55,
    'hp-fuel-pump': 0.2 + load * 0.55,
    valvetronic: 0.15 + (rpm / redline) * 0.28 + load * 0.1,
    'oil-spray-nozzles': 0.1 + load * 0.3 + (rpm / redline) * 0.2,
    'water-pump': 0.1 + (rpm / redline) * 0.42,
    'thermostat-housing': flow.coolantOutC / 118,
    'oil-pump': 0.1 + (rpm / redline) * 0.48,
    'oil-filter-housing': flow.oilBar / 6,
    'oil-pan': 0.07,
  }
  const pistonUtil = peakBar / 145 + (rpm / redline) * 0.16
  for (let i = 1; i <= 4; i++) util[`piston-${i}`] = pistonUtil
  return util
}
