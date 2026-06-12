import type { QuizQuestion } from '../../types'

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    kind: 'identify',
    prompt:
      'Click a component that raises fuel pressure to ~350 bar for direct injection (the S58 has two of them).',
    targetPartId: 'hp-fuel-pump',
    altTargetIds: ['hp-fuel-pump-2'],
  },
  {
    id: 'q2',
    kind: 'identify',
    prompt: 'Click the turbocharger that is fed by cylinders 1–3.',
    targetPartId: 'turbo-front',
  },
  {
    id: 'q3',
    kind: 'choice',
    prompt: 'Where is the S58 charge cooler (intercooler) located?',
    options: [
      'Integrated inside the intake manifold (air-to-water)',
      'In front of the radiator (air-to-air front mount)',
      'Inside the valve cover',
      'The S58 does not use charge cooling',
    ],
    correctIndex: 0,
  },
  {
    id: 'q4',
    kind: 'identify',
    prompt: 'Click the part that synchronizes the camshafts with the crankshaft.',
    targetPartId: 'timing-chain',
  },
  {
    id: 'q5',
    kind: 'choice',
    prompt: 'Before removing the timing chain, the engine must be…',
    options: [
      'Locked at TDC cylinder 1 with timing tools',
      'Warmed to operating temperature',
      'Rotated backwards two turns',
      'Drained of coolant only',
    ],
    correctIndex: 0,
  },
  {
    id: 'q6',
    kind: 'choice',
    prompt: 'Which fasteners are torque-to-yield and must NEVER be reused?',
    options: [
      'Head bolts and connecting rod bolts',
      'Valve cover bolts',
      'Oil pan bolts',
      'Thermostat housing bolts',
    ],
    correctIndex: 0,
  },
  {
    id: 'q7',
    kind: 'identify',
    prompt: 'Click the component that contains the oil pickup screen — the place to check for bottom-end debris.',
    targetPartId: 'oil-pump',
  },
  {
    id: 'q8',
    kind: 'choice',
    prompt: 'What drives the two high-pressure fuel pumps on the S58?',
    options: [
      'Triple-lobe cams on the exhaust camshaft',
      'The accessory belt',
      'An electric motor',
      'The timing chain directly',
    ],
    correctIndex: 0,
  },
  {
    id: 'q9',
    kind: 'choice',
    prompt: 'During teardown, which must come off before the intake manifold?',
    options: ['Throttle body', 'Oil pan', 'Cylinder head', 'Crankshaft'],
    correctIndex: 0,
  },
  {
    id: 'q10',
    kind: 'identify',
    prompt: 'Click the part you would remove FIRST when dropping the rotating assembly (after the head is off).',
    targetPartId: 'oil-pan',
  },
]
