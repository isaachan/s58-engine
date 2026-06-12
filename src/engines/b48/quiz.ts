import type { QuizQuestion } from '../../types'

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'b48-q1',
    kind: 'identify',
    prompt: 'Click the single twin-scroll turbocharger.',
    targetPartId: 'turbo',
  },
  {
    id: 'b48-q2',
    kind: 'choice',
    prompt: 'What is the B48 firing order used in this module?',
    options: ['1-3-4-2', '1-5-3-6-2-4', '1-2-4-3', '1-4-2-3'],
    correctIndex: 0,
  },
  {
    id: 'b48-q3',
    kind: 'identify',
    prompt: 'Click the part that drives the high-pressure fuel pump.',
    targetPartId: 'camshaft-exhaust',
  },
  {
    id: 'b48-q4',
    kind: 'choice',
    prompt: 'Compared with the S58, the B48 turbo layout is…',
    options: ['One twin-scroll turbo', 'Two mono-scroll turbos', 'Naturally aspirated', 'An electric supercharger only'],
    correctIndex: 0,
  },
  {
    id: 'b48-q5',
    kind: 'identify',
    prompt: 'Click the assembly that varies intake valve lift.',
    targetPartId: 'valvetronic',
  },
  {
    id: 'b48-q6',
    kind: 'choice',
    prompt: 'Before removing the timing chain, the engine should be…',
    options: ['Locked at TDC with timing tools', 'Run at idle for five minutes', 'Rotated backwards repeatedly', 'Filled with coolant'],
    correctIndex: 0,
  },
  {
    id: 'b48-q7',
    kind: 'identify',
    prompt: 'Click the integrated charge-cooler intake manifold.',
    targetPartId: 'intake-manifold',
  },
  {
    id: 'b48-q8',
    kind: 'choice',
    prompt: 'How many high-pressure fuel pumps are modeled on the B48?',
    options: ['One', 'Two', 'Four', 'None'],
    correctIndex: 0,
  },
  {
    id: 'b48-q9',
    kind: 'identify',
    prompt: 'Click the component containing the oil pickup screen.',
    targetPartId: 'oil-pump',
  },
  {
    id: 'b48-q10',
    kind: 'choice',
    prompt: 'The B48 module is calibrated as which engine layout?',
    options: ['2.0 L inline-four', '3.0 L inline-six', '4.4 L V8', '1.5 L inline-three'],
    correctIndex: 0,
  },
]
