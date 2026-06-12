import type { EngineMeta } from '../types'

export const meta: EngineMeta = {
  id: 's58',
  badge: 'S58',
  name: { en: 'BMW S58B30', zh: '宝马 S58B30' },
  subtitle: { en: '3.0 L Twin-Turbo Inline-Six', zh: '3.0L 双涡轮直列六缸' },
  exploreIntro: {
    en: 'Free inspection of the BMW S58 — the 3.0 L twin-turbo inline-six used in the M3, M4, X3 M and X4 M.',
    zh: '自由查看宝马 S58 —— 用于 M3、M4、X3 M 和 X4 M 的 3.0L 双涡轮直列六缸发动机。',
  },
  partCount: 34,
  specs: {
    layout: { en: 'Inline-six', zh: '直列六缸' },
    displacementL: 2.993,
    cylinders: 6,
    turbo: { en: 'Twin mono-scroll', zh: '双单流道涡轮' },
    powerKw: 375,
    torqueNm: 650,
    redlineRpm: 7200,
    compressionRatio: 9.3,
    firingOrder: '1-5-3-6-2-4',
  },
}
