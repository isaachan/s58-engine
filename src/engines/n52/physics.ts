import type { CyclePhysics, FlowPhysics, PartUtilCtx, SoundParams } from '../types'

export const cycle: CyclePhysics = {
  boreM: 0.085,
  strokeM: 0.088,
  rodM: 0.145, // estimate — see docs/PARTS-N52.md (rod length not published)
  compressionRatio: 10.7,
  recipMassKg: 0.45, // estimate
  cylinders: 6,
  idleRpm: 700,
  redlineRpm: 7000,
  fmep: { baseBar: 0.32, rpmBar: 1.1, loadBar: 0.14 },
}

export const flow: FlowPhysics = {
  displacementM3: 2.996e-3,
  peakBoostBar: 0, // naturally aspirated
  spool: { startRpm: 1000, spanRpm: 2000 }, // unused at zero boost
  ve: { base: 0.88, spoolGain: 0 },
  afrEnrich: 0,
  brakeEff: 0.36,
  redlineRpm: 7000,
  turboMaxKrpm: 0,
}

export const sound: SoundParams = {
  firesPerRev: 3, // inline-six: 6 cylinders / 2
  redlineRpm: 7000,
  // smooth NA inline-six character (Pixabay, swap in public/audio/clips/)
  samples: {
    idle: { url: 'audio/clips/car-idle.mp3', rpm: 800 },
    redline: { url: 'audio/clips/car-rev.mp3', rpm: 5500 },
  },
}

export const stressParts: [string, string][] = [
  ['piston-1', 'stress.part.pistons'],
  ['crankshaft', 'stress.part.crankshaft'],
  ['cylinder-head', 'stress.part.head'],
  ['cylinder-block', 'stress.part.block'],
  ['exhaust-manifold', 'stress.part.exhaust'],
  ['timing-chain', 'stress.part.timing'],
  ['injector-set', 'stress.part.fuel'],
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
    'cylinder-block': peakBar / 130, // magnesium-aluminium, NA peak pressures
    'cylinder-head': gasForceN / 115e3,
    crankshaft: peakTorqueNm / 1700,
    'harmonic-damper': (rpm / redline) * 0.52 + load * 0.1,
    'timing-chain': (rpm / redline) * 0.48 + load * 0.14,
    'camshaft-intake': (rpm / redline) * 0.34 + load * 0.18,
    'camshaft-exhaust': (rpm / redline) * 0.34 + load * 0.22,
    'vanos-unit': 0.22 + load * 0.14,
    valvetronic: 0.15 + (rpm / redline) * 0.28 + load * 0.1,
    'valve-cover': 0.06,
    'timing-cover': 0.06,
    'intake-manifold': 0.1 + load * 0.2,
    'throttle-body': 0.1 + load * 0.3,
    'exhaust-manifold': flow.exhaustTempC / 1000,
    'fuel-rail': 0.12 + load * 0.3, // low-pressure port injection
    'injector-set': 0.12 + load * 0.4,
    'water-pump': 0.12 + (rpm / redline) * 0.3, // electric pump, demand-based
    'thermostat-housing': flow.coolantOutC / 118,
    'oil-pump': 0.1 + (rpm / redline) * 0.48,
    'oil-filter-housing': flow.oilBar / 6,
    'oil-pan': 0.07,
  }
  const pistonUtil = peakBar / 120 + (rpm / redline) * 0.2
  for (let i = 1; i <= 6; i++) util[`piston-${i}`] = pistonUtil
  return util
}
