import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { GLOSSARY, GLOSSARY_LIST, type GlossaryEntry } from '../data/glossary'
import { useI18n } from '../i18n'
import type { Lang } from '../i18n'
import { SourceList } from './SourceList'

interface IndexEntry {
  id: string
  phrase: string // original-case phrase
  lc: string // lowercased (English matching is case-insensitive)
  len: number
}

// Per-language phrase index, longest-first so "boost pressure" wins over "boost".
const INDEX_CACHE: Partial<Record<Lang, IndexEntry[]>> = {}

function getIndex(lang: Lang): IndexEntry[] {
  const cached = INDEX_CACHE[lang]
  if (cached) return cached
  const list: IndexEntry[] = []
  for (const entry of GLOSSARY_LIST) {
    for (const phrase of entry.match[lang]) {
      list.push({ id: entry.id, phrase, lc: phrase.toLowerCase(), len: phrase.length })
    }
  }
  list.sort((a, b) => b.len - a.len)
  INDEX_CACHE[lang] = list
  return list
}

const isWordChar = (c: string) => /[A-Za-z0-9]/.test(c)

type Segment = string | { id: string; text: string }

/**
 * Split prose into plain strings and glossary hits. English matches require
 * word boundaries; Chinese matches don't (no spaces). Each glossary entry is
 * linked at most once per block to avoid clutter.
 */
function tokenize(text: string, lang: Lang): Segment[] {
  const index = getIndex(lang)
  const lower = lang === 'en' ? text.toLowerCase() : text
  const seen = new Set<string>()
  const segments: Segment[] = []
  let buf = ''
  let i = 0

  while (i < text.length) {
    let hit: IndexEntry | null = null
    for (const e of index) {
      if (seen.has(e.id)) continue
      if (lang === 'en') {
        if (lower.startsWith(e.lc, i)) {
          const before = i === 0 ? ' ' : text[i - 1]
          const after = i + e.len >= text.length ? ' ' : text[i + e.len]
          if (!isWordChar(before) && !isWordChar(after)) {
            hit = e
            break
          }
        }
      } else if (text.startsWith(e.phrase, i)) {
        hit = e
        break
      }
    }
    if (hit) {
      if (buf) {
        segments.push(buf)
        buf = ''
      }
      segments.push({ id: hit.id, text: text.substr(i, hit.len) })
      seen.add(hit.id)
      i += hit.len
    } else {
      buf += text[i]
      i++
    }
  }
  if (buf) segments.push(buf)
  return segments
}

const TermPopover: React.FC<{
  anchor: DOMRect
  startId: string
  onClose: () => void
}> = ({ anchor, startId, onClose }) => {
  const { lang } = useI18n()
  const [id, setId] = useState(startId)
  const [more, setMore] = useState(false)
  const entry: GlossaryEntry | undefined = GLOSSARY[id]
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onScrollOrEsc = (e: Event) => {
      if (e.type === 'scroll' || (e as KeyboardEvent).key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('scroll', onScrollOrEsc, true)
    window.addEventListener('keydown', onScrollOrEsc)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('scroll', onScrollOrEsc, true)
      window.removeEventListener('keydown', onScrollOrEsc)
    }
  }, [onClose])

  if (!entry) return null
  const width = 280
  const left = Math.min(anchor.left, window.innerWidth - width - 12)
  const top = anchor.bottom + 6

  return createPortal(
    <div ref={ref} className="gloss-pop" style={{ left, top, width }}>
      <div className="gloss-pop-term">{entry.term[lang]}</div>
      <p className="gloss-pop-short">{entry.short[lang]}</p>
      {entry.long && more && <p className="gloss-pop-long">{entry.long[lang]}</p>}
      {entry.long && (
        <button className="link-btn gloss-more" onClick={() => setMore((m) => !m)}>
          {more ? (lang === 'zh' ? '收起' : 'Less') : lang === 'zh' ? '展开详解' : 'More'}
        </button>
      )}
      {entry.sources && entry.sources.length > 0 && <SourceList sources={entry.sources} />}
      {entry.related && entry.related.length > 0 && (
        <div className="gloss-related">
          {entry.related.map((rid) => {
            const r = GLOSSARY[rid]
            if (!r) return null
            return (
              <button
                key={rid}
                className="gloss-chip"
                onClick={() => {
                  setId(rid)
                  setMore(false)
                }}
              >
                {r.term[lang]}
              </button>
            )
          })}
        </div>
      )}
    </div>,
    document.body,
  )
}

const Term: React.FC<{ id: string; text: string }> = ({ id, text }) => {
  const btn = useRef<HTMLButtonElement>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)
  return (
    <>
      <button
        ref={btn}
        className="gloss-term"
        onClick={() => setRect(rect ? null : btn.current!.getBoundingClientRect())}
      >
        {text}
      </button>
      {rect && <TermPopover anchor={rect} startId={id} onClose={() => setRect(null)} />}
    </>
  )
}

/**
 * Renders prose with glossary terms auto-linked into clickable definitions.
 * Falls back to plain text when there's nothing to link.
 */
export const RichText: React.FC<{ children?: string }> = ({ children }) => {
  const { lang } = useI18n()
  const segments = useMemo(() => (children ? tokenize(children, lang) : []), [children, lang])
  if (!children) return null
  return (
    <>
      {segments.map((seg, i) =>
        typeof seg === 'string' ? (
          <React.Fragment key={i}>{seg}</React.Fragment>
        ) : (
          <Term key={i} id={seg.id} text={seg.text} />
        ),
      )}
    </>
  )
}
