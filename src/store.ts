import { create } from 'zustand'
import type { Mode, Progress, QuizResult, SystemId, Vec3 } from './types'
import { PART_MAP, REMOVAL_SEQUENCE } from './data/parts'
import { QUIZ_QUESTIONS } from './data/quiz'

const STORAGE_KEY = 's58-trainer-progress-v1'

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* corrupted progress falls back to fresh state */
  }
  return {
    trainee: 'Trainee',
    partsInspected: [],
    disassemblyCompleted: false,
    disassemblyMistakes: 0,
    reassemblyCompleted: false,
    reassemblyMistakes: 0,
    reassemblyAttempts: 0,
    quizResults: [],
  }
}

export interface Feedback {
  kind: 'ok' | 'warn' | 'info'
  text: string
  ts: number
}

interface State {
  mode: Mode
  selectedId: string | null
  hoveredId: string | null
  /** manual offsets from dragging in explore mode */
  offsets: Record<string, Vec3>
  hiddenIds: Set<string>
  isolatedSystem: SystemId | null
  exploded: boolean
  showLabels: boolean
  /** parts removed in disassembly / not yet placed in reassembly */
  removedIds: Set<string>
  /** index of next step in REMOVAL_SEQUENCE */
  disasmStep: number
  disasmMistakes: number
  /** reassembly */
  reasmStep: number // index counting down through REMOVAL_SEQUENCE reversed
  reasmMistakes: number
  /** id of removed part currently being dragged back */
  carryingId: string | null
  /** quiz */
  quizIndex: number
  quizScore: number
  quizMistakes: string[]
  quizAnswered: boolean
  quizStartTs: number
  feedback: Feedback | null
  progress: Progress
  resetViewToken: number
  focusPartId: string | null
  /** flow simulation inputs */
  flowRpm: number
  flowThrottle: number
  flowCircuits: Set<string>
  /** combustion / stress simulation inputs */
  simRpm: number
  simLoad: number
  simTimeScale: number
  theme: 'dark' | 'light'

  setMode: (m: Mode) => void
  select: (id: string | null) => void
  hover: (id: string | null) => void
  setOffset: (id: string, o: Vec3) => void
  resetPart: (id: string) => void
  resetAll: () => void
  toggleHidden: (id: string) => void
  isolate: (s: SystemId | null) => void
  setExploded: (v: boolean) => void
  toggleLabels: () => void
  requestResetView: () => void
  focusPart: (id: string | null) => void
  setFlowRpm: (v: number) => void
  setFlowThrottle: (v: number) => void
  toggleCircuit: (id: string) => void
  setSimRpm: (v: number) => void
  setSimLoad: (v: number) => void
  setSimTimeScale: (v: number) => void
  toggleTheme: () => void
  flash: (f: Omit<Feedback, 'ts'>) => void

  attemptRemove: (id: string) => void
  pickUpRemoved: (id: string) => void
  attemptPlace: (id: string) => void
  startReassembly: () => void
  startQuiz: () => void
  answerIdentify: (clickedId: string) => void
  answerChoice: (index: number) => void
  nextQuestion: () => void
  markInspected: (id: string) => void
  exportCsv: () => void
}

function persist(p: Progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
}

export const useStore = create<State>((set, get) => ({
  mode: 'explore',
  selectedId: null,
  hoveredId: null,
  offsets: {},
  hiddenIds: new Set(),
  isolatedSystem: null,
  exploded: false,
  showLabels: true,
  removedIds: new Set(),
  disasmStep: 0,
  disasmMistakes: 0,
  reasmStep: 0,
  reasmMistakes: 0,
  carryingId: null,
  quizIndex: 0,
  quizScore: 0,
  quizMistakes: [],
  quizAnswered: false,
  quizStartTs: 0,
  feedback: null,
  progress: loadProgress(),
  resetViewToken: 0,
  focusPartId: null,
  flowRpm: 3000,
  flowThrottle: 0.6,
  flowCircuits: new Set(['intake', 'exhaust', 'coolant', 'oil']),
  simRpm: 2400,
  simLoad: 0.8,
  simTimeScale: 0.05,
  theme: (localStorage.getItem('s58-theme') as 'dark' | 'light') || 'dark',

  setMode: (m) => {
    const base = {
      mode: m,
      selectedId: null,
      hoveredId: null,
      offsets: {},
      hiddenIds: new Set<string>(),
      isolatedSystem: null,
      exploded: m === 'exploded',
      carryingId: null,
      feedback: null,
    }
    if (m === 'disassembly') {
      set({ ...base, removedIds: new Set(), disasmStep: 0, disasmMistakes: 0 })
    } else if (m === 'reassembly') {
      get().startReassembly()
      set((s) => ({ ...s, ...base, exploded: false }))
    } else if (m === 'quiz') {
      set(base)
      get().startQuiz()
    } else {
      set({ ...base, removedIds: new Set() })
    }
  },

  select: (id) => {
    set({ selectedId: id })
    if (id) get().markInspected(id)
  },
  hover: (id) => set({ hoveredId: id }),
  setOffset: (id, o) => set((s) => ({ offsets: { ...s.offsets, [id]: o } })),
  resetPart: (id) =>
    set((s) => {
      const { [id]: _, ...rest } = s.offsets
      return { offsets: rest }
    }),
  resetAll: () => set({ offsets: {}, hiddenIds: new Set(), isolatedSystem: null, exploded: false }),
  toggleHidden: (id) =>
    set((s) => {
      const next = new Set(s.hiddenIds)
      next.has(id) ? next.delete(id) : next.add(id)
      return { hiddenIds: next }
    }),
  isolate: (sys) => set({ isolatedSystem: sys }),
  setExploded: (v) => set({ exploded: v }),
  toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  requestResetView: () => set((s) => ({ resetViewToken: s.resetViewToken + 1 })),
  focusPart: (id) => set({ focusPartId: id }),
  setFlowRpm: (v) => set({ flowRpm: v }),
  setFlowThrottle: (v) => set({ flowThrottle: v }),
  toggleCircuit: (id) =>
    set((s) => {
      const next = new Set(s.flowCircuits)
      next.has(id) ? next.delete(id) : next.add(id)
      return { flowCircuits: next }
    }),
  setSimRpm: (v) => set({ simRpm: v }),
  setSimLoad: (v) => set({ simLoad: v }),
  setSimTimeScale: (v) => set({ simTimeScale: v }),
  toggleTheme: () =>
    set((s) => {
      const theme = s.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('s58-theme', theme)
      return { theme }
    }),
  flash: (f) => {
    set({ feedback: { ...f, ts: Date.now() } })
    setTimeout(() => {
      const cur = get().feedback
      if (cur && Date.now() - cur.ts >= 3800) set({ feedback: null })
    }, 4000)
  },

  markInspected: (id) =>
    set((s) => {
      if (s.progress.partsInspected.includes(id)) return {}
      const progress = { ...s.progress, partsInspected: [...s.progress.partsInspected, id] }
      persist(progress)
      return { progress }
    }),

  attemptRemove: (id) => {
    const s = get()
    if (s.mode !== 'disassembly') return
    const expected = REMOVAL_SEQUENCE[s.disasmStep]
    if (!expected) return
    const part = PART_MAP.get(id)
    if (!part) return
    if (part.removalOrder === -1) {
      get().flash({ kind: 'warn', text: `${part.name} is the structural core — it is not removed in this procedure.` })
      return
    }
    if (s.removedIds.has(id)) return
    if (id === expected.id) {
      const removed = new Set(s.removedIds)
      removed.add(id)
      const nextStep = s.disasmStep + 1
      const done = nextStep >= REMOVAL_SEQUENCE.length
      set({ removedIds: removed, disasmStep: nextStep, selectedId: id })
      get().flash({ kind: 'ok', text: `Correct: ${part.name} removed.` })
      if (done) {
        const progress = { ...s.progress, disassemblyCompleted: true, disassemblyMistakes: s.disasmMistakes }
        persist(progress)
        set({ progress })
        get().flash({ kind: 'ok', text: 'Teardown complete! Engine fully disassembled to the bare block.' })
      }
    } else {
      const blockers = part.dependencies.filter((d) => !s.removedIds.has(d))
      const reason = blockers.length
        ? `Remove ${blockers.map((b) => PART_MAP.get(b)?.name).join(', ')} first.`
        : `Out of sequence — next step is ${expected.name}.`
      set({ disasmMistakes: s.disasmMistakes + 1 })
      get().flash({ kind: 'warn', text: `Cannot remove ${part.name} yet. ${reason}` })
    }
  },

  startReassembly: () => {
    const all = new Set(REMOVAL_SEQUENCE.map((p) => p.id))
    set((s) => {
      const progress = { ...s.progress, reassemblyAttempts: s.progress.reassemblyAttempts + 1 }
      persist(progress)
      return { removedIds: all, reasmStep: REMOVAL_SEQUENCE.length - 1, reasmMistakes: 0, carryingId: null, progress }
    })
  },

  pickUpRemoved: (id) => {
    const s = get()
    if (s.mode !== 'reassembly' || !s.removedIds.has(id)) return
    set({ carryingId: id, selectedId: id })
  },

  attemptPlace: (id) => {
    const s = get()
    const expected = REMOVAL_SEQUENCE[s.reasmStep]
    const part = PART_MAP.get(id)
    if (!expected || !part) return
    if (id === expected.id) {
      const removed = new Set(s.removedIds)
      removed.delete(id)
      const nextStep = s.reasmStep - 1
      const done = nextStep < 0
      set({ removedIds: removed, reasmStep: nextStep, carryingId: null })
      get().flash({ kind: 'ok', text: `${part.name} installed correctly.` })
      if (done) {
        const progress = { ...s.progress, reassemblyCompleted: true, reassemblyMistakes: s.reasmMistakes }
        persist(progress)
        set({ progress })
        get().flash({ kind: 'ok', text: 'Reassembly complete — the engine is back together!' })
      }
    } else {
      set({ reasmMistakes: s.reasmMistakes + 1, carryingId: null })
      get().flash({
        kind: 'warn',
        text: `${part.name} cannot go in yet — install ${expected.name} first (assembly is the reverse of teardown).`,
      })
    }
  },

  startQuiz: () =>
    set({ quizIndex: 0, quizScore: 0, quizMistakes: [], quizAnswered: false, quizStartTs: Date.now() }),

  answerIdentify: (clickedId) => {
    const s = get()
    if (s.mode !== 'quiz' || s.quizAnswered) return
    const q = QUIZ_QUESTIONS[s.quizIndex]
    if (!q || q.kind !== 'identify') return
    if (clickedId === q.targetPartId) {
      set({ quizScore: s.quizScore + 1, quizAnswered: true })
      get().flash({ kind: 'ok', text: 'Correct!' })
    } else {
      const target = PART_MAP.get(q.targetPartId!)
      set({ quizMistakes: [...s.quizMistakes, q.id], quizAnswered: true, selectedId: q.targetPartId! })
      get().flash({ kind: 'warn', text: `Not quite — that was ${PART_MAP.get(clickedId)?.name ?? 'another part'}. The answer (${target?.name}) is now highlighted.` })
    }
  },

  answerChoice: (index) => {
    const s = get()
    if (s.quizAnswered) return
    const q = QUIZ_QUESTIONS[s.quizIndex]
    if (!q || q.kind !== 'choice') return
    if (index === q.correctIndex) {
      set({ quizScore: s.quizScore + 1, quizAnswered: true })
      get().flash({ kind: 'ok', text: 'Correct!' })
    } else {
      set({ quizMistakes: [...s.quizMistakes, q.id], quizAnswered: true })
      get().flash({ kind: 'warn', text: `Incorrect — the right answer was: ${q.options![q.correctIndex!]}` })
    }
  },

  nextQuestion: () => {
    const s = get()
    const next = s.quizIndex + 1
    if (next >= QUIZ_QUESTIONS.length) {
      const result: QuizResult = {
        date: new Date().toISOString(),
        score: s.quizScore,
        total: QUIZ_QUESTIONS.length,
        mistakes: s.quizMistakes,
        timeSec: Math.round((Date.now() - s.quizStartTs) / 1000),
      }
      const progress = { ...s.progress, quizResults: [...s.progress.quizResults, result] }
      persist(progress)
      set({ progress, quizIndex: next, selectedId: null })
    } else {
      set({ quizIndex: next, quizAnswered: false, selectedId: null })
    }
  },

  exportCsv: () => {
    const p = get().progress
    const rows = [
      ['metric', 'value'],
      ['trainee', p.trainee],
      ['parts_inspected', String(p.partsInspected.length)],
      ['disassembly_completed', String(p.disassemblyCompleted)],
      ['disassembly_mistakes', String(p.disassemblyMistakes)],
      ['reassembly_completed', String(p.reassemblyCompleted)],
      ['reassembly_attempts', String(p.reassemblyAttempts)],
      ['reassembly_mistakes', String(p.reassemblyMistakes)],
      ...p.quizResults.map((r, i) => [
        `quiz_${i + 1}`,
        `${r.score}/${r.total} in ${r.timeSec}s on ${r.date}`,
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 's58-training-report.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  },
}))
