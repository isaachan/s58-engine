import { useStore } from '../store'
import { t as rawT, type Lang } from './strings'
import * as content from './content'

export type { Lang }
export { LANGS, t } from './strings'
export * from './content'

/**
 * Hook returning the active language plus translation helpers bound to it.
 * Components re-render when `lang` changes because they subscribe to the store.
 */
export function useI18n() {
  const lang = useStore((s) => s.lang)
  return {
    lang,
    t: (key: string, params?: Record<string, string | number>) => rawT(lang, key, params),
    pName: (part: Parameters<typeof content.pName>[1]) => content.pName(lang, part),
    pField: (part: Parameters<typeof content.pField>[1], field: Parameters<typeof content.pField>[2]) =>
      content.pField(lang, part, field),
    sysName: (id: Parameters<typeof content.sysName>[1], fallback: string) =>
      content.sysName(lang, id, fallback),
    circuitName: (id: string, fallback: string) => content.circuitName(lang, id, fallback),
    quizPrompt: (q: Parameters<typeof content.quizPrompt>[1]) => content.quizPrompt(lang, q),
    quizOptions: (q: Parameters<typeof content.quizOptions>[1]) => content.quizOptions(lang, q),
  }
}
