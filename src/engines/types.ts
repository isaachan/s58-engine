import type { PartDef, QuizQuestion, SystemId, Vec3 } from '../types'
import type { FlowResult } from '../sim/flow'

export type EngineId = 's58' | 'b48' | 'skyactiv-g'

export interface LocalizedString {
  en: string
  zh: string
}

export interface EngineMeta {
  id: EngineId
  badge: string
  name: LocalizedString
  subtitle: LocalizedString
  exploreIntro: LocalizedString
  partCount: number
  specs: {
    layout: LocalizedString
    displacementL: number
    cylinders: number
    turbo: LocalizedString
    powerKw: number
    torqueNm: number
    redlineRpm: number
    compressionRatio: number
    firingOrder: string
  }
}

export interface GeometryLayout {
  cylX: number[]
  pinAnglesDeg: number[]
  fireDeg: number[]
  crankRScene: number
  rodScene: number
  blockHalfLen: number
  cameraHome: { pos: Vec3; target: Vec3 }
}

export interface CyclePhysics {
  boreM: number
  strokeM: number
  rodM: number
  compressionRatio: number
  recipMassKg: number
  cylinders: number
  idleRpm: number
  redlineRpm: number
  fmep: { baseBar: number; rpmBar: number; loadBar: number }
}

export interface FlowPhysics {
  displacementM3: number
  peakBoostBar: number
  spool: { startRpm: number; spanRpm: number }
  ve: { base: number; spoolGain: number }
  afrEnrich: number
  brakeEff: number
  redlineRpm: number
  turboMaxKrpm: number
}

export interface SoundParams {
  firesPerRev: number
  redlineRpm: number
}

export interface CircuitDef {
  id: 'intake' | 'exhaust' | 'coolant' | 'oil'
  name: string
  color: string
  closed: boolean
  count: number
  pts: Vec3[]
}

export interface PartUtilCtx {
  rpm: number
  load: number
  peakBar: number
  gasForceN: number
  peakTorqueNm: number
  flow: FlowResult
  redline: number
}

export interface EngineZhContent {
  parts: Record<string, Partial<Record<
    'name' | 'function' | 'location' | 'inspectionNotes' | 'failurePoints' | 'simplified',
    string
  >>>
  quiz: Record<string, { prompt?: string; options?: string[] }>
}

export interface EngineDefinition {
  meta: EngineMeta
  geometry: GeometryLayout
  parts: PartDef[]
  partMap: Map<string, PartDef>
  removalSequence: PartDef[]
  systemOrder: SystemId[]
  quiz: QuizQuestion[]
  cycle: CyclePhysics
  flow: FlowPhysics
  sound: SoundParams
  circuits: CircuitDef[]
  stressParts: [partId: string, i18nKey: string][]
  movingPartIds: string[]
  partUtil: (ctx: PartUtilCtx) => Record<string, number>
  zh: EngineZhContent
}
