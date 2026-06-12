import type { EngineMeta } from '../types'

export const meta: EngineMeta = {
  id: 'n52',
  badge: 'N52',
  name: { en: 'BMW N52B30', zh: '宝马 N52B30' },
  subtitle: { en: '3.0 L Naturally-Aspirated Inline-Six', zh: '3.0L 自然吸气直列六缸' },
  exploreIntro: {
    en: 'Free inspection of the BMW N52B30 naturally-aspirated inline-six: magnesium-aluminium block, port injection (no high-pressure pump), Valvetronic + double VANOS, an electric coolant pump, and a 3-stage DISA variable intake.',
    zh: '自由查看宝马 N52B30 自然吸气直列六缸：镁铝合金缸体、进气道喷射（无高压泵）、Valvetronic + 双 VANOS、电子冷却液泵，以及三级 DISA 可变进气歧管。',
  },
  partCount: 27,
  specs: {
    layout: { en: 'Inline-six', zh: '直列六缸' },
    displacementL: 2.996,
    cylinders: 6,
    turbo: { en: 'Naturally aspirated', zh: '自然吸气' },
    powerKw: 200,
    torqueNm: 315,
    redlineRpm: 7000,
    compressionRatio: 10.7,
    firingOrder: '1-5-3-6-2-4',
  },
}
