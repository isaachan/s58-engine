import type { GeometryLayout } from '../types'

/** Cylinder X positions (scene units). Single source of truth — parts.ts imports this. */
export const cylX = [-1.25, -0.75, -0.25, 0.25, 0.75, 1.25]

export const geometry: GeometryLayout = {
  cylX,
  pinAnglesDeg: [0, 240, 120, 120, 240, 0],
  fireDeg: [0, 480, 240, 600, 120, 360],
  crankRScene: 0.14,
  rodScene: 0.46,
  blockHalfLen: 1.65,
  cameraHome: { pos: [4.6, 2.6, 5.2], target: [0, 0.3, 0] },
}
