import type { PartDef, QuizQuestion, Source, SystemId, Vec3 } from '../types'
import type { FlowResult } from '../sim/flow'

export type EngineId = 's58' | 'b48' | 'skyactiv-g' | 'ea888' | 'n52'

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
  /** engine-level citations (spec sheets, technical training, reviews) */
  sources?: Source[]
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

/** One looped recording captured at a representative engine speed. */
export interface SampleLayer {
  /** URL of the looped audio clip, bundled under public/ (e.g. /audio/s58/idle.ogg) */
  url: string
  /** engine speed the clip was recorded at; used to pitch-shift toward the target rpm */
  rpm: number
}

/**
 * Optional real-recording layers. When present and loadable, the sampler
 * crossfades between them by rpm; otherwise the synthesized note is used.
 * NOTE: no audio assets ship yet — see TODO.md "真实引擎音效".
 */
export interface EngineSamples {
  idle?: SampleLayer
  mid?: SampleLayer
  redline?: SampleLayer
}

export interface SoundParams {
  firesPerRev: number
  redlineRpm: number
  /** real engine recordings; falls back to synthesis when absent or unloadable */
  samples?: EngineSamples
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
