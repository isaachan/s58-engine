import React, { useState } from 'react'
import { useStore } from '../store'
import { SYSTEMS } from '../data/systems'
import { useI18n } from '../i18n'

const FoldButton: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const { t } = useI18n()
  return (
    <button
      className="panel-fold"
      onClick={() => useStore.getState().toggleInfoPanel()}
      title={collapsed ? t('panel.expand') : t('panel.collapse')}
      aria-expanded={!collapsed}
    >
      {collapsed ? '«' : '»'}
    </button>
  )
}

export const InfoPanel: React.FC = () => {
  const selectedId = useStore((s) => s.selectedId)
  const engine = useStore((s) => s.engine)
  const mode = useStore((s) => s.mode)
  const collapsed = useStore((s) => s.infoCollapsed)
  const hiddenHas = useStore((s) => (selectedId ? s.hiddenIds.has(selectedId) : false))
  const [expanded, setExpanded] = useState(false)
  const { t, pName, pField, sysName } = useI18n()
  const part = selectedId && engine ? engine.partMap.get(selectedId) : null

  if (collapsed) {
    return (
      <aside className="info-panel collapsed">
        <FoldButton collapsed />
      </aside>
    )
  }

  if (!part) {
    return (
      <aside className="info-panel dim">
        <FoldButton collapsed={false} />
        <h2>{t('info.learningPanel')}</h2>
        <p className="muted">{t('info.emptyHint')}</p>
        <ul className="hint-list">
          <li>{t('info.hint.rotate')}</li>
          <li>{t('info.hint.pan')}</li>
          <li>{t('info.hint.zoom')}</li>
        </ul>
      </aside>
    )
  }

  const sys = SYSTEMS[part.system]
  const failure = pField(part, 'failurePoints')
  const simplified = pField(part, 'simplified')
  return (
    <aside className="info-panel">
      <FoldButton collapsed={false} />
      <div className="sys-chip" style={{ background: sys.color }}>
        {sysName(sys.id, sys.name)}
      </div>
      <h2>{pName(part)}</h2>
      <div className="info-row">
        <span className="info-key">{t('info.function')}</span>
        <p>{pField(part, 'function')}</p>
      </div>
      <div className="info-row">
        <span className="info-key">{t('info.location')}</span>
        <p>{pField(part, 'location')}</p>
      </div>
      <div className="info-row">
        <span className="info-key">{t('info.difficulty')}</span>
        <p>
          {'●'.repeat(part.difficulty)}
          {'○'.repeat(3 - part.difficulty)} {t(`info.diff.${part.difficulty}`)}
        </p>
      </div>
      <button className="link-btn" onClick={() => setExpanded(!expanded)}>
        {expanded ? t('info.hideDetails') : t('info.showDetails')}
      </button>
      {expanded && (
        <>
          <div className="info-row">
            <span className="info-key">{t('info.inspection')}</span>
            <p>{pField(part, 'inspectionNotes')}</p>
          </div>
          {failure && (
            <div className="info-row">
              <span className="info-key">{t('info.commonWear')}</span>
              <p>{failure}</p>
            </div>
          )}
          {simplified && (
            <div className="info-row">
              <span className="info-key">{t('info.modelNote')}</span>
              <p className="muted">{simplified}</p>
            </div>
          )}
        </>
      )}
      <div className="info-row">
        <span className="info-key">{t('info.relatedParts')}</span>
        <div className="related">
          {part.relatedPartIds.map((id) => {
            const rp = engine?.partMap.get(id)
            if (!rp) return null
            return (
              <button
                key={id}
                className="related-chip"
                onClick={() => {
                  useStore.getState().select(id)
                  useStore.getState().focusPart(id)
                }}
              >
                {pName(rp)}
              </button>
            )
          })}
        </div>
      </div>
      {mode === 'explore' && (
        <div className="panel-actions">
          <button onClick={() => useStore.getState().resetPart(part.id)}>{t('info.resetPosition')}</button>
          <button onClick={() => useStore.getState().toggleHidden(part.id)}>
            {hiddenHas ? t('info.showPart') : t('info.hidePart')}
          </button>
        </div>
      )}
    </aside>
  )
}
