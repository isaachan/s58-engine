import type { EngineDefinition, EngineId, EngineMeta } from './types'
import { S58_ENGINE } from './s58'
import { B48_ENGINE } from './b48'
import { SKYACTIV_G_ENGINE } from './skyactiv-g'
import { EA888_ENGINE } from './ea888'
import { N52_ENGINE } from './n52'

const ENGINES: Record<EngineId, EngineDefinition> = {
  s58: S58_ENGINE,
  b48: B48_ENGINE,
  'skyactiv-g': SKYACTIV_G_ENGINE,
  ea888: EA888_ENGINE,
  n52: N52_ENGINE,
}

export const ENGINE_IDS = Object.keys(ENGINES) as EngineId[]
export const ENGINE_METAS: EngineMeta[] = ENGINE_IDS.map((id) => ENGINES[id].meta)

export function getEngine(id: EngineId): EngineDefinition {
  return ENGINES[id]
}

function assertEngine(def: EngineDefinition) {
  const ids = new Set(def.parts.map((p) => p.id))
  const orders = def.removalSequence.map((p) => p.removalOrder)
  orders.forEach((order, i) => {
    if (order !== i + 1) throw new Error(`${def.meta.id}: removal order must be contiguous at ${i + 1}`)
  })
  for (const p of def.parts) {
    for (const id of [...p.dependencies, ...p.relatedPartIds]) {
      if (!ids.has(id)) throw new Error(`${def.meta.id}: ${p.id} references unknown part ${id}`)
    }
  }
  for (const q of def.quiz) {
    for (const id of [q.targetPartId, ...(q.altTargetIds ?? []), ...(q.orderPartIds ?? [])]) {
      if (id && !ids.has(id)) throw new Error(`${def.meta.id}: quiz ${q.id} references unknown part ${id}`)
    }
  }
  for (const [id] of def.stressParts) {
    if (!ids.has(id)) throw new Error(`${def.meta.id}: stress row references unknown part ${id}`)
  }
  for (const id of def.movingPartIds) {
    if (!ids.has(id)) throw new Error(`${def.meta.id}: moving part references unknown part ${id}`)
  }
}

Object.values(ENGINES).forEach(assertEngine)
