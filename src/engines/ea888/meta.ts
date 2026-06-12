import type { EngineMeta } from '../types'

export const meta: EngineMeta = {
  id: 'ea888',
  badge: 'EA888',
  name: { en: 'VW EA888 evo5 2.0 TSI', zh: '大众 EA888 evo5 2.0 TSI' },
  subtitle: { en: '2.0 L VGT Turbo Inline-Four (evo5)', zh: '2.0L VGT 涡轮直列四缸（evo5）' },
  exploreIntro: {
    en: 'Free inspection of the VW Group EA888 evo5 2.0 TSI (PC2 high-output): variable-geometry turbo, exhaust manifold cast into the head, dual injection (500-bar direct + port MPI), cast-iron block with balance shafts, and 12.5:1 Miller-cycle combustion.',
    zh: '自由查看大众集团 EA888 evo5 2.0 TSI（PC2 高功率版）：可变截面涡轮、集成于缸盖的排气歧管、双喷射（500 bar 直喷 + 进气道 MPI）、带平衡轴的铸铁缸体，以及 12.5:1 米勒循环燃烧。',
  },
  partCount: 27,
  specs: {
    layout: { en: 'Inline-four', zh: '直列四缸' },
    displacementL: 1.984,
    cylinders: 4,
    turbo: { en: 'Single variable-geometry (VGT)', zh: '单可变截面涡轮（VGT）' },
    powerKw: 195,
    torqueNm: 400,
    redlineRpm: 6500,
    compressionRatio: 12.5,
    firingOrder: '1-3-4-2',
  },
}
