import React from 'react'
import { useStore } from '../store'
import type { Mode } from '../types'

const MODES: { id: Mode; label: string; icon: string }[] = [
  { id: 'explore', label: 'Explore', icon: '🔍' },
  { id: 'exploded', label: 'Exploded View', icon: '💥' },
  { id: 'disassembly', label: 'Guided Teardown', icon: '🔧' },
  { id: 'reassembly', label: 'Reassembly', icon: '🔩' },
  { id: 'quiz', label: 'Assessment', icon: '📋' },
  { id: 'flow', label: 'Flow', icon: '💨' },
  { id: 'combust', label: 'Combustion', icon: '🔥' },
  { id: 'stress', label: 'Torque · Stress', icon: '📈' },
]

export const TopBar: React.FC = () => {
  const mode = useStore((s) => s.mode)
  return (
    <header className="top-bar">
      <div className="brand">
        <span className="brand-badge">S58</span>
        <div>
          <div className="brand-title">Engine Training Simulator</div>
          <div className="brand-sub">BMW S58B30 · 3.0 L Twin-Turbo Inline-Six</div>
        </div>
      </div>
      <nav className="mode-tabs">
        {MODES.map((m) => (
          <button
            key={m.id}
            className={mode === m.id ? 'active' : ''}
            onClick={() => useStore.getState().setMode(m.id)}
            title={m.label}
          >
            <span aria-hidden>{m.icon}</span> {m.label}
          </button>
        ))}
      </nav>
    </header>
  )
}

export const BottomToolbar: React.FC = () => {
  const exploded = useStore((s) => s.exploded)
  const showLabels = useStore((s) => s.showLabels)
  const mode = useStore((s) => s.mode)
  const st = useStore.getState

  return (
    <footer className="bottom-bar">
      {(mode === 'explore' || mode === 'exploded') && (
        <button className={exploded ? 'active' : ''} onClick={() => st().setExploded(!exploded)} title="Toggle exploded view">
          💥 Explode
        </button>
      )}
      <button className={showLabels ? 'active' : ''} onClick={() => st().toggleLabels()} title="Toggle hover labels">
        🏷 Labels
      </button>
      <button onClick={() => st().requestResetView()} title="Reset camera to home position">
        🎥 Reset view
      </button>
      {mode === 'explore' && (
        <button onClick={() => st().resetAll()} title="Return all parts to original positions">
          ♻️ Reset all parts
        </button>
      )}
      <span className="bar-hint">
        Click: select · Double-click: focus · Drag selected part: move · Right-drag: pan
      </span>
    </footer>
  )
}

export const Toast: React.FC = () => {
  const fb = useStore((s) => s.feedback)
  if (!fb) return null
  return (
    <div key={fb.ts} className={`toast ${fb.kind}`}>
      {fb.kind === 'ok' ? '✔' : fb.kind === 'warn' ? '⚠' : 'ℹ'} {fb.text}
    </div>
  )
}
