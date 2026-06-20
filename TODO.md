# 发烧友改造 — 真实引擎音效（待补素材）

采样播放代码已就绪（`src/sim/engineSound.ts` 的 `SampleEngine`），缺真实录音素材。

- [ ] 取得各引擎授权/自录的循环音频（怠速 / 中段 / 红线三段），放 `public/audio/<engineId>/`
- [ ] 在每个引擎的 `sound`（`src/engines/<id>/physics.ts` 或 index）填 `samples: { idle:{url,rpm}, mid:{url,rpm}, redline:{url,rpm} }`
- [ ] 确认 `electron-builder` 把 `public/audio/**` 打进 `dist`（Vite 默认拷贝 public/）
- [ ] 解决音频版权来源（自录 / 授权库），离线打包，无网络依赖
- 注：缺素材时自动回退合成音，功能不受影响

---

# Plan B — Engine-Specific Geometry Differentiation

## 基础设施

- [x] 支持引擎命名空间 Builder key：`build: 'skyactiv-g:valveCover'` → `BUILDERS` 里注册对应 key，`PartMesh` 查找时优先引擎前缀版本，找不到再 fallback 全局 key

## 修复错误（所有引擎）

- [x] **ExhaustManifold**：从 `layout.cylX` 动态生成 runner 数量（4 缸 → 4 runner，6 缸 → 已有 2×3 split 保持不变）
- [x] **OilPan**：宽度跟随 `layout.blockHalfLen` 缩放，不再 hardcode `3.24`
- [x] **TimingCover**：高度/宽度跟随 `layout.blockHalfLen`，区分 4 缸和 6 缸

## 引擎专属 Builder

### Valve Cover（最具辨识度）
- [x] `s58:valveCover` — 复合材料盖，双凸轮凸起，M 徽标板
- [x] `n52:valveCover` — 铝制，较平，无 M 徽标，更宽通气口
- [x] `b48:valveCover` — 4 缸，更短，集成 PCV 分离器
- [x] `ea888:valveCover` — 大众风格，不同肋条走向，独特 PCV 布局
- [x] `skyactiv-g:valveCover` — 马自达风格，较平整，浅色铝质外观

### Intake Manifold（NA vs 涡轮外形差异）
- [x] `n52:intakeManifold` — 无中冷器，DISA 可变进气（大型阀体凸起），更长进气道
- [x] `skyactiv-g:intakeManifold` — 无中冷器，简洁短进气道，马自达风格 plenum

### Timing Cover（6 缸 vs 4 缸轮廓）
- [x] 全局 TimingCover 已根据 `layout.cylX` 自动区分 4 缸/6 缸高度和宽度（无需引擎专属版本）

## 优先级顺序
1. 基础设施
2. ExhaustManifold bug
3. Valve Cover
4. Intake Manifold
5. Timing Cover
6. OilPan
