import type { CyclePhysics, FlowPhysics, PartUtilCtx, SoundParams } from '../types'

export const cycle: CyclePhysics = {
  boreM: 0.0835,
  strokeM: 0.0912,
  rodM: 0.139, // estimate — see docs/PARTS-Skyactiv-G.md (rod length not published)
  compressionRatio: 13.0,
  recipMassKg: 0.4, // ND2 lightweight pistons/rods
  cylinders: 4,
  idleRpm: 850,
  redlineRpm: 7500,
  fmep: { baseBar: 0.3, rpmBar: 1.0, loadBar: 0.12 },
}

export const flow: FlowPhysics = {
  displacementM3: 1.998e-3,
  peakBoostBar: 0, // naturally aspirated — flow model treats boost as zero
  spool: { startRpm: 1000, spanRpm: 2000 }, // unused at zero boost; kept for type completeness
  ve: { base: 0.9, spoolGain: 0 },
  afrEnrich: 0,
  brakeEff: 0.35,
  redlineRpm: 7500,
  turboMaxKrpm: 0,
}

export const sound: SoundParams = {
  firesPerRev: 2,
  redlineRpm: 7500,
}

export const stressParts: [string, string][] = [
  ['piston-1', 'stress.part.pistons'],
  ['crankshaft', 'stress.part.crankshaft'],
  ['cylinder-head', 'stress.part.head'],
  ['cylinder-block', 'stress.part.block'],
  ['exhaust-manifold', 'stress.part.exhaust'],
  ['timing-chain', 'stress.part.timing'],
  ['hp-fuel-pump', 'stress.part.fuel'],
]

export const movingPartIds = [
  'crankshaft',
  'harmonic-damper',
  'camshaft-intake',
  'camshaft-exhaust',
  'svt-phasers',
  'timing-chain',
  'piston-1',
  'piston-2',
  'piston-3',
  'piston-4',
]

export function partUtil({ rpm, load, peakBar, gasForceN, peakTorqueNm, flow, redline }: PartUtilCtx) {
  const util: Record<string, number> = {
    // high compression → high peak pressure even without boost; tighter block/head allowables
    'cylinder-block': peakBar / 150,
    'cylinder-head': gasForceN / 120e3,
    crankshaft: peakTorqueNm / 1850,
    'harmonic-damper': (rpm / redline) * 0.52 + load * 0.1,
    'timing-chain': (rpm / redline) * 0.48 + load * 0.14,
    'camshaft-intake': (rpm / redline) * 0.34 + load * 0.18,
    'camshaft-exhaust': (rpm / redline) * 0.34 + load * 0.24,
    'svt-phasers': 0.22 + load * 0.14,
    'valve-cover': 0.06,
    'timing-cover': 0.06,
    'intake-manifold': 0.1 + load * 0.18,
    'throttle-body': 0.1 + load * 0.42,
    'exhaust-manifold': flow.exhaustTempC / 1000,
    'fuel-rail': 0.18 + load * 0.42,
    'injector-set': 0.15 + load * 0.48,
    'hp-fuel-pump': 0.18 + load * 0.48,
    'water-pump': 0.1 + (rpm / redline) * 0.44,
    'thermostat-housing': flow.coolantOutC / 118,
    'oil-pump': 0.1 + (rpm / redline) * 0.5,
    'oil-filter-housing': flow.oilBar / 6,
    'oil-pan': 0.07,
  }
  const pistonUtil = peakBar / 140 + (rpm / redline) * 0.2
  for (let i = 1; i <= 4; i++) util[`piston-${i}`] = pistonUtil
  return util
}
