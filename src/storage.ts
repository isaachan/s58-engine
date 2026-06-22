/**
 * Single namespace for every localStorage key in the app. Persisted keys must
 * be built through `k(name)` — no scattered string literals, no per-feature
 * prefixes. Replaces the old mixed `s58-*` / `trainer-*` prefixes.
 */

const NS = 'engine-app'

/** Build a namespaced storage key. */
export const k = (name: string) => `${NS}:${name}`

/**
 * One-time migration of preference keys from the old scattered prefixes to the
 * unified namespace. Idempotent: only copies when the new key is absent and the
 * old key exists, so it can run on every startup without clobbering newer values.
 * (Progress keys carry their own migration in progressStorage.ts.)
 */
const LEGACY_PREF_KEYS: Array<[next: string, old: string]> = [
  [k('theme'), 's58-theme'],
  [k('lang'), 's58-lang'],
  [k('side-collapsed'), 's58-side-collapsed'],
  [k('info-collapsed'), 's58-info-collapsed'],
  [k('last-engine'), 'trainer-last-engine'],
]

export function migratePreferenceKeys(): void {
  try {
    for (const [next, old] of LEGACY_PREF_KEYS) {
      if (localStorage.getItem(next) === null) {
        const v = localStorage.getItem(old)
        if (v !== null) localStorage.setItem(next, v)
      }
    }
  } catch {
    /* storage unavailable (private mode / SSR) — fall back to defaults */
  }
}
