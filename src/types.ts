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
}

export type Mode = 'explore' | 'exploded' | 'disassembly' | 'reassembly' | 'quiz' | 'flow'

export interface QuizQuestion {
  id: string
  kind: 'identify' | 'choice' | 'order'
  prompt: string
  /** identify: the part the trainee must click */
  targetPartId?: string
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
