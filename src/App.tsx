import React, { useEffect } from 'react'
import { EngineScene } from './engine/EngineScene'
import { InfoPanel } from './ui/InfoPanel'
import { SidePanel } from './ui/SidePanel'
import { TopBar, BottomToolbar, Toast } from './ui/Toolbar'
import { LandingScreen } from './ui/LandingScreen'
import { GlossaryPanel } from './ui/GlossaryPanel'
import { useStore } from './store'
import { engineSound } from './sim/engineSound'

/** drives the synthesized engine note from the running state + active mode's rpm/load */
const EngineAudio: React.FC = () => {
  const running = useStore((s) => s.engineRunning)
  const mode = useStore((s) => s.mode)
  const flowRpm = useStore((s) => s.flowRpm)
  const flowThrottle = useStore((s) => s.flowThrottle)
  const simRpm = useStore((s) => s.simRpm)
  const simLoad = useStore((s) => s.simLoad)
  const engine = useStore((s) => s.engine)

  const active = !!engine && running && (mode === 'flow' || mode === 'combust' || mode === 'stress')
  const rpm = mode === 'flow' ? flowRpm : simRpm
  const load = mode === 'flow' ? flowThrottle : simLoad

  useEffect(() => {
    if (active && engine) engineSound.start(rpm, load, engine.sound)
    else engineSound.stop()
    // start/stop only reacts to activation; retuning is handled below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, engine])

  useEffect(() => {
    if (active && engine) engineSound.update(rpm, load, engine.sound)
  }, [active, rpm, load, engine])

  useEffect(() => () => engineSound.stop(), [])
  return null
}

const ThemeApplier: React.FC = () => {
  const theme = useStore((s) => s.theme)
  const lang = useStore((s) => s.lang)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  }, [lang])
  return null
}

export const App: React.FC = () => {
  const engine = useStore((s) => s.engine)
  return (
    <div className="app">
      <ThemeApplier />
      <EngineAudio />
      {engine ? (
        <>
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
          <GlossaryPanel />
        </>
      ) : (
        <LandingScreen />
      )}
    </div>
  )
}
