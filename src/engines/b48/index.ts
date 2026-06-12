import { SYSTEM_ORDER } from '../../data/systems'
import type { EngineDefinition } from '../types'
import { meta } from './meta'
import { PARTS, PART_MAP, REMOVAL_SEQUENCE } from './parts'
import { QUIZ_QUESTIONS } from './quiz'
import { circuits } from './circuits'
import { cycle, flow, movingPartIds, partUtil, sound, stressParts } from './physics'
import { zh } from './content.zh'

export const B48_ENGINE: EngineDefinition = {
  meta,
  geometry: {
    cylX: [-0.75, -0.25, 0.25, 0.75],
    pinAnglesDeg: [0, 180, 180, 0],
    fireDeg: [0, 540, 180, 360],
    crankRScene: 0.14,
    rodScene: 0.46,
    blockHalfLen: 1.15,
    cameraHome: { pos: [3.7, 2.3, 4.4], target: [0, 0.25, 0] },
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
