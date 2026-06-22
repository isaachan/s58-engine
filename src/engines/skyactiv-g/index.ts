import { SYSTEM_ORDER } from '../../data/systems'
import type { EngineDefinition } from '../types'
import { meta } from './meta'
import { PARTS, PART_MAP, REMOVAL_SEQUENCE } from './parts'
import { QUIZ_QUESTIONS } from './quiz'
import { circuits } from './circuits'
import { cycle, flow, movingPartIds, partUtil, sound, stressParts } from './physics'
import { geometry } from './geometry'
import { zh } from './content.zh'

export const SKYACTIV_G_ENGINE: EngineDefinition = {
  meta,
  geometry,
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
