import { create } from 'zustand'
import type { Mode, Progress, QuizResult, SystemId, Vec3 } from './types'
import { t, type Lang } from './i18n/strings'
import { pName, quizOptions } from './i18n/content'
import type { EngineDefinition, EngineId } from './engines/types'
import { getEngine } from './engines'
import { engineSound } from './sim/engineSound'
import { simClock } from './sim/engineCycle'

const LEGACY_STORAGE_KEY = 's58-trainer-progress-v1'
const progressKey = (id: EngineId) => `trainer-progress-v1:${id}`

const freshProgress = (): Progress => ({
  trainee: 'Trainee',
  partsInspected: [],
  disassemblyCompleted: false,
  disassemblyMistakes: 0,
  reassemblyCompleted: false,
  reassemblyMistakes: 0,
  reassemblyAttempts: 0,
  quizResults: [],
})

function loadProgress(id: EngineId): Progress {
  try {
    const key = progressKey(id)
    let raw = localStorage.getItem(key)
    if (!raw && id === 's58') {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
      if (legacy) {
        localStorage.setItem(key, legacy)
        raw = legacy
      }
    }
    if (raw) return JSON.parse(raw)
  } catch {
    /* corrupted progress falls back to fresh state */
  }
  return freshProgress()
}

export interface Feedback {
  kind: 'ok' | 'warn' | 'info'
  text: string
  ts: number
}

interface State {
  engine: EngineDefinition | null
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
  /** index of next teardown step in active engine.removalSequence */
  disasmStep: number
  disasmMistakes: number
  /** reassembly */
  reasmStep: number // index counting down through active engine.removalSequence reversed
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
  lang: Lang
  /** engine running state for the simulation modes (flow/combust/stress) */
  engineRunning: boolean
  sideCollapsed: boolean
  infoCollapsed: boolean
  glossaryOpen: boolean

  selectEngine: (id: EngineId) => void
  exitToLanding: () => void
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
  setLang: (l: Lang) => void
  toggleSidePanel: () => void
  toggleInfoPanel: () => void
  setGlossaryOpen: (v: boolean) => void
  toggleEngine: () => void
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

function persist(engine: EngineDefinition | null, p: Progress) {
  if (!engine) return
  localStorage.setItem(progressKey(engine.meta.id), JSON.stringify(p))
}

export const useStore = create<State>((set, get) => ({
  engine: null,
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
  progress: freshProgress(),
  resetViewToken: 0,
  focusPartId: null,
  flowRpm: 3000,
  flowThrottle: 0.6,
  flowCircuits: new Set(['intake', 'exhaust', 'coolant', 'oil']),
  simRpm: 2400,
  simLoad: 0.8,
  simTimeScale: 0.05,
  theme: (localStorage.getItem('s58-theme') as 'dark' | 'light') || 'dark',
  lang: (localStorage.getItem('s58-lang') as Lang) || 'en',
  engineRunning: false,
  sideCollapsed: localStorage.getItem('s58-side-collapsed') === '1',
  infoCollapsed: localStorage.getItem('s58-info-collapsed') === '1',
  glossaryOpen: false,

  selectEngine: (id) => {
    const engine = getEngine(id)
    simClock.thetaDeg = 0
    engineSound.stop()
    localStorage.setItem('trainer-last-engine', id)
    set({
      engine,
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
      progress: loadProgress(id),
      resetViewToken: 0,
      focusPartId: null,
      flowRpm: Math.min(3000, engine.cycle.redlineRpm),
      flowThrottle: 0.6,
      flowCircuits: new Set(['intake', 'exhaust', 'coolant', 'oil']),
      simRpm: Math.min(2400, engine.cycle.redlineRpm),
      simLoad: 0.8,
      simTimeScale: 0.05,
      engineRunning: false,
    })
  },

  exitToLanding: () => {
    simClock.thetaDeg = 0
    engineSound.stop()
    set({
      engine: null,
      mode: 'explore',
      selectedId: null,
      hoveredId: null,
      offsets: {},
      hiddenIds: new Set(),
      isolatedSystem: null,
      exploded: false,
      removedIds: new Set(),
      carryingId: null,
      feedback: null,
      engineRunning: false,
      progress: freshProgress(),
    })
  },

  setMode: (m) => {
    if (!get().engine) return
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
      engineRunning: false,
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
  toggleEngine: () => set((s) => ({ engineRunning: !s.engineRunning })),
  toggleTheme: () =>
    set((s) => {
      const theme = s.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('s58-theme', theme)
      return { theme }
    }),
  setLang: (l) => {
    localStorage.setItem('s58-lang', l)
    set({ lang: l })
  },
  toggleSidePanel: () =>
    set((s) => {
      localStorage.setItem('s58-side-collapsed', s.sideCollapsed ? '0' : '1')
      return { sideCollapsed: !s.sideCollapsed }
    }),
  toggleInfoPanel: () =>
    set((s) => {
      localStorage.setItem('s58-info-collapsed', s.infoCollapsed ? '0' : '1')
      return { infoCollapsed: !s.infoCollapsed }
    }),
  setGlossaryOpen: (v) => set({ glossaryOpen: v }),
  flash: (f) => {
    set({ feedback: { ...f, ts: Date.now() } })
    setTimeout(() => {
      const cur = get().feedback
      if (cur && Date.now() - cur.ts >= 3800) set({ feedback: null })
    }, 4000)
  },

  markInspected: (id) =>
    set((s) => {
      if (!s.engine) return {}
      if (s.progress.partsInspected.includes(id)) return {}
      const progress = { ...s.progress, partsInspected: [...s.progress.partsInspected, id] }
      persist(s.engine, progress)
      return { progress }
    }),

  attemptRemove: (id) => {
    const s = get()
    const lang = s.lang
    const engine = s.engine
    if (!engine || s.mode !== 'disassembly') return
    const expected = engine.removalSequence[s.disasmStep]
    if (!expected) return
    const part = engine.partMap.get(id)
    if (!part) return
    if (part.removalOrder === -1) {
      get().flash({ kind: 'warn', text: t(lang, 'fb.structuralCore', { name: pName(lang, engine, part) }) })
      return
    }
    if (s.removedIds.has(id)) return
    if (id === expected.id) {
      const removed = new Set(s.removedIds)
      removed.add(id)
      const nextStep = s.disasmStep + 1
      const done = nextStep >= engine.removalSequence.length
      set({ removedIds: removed, disasmStep: nextStep, selectedId: id })
      get().flash({ kind: 'ok', text: t(lang, 'fb.removedCorrect', { name: pName(lang, engine, part) }) })
      if (done) {
        const progress = { ...s.progress, disassemblyCompleted: true, disassemblyMistakes: s.disasmMistakes }
        persist(engine, progress)
        set({ progress })
        get().flash({ kind: 'ok', text: t(lang, 'fb.teardownComplete') })
      }
    } else {
      const blockers = part.dependencies.filter((d) => !s.removedIds.has(d))
      const reason = blockers.length
        ? t(lang, 'fb.removeFirst', {
            names: blockers.map((b) => pName(lang, engine, engine.partMap.get(b)!)).join('、'),
          })
        : t(lang, 'fb.outOfSequence', { name: pName(lang, engine, expected) })
      set({ disasmMistakes: s.disasmMistakes + 1 })
      get().flash({ kind: 'warn', text: t(lang, 'fb.cannotRemove', { name: pName(lang, engine, part), reason }) })
    }
  },

  startReassembly: () => {
    const engine = get().engine
    if (!engine) return
    const all = new Set(engine.removalSequence.map((p) => p.id))
    set((s) => {
      const progress = { ...s.progress, reassemblyAttempts: s.progress.reassemblyAttempts + 1 }
      persist(engine, progress)
      return { removedIds: all, reasmStep: engine.removalSequence.length - 1, reasmMistakes: 0, carryingId: null, progress }
    })
  },

  pickUpRemoved: (id) => {
    const s = get()
    if (!s.engine || s.mode !== 'reassembly' || !s.removedIds.has(id)) return
    set({ carryingId: id, selectedId: id })
  },

  attemptPlace: (id) => {
    const s = get()
    const lang = s.lang
    const engine = s.engine
    if (!engine) return
    const expected = engine.removalSequence[s.reasmStep]
    const part = engine.partMap.get(id)
    if (!expected || !part) return
    if (id === expected.id) {
      const removed = new Set(s.removedIds)
      removed.delete(id)
      const nextStep = s.reasmStep - 1
      const done = nextStep < 0
      set({ removedIds: removed, reasmStep: nextStep, carryingId: null })
      get().flash({ kind: 'ok', text: t(lang, 'fb.installedCorrect', { name: pName(lang, engine, part) }) })
      if (done) {
        const progress = { ...s.progress, reassemblyCompleted: true, reassemblyMistakes: s.reasmMistakes }
        persist(engine, progress)
        set({ progress })
        get().flash({ kind: 'ok', text: t(lang, 'fb.reassemblyComplete') })
      }
    } else {
      set({ reasmMistakes: s.reasmMistakes + 1, carryingId: null })
      get().flash({
        kind: 'warn',
        text: t(lang, 'fb.cannotInstall', { name: pName(lang, engine, part), expected: pName(lang, engine, expected) }),
      })
    }
  },

  startQuiz: () =>
    set({ quizIndex: 0, quizScore: 0, quizMistakes: [], quizAnswered: false, quizStartTs: Date.now() }),

  answerIdentify: (clickedId) => {
    const s = get()
    const lang = s.lang
    const engine = s.engine
    if (!engine || s.mode !== 'quiz' || s.quizAnswered) return
    const q = engine.quiz[s.quizIndex]
    if (!q || q.kind !== 'identify') return
    if (clickedId === q.targetPartId || q.altTargetIds?.includes(clickedId)) {
      set({ quizScore: s.quizScore + 1, quizAnswered: true })
      get().flash({ kind: 'ok', text: t(lang, 'fb.correct') })
    } else {
      const target = engine.partMap.get(q.targetPartId!)
      const clicked = engine.partMap.get(clickedId)
      set({ quizMistakes: [...s.quizMistakes, q.id], quizAnswered: true, selectedId: q.targetPartId! })
      get().flash({
        kind: 'warn',
        text: t(lang, 'fb.identifyWrong', {
          clicked: clicked ? pName(lang, engine, clicked) : t(lang, 'fb.anotherPart'),
          answer: target ? pName(lang, engine, target) : '',
        }),
      })
    }
  },

  answerChoice: (index) => {
    const s = get()
    const lang = s.lang
    const engine = s.engine
    if (!engine || s.quizAnswered) return
    const q = engine.quiz[s.quizIndex]
    if (!q || q.kind !== 'choice') return
    if (index === q.correctIndex) {
      set({ quizScore: s.quizScore + 1, quizAnswered: true })
      get().flash({ kind: 'ok', text: t(lang, 'fb.correct') })
    } else {
      set({ quizMistakes: [...s.quizMistakes, q.id], quizAnswered: true })
      get().flash({
        kind: 'warn',
        text: t(lang, 'fb.choiceWrong', {
          answer: quizOptions(lang, engine, q)[q.correctIndex!],
        }),
      })
    }
  },

  nextQuestion: () => {
    const s = get()
    const engine = s.engine
    if (!engine) return
    const next = s.quizIndex + 1
    if (next >= engine.quiz.length) {
      const result: QuizResult = {
        date: new Date().toISOString(),
        score: s.quizScore,
        total: engine.quiz.length,
        mistakes: s.quizMistakes,
        timeSec: Math.round((Date.now() - s.quizStartTs) / 1000),
      }
      const progress = { ...s.progress, quizResults: [...s.progress.quizResults, result] }
      persist(engine, progress)
      set({ progress, quizIndex: next, selectedId: null })
    } else {
      set({ quizIndex: next, quizAnswered: false, selectedId: null })
    }
  },

  exportCsv: () => {
    const engine = get().engine
    if (!engine) return
    const p = get().progress
    const rows = [
      ['engine_id', 'metric', 'value'],
      [engine.meta.id, 'trainee', p.trainee],
      [engine.meta.id, 'parts_inspected', String(p.partsInspected.length)],
      [engine.meta.id, 'disassembly_completed', String(p.disassemblyCompleted)],
      [engine.meta.id, 'disassembly_mistakes', String(p.disassemblyMistakes)],
      [engine.meta.id, 'reassembly_completed', String(p.reassemblyCompleted)],
      [engine.meta.id, 'reassembly_attempts', String(p.reassemblyAttempts)],
      [engine.meta.id, 'reassembly_mistakes', String(p.reassemblyMistakes)],
      ...p.quizResults.map((r, i) => [
        engine.meta.id,
        `quiz_${i + 1}`,
        `${r.score}/${r.total} in ${r.timeSec}s on ${r.date}`,
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${engine.meta.id}-training-report.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  },
}))
