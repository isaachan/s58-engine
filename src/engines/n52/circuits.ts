import type { CircuitDef } from '../types'

// Hand-authored visual polylines threaded through the inline-six part layout
// (same scene layout as the S58 module). Naturally aspirated: the intake runs
// straight from the airbox through the throttle into the DISA manifold (no turbo
// loop), and the exhaust runs the header down the exhaust side. The main coolant
// circuit is driven by the electric pump.
export const circuits: CircuitDef[] = [
  {
    id: 'intake',
    name: 'Intake air',
    color: '#54b8ff',
    closed: false,
    count: 240,
    pts: [
      [-2.6, 0.6, 1.2],
      [-1.85, 0.62, 1.28],
      [-1.18, 0.62, 1.28],
      [-0.5, 0.66, 1.12],
      [0.45, 0.66, 1.1],
      [0.8, 0.6, 0.85],
      [0.78, 0.52, 0.55],
      [0.76, 0.45, 0.25],
    ],
  },
  {
    id: 'exhaust',
    name: 'Exhaust gas',
    color: '#ff7a3c',
    closed: false,
    count: 240,
    pts: [
      [-0.74, 0.5, -0.3],
      [-0.2, 0.5, -0.6],
      [0.4, 0.48, -0.62],
      [0.5, 0.1, -1.0],
      [0.55, -0.4, -1.35],
      [1.1, -0.6, -1.6],
      [1.9, -0.62, -1.72],
    ],
  },
  {
    id: 'coolant',
    name: 'Coolant',
    color: '#3ce6b0',
    closed: true,
    count: 260,
    pts: [
      [-1.82, -0.05, 0.42],
      [-0.9, 0.18, 0.56],
      [0.6, 0.25, 0.56],
      [1.35, 0.5, 0.35],
      [0.9, 0.82, 0.3],
      [-0.6, 0.82, 0.32],
      [-1.78, 0.34, 0.56],
      [-2.5, 0.45, 0.85],
      [-2.85, 0.05, 0.55],
      [-2.5, -0.25, 0.35],
    ],
  },
  {
    id: 'oil',
    name: 'Oil',
    color: '#ffc34d',
    closed: true,
    count: 230,
    pts: [
      [-0.65, -0.92, 0],
      [0.45, -0.64, 0.05],
      [-0.3, -0.3, 0.35],
      [-1.3, 0.3, 0.45],
      [-1.28, 1.0, 0.45],
      [-0.6, 1.16, 0.15],
      [0.7, 1.14, 0.0],
      [1.35, 0.6, -0.05],
      [0.9, -0.2, -0.05],
      [0.1, -0.7, -0.05],
    ],
  },
]
