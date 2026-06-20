import type { Source } from '../types'
import type { LocalizedString } from '../engines/types'

/**
 * Glossary of engine terminology for enthusiast mode. The `<RichText>`
 * component auto-links the first occurrence of any term's `match` phrases
 * inside part descriptions and other prose; clicking opens a popover with
 * the short definition (and an optional longer explanation + sources).
 *
 * `match` is per-language because the prose is rendered already-localized:
 * we match the Chinese phrases when lang === 'zh', English when 'en'.
 * Always include the term itself in the relevant `match` array.
 */
export interface GlossaryEntry {
  id: string
  term: LocalizedString
  match: { en: string[]; zh: string[] }
  short: LocalizedString
  long?: LocalizedString
  sources?: Source[]
  related?: string[]
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  boost: {
    id: 'boost',
    term: { en: 'Boost', zh: '增压' },
    match: { en: ['boost pressure', 'boost'], zh: ['增压压力', '增压'] },
    short: {
      en: 'Intake pressure above atmospheric, produced by a turbo or supercharger to pack more air into each cylinder.',
      zh: '高于大气压的进气压力，由涡轮或机械增压器产生，让每个气缸能吸入更多空气。',
    },
    long: {
      en: 'More air means more fuel can be burned, so boost directly raises power. It is measured in bar or psi above ambient; the S58 runs roughly 1.2–1.7 bar peak depending on tune.',
      zh: '更多空气意味着可以燃烧更多燃油，因此增压直接提升功率。以高于环境压力的 bar 或 psi 计量；S58 视调校峰值约 1.2–1.7 bar。',
    },
    related: ['turbocharger', 'intercooler', 've'],
  },
  turbocharger: {
    id: 'turbocharger',
    term: { en: 'Turbocharger', zh: '涡轮增压器' },
    match: { en: ['turbocharger', 'turbocharged', 'turbo'], zh: ['涡轮增压器', '涡轮'] },
    short: {
      en: 'An exhaust-driven turbine spinning a compressor that forces extra air into the intake.',
      zh: '由排气驱动的涡轮带动压气机，将额外空气压入进气道。',
    },
    long: {
      en: 'Exhaust gas spins the turbine wheel; on a shared shaft a compressor wheel pressurizes intake air. The S58 uses twin mono-scroll turbos, one per bank of three cylinders.',
      zh: '排气推动涡轮叶轮，同轴的压气机叶轮为进气加压。S58 采用双单涡管涡轮，每三缸一组各配一个。',
    },
    related: ['boost', 'intercooler'],
  },
  intercooler: {
    id: 'intercooler',
    term: { en: 'Intercooler', zh: '中冷器' },
    match: { en: ['intercooler', 'charge air cooler', 'charge cooler'], zh: ['中冷器', '中冷'] },
    short: {
      en: 'A heat exchanger that cools the compressed (and thus heated) intake charge before it enters the engine.',
      zh: '一种热交换器，在增压后被加热的进气进入发动机前对其降温。',
    },
    long: {
      en: 'Compressing air heats it, which reduces density and promotes knock. Cooling the charge restores density and raises the knock margin. The S58 uses a water-to-air cooler integrated in the intake plenum.',
      zh: '压缩空气会升温，降低密度并诱发爆震。对进气降温可恢复密度并提高抗爆余量。S58 采用集成于进气歧管的水冷式中冷器。',
    },
    related: ['boost', 'detonation'],
  },
  detonation: {
    id: 'detonation',
    term: { en: 'Detonation (knock)', zh: '爆震' },
    match: { en: ['detonation', 'knock', 'pre-ignition'], zh: ['爆震', '震爆'] },
    short: {
      en: 'Uncontrolled auto-ignition of the end-gas, producing a sharp pressure spike that can hammer pistons and bearings.',
      zh: '末端混合气的失控自燃，产生尖锐的压力冲击，可能重击活塞和轴承。',
    },
    long: {
      en: 'Instead of a smooth flame front from the spark, pockets of fuel-air ignite spontaneously and collide, creating the metallic "knock". Sustained detonation damages ring lands and head gaskets. Higher octane, more intercooling, and retarded timing all suppress it.',
      zh: '正常应由火花塞引发平稳火焰面，但局部混合气自发点燃并相互碰撞，形成金属敲击声。持续爆震会损伤环岸和缸盖垫片。提高辛烷值、加强中冷、推迟点火都可抑制。',
    },
    related: ['intercooler', 'compression-ratio'],
  },
  'torque-to-yield': {
    id: 'torque-to-yield',
    term: { en: 'Torque-to-yield bolt', zh: '扭矩-屈服螺栓' },
    match: { en: ['torque-to-yield', 'torque to yield', 'stretch bolt'], zh: ['扭矩-屈服', '扭矩屈服', '塑性螺栓'] },
    short: {
      en: 'A fastener tightened past its elastic limit for a precise, uniform clamp load — single-use, always replace.',
      zh: '被拧紧至超过弹性极限的紧固件，以获得精确均匀的夹紧力——一次性使用，务必更换。',
    },
    long: {
      en: 'Tightening into the plastic region makes clamp load depend on stretch rather than friction, giving very consistent preload. But the bolt is permanently deformed, so reusing it risks failure. Head bolts and rod bolts are typically torque-to-yield.',
      zh: '拧入塑性区后，夹紧力取决于伸长量而非摩擦，预紧力非常一致。但螺栓已永久变形，重复使用有断裂风险。缸盖螺栓和连杆螺栓通常为此类。',
    },
    related: [],
  },
  've': {
    id: 've',
    term: { en: 'Volumetric efficiency (VE)', zh: '容积效率' },
    match: { en: ['volumetric efficiency', 've'], zh: ['容积效率'] },
    short: {
      en: 'How completely a cylinder fills with fresh charge each cycle, versus its geometric displacement.',
      zh: '每个循环气缸充入新鲜混合气的完整程度，相对其几何排量。',
    },
    long: {
      en: 'A naturally aspirated engine peaks near 100% VE; forced induction can exceed 100% because boost packs in extra mass. VE shapes the torque curve and is what intake/exhaust tuning chases.',
      zh: '自然吸气发动机峰值接近 100%；强制进气因增压可超过 100%。容积效率决定扭矩曲线形状，也是进排气调校追求的目标。',
    },
    related: ['boost'],
  },
  imep: {
    id: 'imep',
    term: { en: 'IMEP', zh: '平均指示有效压力' },
    match: { en: ['imep', 'indicated mean effective pressure'], zh: ['平均指示有效压力', '指示平均有效压力'] },
    short: {
      en: 'The work done on the piston per cycle expressed as an equivalent constant pressure — a load-normalized measure of output.',
      zh: '每循环对活塞做的功，折算为等效恒定压力——一种按负荷归一化的输出度量。',
    },
    related: [],
  },
  'compression-ratio': {
    id: 'compression-ratio',
    term: { en: 'Compression ratio', zh: '压缩比' },
    match: { en: ['compression ratio'], zh: ['压缩比'] },
    short: {
      en: 'The ratio of cylinder volume at bottom-dead-center to volume at top-dead-center.',
      zh: '气缸在下止点容积与上止点容积之比。',
    },
    long: {
      en: 'Higher ratios extract more work from each combustion but raise knock risk, so boosted engines run lower ratios than naturally aspirated ones. The S58 uses about 9.3:1.',
      zh: '压缩比越高，每次燃烧提取的功越多，但爆震风险也越大，因此增压发动机比自然吸气采用更低的压缩比。S58 约为 9.3:1。',
    },
    related: ['detonation', 'boost'],
  },
  'cross-hatch': {
    id: 'cross-hatch',
    term: { en: 'Cross-hatch (honing)', zh: '珩磨网纹' },
    match: { en: ['cross-hatch', 'crosshatch', 'cross hatch', 'hone', 'honing'], zh: ['珩磨网纹', '珩磨', '网纹'] },
    short: {
      en: 'The fine criss-cross pattern honed into a cylinder bore to retain an oil film for the piston rings.',
      zh: '在缸壁上珩磨出的细密交叉纹路，用于在活塞环表面保持油膜。',
    },
    long: {
      en: 'The grooves hold oil so the rings stay lubricated and seal properly; the angle and roughness are specified. Glazed or worn cross-hatch leads to blow-by and oil consumption.',
      zh: '沟槽储存机油使活塞环保持润滑并良好密封；其角度和粗糙度有规范要求。网纹被抛光或磨损会导致窜气和机油消耗。',
    },
    related: ['ring-land'],
  },
  'ring-land': {
    id: 'ring-land',
    term: { en: 'Ring land', zh: '环岸' },
    match: { en: ['ring land', 'ring lands'], zh: ['环岸'] },
    short: {
      en: 'The raised metal between the piston ring grooves; the part most often cracked by detonation.',
      zh: '活塞环槽之间凸起的金属部分；最易被爆震击裂的部位。',
    },
    related: ['detonation', 'cross-hatch'],
  },
  vvt: {
    id: 'vvt',
    term: { en: 'Variable valve timing', zh: '可变气门正时' },
    match: { en: ['variable valve timing', 'vvt', 'vanos', 'cam phasing'], zh: ['可变气门正时', '气门正时', '凸轮相位'] },
    short: {
      en: 'Adjusting when valves open and close relative to crank angle, to optimize across the rev range.',
      zh: '相对曲轴转角调整气门开闭时刻，以在整个转速范围内优化性能。',
    },
    long: {
      en: 'Advancing or retarding the camshafts trades low-end torque against top-end power and controls overlap for emissions and idle quality. BMW calls its system VANOS.',
      zh: '提前或延后凸轮轴可在低速扭矩与高速功率之间权衡，并控制气门重叠以兼顾排放和怠速品质。宝马的系统称为 VANOS。',
    },
    related: ['camshaft'],
  },
  camshaft: {
    id: 'camshaft',
    term: { en: 'Camshaft', zh: '凸轮轴' },
    match: { en: ['camshaft', 'camshafts'], zh: ['凸轮轴'] },
    short: {
      en: 'A shaft of lobes that pushes the valves open in time with the crankshaft.',
      zh: '带凸角的轴，与曲轴同步将气门顶开。',
    },
    related: ['vvt'],
  },
  'head-gasket': {
    id: 'head-gasket',
    term: { en: 'Head gasket', zh: '缸盖垫片' },
    match: { en: ['head gasket'], zh: ['缸盖垫片', '气缸垫'] },
    short: {
      en: 'The seal between block and cylinder head that contains combustion pressure, coolant, and oil passages.',
      zh: '缸体与缸盖之间的密封件，封住燃烧压力以及冷却液和机油通道。',
    },
    long: {
      en: 'It must seal three fluids at very different pressures across a surface that heats and flexes. Overheating events are the usual cause of failure, which shows up as coolant loss or combustion gases in the coolant.',
      zh: '它需在受热变形的表面上密封三种压力差异极大的流体。过热是常见失效原因，表现为冷却液减少或冷却液中出现燃烧气体。',
    },
    related: ['torque-to-yield'],
  },
  'closed-deck': {
    id: 'closed-deck',
    term: { en: 'Closed-deck block', zh: '闭式缸体' },
    match: { en: ['closed-deck', 'closed deck'], zh: ['闭式缸体', '闭式'] },
    short: {
      en: 'A block design where the top deck is largely solid around the bores, for high cylinder rigidity under boost.',
      zh: '缸体顶面在缸孔周围基本实心的设计，在增压下提供高缸壁刚度。',
    },
    long: {
      en: 'Closed decks resist bore distortion at high cylinder pressure, at the cost of coolant flow flexibility. The S58 uses a closed-deck crankcase, unlike the open-deck B58 it is based on.',
      zh: '闭式缸体在高缸压下抗缸孔变形，代价是冷却液流动灵活性较低。S58 采用闭式曲轴箱，与其基础机型 B58 的开式缸体不同。',
    },
    related: ['boost'],
  },
  'direct-injection': {
    id: 'direct-injection',
    term: { en: 'Direct injection', zh: '缸内直喷' },
    match: { en: ['direct injection', 'direct-injection', 'gdi'], zh: ['缸内直喷', '直喷'] },
    short: {
      en: 'Spraying fuel straight into the combustion chamber at high pressure, rather than into the intake port.',
      zh: '将燃油以高压直接喷入燃烧室，而非喷入进气道。',
    },
    long: {
      en: 'In-cylinder injection cools the charge (raising knock margin) and allows precise multi-pulse metering, but can leave intake valves without a fuel-wash, so carbon buildup is a known maintenance item.',
      zh: '缸内喷射可冷却混合气（提高抗爆余量）并实现精确多段喷射，但进气门得不到燃油冲刷，因此积碳是已知的维护项目。',
    },
    related: ['detonation'],
  },
  afr: {
    id: 'afr',
    term: { en: 'Air-fuel ratio (AFR)', zh: '空燃比' },
    match: { en: ['air-fuel ratio', 'air/fuel ratio', 'afr'], zh: ['空燃比'] },
    short: {
      en: 'The mass ratio of air to fuel in the charge; ~14.7:1 is stoichiometric for gasoline.',
      zh: '混合气中空气与燃油的质量比；汽油的理论值约 14.7:1。',
    },
    long: {
      en: 'Under high load engines run rich (more fuel) to cool combustion and protect components, which is why boosted cars show lower AFR at full throttle.',
      zh: '高负荷下发动机偏浓（更多燃油）以降低燃烧温度、保护部件，这就是增压车全油门时空燃比偏低的原因。',
    },
    related: ['detonation'],
  },
  crankshaft: {
    id: 'crankshaft',
    term: { en: 'Crankshaft', zh: '曲轴' },
    match: { en: ['crankshaft'], zh: ['曲轴'] },
    short: {
      en: 'The shaft that converts the pistons’ reciprocating motion into rotation, riding on the main bearings.',
      zh: '将活塞往复运动转化为旋转的轴，支承于主轴承上。',
    },
    related: ['main-bearing'],
  },
  'main-bearing': {
    id: 'main-bearing',
    term: { en: 'Main bearing', zh: '主轴承' },
    match: { en: ['main bearing', 'main bearings'], zh: ['主轴承'] },
    short: {
      en: 'The plain bearings that support the crankshaft in the block, fed by pressurized oil.',
      zh: '在缸体内支承曲轴的滑动轴承，由压力机油供油。',
    },
    related: ['crankshaft'],
  },
  redline: {
    id: 'redline',
    term: { en: 'Redline', zh: '红线转速' },
    match: { en: ['redline'], zh: ['红线转速', '红线'] },
    short: {
      en: 'The maximum safe engine speed, limited by valvetrain dynamics and reciprocating stress.',
      zh: '发动机安全运转的最高转速，受气门机构动力学和往复应力限制。',
    },
    related: [],
  },
}

/** All glossary entries, e.g. for the browsable glossary panel. */
export const GLOSSARY_LIST: GlossaryEntry[] = Object.values(GLOSSARY)
