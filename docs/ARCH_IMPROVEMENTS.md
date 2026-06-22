# 架构改进待办 / Architecture Improvements

> 背景：i18n 的实现出现过"同一件事两种做法"导致风格不一致。以此为线索对全仓做了一轮架构 review，
> 下列是发现的**风格不一致 / 重复真源**问题，供开发人员后续逐项处理。
>
> 代码标识符、路径保持英文原样；引用位置为 `文件:行号`（行号以记录时为准，重构后请以符号搜索为准）。

## 如何阅读

- **严重级**：🔴 高（correctness/静默漂移风险）· 🟠 中（可维护性/命名）· 🟡 低（结构整洁）
- 每条含：现象 → 证据 → 影响 → 建议方案 → 工作量 → 依赖 → 状态
- 状态用 `[ ]` / `[x]`；完成后在条目内补一行"已于 <commit> 处理"

---

## #1 内容本地化存在两种建模策略 + overlay 两个存放点 🔴

**状态**：`[x]`

### 现象
对"需要翻译的数据内容"，代码层并存两种互斥风格；其中 overlay 风格自身又有两个存放点。

| 风格 | 用在哪 | 形态 |
|---|---|---|
| A. 内联双语 `{ en, zh }` | `engines/*/meta.ts`（name/subtitle/specs）、`data/glossary.ts`、`types.ts` 的 `Source.label/labelZh` | 中英并排存于一处 |
| B. 英文为源 + 按 id 覆盖 | `PartDef` 文本字段、`QuizQuestion` | 英文在 `parts.ts`/`quiz.ts`，中文在 overlay |
| C. key 目录 `t(lang, key)` | `i18n/strings.ts` | UI 文案，属另一类问题，**保持不变** |

风格 B 的中文 overlay 有**两个家**：
- s58 → 中央 `src/i18n/content.ts` 的 `PARTS_ZH` / `QUIZ_ZH`（`engines/s58/content.zh.ts` 为空，0 条）
- n52 / b48 / ea888 / skyactiv-g → 各自 `engines/<id>/content.zh.ts`（25–28 条）

### 证据
- 解析器三级 fallback：`src/i18n/content.ts:304`（`pField`），quiz 同理 `src/i18n/content.ts:325` 与 `:329`
- 中央 overlay：`src/i18n/content.ts:25`（`PARTS_ZH`）、`:251`（piston 循环填充）
- 空壳：`src/engines/s58/content.zh.ts`（`parts: {}` / `quiz: {}`）
- 风格 A 实例：`src/engines/s58/meta.ts`、`src/data/glossary.ts`、`src/types.ts`（`Source`）

### 影响
- `pField`/`quizPrompt`/`quizOptions` 需常年背着双 fallback 分支，新人易迷惑"该往哪写中文"。
- 新增可翻译内容时无明确约定，容易再分叉（本次新加的 glossary/citation 即选了风格 A，与 parts 的风格 B 不一致，进一步加深分裂）。

### 建议方案
1. **统一 overlay 的单一存放点**：把 s58 的 `PARTS_ZH`/`QUIZ_ZH` 迁回 `engines/s58/content.zh.ts`，删除中央 `PARTS_ZH`/`QUIZ_ZH` 及 `pField`/quiz 解析里的对应 fallback 分支（只保留 `engine.zh.* ?? 英文`）。
2. **明确边界约定并写入本节**：大列表（parts/quiz）用风格 B（英文+overlay，便于翻译协作）；小型单点对象（meta/glossary/source）用风格 A（内联双语）。决定 glossary/citation 是否回迁——建议**保持 A**，因为它们是小对象且与 meta 一致。
3. 在 `content.ts` 顶部注释里固化该边界，防复发。

已于 content.zh.ts 迁移处理：s58 的 `PARTS_ZH`/`QUIZ_ZH` 全量迁回 `engines/s58/content.zh.ts`（含 `pistonZh` 循环填充）；删除中央 `PARTS_ZH`/`QUIZ_ZH` 及 `pField`/`quizPrompt`/`quizOptions` 的对应 fallback 分支，overlay 解析现仅保留 `engine.zh.* ?? 英文` 单一路径。共享的 `SYSTEMS_ZH`/`CIRCUITS_ZH`（按 SystemId/circuit id 跨引擎共用，非每引擎内容）保留在中央。glossary/citation 按建议保持风格 A。`content.ts` 顶部注释已改写为边界约定。`npm run build` 通过。

### 工作量
中（迁移 s58 一份 overlay + 删 fallback + 回归测试中英切换）。

### 依赖
无。可独立进行。

---

## #2 localStorage 两套 key 前缀 + 误导命名 🟠

**状态**：`[ ]`

### 现象
UI 偏好用 `s58-*`，引擎相关用 `trainer-*`，两套前缀并存；且 `s58-` 在 5 引擎项目里是误称。

### 证据
- `s58-*`：`src/store.ts:171`（theme）、`:172`（lang）、`:174` `:175`（side/info collapsed）、`:303` `:307` `:312` `:317`
- `trainer-*`：`src/store.ts:182`（`trainer-last-engine`）、`:11`（`trainer-progress-v1:<id>`）、`:10`（`LEGACY_STORAGE_KEY = 's58-trainer-progress-v1'`）

### 影响
- 命名无统一规范；`s58-` 误导（与具体引擎无关）。
- 与 Phase D 改名强相关：改名时若不统一，会留下历史包袱。

### 建议方案
- 引入单一命名空间常量（如 `const NS = 'engine-app'`），所有 key 经 `k(name)` 生成。
- 迁移时为旧 key 写一次性兼容读取（参考现有 `LEGACY_STORAGE_KEY` 的迁移写法 `src/store.ts:28-34`），避免丢用户偏好与进度。

### 工作量
小。

### 依赖
建议与 **Phase D（改名/重定位）** 合并执行。

### 备注
`glossaryOpen` 刻意不持久化（每次进入默认关闭），而 `side/info collapsed` 持久化——这是合理的差异，非缺陷，但在统一 key 时请勿顺手给 `glossaryOpen` 加持久化。

---

## #3 进度存储 key 与读取逻辑重复定义 🔴

**状态**：`[x]`

### 现象
进度的 storage key 与读取器在两处各写一遍，存在静默漂移风险。

### 证据
- key 定义重复：`src/store.ts:11`（`progressKey`）与 `src/ui/LandingScreen.tsx:8`（同名同实现）
- 读取逻辑重复：`src/store.ts:24`（`loadProgress`）与 `src/ui/LandingScreen.tsx:10`（`loadSummary`，各自直接读 localStorage 解析同一结构）

### 影响
改其中一处（如 key 版本号、结构）另一处会无声失效，属典型 bug 温床。

### 建议方案
- 在 store（或一个 `progressStorage.ts` 模块）单一导出 `progressKey` 与读取器；`LandingScreen` 复用，不再自带副本。
- 与 #2 合并：key 统一走命名空间常量。

已于 progressStorage.ts 处理：新增 `src/progressStorage.ts`，单点导出 `progressKey` / `freshProgress` / `loadProgress`（含 legacy 迁移）/ `loadProgressSummary` / `saveProgress`。`store.ts` 与 `LandingScreen.tsx` 均改为复用，删除各自的 key 与读取副本。key 命名空间统一留待 #2/Phase D。`npm run build` 通过。

### 工作量
小。

### 依赖
与 #2 协同最佳。

---

## #4 `cylX`（气缸 X 坐标）在每个引擎重复两份 🔴

**状态**：`[x]`（已于 geometry.ts 抽取一并处理）

### 现象
同一物理常量在 `parts.ts` 的 `const CYL_X` 和 `index.ts` 的 `geometry.cylX` 各写一份，5 引擎共 10 处，靠手动同步。

### 证据
```
s58/parts.ts:3        const CYL_X = [-1.25,-0.75,-0.25,0.25,0.75,1.25]
s58/index.ts:13       cylX:        [-1.25,-0.75,-0.25,0.25,0.75,1.25]
n52/parts.ts:3 / n52/index.ts:13         （同上六缸值）
b48/parts.ts:3 / b48/index.ts:13         [-0.75,-0.25,0.25,0.75]
ea888/parts.ts:3 / ea888/index.ts:13     [-0.75,-0.25,0.25,0.75]
skyactiv-g/parts.ts:3 / .../index.ts:13  [-0.75,-0.25,0.25,0.75]
```

### 影响
两个真源，改一处忘改另一处 → 几何与零件定位不一致。

### 建议方案
单一来源：建议结合 #5 抽出的 `geometry.ts` 导出 `cylX`，`parts.ts` 从中 import；删除 `const CYL_X`。

### 工作量
小。

### 依赖
与 #5 一起做最自然。

---

## #5 `geometry` 内联在 index.ts，是引擎数据切片里的"异类" 🟡

**状态**：`[x]`

### 现象
每个引擎的数据都有专属文件（`parts.ts` / `physics.ts` / `quiz.ts` / `circuits.ts` / `meta.ts` / `content.zh.ts`），唯独 `geometry`（`GeometryLayout`）直接内联在 `index.ts`。index.ts 本应只做"装配"，却混入了一份原始数据定义。

### 证据
- `src/engines/s58/index.ts:11-21`（`geometry: { cylX, pinAnglesDeg, fireDeg, ... cameraHome }` 内联），其余四款 index.ts 同形态。

### 影响
结构不一致：index.ts 既装配又定义数据；geometry 无独立可定位的来源文件，diff/审阅时与装配代码混在一起。

### 建议方案
- 抽出 `engines/<id>/geometry.ts` 导出 `geometry: GeometryLayout`（顺带导出 `cylX` 供 parts 复用，解决 #4）。
- `index.ts` 回归纯 import + 组装。

已于 geometry.ts 抽取处理：5 引擎各新增 `geometry.ts`，导出 `geometry` 与 `cylX`；`index.ts` 改为 `import { geometry }` 纯装配；`parts.ts` 改为 `import { cylX } from './geometry'`，删除本地 `const CYL_X`。`tsc -b` 与 `npm run build` 均通过。

### 工作量
小（5 文件机械抽取）。

### 依赖
与 #4 合并。

---

## 处理路线建议

> 分两组推进：第一组消除"重复真源"（低风险、收益直接）；第二组牵涉面大，需先定约定。

**第一组（建议尽快，一次 PR）**：#3 + #4 + #5
- 都是重复真源 / 结构整理，互相关联（#4 依赖 #5 抽出的 geometry.ts；#3 与 #2 的 key 收敛同源）。
- 验收：`tsc -b` 通过、`npm run build` 通过、中英/引擎切换与进度读写回归正常。

**第二组（择期，需决策）**：
- #2 —— 与 Phase D 改名/重定位合并，统一 key 命名空间 + 旧 key 迁移。
- #1 —— 最铺开。先在本文件 #1 的"边界约定"达成一致，再迁移 s58 overlay、删中央 fallback；同时定夺 glossary/citation 是否保持风格 A。

## 防止复发的约定（落地后维护）

1. **内容本地化**：大列表用"英文源 + `engine.zh` overlay（单一存放点）"；小型单点对象用内联 `{ en, zh }`。禁止再新增中央 `PARTS_ZH` 式的第二存放点。
2. **持久化**：所有 localStorage key 经统一命名空间常量生成，禁止散落字符串字面量；key 的定义与读取器单点导出，组件复用。
3. **引擎数据**：每类数据一个专属文件；`index.ts` 只做装配，不定义原始数据。
4. **单一真源**：跨文件共享的常量（如 `cylX`）只定义一次，其余 import。
