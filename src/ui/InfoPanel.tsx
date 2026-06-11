import React, { useState } from 'react'
import { useStore } from '../store'
import { PART_MAP } from '../data/parts'
import { SYSTEMS } from '../data/systems'

export const InfoPanel: React.FC = () => {
  const selectedId = useStore((s) => s.selectedId)
  const mode = useStore((s) => s.mode)
  const [expanded, setExpanded] = useState(false)
  const part = selectedId ? PART_MAP.get(selectedId) : null

  if (!part) {
    return (
      <aside className="info-panel dim">
        <h2>Learning Panel</h2>
        <p className="muted">
          Click a part to inspect it. Double-click to focus the camera. Drag a selected part to pull
          it away from the assembly.
        </p>
        <ul className="hint-list">
          <li>Left-drag — rotate</li>
          <li>Right-drag — pan</li>
          <li>Scroll — zoom</li>
        </ul>
      </aside>
    )
  }

  const sys = SYSTEMS[part.system]
  return (
    <aside className="info-panel">
      <div className="sys-chip" style={{ background: sys.color }}>
        {sys.name}
      </div>
      <h2>{part.name}</h2>
      <div className="info-row">
        <span className="info-key">Function</span>
        <p>{part.function}</p>
      </div>
      <div className="info-row">
        <span className="info-key">Location</span>
        <p>{part.location}</p>
      </div>
      <div className="info-row">
        <span className="info-key">Difficulty</span>
        <p>{'●'.repeat(part.difficulty)}{'○'.repeat(3 - part.difficulty)} {['Basic', 'Intermediate', 'Advanced'][part.difficulty - 1]}</p>
      </div>
      <button className="link-btn" onClick={() => setExpanded(!expanded)}>
        {expanded ? '▾ Hide service details' : '▸ Service & inspection details'}
      </button>
      {expanded && (
        <>
          <div className="info-row">
            <span className="info-key">Inspection</span>
            <p>{part.inspectionNotes}</p>
          </div>
          {part.failurePoints && (
            <div className="info-row">
              <span className="info-key">Common wear</span>
              <p>{part.failurePoints}</p>
            </div>
          )}
          {part.simplified && (
            <div className="info-row">
              <span className="info-key">Model note</span>
              <p className="muted">{part.simplified}</p>
            </div>
          )}
        </>
      )}
      <div className="info-row">
        <span className="info-key">Related parts</span>
        <div className="related">
          {part.relatedPartIds.map((id) => {
            const rp = PART_MAP.get(id)
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
                {rp.name}
              </button>
            )
          })}
        </div>
      </div>
      {mode === 'explore' && (
        <div className="panel-actions">
          <button onClick={() => useStore.getState().resetPart(part.id)}>Reset position</button>
          <button onClick={() => useStore.getState().toggleHidden(part.id)}>
            {useStore.getState().hiddenIds.has(part.id) ? 'Show' : 'Hide'} part
          </button>
        </div>
      )}
    </aside>
  )
}
