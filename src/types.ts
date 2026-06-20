export type SystemId =
  | 'block'
  | 'head'
  | 'rotating'
  | 'timing'
  | 'turbo'
  | 'intake'
  | 'exhaust'
  | 'cooling'
  | 'lubrication'
  | 'fuel'

export interface SystemInfo {
  id: SystemId
  name: string
  color: string
  explodeDir: [number, number, number]
}

export type Vec3 = [number, number, number]

/**
 * A citation / reference backing a piece of content (a part description,
 * a glossary entry, an engine spec). Labels are kept inline (English +
 * optional Chinese) so sources live next to the English source-of-truth
 * data without needing an i18n overlay, keeping types.ts dependency-free.
 */
export interface Source {
  /** Human-readable citation, e.g. "BMW S58 Technical Training §3.2" */
  label: string
  /** Optional Chinese rendering of the label */
  labelZh?: string
  kind: 'manual' | 'sae' | 'article' | 'video' | 'patent'
  /** External link; opened in the system browser when present */
  url?: string
  /** Reference shown when there is no url (page/section/doc number) */
  ref?: string
}

export interface PartDef {
  id: string
  name: string
  system: SystemId
  /** geometry builder key, see engine/geometry.tsx */
  build: string
  position: Vec3
  rotation?: Vec3
  /** extra offset (added to system direction) in exploded view */
  explodeOffset: Vec3
  function: string
  location: string
  inspectionNotes: string
  failurePoints?: string
  relatedPartIds: string[]
  /** parts that must be removed before this one; empty = removable immediately */
  dependencies: string[]
  /** order index in the guided teardown; -1 = not removable (e.g. block) */
  removalOrder: number
  difficulty: 1 | 2 | 3
  /** simplified visual representation, documented per PRD accuracy rules */
  simplified?: string
  /** optional geometry-builder customization for engine-specific visual variants */
  buildParams?: Record<string, number | string | boolean>
  /** citations / references backing this part's description (enthusiast mode) */
  sources?: Source[]
}

export type Mode =
  | 'explore'
  | 'exploded'
  | 'disassembly'
  | 'reassembly'
  | 'quiz'
  | 'flow'
  | 'combust'
  | 'stress'

export interface QuizQuestion {
  id: string
  kind: 'identify' | 'choice' | 'order'
  prompt: string
  /** identify: the part the trainee must click */
  targetPartId?: string
  /** identify: additional part ids that also count as correct (e.g. twin pumps) */
  altTargetIds?: string[]
  /** choice: options (part ids or strings) and correct index */
  options?: string[]
  correctIndex?: number
  /** order: part ids to sort into removal order */
  orderPartIds?: string[]
}

export interface QuizResult {
  date: string
  score: number
  total: number
  mistakes: string[]
  timeSec: number
}

export interface Progress {
  trainee: string
  partsInspected: string[]
  disassemblyCompleted: boolean
  disassemblyMistakes: number
  reassemblyCompleted: boolean
  reassemblyMistakes: number
  reassemblyAttempts: number
  quizResults: QuizResult[]
}
