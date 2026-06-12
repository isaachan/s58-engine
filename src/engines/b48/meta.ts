import type { EngineMeta } from '../types'

export const meta: EngineMeta = {
  id: 'b48',
  badge: 'B48',
  name: { en: 'BMW B48B20', zh: '宝马 B48B20' },
  subtitle: { en: '2.0 L Twin-Scroll Turbo Inline-Four', zh: '2.0L 双流道单涡轮直列四缸' },
  exploreIntro: {
    en: 'Free inspection of the BMW B48B20 high-output inline-four: single twin-scroll turbo, Valvetronic, double VANOS, and 350-bar direct injection.',
    zh: '自由查看宝马 B48B20 高功率直列四缸：单个双流道涡轮、Valvetronic、双 VANOS 与 350 bar 直喷。',
  },
  partCount: 28,
  specs: {
    layout: { en: 'Inline-four', zh: '直列四缸' },
    displacementL: 1.998,
    cylinders: 4,
    turbo: { en: 'Single twin-scroll', zh: '单个双流道涡轮' },
    powerKw: 190,
    torqueNm: 400,
    redlineRpm: 6500,
    compressionRatio: 10.2,
    firingOrder: '1-3-4-2',
  },
}
