import type { EngineMeta } from '../types'

export const meta: EngineMeta = {
  id: 'skyactiv-g',
  badge: 'SKY-G',
  name: { en: 'Mazda Skyactiv-G 2.0', zh: '马自达 创驰蓝天 2.0' },
  subtitle: { en: '2.0 L Naturally-Aspirated Inline-Four (MX-5 ND)', zh: '2.0L 自然吸气直列四缸（MX-5 ND）' },
  exploreIntro: {
    en: 'Free inspection of the Mazda 2.0 Skyactiv-G (PE-VPS, MX-5 ND2): naturally aspirated, 13:1 high compression, signature 4-2-1 exhaust manifold, Dual S-VT, and direct injection.',
    zh: '自由查看马自达 2.0 创驰蓝天（PE-VPS，MX-5 ND2）：自然吸气、13:1 高压缩比、标志性 4-2-1 排气歧管、双 S-VT 与缸内直喷。',
  },
  partCount: 25,
  specs: {
    layout: { en: 'Inline-four', zh: '直列四缸' },
    displacementL: 1.998,
    cylinders: 4,
    turbo: { en: 'Naturally aspirated', zh: '自然吸气' },
    powerKw: 135,
    torqueNm: 205,
    redlineRpm: 7500,
    compressionRatio: 13.0,
    firingOrder: '1-3-4-2',
  },
}
