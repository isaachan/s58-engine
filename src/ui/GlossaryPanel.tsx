import React, { useMemo, useState } from 'react'
import { GLOSSARY, GLOSSARY_LIST } from '../data/glossary'
import { useStore } from '../store'
import { useI18n } from '../i18n'
import { SourceList } from './SourceList'

/**
 * Browsable glossary overlay: a searchable list of every term with its full
 * definition, sources, and cross-links. Opened from the top bar.
 */
export const GlossaryPanel: React.FC = () => {
  const open = useStore((s) => s.glossaryOpen)
  const { lang, t } = useI18n()
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = [...GLOSSARY_LIST].sort((a, b) => a.term[lang].localeCompare(b.term[lang]))
    if (!q) return list
    return list.filter(
      (e) =>
        e.term.en.toLowerCase().includes(q) ||
        e.term.zh.includes(query.trim()) ||
        e.match.en.some((m) => m.toLowerCase().includes(q)) ||
        e.match.zh.some((m) => m.includes(query.trim())),
    )
  }, [query, lang])

  if (!open) return null
  const active = activeId ? GLOSSARY[activeId] : null
  const close = () => useStore.getState().setGlossaryOpen(false)

  return (
    <div className="gloss-overlay" onMouseDown={close}>
      <div className="gloss-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="gloss-modal-head">
          <h2>{t('glossary.title')}</h2>
          <button className="gloss-close" onClick={close} aria-label="Close">
            ✕
          </button>
        </div>
        <input
          className="gloss-search"
          placeholder={t('glossary.search')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <div className="gloss-body">
          <ul className="gloss-index">
            {filtered.map((e) => (
              <li key={e.id}>
                <button
                  className={activeId === e.id ? 'active' : ''}
                  onClick={() => setActiveId(e.id)}
                >
                  {e.term[lang]}
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="muted gloss-empty">{t('glossary.none')}</li>}
          </ul>
          <div className="gloss-detail">
            {active ? (
              <>
                <h3>{active.term[lang]}</h3>
                <p>{active.short[lang]}</p>
                {active.long && <p className="gloss-detail-long">{active.long[lang]}</p>}
                {active.sources && active.sources.length > 0 && (
                  <>
                    <span className="info-key">{t('info.sources')}</span>
                    <SourceList sources={active.sources} />
                  </>
                )}
                {active.related && active.related.length > 0 && (
                  <div className="gloss-related">
                    {active.related.map((rid) => {
                      const r = GLOSSARY[rid]
                      if (!r) return null
                      return (
                        <button key={rid} className="gloss-chip" onClick={() => setActiveId(rid)}>
                          {r.term[lang]}
                        </button>
                      )
                    })}
                  </div>
                )}
              </>
            ) : (
              <p className="muted">{t('glossary.pickHint')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
