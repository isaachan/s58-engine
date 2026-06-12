import type { CircuitDef } from '../types'

// Hand-authored visual polylines threaded through the inline-four part layout
// (same scene layout as the B48 module). Naturally aspirated: the exhaust path
// runs the 4-2-1 header down the exhaust side rather than into a turbine.
export const circuits: CircuitDef[] = [
  {
    id: 'intake',
    name: 'Intake air',
    color: '#54b8ff',
    closed: false,
    count: 180,
    pts: [
      [-2.1, 0.5, 1.3],
      [-1.3, 0.58, 1.25],
      [-0.86, 0.62, 1.22],
      [-0.25, 0.66, 1.05],
      [0.45, 0.6, 0.82],
      [0.5, 0.48, 0.28],
    ],
  },
  {
    id: 'exhaust',
    name: 'Exhaust gas',
    color: '#ff7a3c',
    closed: false,
    count: 190,
    pts: [
      [-0.55, 0.5, -0.3],
      [0, 0.5, -0.55],
      [0.12, 0.5, -0.78],
      [0.18, 0.35, -1.0],
      [0.2, -0.2, -1.2],
      [0.6, -0.7, -1.45],
      [1.4, -0.8, -1.6],
    ],
  },
  {
    id: 'coolant',
    name: 'Coolant',
    color: '#3ce6b0',
    closed: true,
    count: 210,
    pts: [
      [-1.28, -0.05, 0.42],
      [-0.55, 0.18, 0.54],
      [0.65, 0.25, 0.54],
      [0.9, 0.78, 0.28],
      [-0.55, 0.82, 0.3],
      [-1.2, 0.34, 0.56],
      [-2.1, 0.35, 0.75],
      [-2.35, -0.15, 0.42],
    ],
  },
  {
    id: 'oil',
    name: 'Oil',
    color: '#ffc34d',
    closed: true,
    count: 190,
    pts: [
      [-0.45, -0.92, 0],
      [0.25, -0.64, 0.05],
      [-0.2, -0.3, 0.35],
      [-0.84, 0.3, 0.45],
      [-0.82, 1.0, 0.45],
      [-0.25, 1.16, 0.15],
      [0.6, 1.1, 0.0],
      [0.85, 0.45, -0.05],
      [0.2, -0.7, -0.05],
    ],
  },
]
