import type { GeometryLayout } from '../types'

/** Cylinder X positions (scene units). Single source of truth — parts.ts imports this. */
export const cylX = [-0.75, -0.25, 0.25, 0.75]

export const geometry: GeometryLayout = {
  cylX,
  pinAnglesDeg: [0, 180, 180, 0],
  fireDeg: [0, 540, 180, 360],
  crankRScene: 0.14,
  rodScene: 0.46,
  blockHalfLen: 1.15,
  cameraHome: { pos: [3.7, 2.3, 4.4], target: [0, 0.25, 0] },
}
