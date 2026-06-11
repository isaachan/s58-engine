import React from 'react'
import { useStore } from '../store'
import { PART_MAP, REMOVAL_SEQUENCE } from '../data/parts'
import { SYSTEMS, SYSTEM_ORDER } from '../data/systems'
import { QUIZ_QUESTIONS } from '../data/quiz'

const ExplodedPanel: React.FC = () => {
  const isolated = useStore((s) => s.isolatedSystem)
  return (
    <div className="side-content">
      <h3>Systems</h3>
      <p className="muted small">Isolate one system to study it. Others fade out.</p>
      <div className="sys-list">
        <button className={!isolated ? 'active' : ''} onClick={() => useStore.getState().isolate(null)}>
          All systems
        </button>
        {SYSTEM_ORDER.map((id) => (
          <button
            key={id}
            className={isolated === id ? 'active' : ''}
            onClick={() => useStore.getState().isolate(isolated === id ? null : id)}
          >
            <span className="dot" style={{ background: SYSTEMS[id].color }} />
            {SYSTEMS[id].name}
          </button>
        ))}
      </div>
    </div>
  )
}

const DisassemblyPanel: React.FC = () => {
  const step = useStore((s) => s.disasmStep)
  const mistakes = useStore((s) => s.disasmMistakes)
  const total = REMOVAL_SEQUENCE.length
  const done = step >= total
  const current = REMOVAL_SEQUENCE[step]

  return (
    <div className="side-content">
      <h3>Guided Teardown</h3>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(step / total) * 100}%` }} />
      </div>
      <p className="small muted">
        Step {Math.min(step + 1, total)} of {total} · Mistakes: {mistakes}
      </p>
      {done ? (
        <div className="step-card ok">
          <strong>Teardown complete.</strong>
          <p className="small">The engine is stripped to the bare block. Switch to Reassembly to rebuild it.</p>
          <button onClick={() => useStore.getState().setMode('reassembly')}>Start reassembly →</button>
        </div>
      ) : (
        <div className="step-card">
          <span className="step-label">Remove next (highlighted green):</span>
          <strong>{current.name}</strong>
          <p className="small">{current.inspectionNotes}</p>
        </div>
      )}
      <details className="seq-details">
        <summary>Full sequence</summary>
        <ol className="seq-list">
          {REMOVAL_SEQUENCE.map((p, i) => (
            <li key={p.id} className={i < step ? 'done' : i === step ? 'current' : ''}>
              {p.name}
            </li>
          ))}
        </ol>
      </details>
      <button className="ghost" onClick={() => useStore.getState().setMode('disassembly')}>
        Restart teardown
      </button>
    </div>
  )
}

const ReassemblyPanel: React.FC = () => {
  const removedIds = useStore((s) => s.removedIds)
  const reasmStep = useStore((s) => s.reasmStep)
  const mistakes = useStore((s) => s.reasmMistakes)
  const carrying = useStore((s) => s.carryingId)
  const total = REMOVAL_SEQUENCE.length
  const placed = total - removedIds.size
  const done = reasmStep < 0

  // tray in reverse-removal (= correct install) order
  const tray = [...REMOVAL_SEQUENCE].reverse().filter((p) => removedIds.has(p.id))

  return (
    <div className="side-content">
      <h3>Reassembly Practice</h3>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(placed / total) * 100}%` }} />
      </div>
      <p className="small muted">
        Installed {placed} of {total} · Mistakes: {mistakes}
      </p>
      {done ? (
        <div className="step-card ok">
          <strong>Engine assembled!</strong>
          <p className="small">All parts are back in position. Your mistakes are logged for the instructor report.</p>
        </div>
      ) : (
        <>
          <p className="small">
            Pick a part from the tray, then <strong>drag it onto its position</strong> on the engine. It
            snaps when close. Assembly order is the reverse of teardown.
          </p>
          {carrying && (
            <div className="step-card">
              Carrying: <strong>{PART_MAP.get(carrying)?.name}</strong>
            </div>
          )}
          <div className="tray">
            {tray.map((p) => (
              <button
                key={p.id}
                className={`tray-item ${carrying === p.id ? 'active' : ''}`}
                onClick={() => useStore.getState().pickUpRemoved(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </>
      )}
      <button className="ghost" onClick={() => useStore.getState().setMode('reassembly')}>
        Restart reassembly
      </button>
    </div>
  )
}

const QuizPanel: React.FC = () => {
  const idx = useStore((s) => s.quizIndex)
  const score = useStore((s) => s.quizScore)
  const answered = useStore((s) => s.quizAnswered)
  const progress = useStore((s) => s.progress)
  const finished = idx >= QUIZ_QUESTIONS.length
  const q = QUIZ_QUESTIONS[idx]

  if (finished) {
    const last = progress.quizResults[progress.quizResults.length - 1]
    return (
      <div className="side-content">
        <h3>Assessment Result</h3>
        <div className="score-big">
          {last?.score}/{last?.total}
        </div>
        <p className="small muted">Time: {last?.timeSec}s · Saved to your training record.</p>
        {last && last.mistakes.length > 0 && (
          <>
            <p className="small">Review these topics:</p>
            <ul className="seq-list">
              {last.mistakes.map((id) => (
                <li key={id}>{QUIZ_QUESTIONS.find((x) => x.id === id)?.prompt}</li>
              ))}
            </ul>
          </>
        )}
        <button onClick={() => useStore.getState().setMode('quiz')}>Retake assessment</button>
      </div>
    )
  }

  return (
    <div className="side-content">
      <h3>Assessment</h3>
      <p className="small muted">
        Question {idx + 1} of {QUIZ_QUESTIONS.length} · Score: {score}
      </p>
      <div className="step-card">
        <strong>{q.prompt}</strong>
        {q.kind === 'identify' && <p className="small muted">Click the part in the 3D view.</p>}
      </div>
      {q.kind === 'choice' && (
        <div className="choices">
          {q.options!.map((opt, i) => (
            <button key={i} disabled={answered} onClick={() => useStore.getState().answerChoice(i)}>
              {opt}
            </button>
          ))}
        </div>
      )}
      {answered && (
        <button className="primary" onClick={() => useStore.getState().nextQuestion()}>
          {idx + 1 === QUIZ_QUESTIONS.length ? 'Finish' : 'Next question →'}
        </button>
      )}
    </div>
  )
}

const ExplorePanel: React.FC = () => {
  const progress = useStore((s) => s.progress)
  const totalParts = PART_MAP.size
  return (
    <div className="side-content">
      <h3>Explore Mode</h3>
      <p className="small muted">
        Free inspection of the BMW S58 — the 3.0 L twin-turbo inline-six used in the M3, M4, X3 M
        and X4 M.
      </p>
      <div className="stat-grid">
        <div className="stat">
          <span className="stat-num">{progress.partsInspected.length}/{totalParts}</span>
          <span className="stat-label">parts inspected</span>
        </div>
        <div className="stat">
          <span className="stat-num">{progress.quizResults.length}</span>
          <span className="stat-label">assessments taken</span>
        </div>
        <div className="stat">
          <span className="stat-num">{progress.disassemblyCompleted ? '✓' : '—'}</span>
          <span className="stat-label">teardown done</span>
        </div>
        <div className="stat">
          <span className="stat-num">{progress.reassemblyCompleted ? '✓' : '—'}</span>
          <span className="stat-label">reassembly done</span>
        </div>
      </div>
      <button className="ghost" onClick={() => useStore.getState().exportCsv()}>
        Export progress report (CSV)
      </button>
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
    </aside>
  )
}
