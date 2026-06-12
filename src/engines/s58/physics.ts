import type { CyclePhysics, FlowPhysics, PartUtilCtx, SoundParams } from '../types'

export const cycle: CyclePhysics = {
  boreM: 0.084,
  strokeM: 0.09,
  rodM: 0.144,
  compressionRatio: 9.3,
  recipMassKg: 0.62,
  cylinders: 6,
  idleRpm: 800,
  redlineRpm: 7200,
  fmep: { baseBar: 0.35, rpmBar: 1.15, loadBar: 0.15 },
}

export const flow: FlowPhysics = {
  displacementM3: 2.993e-3,
  peakBoostBar: 1.7,
  spool: { startRpm: 1400, spanRpm: 2100 },
  ve: { base: 0.78, spoolGain: 0.08 },
  afrEnrich: 2.2,
  brakeEff: 0.28,
  redlineRpm: 7200,
  turboMaxKrpm: 158,
}

export const sound: SoundParams = {
  firesPerRev: 3,
  redlineRpm: 7200,
}

export const stressParts: [string, string][] = [
  ['piston-1', 'stress.part.pistons'],
  ['crankshaft', 'stress.part.crankshaft'],
  ['cylinder-head', 'stress.part.head'],
  ['cylinder-block', 'stress.part.block'],
  ['turbo-front', 'stress.part.turbos'],
  ['exhaust-manifold-front', 'stress.part.exhaust'],
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
  'piston-5',
  'piston-6',
]

export function partUtil({ rpm, load, peakBar, gasForceN, peakTorqueNm, flow, redline }: PartUtilCtx) {
  const util: Record<string, number> = {
    'cylinder-block': peakBar / 170,
    'cylinder-head': gasForceN / 150e3,
    crankshaft: peakTorqueNm / 2600,
    'harmonic-damper': (rpm / redline) * 0.55 + load * 0.1,
    'timing-chain': (rpm / redline) * 0.5 + load * 0.15,
    'camshaft-intake': (rpm / redline) * 0.35 + load * 0.2,
    'camshaft-exhaust': (rpm / redline) * 0.35 + load * 0.25,
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
    valvetronic: 0.15 + (rpm / redline) * 0.3 + load * 0.1,
    'coolant-pump-electric': 0.15 + load * 0.35,
    'oil-spray-nozzles': 0.1 + load * 0.3 + (rpm / redline) * 0.2,
    'water-pump': 0.1 + (rpm / redline) * 0.45,
    'thermostat-housing': flow.coolantOutC / 118,
    'oil-pump': 0.1 + (rpm / redline) * 0.5,
    'oil-filter-housing': flow.oilBar / 6,
    'oil-pan': 0.07,
  }
  const pistonUtil = peakBar / 155 + (rpm / redline) * 0.18
  for (let i = 1; i <= 6; i++) util[`piston-${i}`] = pistonUtil
  return util
}
