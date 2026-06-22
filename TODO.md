# TODO / 跟踪项

> 架构 review（`docs/ARCH_IMPROVEMENTS.md`）的 #1–#5 已全部完成。下列为由此衍生、
> 但不属于该清单的后续跟踪项。

## 架构后续

### Phase D — 改名 / 重定位（未排期）
- 背景：项目名为 `s58-engine`，但实为 5 引擎应用，`s58-` 前缀是误称（见架构 review #2）。
- #2 的 localStorage 命名空间已先行统一为 `engine-app`（`src/storage.ts` 的 `NS`），迁移逻辑兼容旧 key。
- [ ] Phase D 落地时确定最终项目/产品名，并：
  - [ ] 若改命名空间，调整 `src/storage.ts` 的 `NS` 并补一条 `migratePreferenceKeys` 迁移（保持向后兼容，勿丢用户偏好/进度）
  - [ ] 评估目录/包名 / `package.json` `name` / `appId`（`com.s58.engine-trainer`）是否一并改
- 决策点：当时架构师建议 #2「与 Phase D 合并」；现已独立落地，Phase D 仅需收尾命名。

### 防复发约定的执行（持续）
- `docs/ARCH_IMPROVEMENTS.md` 末尾「防止复发的约定」是活的护栏，靠后续 PR review 遵守，无代码改动：
  - 内容本地化：大列表用「英文源 + `engine.zh` overlay（单一存放点）」；小对象用内联 `{ en, zh }`
  - 持久化：所有 localStorage key 经 `k()` 生成，定义与读取器单点导出
  - 引擎数据：每类数据一个专属文件，`index.ts` 只装配
  - 单一真源：跨文件共享常量（如 `cylX`）只定义一次

### 构建体积（低优先级）
- [ ] `npm run build` 提示主 chunk >500kB；可后续用 dynamic import / `manualChunks` 拆分（与本次 review 无关）

---

## 发烧友改造 — 真实引擎音效（起步素材已接入，待打磨）

采样器 `src/sim/engineSound.ts`（`SampleEngine`）已接入 Pixabay 起步素材，5 款引擎都能出真实声。

- [x] 起步素材下载到 `public/audio/clips/`（Pixabay，CC0/Pixabay 授权，非商用）
- [x] 5 款引擎 `physics.ts` 的 `sound.samples` 已填（idle + redline 两层，按声音特征匹配）
- [x] 确认 Vite 把 `public/audio/**` 拷进 `dist`（已验证）
- [x] 验证 fetch+decode 路径（dev 下 HTTP 200、解码正常）
- [ ] **打磨**：素材是按"特征"匹配的通用车声、非精确机型；逐个试听替换更贴的剪辑
- [ ] **做循环**：现剪辑首尾未做过零点/交叉淡化，长时间循环可能有接缝感；用 Audacity 处理
- [ ] 可选：补 mid 层（现为 idle↔redline 两层交叉），让中段更自然
- [ ] 可选：转 `.ogg` 压体积（现 8 个 mp3 ≈ 6MB）
- 注：缺/坏素材时自动回退合成音，不影响功能
