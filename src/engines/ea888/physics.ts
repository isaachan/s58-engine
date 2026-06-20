import type { CyclePhysics, FlowPhysics, PartUtilCtx, SoundParams } from '../types'

export const cycle: CyclePhysics = {
  boreM: 0.0825,
  strokeM: 0.0928,
  rodM: 0.14, // evo5 con-rod shortened to 140 mm [APTI]
  compressionRatio: 12.5, // PC2 high-output (PC1 base is 10.5:1)
  recipMassKg: 0.45, // estimate — see docs/PARTS-EA888.md
  cylinders: 4,
  idleRpm: 800,
  redlineRpm: 6500,
  fmep: { baseBar: 0.32, rpmBar: 1.05, loadBar: 0.13 },
}

export const flow: FlowPhysics = {
  displacementM3: 1.984e-3,
  peakBoostBar: 1.4,
  spool: { startRpm: 1200, spanRpm: 1800 }, // VGT spools early
  ve: { base: 0.8, spoolGain: 0.08 },
  afrEnrich: 2.0,
  brakeEff: 0.3,
  redlineRpm: 6500,
  turboMaxKrpm: 180,
}

export const sound: SoundParams = {
  firesPerRev: 2,
  redlineRpm: 6500,
  // turbo inline-four (Pixabay, swap in public/audio/clips/)
  samples: {
    idle: { url: 'audio/clips/car-idle.mp3', rpm: 850 },
    redline: { url: 'audio/clips/turbo-dyno-rev.mp3', rpm: 5500 },
  },
}

export const stressParts: [string, string][] = [
  ['piston-1', 'stress.part.pistons'],
  ['crankshaft', 'stress.part.crankshaft'],
  ['cylinder-head', 'stress.part.head'],
  ['cylinder-block', 'stress.part.block'],
  ['turbo', 'stress.part.turbos'],
  ['timing-chain', 'stress.part.timing'],
  ['intake-manifold', 'stress.part.intake'],
  ['hp-fuel-pump', 'stress.part.fuel'],
]

export const movingPartIds = [
  'crankshaft',
  'harmonic-damper',
  'camshaft-intake',
  'camshaft-exhaust',
  'cam-phasers',
  'timing-chain',
  'piston-1',
  'piston-2',
  'piston-3',
  'piston-4',
]

export function partUtil({ rpm, load, peakBar, gasForceN, peakTorqueNm, flow, redline }: PartUtilCtx) {
  const util: Record<string, number> = {
    // iron block + high CR: strong allowables, but high peak pressure from boost + 12.5:1
    'cylinder-block': peakBar / 175,
    'cylinder-head': gasForceN / 130e3, // integrated exhaust manifold runs hot
    crankshaft: peakTorqueNm / 1950,
    'harmonic-damper': (rpm / redline) * 0.5 + load * 0.1,
    'timing-chain': (rpm / redline) * 0.5 + load * 0.16, // also drives balance shafts
    'camshaft-intake': (rpm / redline) * 0.34 + load * 0.18,
    'camshaft-exhaust': (rpm / redline) * 0.34 + load * 0.24,
    'cam-phasers': 0.24 + load * 0.14,
    'valve-cover': 0.06,
    'timing-cover': 0.06,
    'intake-manifold': flow.boostBar / 1.9 + 0.08,
    'throttle-body': flow.boostBar / 2.0 + 0.08,
    turbo: flow.exhaustTempC / 1020, // EGT up to 1020 °C [APTI]
    'fuel-rail': 0.22 + load * 0.55, // 500-bar DI
    'injector-set': 0.18 + load * 0.6,
    'port-injectors': 0.1 + (1 - load) * 0.3, // MPI favored at part load
    'hp-fuel-pump': 0.22 + load * 0.58,
    'water-pump': 0.1 + (rpm / redline) * 0.42,
    'electric-coolant-pump': 0.12 + load * 0.2,
    'thermostat-housing': flow.coolantOutC / 118,
    'oil-pump': 0.1 + (rpm / redline) * 0.48,
    'oil-filter-housing': flow.oilBar / 6,
    'oil-pan': 0.07,
  }
  const pistonUtil = peakBar / 155 + (rpm / redline) * 0.16
  for (let i = 1; i <= 4; i++) util[`piston-${i}`] = pistonUtil
  return util
}
