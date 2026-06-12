import React from 'react'
import { ENGINE_METAS } from '../engines'
import type { EngineId, EngineMeta, LocalizedString } from '../engines/types'
import type { Progress } from '../types'
import { useI18n } from '../i18n'
import { useStore } from '../store'

const progressKey = (id: EngineId) => `trainer-progress-v1:${id}`

function loadSummary(id: EngineId): Progress | null {
  try {
    const raw = localStorage.getItem(progressKey(id))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const Text: React.FC<{ value: LocalizedString }> = ({ value }) => {
  const { lang } = useI18n()
  return <>{lang === 'zh' ? value.zh : value.en}</>
}

const EngineCard: React.FC<{ meta: EngineMeta; last: string | null }> = ({ meta, last }) => {
  const { t } = useI18n()
  const p = loadSummary(meta.id)
  const best = p?.quizResults.length ? Math.max(...p.quizResults.map((r) => Math.round((r.score / r.total) * 100))) : 0
  return (
    <button className="engine-card" onClick={() => useStore.getState().selectEngine(meta.id)}>
      <div className="engine-card-head">
        <span className="brand-badge">{meta.badge}</span>
        {last === meta.id && <span className="last-used">{t('landing.lastUsed')}</span>}
      </div>
      <h2><Text value={meta.name} /></h2>
      <p className="muted"><Text value={meta.subtitle} /></p>
      <div className="spec-grid">
        <span>{t('landing.layout')}</span><strong><Text value={meta.specs.layout} /></strong>
        <span>{t('landing.displacement')}</span><strong>{meta.specs.displacementL.toFixed(3)} L</strong>
        <span>{t('landing.cylinders')}</span><strong>{meta.specs.cylinders}</strong>
        <span>{t('landing.turbo')}</span><strong><Text value={meta.specs.turbo} /></strong>
        <span>{t('landing.output')}</span><strong>{meta.specs.powerKw} kW / {meta.specs.torqueNm} N·m</strong>
        <span>{t('landing.redline')}</span><strong>{meta.specs.redlineRpm} rpm</strong>
        <span>{t('landing.cr')}</span><strong>{meta.specs.compressionRatio}:1</strong>
        <span>{t('landing.firing')}</span><strong>{meta.specs.firingOrder}</strong>
      </div>
      <div className="landing-progress">
        <span>{t('landing.progress')}</span>
        <strong>
          {p ? `${p.partsInspected.length}/${meta.partCount} · ${best}%` : t('landing.notStarted')}
        </strong>
      </div>
    </button>
  )
}

export const LandingScreen: React.FC = () => {
  const { t } = useI18n()
  const last = localStorage.getItem('trainer-last-engine')
  return (
    <main className="landing">
      <section className="landing-inner">
        <div className="landing-copy">
          <span className="landing-kicker">{t('landing.choose')}</span>
          <h1>{t('landing.title')}</h1>
        </div>
        <div className="engine-card-grid">
          {ENGINE_METAS.map((m) => (
            <EngineCard key={m.id} meta={m} last={last} />
          ))}
        </div>
      </section>
    </main>
  )
}
