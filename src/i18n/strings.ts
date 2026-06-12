export type Lang = 'en' | 'zh'

export const LANGS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'zh', label: '中文' },
]

/** UI chrome strings. English is the source of truth; zh mirrors every key. */
type Dict = Record<string, string>

const en: Dict = {
  // brand / top bar
  'brand.title': 'Engine Training Simulator',
  'brand.sub': 'BMW S58B30 · 3.0 L Twin-Turbo Inline-Six',
  'theme.toLight': '☀️ Light',
  'theme.toDark': '🌙 Dark',
  'theme.titleToLight': 'Switch to light mode',
  'theme.titleToDark': 'Switch to dark mode',
  'lang.title': 'Switch language',

  // modes
  'mode.explore': 'Explore',
  'mode.exploded': 'Exploded View',
  'mode.disassembly': 'Guided Teardown',
  'mode.reassembly': 'Reassembly',
  'mode.quiz': 'Assessment',
  'mode.flow': 'Flow',
  'mode.combust': 'Combustion',
  'mode.stress': 'Torque · Stress',

  // bottom toolbar
  'bottom.explode': '💥 Explode',
  'bottom.labels': '🏷 Labels',
  'bottom.resetView': '🎥 Reset view',
  'bottom.resetParts': '♻️ Reset all parts',
  'bottom.title.explode': 'Toggle exploded view',
  'bottom.title.labels': 'Toggle hover labels',
  'bottom.title.resetView': 'Reset camera to home position',
  'bottom.title.resetParts': 'Return all parts to original positions',
  'bottom.hint': 'Click: select · Double-click: focus · Drag selected part: move · Right-drag: pan',

  // info panel
  'info.learningPanel': 'Learning Panel',
  'info.emptyHint':
    'Click a part to inspect it. Double-click to focus the camera. Drag a selected part to pull it away from the assembly.',
  'info.hint.rotate': 'Left-drag — rotate',
  'info.hint.pan': 'Right-drag — pan',
  'info.hint.zoom': 'Scroll — zoom',
  'info.function': 'Function',
  'info.location': 'Location',
  'info.difficulty': 'Difficulty',
  'info.diff.1': 'Basic',
  'info.diff.2': 'Intermediate',
  'info.diff.3': 'Advanced',
  'info.showDetails': '▸ Service & inspection details',
  'info.hideDetails': '▾ Hide service details',
  'info.inspection': 'Inspection',
  'info.commonWear': 'Common wear',
  'info.modelNote': 'Model note',
  'info.relatedParts': 'Related parts',
  'info.resetPosition': 'Reset position',
  'info.showPart': 'Show part',
  'info.hidePart': 'Hide part',

  // exploded panel
  'exploded.systems': 'Systems',
  'exploded.isolateHint': 'Isolate one system to study it. Others fade out.',
  'exploded.allSystems': 'All systems',

  // disassembly
  'dis.title': 'Guided Teardown',
  'dis.stepOf': 'Step {n} of {total} · Mistakes: {m}',
  'dis.complete': 'Teardown complete.',
  'dis.completeBody': 'The engine is stripped to the bare block. Switch to Reassembly to rebuild it.',
  'dis.startReassembly': 'Start reassembly →',
  'dis.removeNext': 'Remove next (highlighted green):',
  'dis.removeBtn': 'Remove this part ▸',
  'dis.fullSequence': 'Full sequence',
  'dis.restart': 'Restart teardown',

  // reassembly
  'reasm.title': 'Reassembly Practice',
  'reasm.installedOf': 'Installed {n} of {total} · Mistakes: {m}',
  'reasm.complete': 'Engine assembled!',
  'reasm.completeBody':
    'All parts are back in position. Your mistakes are logged for the instructor report.',
  'reasm.dragPre': 'Pick a part from the tray, then ',
  'reasm.dragBold': 'drag it onto its position',
  'reasm.dragPost': ' on the engine. It snaps when close. Assembly order is the reverse of teardown.',
  'reasm.carrying': 'Carrying:',
  'reasm.restart': 'Restart reassembly',

  // quiz
  'quiz.result': 'Assessment Result',
  'quiz.time': 'Time: {s}s · Saved to your training record.',
  'quiz.review': 'Review these topics:',
  'quiz.retake': 'Retake assessment',
  'quiz.title': 'Assessment',
  'quiz.questionOf': 'Question {n} of {total} · Score: {score}',
  'quiz.clickPart': 'Click the part in the 3D view.',
  'quiz.finish': 'Finish',
  'quiz.next': 'Next question →',

  // explore panel
  'explore.title': 'Explore Mode',
  'explore.intro':
    'Free inspection of the BMW S58 — the 3.0 L twin-turbo inline-six used in the M3, M4, X3 M and X4 M.',
  'explore.partsInspected': 'parts inspected',
  'explore.assessmentsTaken': 'assessments taken',
  'explore.teardownDone': 'teardown done',
  'explore.reassemblyDone': 'reassembly done',
  'explore.exportCsv': 'Export progress report (CSV)',

  // simulation common
  'sim.start': '▶ Start engine',
  'sim.stop': '■ Stop engine',
  'common.engineSpeed': 'Engine speed',
  'sim.load': 'Load',
  'sim.slowMotion': 'Slow motion',
  'flow.throttle': 'Throttle',

  // flow panel
  'flow.title': 'Fluid Dynamics',
  'flow.intro':
    'Lumped-parameter (1D) flow model — quasi-steady gas and thermal balances, not CFD. Particle speed tracks computed flow rates.',
  'flow.ghostHint':
    'Engine parts are ghosted so circuits are visible. Hover or select parts to identify them.',
  'stat.maf': 'mass air flow',
  'stat.boost': 'boost (gauge)',
  'stat.turboSpeed': 'turbo speed',
  'stat.chargeTemp': 'charge temp',
  'stat.exhaustTemp': 'exhaust temp',
  'stat.exhaustFlow': 'exhaust flow',
  'stat.coolantFlow': 'coolant flow',
  'stat.coolantDelta': 'coolant ΔT',
  'stat.oilPressure': 'oil pressure',
  'stat.oilFlow': 'oil flow',
  'stat.estPower': 'est. power',
  'stat.fuelFlow': 'fuel flow',

  // combustion panel
  'combust.title': 'Combustion Cycle',
  'combust.intro':
    'Per-degree first-law model: polytropic compression/expansion with Wiebe heat release. Firing order 1-5-3-6-2-4. Watch the rotating assembly and the flash in each firing cylinder.',
  'combust.peakAt': 'peak pressure @ {deg}° ATDC',
  'combust.btdc': '{deg}° BTDC',
  'stat.imep': 'IMEP',
  'stat.brakeTorque': 'brake torque',
  'stat.brakePower': 'brake power',
  'stat.sparkAdvance': 'spark advance',
  'stat.fuelPerCyl': 'fuel / cyl / cycle',
  'combust.pressureChart': 'Cylinder pressure vs crank angle (0–{max} bar)',
  'combust.pvChart': 'P–V diagram (pressure vs cylinder volume)',
  'combust.simplify':
    'Simplifications: quasi-steady gas exchange, fixed polytropic exponents, no knock or cycle-to-cycle variation, reciprocating inertia not included in the pressure trace.',

  // stress panel
  'stress.title': 'Torque & Stress',
  'stress.intro':
    'Instantaneous crank torque from slider-crank kinematics over the cycle; parts are colored by load utilization (blue = low, red = near design limit).',
  'stat.meanBrakeTorque': 'mean brake torque',
  'stat.peakInstant': 'peak instantaneous',
  'stat.minReversal': 'min (reversal)',
  'stat.peakGasForce': 'peak gas force',
  'stat.conrodForce': 'conrod force',
  'stat.recipInertia': 'recip. inertia @TDC',
  'stat.rodBearing': 'rod bearing load',
  'stress.torqueChart': 'Total crank torque vs crank angle (720°)',
  'stress.meanLine': 'mean (indicated)',
  'stress.util':
    'Utilization = computed load / representative design allowable. Educational magnitudes — not an FEA substitute.',
  'stress.part.pistons': 'Pistons & rods',
  'stress.part.crankshaft': 'Crankshaft',
  'stress.part.head': 'Cylinder head',
  'stress.part.block': 'Cylinder block',
  'stress.part.turbos': 'Turbochargers',
  'stress.part.exhaust': 'Exhaust manifolds',
  'stress.part.timing': 'Timing chain',
  'stress.part.intake': 'Intake (boost)',
  'stress.part.fuel': 'Fuel system',

  // chart axis labels (drawn on canvas)
  'chart.tdc': 'TDC',
  'chart.bdc': 'BDC',

  // store feedback
  'fb.structuralCore': '{name} is the structural core — it is not removed in this procedure.',
  'fb.removedCorrect': 'Correct: {name} removed.',
  'fb.teardownComplete': 'Teardown complete! Engine fully disassembled to the bare block.',
  'fb.removeFirst': 'Remove {names} first.',
  'fb.outOfSequence': 'Out of sequence — next step is {name}.',
  'fb.cannotRemove': 'Cannot remove {name} yet. {reason}',
  'fb.installedCorrect': '{name} installed correctly.',
  'fb.reassemblyComplete': 'Reassembly complete — the engine is back together!',
  'fb.cannotInstall':
    '{name} cannot go in yet — install {expected} first (assembly is the reverse of teardown).',
  'fb.correct': 'Correct!',
  'fb.anotherPart': 'another part',
  'fb.identifyWrong': 'Not quite — that was {clicked}. The answer ({answer}) is now highlighted.',
  'fb.choiceWrong': 'Incorrect — the right answer was: {answer}',
}

const zh: Dict = {
  'brand.title': '发动机培训模拟器',
  'brand.sub': '宝马 S58B30 · 3.0L 双涡轮直列六缸',
  'theme.toLight': '☀️ 浅色',
  'theme.toDark': '🌙 深色',
  'theme.titleToLight': '切换到浅色模式',
  'theme.titleToDark': '切换到深色模式',
  'lang.title': '切换语言',

  'mode.explore': '浏览',
  'mode.exploded': '爆炸视图',
  'mode.disassembly': '引导拆解',
  'mode.reassembly': '重新组装',
  'mode.quiz': '测验',
  'mode.flow': '流体',
  'mode.combust': '燃烧',
  'mode.stress': '扭矩·应力',

  'bottom.explode': '💥 爆炸',
  'bottom.labels': '🏷 标签',
  'bottom.resetView': '🎥 重置视角',
  'bottom.resetParts': '♻️ 复位零件',
  'bottom.title.explode': '切换爆炸视图',
  'bottom.title.labels': '切换悬停标签',
  'bottom.title.resetView': '将相机重置到初始位置',
  'bottom.title.resetParts': '将所有零件复位到原始位置',
  'bottom.hint': '单击：选择 · 双击：聚焦 · 拖动选中零件：移动 · 右键拖动：平移',

  'info.learningPanel': '学习面板',
  'info.emptyHint': '单击零件进行查看。双击可聚焦相机。拖动选中的零件可将其从总成中拉出。',
  'info.hint.rotate': '左键拖动 — 旋转',
  'info.hint.pan': '右键拖动 — 平移',
  'info.hint.zoom': '滚轮 — 缩放',
  'info.function': '功能',
  'info.location': '位置',
  'info.difficulty': '难度',
  'info.diff.1': '基础',
  'info.diff.2': '中级',
  'info.diff.3': '高级',
  'info.showDetails': '▸ 维修与检查详情',
  'info.hideDetails': '▾ 隐藏维修详情',
  'info.inspection': '检查',
  'info.commonWear': '常见磨损',
  'info.modelNote': '模型说明',
  'info.relatedParts': '相关零件',
  'info.resetPosition': '复位位置',
  'info.showPart': '显示零件',
  'info.hidePart': '隐藏零件',

  'exploded.systems': '系统',
  'exploded.isolateHint': '隔离某一系统以便单独学习，其他系统将淡出。',
  'exploded.allSystems': '所有系统',

  'dis.title': '引导拆解',
  'dis.stepOf': '第 {n} / {total} 步 · 错误：{m}',
  'dis.complete': '拆解完成。',
  'dis.completeBody': '发动机已拆解到裸缸体。切换到“重新组装”进行复原。',
  'dis.startReassembly': '开始组装 →',
  'dis.removeNext': '拆下一个（绿色高亮）：',
  'dis.removeBtn': '拆下该零件 ▸',
  'dis.fullSequence': '完整顺序',
  'dis.restart': '重新开始拆解',

  'reasm.title': '组装练习',
  'reasm.installedOf': '已安装 {n} / {total} · 错误：{m}',
  'reasm.complete': '发动机组装完成！',
  'reasm.completeBody': '所有零件已复位。你的错误已记录到教练报告中。',
  'reasm.dragPre': '从托盘中选择一个零件，然后',
  'reasm.dragBold': '拖到发动机上的对应位置',
  'reasm.dragPost': '。靠近时会自动吸附。组装顺序与拆解相反。',
  'reasm.carrying': '正在搬运：',
  'reasm.restart': '重新开始组装',

  'quiz.result': '测验结果',
  'quiz.time': '用时：{s} 秒 · 已保存到你的培训记录。',
  'quiz.review': '复习以下内容：',
  'quiz.retake': '重新测验',
  'quiz.title': '测验',
  'quiz.questionOf': '第 {n} / {total} 题 · 得分：{score}',
  'quiz.clickPart': '在 3D 视图中单击该零件。',
  'quiz.finish': '完成',
  'quiz.next': '下一题 →',

  'explore.title': '浏览模式',
  'explore.intro': '自由查看宝马 S58 —— 用于 M3、M4、X3 M 和 X4 M 的 3.0L 双涡轮直列六缸发动机。',
  'explore.partsInspected': '已查看零件',
  'explore.assessmentsTaken': '已完成测验',
  'explore.teardownDone': '拆解完成',
  'explore.reassemblyDone': '组装完成',
  'explore.exportCsv': '导出进度报告（CSV）',

  'sim.start': '▶ 启动发动机',
  'sim.stop': '■ 停止发动机',
  'common.engineSpeed': '发动机转速',
  'sim.load': '负荷',
  'sim.slowMotion': '慢动作',
  'flow.throttle': '节气门',

  'flow.title': '流体动力学',
  'flow.intro':
    '集总参数（一维）流动模型 —— 准稳态气体与热平衡，并非 CFD。粒子速度对应计算出的流量。',
  'flow.ghostHint': '发动机零件已半透明化以便观察回路。悬停或选择零件可识别。',
  'stat.maf': '进气质量流量',
  'stat.boost': '增压（表压）',
  'stat.turboSpeed': '涡轮转速',
  'stat.chargeTemp': '进气温度',
  'stat.exhaustTemp': '排气温度',
  'stat.exhaustFlow': '排气流量',
  'stat.coolantFlow': '冷却液流量',
  'stat.coolantDelta': '冷却液温升',
  'stat.oilPressure': '机油压力',
  'stat.oilFlow': '机油流量',
  'stat.estPower': '估算功率',
  'stat.fuelFlow': '燃油流量',

  'combust.title': '燃烧循环',
  'combust.intro':
    '逐曲轴角的热力学第一定律模型：多变压缩/膨胀，配合 Wiebe 放热。点火顺序 1-5-3-6-2-4。观察旋转组件及各缸点火时的闪光。',
  'combust.peakAt': '峰值压力 @ 上止点后 {deg}°',
  'combust.btdc': '上止点前 {deg}°',
  'stat.imep': '平均指示压力',
  'stat.brakeTorque': '制动扭矩',
  'stat.brakePower': '制动功率',
  'stat.sparkAdvance': '点火提前角',
  'stat.fuelPerCyl': '每缸每循环燃油',
  'combust.pressureChart': '缸压 vs 曲轴转角（0–{max} bar）',
  'combust.pvChart': 'P–V 图（压力 vs 气缸容积）',
  'combust.simplify':
    '简化：准稳态换气、固定多变指数、不含爆震或循环间波动、压力曲线未计入往复惯性。',

  'stress.title': '扭矩与应力',
  'stress.intro':
    '基于曲柄滑块运动学的瞬时曲轴扭矩；零件按负荷利用率着色（蓝 = 低，红 = 接近设计极限）。',
  'stat.meanBrakeTorque': '平均制动扭矩',
  'stat.peakInstant': '瞬时峰值',
  'stat.minReversal': '最小（反向）',
  'stat.peakGasForce': '峰值气体力',
  'stat.conrodForce': '连杆受力',
  'stat.recipInertia': '往复惯性力 @上止点',
  'stat.rodBearing': '连杆轴承负荷',
  'stress.torqueChart': '总曲轴扭矩 vs 曲轴转角（720°）',
  'stress.meanLine': '平均（指示）',
  'stress.util':
    '利用率 = 计算负荷 / 代表性设计许用值。仅供教学参考 —— 不能替代有限元分析。',
  'stress.part.pistons': '活塞与连杆',
  'stress.part.crankshaft': '曲轴',
  'stress.part.head': '气缸盖',
  'stress.part.block': '气缸体',
  'stress.part.turbos': '涡轮增压器',
  'stress.part.exhaust': '排气歧管',
  'stress.part.timing': '正时链',
  'stress.part.intake': '进气（增压）',
  'stress.part.fuel': '燃油系统',

  'chart.tdc': '上止点',
  'chart.bdc': '下止点',

  'fb.structuralCore': '{name} 是结构核心 —— 本流程中不拆除。',
  'fb.removedCorrect': '正确：已拆下 {name}。',
  'fb.teardownComplete': '拆解完成！发动机已完全拆解到裸缸体。',
  'fb.removeFirst': '请先拆下 {names}。',
  'fb.outOfSequence': '顺序错误 —— 下一步应为 {name}。',
  'fb.cannotRemove': '暂时无法拆下 {name}。{reason}',
  'fb.installedCorrect': '已正确安装 {name}。',
  'fb.reassemblyComplete': '组装完成 —— 发动机已重新装好！',
  'fb.cannotInstall': '暂时无法安装 {name} —— 请先安装 {expected}（组装顺序与拆解相反）。',
  'fb.correct': '正确！',
  'fb.anotherPart': '其他零件',
  'fb.identifyWrong': '不对 —— 那是 {clicked}。正确答案（{answer}）已高亮显示。',
  'fb.choiceWrong': '回答错误 —— 正确答案是：{answer}',
}

const UI: Record<Lang, Dict> = { en, zh }

export function t(lang: Lang, key: string, params?: Record<string, string | number>): string {
  let s = UI[lang][key] ?? UI.en[key] ?? key
  if (params) {
    for (const k of Object.keys(params)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(params[k]))
    }
  }
  return s
}
