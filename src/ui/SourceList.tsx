import React from 'react'
import type { Source } from '../types'
import { useI18n } from '../i18n'

/**
 * Renders a list of citations. Linked sources open in the system browser
 * (Electron's window-open handler forwards target=_blank to shell.openExternal;
 * in a plain browser the link just opens a new tab). Reused by the part info
 * panel and the glossary.
 */
export const SourceList: React.FC<{ sources?: Source[] }> = ({ sources }) => {
  const { lang, t } = useI18n()
  if (!sources || sources.length === 0) return null
  return (
    <ul className="source-list">
      {sources.map((s, i) => {
        const label = lang === 'zh' && s.labelZh ? s.labelZh : s.label
        const kind = t(`info.source.${s.kind}`)
        return (
          <li key={i} className="source-item">
            <span className={`source-kind source-kind--${s.kind}`}>{kind}</span>
            {s.url ? (
              <a className="source-link" href={s.url} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            ) : (
              <span className="source-text">{label}</span>
            )}
            {s.ref && <span className="source-ref">{s.ref}</span>}
          </li>
        )
      })}
    </ul>
  )
}
