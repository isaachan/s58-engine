import React, { useEffect } from 'react'
import { EngineScene } from './engine/EngineScene'
import { InfoPanel } from './ui/InfoPanel'
import { SidePanel } from './ui/SidePanel'
import { TopBar, BottomToolbar, Toast } from './ui/Toolbar'
import { useStore } from './store'

const ThemeApplier: React.FC = () => {
  const theme = useStore((s) => s.theme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  return null
}

export const App: React.FC = () => (
  <div className="app">
    <ThemeApplier />
    <TopBar />
    <div className="main">
      <SidePanel />
      <div className="viewport">
        <EngineScene />
        <Toast />
        <BottomToolbar />
      </div>
      <InfoPanel />
    </div>
  </div>
)
