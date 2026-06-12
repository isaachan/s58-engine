import React from 'react'
import { useStore } from '../store'
import type { Mode } from '../types'
import { useI18n, LANGS } from '../i18n'

const MODES: { id: Mode; key: string; icon: string }[] = [
  { id: 'explore', key: 'mode.explore', icon: '🔍' },
  { id: 'exploded', key: 'mode.exploded', icon: '💥' },
  { id: 'disassembly', key: 'mode.disassembly', icon: '🔧' },
  { id: 'reassembly', key: 'mode.reassembly', icon: '🔩' },
  { id: 'quiz', key: 'mode.quiz', icon: '📋' },
  { id: 'flow', key: 'mode.flow', icon: '💨' },
  { id: 'combust', key: 'mode.combust', icon: '🔥' },
  { id: 'stress', key: 'mode.stress', icon: '📈' },
]

const LangSwitch: React.FC = () => {
  const { lang, t } = useI18n()
  return (
    <div className="lang-switch" title={t('lang.title')}>
      {LANGS.map((l) => (
        <button
          key={l.id}
          className={lang === l.id ? 'active' : ''}
          onClick={() => useStore.getState().setLang(l.id)}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}

export const TopBar: React.FC = () => {
  const mode = useStore((s) => s.mode)
  const theme = useStore((s) => s.theme)
  const { t } = useI18n()
  return (
    <header className="top-bar">
      <div className="brand">
        <span className="brand-badge">S58</span>
        <div>
          <div className="brand-title">{t('brand.title')}</div>
          <div className="brand-sub">{t('brand.sub')}</div>
        </div>
      </div>
      <nav className="mode-tabs">
        {MODES.map((m) => (
          <button
            key={m.id}
            className={mode === m.id ? 'active' : ''}
            onClick={() => useStore.getState().setMode(m.id)}
            title={t(m.key)}
          >
            <span aria-hidden>{m.icon}</span> {t(m.key)}
          </button>
        ))}
        <LangSwitch />
        <button
          className="theme-toggle"
          onClick={() => useStore.getState().toggleTheme()}
          title={theme === 'dark' ? t('theme.titleToLight') : t('theme.titleToDark')}
          aria-label="Toggle light/dark theme"
        >
          {theme === 'dark' ? t('theme.toLight') : t('theme.toDark')}
        </button>
      </nav>
    </header>
  )
}

export const BottomToolbar: React.FC = () => {
  const exploded = useStore((s) => s.exploded)
  const showLabels = useStore((s) => s.showLabels)
  const mode = useStore((s) => s.mode)
  const { t } = useI18n()
  const st = useStore.getState

  return (
    <footer className="bottom-bar">
      {(mode === 'explore' || mode === 'exploded') && (
        <button className={exploded ? 'active' : ''} onClick={() => st().setExploded(!exploded)} title={t('bottom.title.explode')}>
          {t('bottom.explode')}
        </button>
      )}
      <button className={showLabels ? 'active' : ''} onClick={() => st().toggleLabels()} title={t('bottom.title.labels')}>
        {t('bottom.labels')}
      </button>
      <button onClick={() => st().requestResetView()} title={t('bottom.title.resetView')}>
        {t('bottom.resetView')}
      </button>
      {mode === 'explore' && (
        <button onClick={() => st().resetAll()} title={t('bottom.title.resetParts')}>
          {t('bottom.resetParts')}
        </button>
      )}
      <span className="bar-hint">{t('bottom.hint')}</span>
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
