import type { Lang } from './strings'
import type { PartDef, QuizQuestion, SystemId } from '../types'
import type { EngineDefinition } from '../engines/types'

/**
 * Content translation overlay. English lives in data/* (source of truth);
 * this file supplies the Chinese rendering, looked up by id. Resolver helpers
 * fall back to the English field when a translation is missing.
 */

type PartFieldKey = 'name' | 'function' | 'location' | 'inspectionNotes' | 'failurePoints' | 'simplified'
type PartZh = Partial<Record<PartFieldKey, string>>

const pistonZh = (i: number): PartZh => ({
  name: `活塞与连杆 #${i + 1}`,
  function:
    '将燃烧压力转化为直线推力，经连杆传递到曲轴。S58 采用可承受高增压压力的锻造活塞。',
  location: `第 ${i + 1} 缸，从发动机前端（正时端）开始计数。`,
  inspectionNotes:
    '检查环岸、裙部涂层和连杆轴瓦。重新安装前检查缸壁珩磨网纹。连杆螺栓为扭矩-屈服型：务必更换。',
  failurePoints: '爆震导致的环岸损伤；持续高负荷下的连杆轴承磨损。',
  simplified: '活塞、活塞环、活塞销与连杆建模为一个整体组件。',
})

const PARTS_ZH: Record<string, PartZh> = {
  'cylinder-block': {
    name: '气缸体（曲轴箱）',
    function:
      '闭式缸体结构的铝制曲轴箱，含六个气缸。承载曲轴、活塞、冷却液水套和主油道，是发动机的结构核心。',
    location: '发动机总成的中心；其他所有系统都安装于其上。',
    inspectionNotes:
      '检查缸壁（电弧喷涂铁基涂层）是否有拉伤。装缸盖前确认缸体平面平整度。主轴承盖为同镗加工：务必保持原有顺序。',
    failurePoints: '机油更换间隔被忽视时的缸壁拉伤；缸盖螺栓螺纹损坏。',
    simplified: '冷却液水套和内部油道未建模。',
  },
  'cylinder-head': {
    name: '气缸盖',
    function:
      '容纳燃烧室、气门和 S58 特有的 3D 打印型芯冷却水道。引导进气进入、排气排出。',
    location: '位于气缸体顶部，由缸盖垫片密封。',
    inspectionNotes:
      '缸盖螺栓为扭矩-屈服型：务必更换，切勿重复使用。检查气门座下陷和垫片接合面。按从中心向外的螺旋扭矩顺序紧固。',
    failurePoints: '过热事件后的垫片密封失效。',
  },
  'valve-cover': {
    name: '气门室盖',
    function:
      '密封气门机构并集成曲轴箱通风（PCV）迷宫结构。S58 采用内置油气分离器的复合材料盖。',
    location: '发动机最顶部的盖，位于凸轮轴上方。',
    inspectionNotes:
      '检查周边垫片和火花塞管密封。复合材料盖可能翘曲：按顺序紧固小螺栓，切勿过紧。',
    failurePoints: 'PCV 膜片磨损导致怠速不稳和机油消耗。',
  },
  'camshaft-intake': {
    name: '进气凸轮轴',
    function:
      '通过滚子摇臂驱动进气门。由 VANOS 单元调相实现可变气门正时；进气门升程另由 Valvetronic 系统连续调节。',
    location: '进气侧（本模型缸盖的 +Z 侧），位于气门室盖下方。',
    inspectionNotes:
      '检查凸轮表面是否点蚀、轴承座是否拉伤。凸轮轴承盖须均匀紧固：受力不均会导致轴体开裂。',
    simplified: '气门、气门弹簧和摇臂未单独建模。',
  },
  'camshaft-exhaust': {
    name: '排气凸轮轴',
    function: '驱动排气门，并通过三联凸轮带动两个高压燃油泵，两组凸轮错相布置使泵每旋转 60° 供油一次。',
    location: '缸盖排气侧（本模型的 -Z 侧），位于气门室盖下方。',
    inspectionNotes:
      '检查三联高压泵驱动凸轮：其接触负荷很高。拆卸前对照锁止工具位置核对正时标记。',
  },
  crankshaft: {
    name: '曲轴',
    function: '锻钢曲轴，将活塞运动转化为旋转。七道主轴承；驱动正时链和机油泵。',
    location: '缸体底部，位于曲轴箱主轴承座中。',
    inspectionNotes:
      '测量主轴颈和连杆轴颈直径，检查轴瓦是否露铜。确认轴向止推间隙。主轴承盖螺栓为一次性使用。',
    failurePoints: '连杆轴承磨损是 S5x 系列在赛道使用下的典型失效模式。',
  },
  'harmonic-damper': {
    name: '扭振减振器（曲轴皮带轮）',
    function: '抑制曲轴扭转振动并驱动附件皮带。用螺栓固定在曲轴前端。',
    location: '曲轴前端，正时罩盖外侧。',
    inspectionNotes:
      '检查弹性体环是否开裂或有转动痕迹。中心螺栓扭矩极高：须反向固定曲轴，切勿依赖起动机。',
  },
  'timing-cover': {
    name: '正时罩盖',
    function: '密封发动机前端的正时传动机构，并承载前曲轴油封。',
    location: '发动机前端面，位于扭振减振器后方。',
    inspectionNotes:
      '使用液态密封胶密封：彻底清洁两个接合面并在可操作时间内重新密封。每次拆下罩盖时都应更换前曲轴油封。',
  },
  'vanos-unit': {
    name: 'VANOS 单元（凸轮相位器）',
    function: '两根凸轮轴上的液压凸轮相位器，提前或滞后气门正时以兼顾扭矩、响应和排放。',
    location: '两根凸轮轴前端，由正时链驱动。',
    inspectionNotes:
      '松开中心气门螺栓前先用正时工具锁定凸轮轴。中心螺栓为一次性使用。检查机油控制电磁阀滤网。',
    failurePoints: '冷启动时的异响表明相位器锁止销磨损。',
    simplified: '两个相位器及其链轮建模为一个可维修单元。',
  },
  'timing-chain': {
    name: '正时链与导轨',
    function: '连接曲轴与 VANOS 链轮，使气门动作与活塞位置保持同步。采用液压张紧。',
    location: '发动机前端，在正时罩盖内自曲轴向凸轮轴竖直延伸。',
    inspectionNotes:
      '拆卸前发动机必须锁定在 1 缸上止点：单独转动凸轮轴或曲轴会顶弯气门。检查导轨是否有沟槽磨损、张紧器棘齿伸出量。',
    failurePoints: '高里程时导轨磨损；链条伸长会表现为 VANOS 故障码。',
    simplified: '链条、导轨和张紧器建模为一个环形组件。',
  },
  'turbo-front': {
    name: '涡轮增压器（1–3 缸）',
    function:
      '由 1–3 缸供气的单流道涡轮增压器。S58 采用两个小涡轮并联，以兼顾快速起压和高总进气量。',
    location: '发动机排气侧前部，固定在前排气歧管上。',
    inspectionNotes:
      '检查转轴间隙（轴向和径向）和叶轮叶尖损伤。检查进油和回油管路：回油受阻会迫使机油越过油封进入排气。',
    failurePoints: '废气门执行器异响；油封渗漏表现为蓝烟。',
  },
  'turbo-rear': {
    name: '涡轮增压器（4–6 缸）',
    function: '由 4–6 缸供气的单流道涡轮增压器，与前涡轮并联工作。',
    location: '发动机排气侧后部，固定在后排气歧管上。',
    inspectionNotes:
      '检查项与前涡轮相同。在车身上后部空间更紧凑：拆下时检查隔热罩和冷却液管路状况。',
  },
  'exhaust-manifold-front': {
    name: '排气歧管（1–3 缸）',
    function: '汇集 1–3 缸的排气并送入前涡轮增压器。',
    location: '气缸盖排气侧，前三个排气口。',
    inspectionNotes:
      '检查法兰平整度和螺柱状况：经热循环的螺柱易断裂，先用渗透剂浸泡。务必更换垫片。',
  },
  'exhaust-manifold-rear': {
    name: '排气歧管（4–6 缸）',
    function: '汇集 4–6 缸的排气并送入后涡轮增压器。',
    location: '气缸盖排气侧，后三个排气口。',
    inspectionNotes: '操作与前歧管相同。检查集气管周围是否开裂。',
  },
  'intake-manifold': {
    name: '进气歧管（含中冷器）',
    function:
      '将压缩空气分配到全部六个气缸。进气室集成间接式水-空中冷器，由独立的低温冷却回路供给（专用电动水泵、散热器和膨胀水壶），与发动机主冷却回路分开。',
    location: '气缸盖进气侧（+Z），横跨全部六个进气口。',
    inspectionNotes:
      '检查中冷器芯体是否有冷却液渗漏，并对低温回路做压力测试。安装时更换进气道密封件。',
    failurePoints: '中冷器内部泄漏会使冷却液进入气缸：检查火花塞是否被蒸汽清洗。',
    simplified: '内部中冷器芯体未单独建模。',
  },
  'throttle-body': {
    name: '节气门体',
    function:
      '位于进气室入口的电控阀门。S58 主要通过 Valvetronic 进气门升程控制负荷，因此节气门通常保持全开，主要作为备用控制和增压/滑行工况使用。',
    location: '进气歧管前端，由增压管供气。',
    inspectionNotes: '检查节气门轴间隙和积碳。重新安装后执行 DME 节气门自适应。',
  },
  'fuel-rail': {
    name: '高压燃油轨',
    function: '以高达 350 bar 的压力储存燃油，并向全部六个直喷喷油器供油。',
    location: '缸盖进气侧，喷油器上方。',
    inspectionNotes:
      '打开任何接头前先泄掉系统压力。高压油管为一次性使用：切勿对用过的油管重新拧紧。',
  },
  'injector-set': {
    name: '直喷喷油器（×6）',
    function: '电磁直喷喷油器，将燃油高压喷入各燃烧室。',
    location: '缸盖进气侧，每缸一个，位于燃油轨下方。',
    inspectionNotes:
      '使用拉拔工具：切勿撬动喷油器本体。用定径工具更换 PTFE 燃烧密封圈，并将喷油器修正值写入 DME。',
    failurePoints: '燃烧密封圈泄漏会产生“噗噗”声和燃油修正故障。',
    simplified: '六个喷油器建模为一个维修组件。',
  },
  'hp-fuel-pump': {
    name: '高压燃油泵 1',
    function:
      '两个凸轮驱动柱塞泵之一（S58 标配两个），将燃油压力从约 5 bar 提升到高达 350 bar。两泵并联工作：中等负荷下每 30 秒交替运行，全负荷时同时供油。',
    location: '气缸盖顶部前方，由排气凸轮轴上的三联凸轮驱动。',
    inspectionNotes:
      '拆卸前将驱动凸轮置于基圆位置。检查滚子挺柱磨损并更换 O 形圈。断开前泄压。',
  },
  'hp-fuel-pump-2': {
    name: '高压燃油泵 2',
    function:
      '两个并联高压泵中的第二个。两组三联驱动凸轮错相布置，使泵组每旋转 60° 输出一次压力脉冲。',
    location: '气缸盖顶部、1 号泵后方，由排气凸轮轴上独立的三联凸轮驱动。',
    inspectionNotes: '操作与 1 号泵相同。更换任一泵后，应在两个流量控制阀循环工作时验证油轨压力合理性。',
  },
  valvetronic: {
    name: 'Valvetronic（可变气门升程）',
    function:
      '由偏心轴、中间摇臂和伺服电机组成，连续调节进气门升程。这是 S58 的主要负荷控制方式 —— 发动机通过气门“呼吸”，而非节流进气。',
    location: '气门室盖下方、进气凸轮轴上方；伺服电机位于缸盖前端。',
    inspectionNotes:
      '检查中间摇臂导轨和偏心轴传感器。任何作业后执行 Valvetronic 限位自适应。中间摇臂分级配对，不得互换位置。',
    failurePoints: '中间摇臂轴承磨损导致怠速不稳；伺服电机齿轮磨损。',
    simplified: '偏心轴、摇臂、弹簧和伺服电机建模为一个总成。',
  },
  'coolant-pump-electric': {
    name: '电动水泵（中冷回路）',
    function:
      '独立低温回路的电动泵，为进气室内的中冷器供给冷却液。与发动机主水泵和主散热器相互独立。',
    location: '发动机前端进气侧，与进气歧管的中冷器接口相连。',
    inspectionNotes:
      '通过诊断激活并确认流动声。使用服务功能为低温回路排气 —— 残留空气会导致热浸和赛道工况功率下降。',
    failurePoints: '泵电子故障表现为持续负荷下进气温度升高。',
    simplified: '低温散热器和膨胀水壶位于车身侧，未建模。',
  },
  'oil-spray-nozzles': {
    name: '活塞机油喷嘴（×6）',
    function:
      '由 MAP 控制的喷油嘴，向活塞底部喷射机油以冷却活塞顶。经继电阀切换，仅在活塞温度需要时喷射。',
    location: '曲轴箱底部，每缸一个，朝活塞冷却油道向上喷射。',
    inspectionNotes:
      '确认每个喷嘴紧固且油道畅通 —— 喷嘴堵塞或弯曲会使单缸过热。用诊断测试检查继电阀动作。',
    failurePoints: '喷嘴堵塞会在高负荷下导致单缸活塞损坏。',
    simplified: '六个喷嘴与继电阀建模为一个维修组件。',
  },
  'water-pump': {
    name: '冷却液泵',
    function:
      '使冷却液在缸体和缸盖（主回路）中循环。中冷器不在此回路上 —— 它有自己的低温回路和专用电动泵。',
    location: '发动机前端，进气侧偏低位置，皮带/电动驱动。',
    inspectionNotes: '检查泄漏孔是否有结晶的冷却液痕迹，以及轴承是否有间隙。',
    failurePoints: '轴承和油封磨损：渗漏先于失效出现。',
  },
  'thermostat-housing': {
    name: '节温器壳体',
    function: '电控（MAP 控制）节温器，通过调节冷却液流向管理发动机工作温度。',
    location: '发动机前端，冷却液泵上方。',
    inspectionNotes: '塑料壳体随热循环变脆：高里程时应更换而非重新密封。',
  },
  'oil-filter-housing': {
    name: '机油滤清器壳体',
    function: '顶置式滤罐，容纳机油滤芯；含机油压力传感器接口。',
    location: '发动机进气侧顶部前方：无需举升车辆即可维修。',
    inspectionNotes: '每次保养更换盖 O 形圈。按规定扭矩拧紧盖：开裂的盖在受压时会泄漏。',
  },
  'oil-pan': {
    name: '油底壳',
    function: '储存发动机机油并保护旋转组件。承载机油液位传感器。',
    location: '用螺栓固定在曲轴箱底部。',
    inspectionNotes:
      '检查放出的机油是否有金属碎屑或轴承材料。使用液态密封胶密封：复装时遵循螺栓顺序。',
  },
  'oil-pump': {
    name: '机油泵',
    function: '链条驱动、MAP 控制的可变排量泵，为所有轴承和 VANOS 系统供油。',
    location: '油底壳区域内，用螺栓固定在曲轴箱底部，由曲轴驱动。',
    inspectionNotes: '检查集滤网是否有碎屑：此处污染意味着下端机件正在脱落金属。',
  },
}
for (let i = 0; i < 6; i++) PARTS_ZH[`piston-${i + 1}`] = pistonZh(i)

const SYSTEMS_ZH: Record<SystemId, string> = {
  block: '气缸体与曲轴箱',
  head: '气缸盖与气门机构',
  rotating: '曲轴、活塞与连杆',
  timing: '正时系统',
  turbo: '涡轮增压系统',
  intake: '进气系统',
  exhaust: '排气系统',
  cooling: '冷却系统',
  lubrication: '润滑系统',
  fuel: '燃油喷射系统',
}

const CIRCUITS_ZH: Record<string, string> = {
  intake: '进气',
  exhaust: '排气',
  coolant: '冷却液',
  oil: '机油',
}

/** quiz prompt + option overrides, keyed by question id */
const QUIZ_ZH: Record<string, { prompt: string; options?: string[] }> = {
  q1: { prompt: '单击将燃油压力提升到约 350 bar 以供直喷的部件之一（S58 有两个）。' },
  q2: { prompt: '单击由 1–3 缸供气的涡轮增压器。' },
  q3: {
    prompt: 'S58 的中冷器位于何处？',
    options: ['集成在进气歧管内（水冷式）', '散热器前方（前置风冷式）', '气门室盖内', 'S58 不使用中冷'],
  },
  q4: { prompt: '单击使凸轮轴与曲轴同步的零件。' },
  q5: {
    prompt: '拆下正时链之前，发动机必须……',
    options: ['用正时工具锁定在 1 缸上止点', '加热到工作温度', '反向转动两圈', '仅排空冷却液'],
  },
  q6: {
    prompt: '哪些紧固件是扭矩-屈服型、绝不可重复使用？',
    options: ['缸盖螺栓和连杆螺栓', '气门室盖螺栓', '油底壳螺栓', '节温器壳体螺栓'],
  },
  q7: { prompt: '单击包含机油集滤网的部件 —— 检查下端碎屑之处。' },
  q8: {
    prompt: 'S58 的两个高压燃油泵由什么驱动？',
    options: ['排气凸轮轴上的三联凸轮', '附件皮带', '电动机', '正时链直接驱动'],
  },
  q9: {
    prompt: '拆解时，哪个必须先于进气歧管拆下？',
    options: ['节气门体', '油底壳', '气缸盖', '曲轴'],
  },
  q10: { prompt: '拆卸旋转组件时（缸盖已拆除后）你会最先拆下的零件。' },
}

/* ------------------------------- resolvers ------------------------------- */

export function pField(lang: Lang, engine: EngineDefinition | null, part: PartDef, field: PartFieldKey): string | undefined {
  if (lang === 'zh') {
    const engineValue = engine?.zh.parts[part.id]?.[field]
    if (engineValue !== undefined) return engineValue
    const z = PARTS_ZH[part.id]?.[field]
    if (z !== undefined) return z
  }
  return part[field] as string | undefined
}

export const pName = (lang: Lang, engine: EngineDefinition | null, part: PartDef): string => pField(lang, engine, part, 'name')!

export function sysName(lang: Lang, id: SystemId, fallback: string): string {
  return lang === 'zh' ? SYSTEMS_ZH[id] ?? fallback : fallback
}

export function circuitName(lang: Lang, id: string, fallback: string): string {
  return lang === 'zh' ? CIRCUITS_ZH[id] ?? fallback : fallback
}

export function quizPrompt(lang: Lang, engine: EngineDefinition | null, q: QuizQuestion): string {
  return lang === 'zh' ? engine?.zh.quiz[q.id]?.prompt ?? QUIZ_ZH[q.id]?.prompt ?? q.prompt : q.prompt
}

export function quizOptions(lang: Lang, engine: EngineDefinition | null, q: QuizQuestion): string[] {
  if (lang === 'zh' && engine?.zh.quiz[q.id]?.options) return engine.zh.quiz[q.id].options!
  if (lang === 'zh' && QUIZ_ZH[q.id]?.options) return QUIZ_ZH[q.id]!.options!
  return q.options ?? []
}
