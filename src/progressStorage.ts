import type { Progress } from './types'
import type { EngineId } from './engines/types'
import { k } from './storage'

/**
 * Single source of truth for trainee-progress persistence.
 * Both the store and the landing screen read/write through here, so the
 * storage key and serialization format can never silently drift apart.
 */

/** Older key shapes, newest first, migrated on read. */
const legacyProgressKeys = (id: EngineId): string[] => [
  `trainer-progress-v1:${id}`,
  ...(id === 's58' ? ['s58-trainer-progress-v1'] : []),
]

export const progressKey = (id: EngineId) => k(`progress-v1:${id}`)

export const freshProgress = (): Progress => ({
  trainee: 'Trainee',
  partsInspected: [],
  disassemblyCompleted: false,
  disassemblyMistakes: 0,
  reassemblyCompleted: false,
  reassemblyMistakes: 0,
  reassemblyAttempts: 0,
  quizResults: [],
})

/** Read raw stored progress for an engine, migrating older key shapes once. */
function readStored(id: EngineId): Progress | null {
  try {
    const key = progressKey(id)
    let raw = localStorage.getItem(key)
    if (!raw) {
      for (const old of legacyProgressKeys(id)) {
        const legacy = localStorage.getItem(old)
        if (legacy) {
          localStorage.setItem(key, legacy)
          raw = legacy
          break
        }
      }
    }
    if (raw) return JSON.parse(raw)
  } catch {
    /* corrupted progress falls back to caller default */
  }
  return null
}

/** Full progress for an engine, falling back to a fresh record when absent. */
export function loadProgress(id: EngineId): Progress {
  return readStored(id) ?? freshProgress()
}

/** Stored progress summary, or null when the engine has never been started. */
export function loadProgressSummary(id: EngineId): Progress | null {
  return readStored(id)
}

export function saveProgress(id: EngineId, p: Progress): void {
  localStorage.setItem(progressKey(id), JSON.stringify(p))
}
