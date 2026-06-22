import type { Lang } from './strings'
import type { PartDef, QuizQuestion, SystemId } from '../types'
import type { EngineDefinition } from '../engines/types'

/**
 * Shared, engine-agnostic translation overlays (system names, circuit names).
 * Per-engine part/quiz translations live in each engine's `content.zh.ts`
 * (`engine.zh`), the single source of truth; resolvers below fall back to the
 * English field when a Chinese rendering is missing.
 */

type PartFieldKey = 'name' | 'function' | 'location' | 'inspectionNotes' | 'failurePoints' | 'simplified'

const SYSTEMS_ZH: Record<SystemId, string> = {
  block: '气缸体与曲轴箱',
  head: '气缸盖与气门机构',
  rotating: '曲轴、活塞与连杆',
  timing: '正时系统',
  turbo: '涡轮增压系统',
  intake: '进气系统',
  exhaust: '排气系统',
  cooling: '冷却系统',
  lubrication: '润滑系统',
  fuel: '燃油喷射系统',
}

const CIRCUITS_ZH: Record<string, string> = {
  intake: '进气',
  exhaust: '排气',
  coolant: '冷却液',
  oil: '机油',
}

/* ------------------------------- resolvers ------------------------------- */

export function pField(lang: Lang, engine: EngineDefinition | null, part: PartDef, field: PartFieldKey): string | undefined {
  if (lang === 'zh') {
    const engineValue = engine?.zh.parts[part.id]?.[field]
    if (engineValue !== undefined) return engineValue
  }
  return part[field] as string | undefined
}

export const pName = (lang: Lang, engine: EngineDefinition | null, part: PartDef): string => pField(lang, engine, part, 'name')!

export function sysName(lang: Lang, id: SystemId, fallback: string): string {
  return lang === 'zh' ? SYSTEMS_ZH[id] ?? fallback : fallback
}

export function circuitName(lang: Lang, id: string, fallback: string): string {
  return lang === 'zh' ? CIRCUITS_ZH[id] ?? fallback : fallback
}

export function quizPrompt(lang: Lang, engine: EngineDefinition | null, q: QuizQuestion): string {
  return lang === 'zh' ? engine?.zh.quiz[q.id]?.prompt ?? q.prompt : q.prompt
}

export function quizOptions(lang: Lang, engine: EngineDefinition | null, q: QuizQuestion): string[] {
  if (lang === 'zh' && engine?.zh.quiz[q.id]?.options) return engine.zh.quiz[q.id].options!
  return q.options ?? []
}
