import React from 'react'
import { EngineScene } from './engine/EngineScene'
import { InfoPanel } from './ui/InfoPanel'
import { SidePanel } from './ui/SidePanel'
import { TopBar, BottomToolbar, Toast } from './ui/Toolbar'

export const App: React.FC = () => (
  <div className="app">
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
