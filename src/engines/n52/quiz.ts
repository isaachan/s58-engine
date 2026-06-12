import type { QuizQuestion } from '../../types'

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'n52-q1',
    kind: 'choice',
    prompt: 'How does the N52 deliver fuel?',
    options: [
      'Port (manifold) injection — no high-pressure pump',
      'Direct injection at 350 bar',
      'Direct injection at 500 bar',
      'A mechanical carburettor',
    ],
    correctIndex: 0,
  },
  {
    id: 'n52-q2',
    kind: 'choice',
    prompt: 'What is unusual about the N52 cylinder block?',
    options: [
      'It is a magnesium-aluminium composite',
      'It is grey cast iron',
      'It is an open-deck design with no liners',
      'It is made of carbon fibre',
    ],
    correctIndex: 0,
  },
  {
    id: 'n52-q3',
    kind: 'identify',
    prompt: 'Click the assembly that varies intake-valve lift (the primary load control).',
    targetPartId: 'valvetronic',
  },
  {
    id: 'n52-q4',
    kind: 'identify',
    prompt: 'Click the electric coolant pump.',
    targetPartId: 'water-pump',
  },
  {
    id: 'n52-q5',
    kind: 'choice',
    prompt: 'How does the N52 circulate engine coolant?',
    options: [
      'With an electric coolant pump',
      'With a belt-driven mechanical pump',
      'By thermosiphon only',
      'With an exhaust-driven pump',
    ],
    correctIndex: 0,
  },
  {
    id: 'n52-q6',
    kind: 'identify',
    prompt: 'Click the 3-stage DISA variable-length intake manifold.',
    targetPartId: 'intake-manifold',
  },
  {
    id: 'n52-q7',
    kind: 'choice',
    prompt: 'What is the firing order used in this module?',
    options: ['1-5-3-6-2-4', '1-3-4-2', '1-2-3-4-5-6', '1-6-2-4-3-5'],
    correctIndex: 0,
  },
  {
    id: 'n52-q8',
    kind: 'identify',
    prompt: 'Click the port injectors.',
    targetPartId: 'injector-set',
  },
  {
    id: 'n52-q9',
    kind: 'choice',
    prompt: 'Before removing the timing chain, the engine should be…',
    options: [
      'Locked at TDC cylinder 1 with timing tools',
      'Run at idle for five minutes',
      'Rotated backwards repeatedly',
      'Filled with coolant',
    ],
    correctIndex: 0,
  },
  {
    id: 'n52-q10',
    kind: 'choice',
    prompt: 'Is the N52 turbocharged?',
    options: [
      'No — it is naturally aspirated',
      'Yes — single twin-scroll turbo',
      'Yes — two mono-scroll turbos',
      'Yes — a variable-geometry turbo',
    ],
    correctIndex: 0,
  },
]
