import React from 'react'
import { useStore } from '../store'
import { PART_MAP, REMOVAL_SEQUENCE } from '../data/parts'
import { SYSTEMS, SYSTEM_ORDER } from '../data/systems'
import { QUIZ_QUESTIONS } from '../data/quiz'
import { CIRCUITS, computeFlow } from '../sim/flow'
import { getCycle } from '../sim/engineCycle'
import { useEffect, useRef } from 'react'
import { useI18n } from '../i18n'

const ExplodedPanel: React.FC = () => {
  const isolated = useStore((s) => s.isolatedSystem)
  const { t, sysName } = useI18n()
  return (
    <div className="side-content">
      <h3>{t('exploded.systems')}</h3>
      <p className="muted small">{t('exploded.isolateHint')}</p>
      <div className="sys-list">
        <button className={!isolated ? 'active' : ''} onClick={() => useStore.getState().isolate(null)}>
          {t('exploded.allSystems')}
        </button>
        {SYSTEM_ORDER.map((id) => (
          <button
            key={id}
            className={isolated === id ? 'active' : ''}
            onClick={() => useStore.getState().isolate(isolated === id ? null : id)}
          >
            <span className="dot" style={{ background: SYSTEMS[id].color }} />
            {sysName(id, SYSTEMS[id].name)}
          </button>
        ))}
      </div>
    </div>
  )
}

const DisassemblyPanel: React.FC = () => {
  const step = useStore((s) => s.disasmStep)
  const mistakes = useStore((s) => s.disasmMistakes)
  const { t, pName, pField } = useI18n()
  const total = REMOVAL_SEQUENCE.length
  const done = step >= total
  const current = REMOVAL_SEQUENCE[step]

  return (
    <div className="side-content">
      <h3>{t('dis.title')}</h3>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(step / total) * 100}%` }} />
      </div>
      <p className="small muted">{t('dis.stepOf', { n: Math.min(step + 1, total), total, m: mistakes })}</p>
      {done ? (
        <div className="step-card ok">
          <strong>{t('dis.complete')}</strong>
          <p className="small">{t('dis.completeBody')}</p>
          <button onClick={() => useStore.getState().setMode('reassembly')}>{t('dis.startReassembly')}</button>
        </div>
      ) : (
        <div className="step-card">
          <span className="step-label">{t('dis.removeNext')}</span>
          <strong>{pName(current)}</strong>
          <p className="small">{pField(current, 'inspectionNotes')}</p>
        </div>
      )}
      <details className="seq-details">
        <summary>{t('dis.fullSequence')}</summary>
        <ol className="seq-list">
          {REMOVAL_SEQUENCE.map((p, i) => (
            <li key={p.id} className={i < step ? 'done' : i === step ? 'current' : ''}>
              {pName(p)}
            </li>
          ))}
        </ol>
      </details>
      <button className="ghost" onClick={() => useStore.getState().setMode('disassembly')}>
        {t('dis.restart')}
      </button>
    </div>
  )
}

const ReassemblyPanel: React.FC = () => {
  const removedIds = useStore((s) => s.removedIds)
  const reasmStep = useStore((s) => s.reasmStep)
  const mistakes = useStore((s) => s.reasmMistakes)
  const carrying = useStore((s) => s.carryingId)
  const { t, pName } = useI18n()
  const total = REMOVAL_SEQUENCE.length
  const placed = total - removedIds.size
  const done = reasmStep < 0

  const tray = [...REMOVAL_SEQUENCE].reverse().filter((p) => removedIds.has(p.id))

  return (
    <div className="side-content">
      <h3>{t('reasm.title')}</h3>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(placed / total) * 100}%` }} />
      </div>
      <p className="small muted">{t('reasm.installedOf', { n: placed, total, m: mistakes })}</p>
      {done ? (
        <div className="step-card ok">
          <strong>{t('reasm.complete')}</strong>
          <p className="small">{t('reasm.completeBody')}</p>
        </div>
      ) : (
        <>
          <p className="small">
            {t('reasm.dragPre')}
            <strong>{t('reasm.dragBold')}</strong>
            {t('reasm.dragPost')}
          </p>
          {carrying && (
            <div className="step-card">
              {t('reasm.carrying')} <strong>{pName(PART_MAP.get(carrying)!)}</strong>
            </div>
          )}
          <div className="tray">
            {tray.map((p) => (
              <button
                key={p.id}
                className={`tray-item ${carrying === p.id ? 'active' : ''}`}
                onClick={() => useStore.getState().pickUpRemoved(p.id)}
              >
                {pName(p)}
              </button>
            ))}
          </div>
        </>
      )}
      <button className="ghost" onClick={() => useStore.getState().setMode('reassembly')}>
        {t('reasm.restart')}
      </button>
    </div>
  )
}

const QuizPanel: React.FC = () => {
  const idx = useStore((s) => s.quizIndex)
  const score = useStore((s) => s.quizScore)
  const answered = useStore((s) => s.quizAnswered)
  const progress = useStore((s) => s.progress)
  const { t, quizPrompt, quizOptions } = useI18n()
  const finished = idx >= QUIZ_QUESTIONS.length
  const q = QUIZ_QUESTIONS[idx]

  if (finished) {
    const last = progress.quizResults[progress.quizResults.length - 1]
    return (
      <div className="side-content">
        <h3>{t('quiz.result')}</h3>
        <div className="score-big">
          {last?.score}/{last?.total}
        </div>
        <p className="small muted">{t('quiz.time', { s: last?.timeSec ?? 0 })}</p>
        {last && last.mistakes.length > 0 && (
          <>
            <p className="small">{t('quiz.review')}</p>
            <ul className="seq-list">
              {last.mistakes.map((id) => {
                const mq = QUIZ_QUESTIONS.find((x) => x.id === id)
                return <li key={id}>{mq ? quizPrompt(mq) : id}</li>
              })}
            </ul>
          </>
        )}
        <button onClick={() => useStore.getState().setMode('quiz')}>{t('quiz.retake')}</button>
      </div>
    )
  }

  return (
    <div className="side-content">
      <h3>{t('quiz.title')}</h3>
      <p className="small muted">{t('quiz.questionOf', { n: idx + 1, total: QUIZ_QUESTIONS.length, score })}</p>
      <div className="step-card">
        <strong>{quizPrompt(q)}</strong>
        {q.kind === 'identify' && <p className="small muted">{t('quiz.clickPart')}</p>}
      </div>
      {q.kind === 'choice' && (
        <div className="choices">
          {quizOptions(q).map((opt, i) => (
            <button key={i} disabled={answered} onClick={() => useStore.getState().answerChoice(i)}>
              {opt}
            </button>
          ))}
        </div>
      )}
      {answered && (
        <button className="primary" onClick={() => useStore.getState().nextQuestion()}>
          {idx + 1 === QUIZ_QUESTIONS.length ? t('quiz.finish') : t('quiz.next')}
        </button>
      )}
    </div>
  )
}

const ExplorePanel: React.FC = () => {
  const progress = useStore((s) => s.progress)
  const { t } = useI18n()
  const totalParts = PART_MAP.size
  return (
    <div className="side-content">
      <h3>{t('explore.title')}</h3>
      <p className="small muted">{t('explore.intro')}</p>
      <div className="stat-grid">
        <div className="stat">
          <span className="stat-num">
            {progress.partsInspected.length}/{totalParts}
          </span>
          <span className="stat-label">{t('explore.partsInspected')}</span>
        </div>
        <div className="stat">
          <span className="stat-num">{progress.quizResults.length}</span>
          <span className="stat-label">{t('explore.assessmentsTaken')}</span>
        </div>
        <div className="stat">
          <span className="stat-num">{progress.disassemblyCompleted ? '✓' : '—'}</span>
          <span className="stat-label">{t('explore.teardownDone')}</span>
        </div>
        <div className="stat">
          <span className="stat-num">{progress.reassemblyCompleted ? '✓' : '—'}</span>
          <span className="stat-label">{t('explore.reassemblyDone')}</span>
        </div>
      </div>
      <button className="ghost" onClick={() => useStore.getState().exportCsv()}>
        {t('explore.exportCsv')}
      </button>
    </div>
  )
}

const FlowPanel: React.FC = () => {
  const rpm = useStore((s) => s.flowRpm)
  const throttle = useStore((s) => s.flowThrottle)
  const circuits = useStore((s) => s.flowCircuits)
  const { t, circuitName } = useI18n()
  const f = computeFlow({ rpm, throttle })

  return (
    <div className="side-content">
      <h3>{t('flow.title')}</h3>
      <p className="small muted">{t('flow.intro')}</p>
      <EngineButton />
      <label className="slider-row">
        <span>{t('common.engineSpeed')}</span>
        <input
          type="range"
          min={800}
          max={7200}
          step={50}
          value={rpm}
          onChange={(e) => useStore.getState().setFlowRpm(Number(e.target.value))}
        />
        <strong>{rpm} rpm</strong>
      </label>
      <label className="slider-row">
        <span>{t('flow.throttle')}</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={throttle}
          onChange={(e) => useStore.getState().setFlowThrottle(Number(e.target.value))}
        />
        <strong>{Math.round(throttle * 100)}%</strong>
      </label>

      <div className="sys-list">
        {CIRCUITS.map((c) => (
          <button
            key={c.id}
            className={circuits.has(c.id) ? 'active' : ''}
            onClick={() => useStore.getState().toggleCircuit(c.id)}
          >
            <span className="dot" style={{ background: c.color }} />
            {circuitName(c.id, c.name)}
          </button>
        ))}
      </div>

      <div className="stat-grid">
        <Stat num={`${f.mafGs.toFixed(0)} g/s`} label={t('stat.maf')} />
        <Stat num={`${f.boostBar.toFixed(2)} bar`} label={t('stat.boost')} />
        <Stat num={`${f.turboKrpm.toFixed(0)} krpm`} label={t('stat.turboSpeed')} />
        <Stat num={`${f.chargeTempC.toFixed(0)} °C`} label={t('stat.chargeTemp')} />
        <Stat num={`${f.exhaustTempC.toFixed(0)} °C`} label={t('stat.exhaustTemp')} />
        <Stat num={`${f.exhaustGs.toFixed(0)} g/s`} label={t('stat.exhaustFlow')} />
        <Stat num={`${f.coolantLpm.toFixed(0)} L/min`} label={t('stat.coolantFlow')} />
        <Stat num={`+${f.coolantDeltaC.toFixed(1)} °C`} label={t('stat.coolantDelta')} />
        <Stat num={`${f.oilBar.toFixed(1)} bar`} label={t('stat.oilPressure')} />
        <Stat num={`${f.oilLpm.toFixed(0)} L/min`} label={t('stat.oilFlow')} />
        <Stat num={`${f.powerKw.toFixed(0)} kW`} label={t('stat.estPower')} />
        <Stat num={`${f.fuelGs.toFixed(1)} g/s`} label={t('stat.fuelFlow')} />
      </div>
      <p className="small muted">{t('flow.ghostHint')}</p>
    </div>
  )
}

const Stat: React.FC<{ num: string; label: string }> = ({ num, label }) => (
  <div className="stat">
    <span className="stat-num">{num}</span>
    <span className="stat-label">{label}</span>
  </div>
)

const SimCanvas: React.FC<{
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
  deps: unknown[]
  label: string
}> = ({ draw, deps, label }) => {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, c.width, c.height)
    draw(ctx, c.width, c.height)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return (
    <div className="sim-chart">
      <span className="info-key">{label}</span>
      <canvas ref={ref} width={250} height={110} />
    </div>
  )
}

const EngineButton: React.FC = () => {
  const running = useStore((s) => s.engineRunning)
  const { t } = useI18n()
  return (
    <button
      className={`engine-btn ${running ? 'running' : ''}`}
      onClick={() => useStore.getState().toggleEngine()}
    >
      {running ? t('sim.stop') : t('sim.start')}
    </button>
  )
}

const SimControls: React.FC = () => {
  const rpm = useStore((s) => s.simRpm)
  const load = useStore((s) => s.simLoad)
  const ts = useStore((s) => s.simTimeScale)
  const { t } = useI18n()
  return (
    <>
      <EngineButton />
      <label className="slider-row">
        <span>{t('common.engineSpeed')}</span>
        <input type="range" min={800} max={7200} step={50} value={rpm}
          onChange={(e) => useStore.getState().setSimRpm(Number(e.target.value))} />
        <strong>{rpm} rpm</strong>
      </label>
      <label className="slider-row">
        <span>{t('sim.load')}</span>
        <input type="range" min={0.05} max={1} step={0.01} value={load}
          onChange={(e) => useStore.getState().setSimLoad(Number(e.target.value))} />
        <strong>{Math.round(load * 100)}%</strong>
      </label>
      <label className="slider-row">
        <span>{t('sim.slowMotion')}</span>
        <input type="range" min={0.005} max={0.5} step={0.005} value={ts}
          onChange={(e) => useStore.getState().setSimTimeScale(Number(e.target.value))} />
        <strong>×{ts.toFixed(2)}</strong>
      </label>
    </>
  )
}

const CombustionPanel: React.FC = () => {
  const rpm = useStore((s) => s.simRpm)
  const load = useStore((s) => s.simLoad)
  const { t } = useI18n()
  const c = getCycle(rpm, load)
  const tdcLabel = t('chart.tdc')
  const bdcLabel = t('chart.bdc')

  return (
    <div className="side-content">
      <h3>{t('combust.title')}</h3>
      <p className="small muted">{t('combust.intro')}</p>
      <SimControls />
      <div className="stat-grid">
        <Stat num={`${c.peakBar.toFixed(0)} bar`} label={t('combust.peakAt', { deg: c.peakDeg })} />
        <Stat num={`${c.imepBar.toFixed(1)} bar`} label={t('stat.imep')} />
        <Stat num={`${c.brakeTorqueNm.toFixed(0)} N·m`} label={t('stat.brakeTorque')} />
        <Stat num={`${c.powerKw.toFixed(0)} kW`} label={t('stat.brakePower')} />
        <Stat num={t('combust.btdc', { deg: c.sparkBtdc.toFixed(0) })} label={t('stat.sparkAdvance')} />
        <Stat num={`${c.fuelMgCyl.toFixed(0)} mg`} label={t('stat.fuelPerCyl')} />
      </div>
      <SimCanvas
        label={t('combust.pressureChart', { max: Math.ceil(c.peakBar / 10) * 10 })}
        deps={[rpm, load, tdcLabel]}
        draw={(ctx, w, h) => {
          const pMax = c.peakBar * 1.08
          ctx.strokeStyle = '#39434f'
          ctx.beginPath(); ctx.moveTo(0, h - 14); ctx.lineTo(w, h - 14); ctx.stroke()
          const xTdc = (360 / 720) * w
          ctx.strokeStyle = '#4a5560'; ctx.setLineDash([3, 3])
          ctx.beginPath(); ctx.moveTo(xTdc, 0); ctx.lineTo(xTdc, h - 14); ctx.stroke()
          ctx.setLineDash([])
          ctx.fillStyle = '#8d99a6'; ctx.font = '9px sans-serif'
          ctx.fillText('-360', 2, h - 4); ctx.fillText(tdcLabel, xTdc - 9, h - 4); ctx.fillText('360', w - 20, h - 4)
          ctx.strokeStyle = '#ff7a3c'; ctx.lineWidth = 1.5
          ctx.beginPath()
          for (let i = 0; i <= 720; i++) {
            const x = (i / 720) * w
            const y = (h - 14) * (1 - c.pBar[i] / pMax)
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          }
          ctx.stroke()
        }}
      />
      <SimCanvas
        label={t('combust.pvChart')}
        deps={[rpm, load, tdcLabel]}
        draw={(ctx, w, h) => {
          const pMax = c.peakBar * 1.08
          const vMin = 45
          const vMax = 560
          ctx.strokeStyle = '#39434f'
          ctx.strokeRect(0.5, 0.5, w - 1, h - 1)
          ctx.strokeStyle = '#54b8ff'; ctx.lineWidth = 1.5
          ctx.beginPath()
          for (let i = 0; i <= 720; i++) {
            const x = ((c.vCc[i] - vMin) / (vMax - vMin)) * (w - 8) + 4
            const y = (h - 6) * (1 - c.pBar[i] / pMax) + 3
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          }
          ctx.stroke()
          ctx.fillStyle = '#8d99a6'; ctx.font = '9px sans-serif'
          ctx.fillText(tdcLabel, 6, h - 5); ctx.fillText(bdcLabel, w - 26, h - 5)
        }}
      />
      <p className="small muted">{t('combust.simplify')}</p>
    </div>
  )
}

const STRESS_PARTS: [string, string][] = [
  ['piston-1', 'stress.part.pistons'],
  ['crankshaft', 'stress.part.crankshaft'],
  ['cylinder-head', 'stress.part.head'],
  ['cylinder-block', 'stress.part.block'],
  ['turbo-front', 'stress.part.turbos'],
  ['exhaust-manifold-front', 'stress.part.exhaust'],
  ['timing-chain', 'stress.part.timing'],
  ['intake-manifold', 'stress.part.intake'],
  ['hp-fuel-pump', 'stress.part.fuel'],
]

const StressPanel: React.FC = () => {
  const rpm = useStore((s) => s.simRpm)
  const load = useStore((s) => s.simLoad)
  const { t } = useI18n()
  const c = getCycle(rpm, load)
  const meanLabel = t('stress.meanLine')

  return (
    <div className="side-content">
      <h3>{t('stress.title')}</h3>
      <p className="small muted">{t('stress.intro')}</p>
      <SimControls />
      <div className="stat-grid">
        <Stat num={`${c.brakeTorqueNm.toFixed(0)} N·m`} label={t('stat.meanBrakeTorque')} />
        <Stat num={`${c.powerKw.toFixed(0)} kW`} label={t('stat.brakePower')} />
        <Stat num={`${c.peakTorqueNm.toFixed(0)} N·m`} label={t('stat.peakInstant')} />
        <Stat num={`${c.minTorqueNm.toFixed(0)} N·m`} label={t('stat.minReversal')} />
        <Stat num={`${c.gasForceKn.toFixed(0)} kN`} label={t('stat.peakGasForce')} />
        <Stat num={`${c.rodForceKn.toFixed(0)} kN`} label={t('stat.conrodForce')} />
        <Stat num={`${c.inertiaForceKn.toFixed(1)} kN`} label={t('stat.recipInertia')} />
        <Stat num={`${c.rodBearingMpa.toFixed(0)} MPa`} label={t('stat.rodBearing')} />
      </div>
      <SimCanvas
        label={t('stress.torqueChart')}
        deps={[rpm, load, meanLabel]}
        draw={(ctx, w, h) => {
          const tMax = Math.max(c.peakTorqueNm, 1) * 1.1
          const tMin = Math.min(c.minTorqueNm, 0) * 1.1
          const y0 = (h - 12) * (tMax / (tMax - tMin))
          ctx.strokeStyle = '#39434f'
          ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(w, y0); ctx.stroke()
          const yMean = (h - 12) * ((tMax - c.meanIndTorqueNm) / (tMax - tMin))
          ctx.strokeStyle = '#2eb872'; ctx.setLineDash([3, 3])
          ctx.beginPath(); ctx.moveTo(0, yMean); ctx.lineTo(w, yMean); ctx.stroke()
          ctx.setLineDash([])
          ctx.strokeStyle = '#3d8bfd'; ctx.lineWidth = 1.5
          ctx.beginPath()
          for (let i = 0; i < 720; i++) {
            const x = (i / 720) * w
            const y = (h - 12) * ((tMax - c.torque[i]) / (tMax - tMin))
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          }
          ctx.stroke()
          ctx.fillStyle = '#8d99a6'; ctx.font = '9px sans-serif'
          ctx.fillText(meanLabel, w - 86, yMean - 3)
        }}
      />
      <div className="util-list">
        {STRESS_PARTS.map(([id, key]) => {
          const u = Math.min(c.partUtil[id] ?? 0, 1.2)
          const hue = 220 * (1 - Math.min(u, 1))
          return (
            <div key={id} className="util-row">
              <span>{t(key)}</span>
              <div className="util-bar">
                <div
                  className="util-fill"
                  style={{ width: `${Math.min(u, 1.05) * 100}%`, background: `hsl(${hue} 80% 52%)` }}
                />
              </div>
              <strong>{Math.round(u * 100)}%</strong>
            </div>
          )
        })}
      </div>
      <p className="small muted">{t('stress.util')}</p>
    </div>
  )
}

export const SidePanel: React.FC = () => {
  const mode = useStore((s) => s.mode)
  return (
    <aside className="side-panel">
      {mode === 'explore' && <ExplorePanel />}
      {mode === 'exploded' && <ExplodedPanel />}
      {mode === 'disassembly' && <DisassemblyPanel />}
      {mode === 'reassembly' && <ReassemblyPanel />}
      {mode === 'quiz' && <QuizPanel />}
      {mode === 'flow' && <FlowPanel />}
      {mode === 'combust' && <CombustionPanel />}
      {mode === 'stress' && <StressPanel />}
    </aside>
  )
}
