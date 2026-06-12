import { SYSTEM_ORDER } from '../../data/systems'
import type { EngineDefinition } from '../types'
import { meta } from './meta'
import { PARTS, PART_MAP, REMOVAL_SEQUENCE } from './parts'
import { QUIZ_QUESTIONS } from './quiz'
import { circuits } from './circuits'
import { cycle, flow, movingPartIds, partUtil, sound, stressParts } from './physics'
import { zh } from './content.zh'

export const N52_ENGINE: EngineDefinition = {
  meta,
  geometry: {
    cylX: [-1.25, -0.75, -0.25, 0.25, 0.75, 1.25],
    pinAnglesDeg: [0, 240, 120, 120, 240, 0],
    fireDeg: [0, 480, 240, 600, 120, 360],
    crankRScene: 0.14,
    rodScene: 0.46,
    blockHalfLen: 1.65,
    cameraHome: { pos: [4.6, 2.6, 5.2], target: [0, 0.3, 0] },
  },
  parts: PARTS,
  partMap: PART_MAP,
  removalSequence: REMOVAL_SEQUENCE,
  systemOrder: SYSTEM_ORDER,
  quiz: QUIZ_QUESTIONS,
  cycle,
  flow,
  sound,
  circuits,
  stressParts,
  movingPartIds,
  partUtil,
  zh,
}
