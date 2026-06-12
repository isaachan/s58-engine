import type { QuizQuestion } from '../../types'

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'skyg-q1',
    kind: 'choice',
    prompt: 'How is the Skyactiv-G 2.0 force-fed?',
    options: ['It is naturally aspirated', 'Single twin-scroll turbo', 'Twin mono-scroll turbos', 'Supercharged'],
    correctIndex: 0,
  },
  {
    id: 'skyg-q2',
    kind: 'identify',
    prompt: 'Click the signature 4-2-1 exhaust manifold.',
    targetPartId: 'exhaust-manifold',
  },
  {
    id: 'skyg-q3',
    kind: 'choice',
    prompt: 'Why does the Skyactiv-G use a long 4-2-1 exhaust header?',
    options: [
      'It reduces residual exhaust gas, suppressing knock so the 13:1 compression can run',
      'It spools the turbocharger faster',
      'It increases backpressure for emissions',
      'It cools the charge air',
    ],
    correctIndex: 0,
  },
  {
    id: 'skyg-q4',
    kind: 'choice',
    prompt: 'What is the compression ratio of this module (US/regular-fuel spec)?',
    options: ['13.0:1', '9.3:1', '10.2:1', '8.5:1'],
    correctIndex: 0,
  },
  {
    id: 'skyg-q5',
    kind: 'identify',
    prompt: 'Click the Dual S-VT cam phasers.',
    targetPartId: 'svt-phasers',
  },
  {
    id: 'skyg-q6',
    kind: 'choice',
    prompt: 'How does the Skyactiv-G control engine load? (Contrast with the Valvetronic BMWs.)',
    options: [
      'Primarily with the throttle, aided by Dual S-VT timing',
      'With variable intake-valve lift (throttle stays open)',
      'By varying boost pressure',
      'By cylinder deactivation',
    ],
    correctIndex: 0,
  },
  {
    id: 'skyg-q7',
    kind: 'identify',
    prompt: 'Click the part that drives the high-pressure fuel pump.',
    targetPartId: 'camshaft-exhaust',
  },
  {
    id: 'skyg-q8',
    kind: 'choice',
    prompt: 'Approximately what direct-injection rail pressure does this engine use?',
    options: ['Up to ~200 bar', 'Up to 350 bar', 'Up to 2,000 bar', 'About 4 bar (port injection)'],
    correctIndex: 0,
  },
  {
    id: 'skyg-q9',
    kind: 'identify',
    prompt: 'Click the intake manifold (note: no charge cooler — the engine is naturally aspirated).',
    targetPartId: 'intake-manifold',
  },
  {
    id: 'skyg-q10',
    kind: 'choice',
    prompt: 'What is the firing order used in this module?',
    options: ['1-3-4-2', '1-5-3-6-2-4', '1-2-3-4', '1-4-2-3'],
    correctIndex: 0,
  },
]
