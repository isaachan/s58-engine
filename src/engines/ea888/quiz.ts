import type { QuizQuestion } from '../../types'

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'ea888-q1',
    kind: 'identify',
    prompt: 'Click the variable-geometry (VGT) turbocharger.',
    targetPartId: 'turbo',
  },
  {
    id: 'ea888-q2',
    kind: 'choice',
    prompt: 'Where is the EA888 exhaust manifold?',
    options: [
      'Cast into the cylinder head (no separate manifold)',
      'A bolt-on 4-2-1 long-tube header',
      'Split into two manifolds, one per cylinder pair',
      'There is no exhaust manifold',
    ],
    correctIndex: 0,
  },
  {
    id: 'ea888-q3',
    kind: 'identify',
    prompt: 'Click the port (MPI) injectors that give this engine dual injection.',
    targetPartId: 'port-injectors',
  },
  {
    id: 'ea888-q4',
    kind: 'choice',
    prompt: 'How does the EA888 inject fuel?',
    options: [
      'Both direct (500 bar) and port (MPI) injection',
      'Direct injection only',
      'Port injection only',
      'Mechanical carburetion',
    ],
    correctIndex: 0,
  },
  {
    id: 'ea888-q5',
    kind: 'identify',
    prompt: 'Click the module that also carries the two balance shafts.',
    targetPartId: 'oil-pump',
  },
  {
    id: 'ea888-q6',
    kind: 'choice',
    prompt: 'What is unusual about the EA888 evo5 crankcase compared with the other engines here?',
    options: [
      'It is grey cast iron, not aluminium',
      'It is magnesium',
      'It is an open-deck design with no liners',
      'It has no main bearing caps',
    ],
    correctIndex: 0,
  },
  {
    id: 'ea888-q7',
    kind: 'identify',
    prompt: 'Click the part that drives the high-pressure fuel pump.',
    targetPartId: 'camshaft-exhaust',
  },
  {
    id: 'ea888-q8',
    kind: 'choice',
    prompt: 'The evo5 raised the direct-injection rail pressure to…',
    options: ['500 bar', '200 bar', '350 bar', '2,000 bar'],
    correctIndex: 0,
  },
  {
    id: 'ea888-q9',
    kind: 'identify',
    prompt: 'Click the auxiliary electric coolant pump (thermal management).',
    targetPartId: 'electric-coolant-pump',
  },
  {
    id: 'ea888-q10',
    kind: 'choice',
    prompt: 'What is the firing order used in this module?',
    options: ['1-3-4-2', '1-5-3-6-2-4', '1-2-3-4', '1-4-2-3'],
    correctIndex: 0,
  },
]
