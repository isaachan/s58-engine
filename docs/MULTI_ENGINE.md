# Multi-Engine Support — Design Doc

Status: **approved design, not yet implemented**
Audience: engineers implementing the refactor. Read alongside `docs/IMPLEMENTATION.md` (current single-engine architecture) and `docs/PARTS.md` (content accuracy conventions).

---

## 1. Context & goals

The trainer is hardcoded to one engine, the BMW S58B30. The part list, removal sequence, quiz, physics constants, 3D layout, sound model, flow circuits, branding, and localStorage keys all assume it. We want the app to support multiple engines, selected by the user.

**Goals**

- Everything engine-specific lives in one typed bundle per engine (`EngineDefinition`), under `src/engines/<id>/`.
- Port the existing S58 content into that shape with zero behavior change.
- Author a second real engine — the **BMW B48** (2.0 L twin-scroll single-turbo inline-four) — to prove the abstraction handles different cylinder counts, turbo layouts, firing orders, and part lists.
- New UX: a **landing/selection screen** at startup with engine cards; a "change engine" button in the top bar returns to it. Progress is persisted **per engine**.

**Non-goals**

- Runtime-loaded JSON content (engine content stays bundled TypeScript; geometry and physics cannot be expressed as data anyway).
- More than two engines in this milestone.
- Engine comparison views or cross-engine reporting.

## 2. Core architectural decisions

1. **The zustand store is the single distribution channel for the active engine.**
   `useStore((s) => s.engine)` works on both sides of the react-three-fiber `<Canvas>` boundary. React context does **not** cross the r3f reconciler without re-providing, so an `EngineContext` provider in `App` would silently fail inside the scene. Non-React code (store actions, per-frame sim helpers) uses `useStore.getState().engine`. No prop-threading, no context bridging. **Do not add an EngineProvider.**

2. **Sim functions become explicitly engine-parameterized pure functions.**
   `computeCycle(engine, rpm, load)` and `computeFlow(engine, inputs)`, with the per-frame memo keyed by `` `${engine.meta.id}|${rpm}|${load}` ``. An explicit parameter beats a hidden module-level `setActiveEngine()`: stale-engine bugs become impossible at call sites and the functions stay pure/testable. `simClock` (crank-angle scrubber in `src/sim/engineCycle.ts`) stays a module singleton and is reset to 0 on engine switch.

3. **Geometry builders stay shared React components.**
   The `BUILDERS` map in `src/engine/geometry.tsx` (25 builders keyed by `PartDef.build`) is reused by all engines. Builders gain a `layout: GeometryLayout` prop (cylinder X positions, scene crank/rod radii, pin angles, block length) instead of reading the module-level `CYLS` constant (line 139) and the `PIN_ANGLES` import from `sim/engineCycle` (line 4) — that import is deleted, breaking the geometry→sim coupling. Per-part variation (e.g. twin-scroll turbo styling) goes through a new optional `PartDef.buildParams`.

4. **Per-engine content is bundled TS** under `src/engines/<id>/`, each exporting a typed `EngineDefinition` plus a lightweight `meta.ts` the landing screen can import eagerly. Central registry in `src/engines/index.ts` with static imports. Dynamic-import code splitting is an optional Phase E follow-up — the bundle is small; don't pay async complexity up front.

5. **The stress model (`partUtil`) is a per-engine function** in the definition: `partUtil(ctx) => Record<partId, utilization>`. Material allowables and the part-id list are inherently engine-specific; a generic parameterization table would be more code than two small functions. Shared helper math (gas force, rod force, inertia) is exported from `src/sim/`.

6. **The landing screen always shows at startup.** `engine: null` in the store ⇒ landing renders. The last-used engine (localStorage `trainer-last-engine`) only badges a card — it does not skip the landing.

## 3. Type definitions

New file `src/engines/types.ts`:

```ts
import type { PartDef, QuizQuestion, SystemId, Vec3 } from '../types'

export type EngineId = 's58' | 'b48'            // widen as engines are added

export interface LocalizedString { en: string; zh: string }

/** Lightweight card data — safe to import eagerly for the landing screen. */
export interface EngineMeta {
  id: EngineId
  badge: string                  // 'S58' / 'B48' top-bar chip
  name: LocalizedString          // 'BMW S58B30' / '宝马 S58B30'
  subtitle: LocalizedString      // '3.0 L Twin-Turbo Inline-Six'
  exploreIntro: LocalizedString  // replaces the Dict key 'explore.intro'
  partCount: number              // shown on the card without importing the full def
  specs: {
    layout: LocalizedString      // 'Inline-six' / '直列六缸'
    displacementL: number
    cylinders: number
    turbo: LocalizedString       // 'Twin mono-scroll' / 'Single twin-scroll'
    powerKw: number
    torqueNm: number
    redlineRpm: number
    compressionRatio: number
    firingOrder: string          // '1-5-3-6-2-4'
  }
}

export interface GeometryLayout {
  cylX: number[]                 // scene-unit cylinder X centers, length === cylinders
  pinAnglesDeg: number[]         // crank pin phase per cylinder
  fireDeg: number[]              // firing TDC within 720°, per cylinder
  crankRScene: number            // scene crank radius (R_S = 0.14 today, PartMesh.tsx)
  rodScene: number               // scene rod length (ROD_S = 0.46 today)
  blockHalfLen: number           // drives Block/Head/ValveCover/OilPan/Crank widths
  cameraHome: { pos: Vec3; target: Vec3 }
}

export interface CyclePhysics {
  boreM: number; strokeM: number; rodM: number
  compressionRatio: number
  recipMassKg: number            // piston + pin + small end
  cylinders: number
  idleRpm: number; redlineRpm: number
  fmep: { baseBar: number; rpmBar: number; loadBar: number }  // 0.35 / 1.15 / 0.15 today
}

export interface FlowPhysics {
  displacementM3: number         // 2.993e-3 (S58)
  peakBoostBar: number           // 1.7 (S58) / ~1.3 (B48)
  spool: { startRpm: number; spanRpm: number }
  ve: { base: number; spoolGain: number }   // 0.78 / 0.08 today
  afrEnrich: number              // 2.2 today
  brakeEff: number               // 0.28 today
  redlineRpm: number             // replaces every `/ 7200` normalization
  turboMaxKrpm: number
}

export interface SoundParams {
  firesPerRev: number            // cylinders / 2 for a four-stroke
  redlineRpm: number
}

/** Moves verbatim from src/sim/flow.ts */
export interface CircuitDef {
  id: 'intake' | 'exhaust' | 'coolant' | 'oil'
  name: string; color: string; closed: boolean; count: number
  pts: Vec3[]
}

export interface PartUtilCtx {
  rpm: number; load: number
  peakBar: number; gasForceN: number; peakTorqueNm: number
  flow: import('../sim/flow').FlowResult
  redline: number
}

/** zh overlay — same shape src/i18n/content.ts uses today, engine-scoped. */
export interface EngineZhContent {
  parts: Record<string, Partial<Record<
    'name' | 'function' | 'location' | 'inspectionNotes' | 'failurePoints' | 'simplified',
    string>>>
  quiz: Record<string, { prompt?: string; options?: string[] }>
}

export interface EngineDefinition {
  meta: EngineMeta
  geometry: GeometryLayout
  parts: PartDef[]
  partMap: Map<string, PartDef>            // derived in the engine module
  removalSequence: PartDef[]               // derived in the engine module
  systemOrder: SystemId[]                  // subset/order of the global SYSTEMS
  quiz: QuizQuestion[]
  cycle: CyclePhysics
  flow: FlowPhysics
  sound: SoundParams
  circuits: CircuitDef[]
  stressParts: [partId: string, i18nKey: string][]  // SidePanel stress table rows
  movingPartIds: string[]                  // replaces the MOVING set in PartMesh.tsx
  partUtil: (ctx: PartUtilCtx) => Record<string, number>
  zh: EngineZhContent
}
```

`PartDef` in `src/types.ts` gains one optional field:

```ts
buildParams?: Record<string, number | string | boolean>
// e.g. { scrolls: 2 } on the B48 turbo; consumed by the geometry builder
```

## 4. Module layout

```
src/
  engines/
    types.ts              ← everything in §3
    index.ts              ← ENGINE_IDS, ENGINE_METAS (eager), getEngine(id), dev-time validation (§8.7)
    s58/
      index.ts            ← assembles & exports S58: EngineDefinition
      meta.ts             ← EngineMeta only
      parts.ts            ← moved from src/data/parts.ts (verbatim)
      quiz.ts             ← moved from src/data/quiz.ts
      physics.ts          ← cycle/flow/sound params + partUtil (formulas from sim/engineCycle.ts lines 170–201)
      circuits.ts         ← CIRCUITS moved from src/sim/flow.ts
      content.zh.ts       ← PARTS_ZH / QUIZ_ZH moved from src/i18n/content.ts
    b48/
      (same file set)
  sim/
    engineCycle.ts        ← computeCycle(engine, rpm, load); getCycle memo keyed by engine id; simClock
    flow.ts               ← computeFlow(engine, inputs); CIRCUITS removed
    engineSound.ts        ← start/update take SoundParams
  data/
    systems.ts            ← stays global (SYSTEMS record + colors + zh names)
    parts.ts, quiz.ts     ← deleted after Phase A
  ui/
    LandingScreen.tsx     ← new
  i18n/
    strings.ts            ← brand.* keys removed; landing.* keys added
    content.ts            ← resolvers become engine-aware (§5.4)
```

## 5. Subsystem designs

### 5.1 Store (`src/store.ts`)

- New state: `engine: EngineDefinition | null` (null ⇒ landing screen), `selectEngine(id: EngineId)`, `exitToLanding()`.
- `selectEngine`: gets the def from the registry, loads that engine's progress, resets all per-mode state (same reset body as `setMode('explore')` plus `removedIds`, quiz state, sim defaults), resets `simClock.thetaDeg = 0`, calls `engineSound.stop()`, clamps `flowRpm`/`simRpm` defaults to the engine's idle/redline, writes `trainer-last-engine`.
- **Persistence keys**
  - Progress: `trainer-progress-v1:<engineId>`. One-time migration in `loadProgress('s58')`: if the namespaced key is absent and the legacy `s58-trainer-progress-v1` (store.ts line 8) exists, copy it over. **Never delete the legacy key** (rollback safety).
  - `trainer-last-engine`: badges the landing card only.
  - `s58-theme` / `s58-lang` / `s58-side-collapsed` / `s58-info-collapsed` stay as-is in Phase A; optional rename to `trainer-*` with read-fallback in Phase E (cosmetic).
- All action lookups of `PART_MAP`, `REMOVAL_SEQUENCE`, `QUIZ_QUESTIONS` become `get().engine!.partMap` / `.removalSequence` / `.quiz`. Actions no-op when `engine === null`.
- `exportCsv`: filename `` `${engine.meta.id}-training-report.csv` ``; add an engine-id column so aggregated reports stay disambiguated.

### 5.2 Sims (`src/sim/`)

- **`engineCycle.ts`**: delete module constants `BORE/STROKE/ROD/CR/M_RECIP` (lines 16–25) and the exported `PIN_ANGLES`/`FIRE_DEG` (lines 28–30) — they live once in the engine def (`geometry` for scene use, `cycle` for physics). `computeCycle(engine, rpm, load)` derives piston area / clearance volume locally from `engine.cycle`; the cylinder superposition loop (line 149, `for cyl < 6`) uses `engine.cycle.cylinders` and `engine.geometry.fireDeg`; per-cycle fuel divisor uses `cylinders`; fmep and normalizations use `engine.cycle.redlineRpm` / `engine.cycle.fmep`. The hardcoded `partUtil` block (lines 170–201) is replaced by `engine.partUtil(ctx)`. Memo cache key: `` `${engine.meta.id}|${rpm}|${load}` ``.
- **`flow.ts`**: `computeFlow(engine, { rpm, throttle })` reads `engine.flow` for displacement/boost/spool/VE/AFR/efficiency; every `rpm / 7200` becomes `rpm / engine.flow.redlineRpm`. The particle-speed normalizers scale off the engine's own estimated peak MAF (`displacement · redline/120 · ρmax · VEmax`, computed per call — cheap). The `CIRCUITS` export moves to `engines/s58/circuits.ts`.
- **`engineSound.ts`**: `start(rpm, load, p: SoundParams)` / `update(rpm, load, p)`; `fireHz = (rpm / 60) * p.firesPerRev` (replaces the hardcoded `* 3` at line 92); filter/master curves normalize by `p.redlineRpm`. `EngineAudio` in `App.tsx` already subscribes to the store — it additionally selects `s.engine`, passes `engine.sound`, and stops sound when `engine` becomes null.

### 5.3 3D scene (`src/engine/`)

- **`geometry.tsx`**: builder type becomes

  ```ts
  type Builder = React.FC<{
    material: THREE.MeshStandardMaterial
    layout: GeometryLayout
    params?: PartDef['buildParams']
  }>
  ```

  Delete `CYLS` (line 139) and the `import { PIN_ANGLES } from '../sim/engineCycle'` (line 4). Builders that consumed them — Block, Head, ValveCover, Camshaft, Crankshaft, Valvetronic, OilNozzles, Injectors, OilPan, TimingChain — compute from `layout.cylX`, `layout.blockHalfLen`, `layout.pinAnglesDeg`. The other ~15 builders just accept the wider prop type.
- **`PartMesh.tsx`**: read the engine from the store. The hardcoded `MOVING` set (lines 29–31) becomes a memoized `Set(engine.movingPartIds)`; `R_S`/`ROD_S` become `engine.geometry.crankRScene/rodScene`; `PIN_ANGLES[cyl]` becomes `engine.geometry.pinAnglesDeg[cyl]`; `REMOVAL_SEQUENCE` (line 53) becomes `engine.removalSequence`; `getCycle(rpm, load)` gains the engine arg. Pass `layout={engine.geometry}` and `params={def.buildParams}` into the builder.
- **`SimDriver.tsx`**: local `CYL_X` (line 7) and `FIRE_DEG` import (line 5) become `engine.geometry.cylX/fireDeg`; the combustion-flash mesh array length follows `cylX.length`, with `key={engine.meta.id + i}` so meshes remount on engine switch.
- **`EngineScene.tsx`**: `PARTS`/`PART_MAP` imports become `engine.parts/partMap`; `HOME_POS`/`HOME_TARGET` (lines 12–13) and the `<Canvas camera>` initial position come from `engine.geometry.cameraHome`. Put `key={engine.meta.id}` on the scene contents so every part group remounts cleanly on switch (wipes lerp targets, drag offsets, material caches).
- **`FlowParticles.tsx`**: reads `engine.circuits` instead of importing `CIRCUITS` from `sim/flow`.

### 5.4 i18n (`src/i18n/`)

- **`strings.ts`**: drop `brand.title` / `brand.sub` / the S58-specific `explore.intro` from both Dicts; add landing keys (`landing.title`, `landing.choose`, `landing.continue`, `landing.progress`, `topbar.changeEngine`, spec-row labels).
- **`content.ts`**: resolvers become engine-aware — `pName(lang, engine, part)`, `pField(lang, engine, part, field)`, `quizPrompt(lang, engine, q)`, `quizOptions(lang, engine, q)` — looking up `engine.zh.parts[part.id]` / `engine.zh.quiz[q.id]` with English fallback. `sysName` / `circuitName` stay global (system taxonomy and the four circuit ids are shared).
- **`useI18n()`** binds the active engine from the store internally, so component call sites keep their current arity. Store actions that build feedback strings pass `get().engine` explicitly.
- **Engine-provided strings in the UI**: engine-def strings bypass the `Dict`, so add `DualText: React.FC<{ text: LocalizedString }>` next to `DualLabel` in `src/ui/Toolbar.tsx`, using the same stacked-grid width-reservation trick (`.dual-label` CSS) — render both `text.en` and `text.zh`, hide the inactive one. The top bar must not shift on language switch (see the DualLabel fix in commit `ba469a8` for why). `TopBar`'s brand block becomes `engine.meta.badge` + `<DualText text={engine.meta.name} />` + `<DualText text={engine.meta.subtitle} />`.

### 5.5 Landing screen (`src/ui/LandingScreen.tsx`, new)

- Rendered by `App.tsx` when `engine === null`, replacing the `.main` area (top bar hidden or minimal).
- Iterates `ENGINE_METAS` from the registry. Card contents: badge, name, subtitle, spec rows (layout, displacement, cylinders, turbo config, power/torque, redline, CR, firing order), parts count, and a per-engine progress summary read straight from localStorage (parts inspected x/y, teardown/reassembly done, best quiz score). "Last used" badge from `trainer-last-engine`.
- Click ⇒ `selectEngine(id)`.
- `TopBar` gains a "change engine" button ⇒ `exitToLanding()`. No confirmation needed: progress persists on the fly; losing transient mode state is consistent with mode switching.

### 5.6 UI panels

- **`SidePanel.tsx`**: `QUIZ_QUESTIONS` → `engine.quiz`; `CIRCUITS` → `engine.circuits`; the hardcoded `STRESS_PARTS` list (lines 447–457) → `engine.stressParts`; rpm sliders `min={engine.cycle.idleRpm} max={engine.cycle.redlineRpm}` (currently hardcoded 800–7200); sim calls gain the engine arg.
- **`InfoPanel.tsx`**: related-part lookups switch to `engine.partMap`; `pField`/`pName` already flow through `useI18n`.

## 6. B48 content spec (Phase D)

Calibration target: **B48B20 high-output** (330i-grade). Where variants disagree, pick these values and note the variant in part copy and `docs/PARTS.md`, per the existing accuracy-audit convention.

| Parameter | Value |
|---|---|
| Displacement | 1,998 cc (`1.998e-3 m³`) |
| Bore × stroke | 82.0 mm × 94.6 mm |
| Rod length | ≈ 140.7 mm |
| Compression ratio | 10.2:1 (variants range 9.5–11 — state this) |
| Recip mass | ≈ 0.48 kg |
| Firing order | 1-3-4-2 → `pinAnglesDeg [0, 180, 180, 0]`, `fireDeg [0, 540, 180, 360]` |
| Idle / redline | 750 / 6,500 rpm |
| Turbo | single **twin-scroll** (`buildParams: { scrolls: 2 }`), ~1.3 bar peak |
| Charge cooling | air-to-water, integrated in intake manifold (good teaching contrast: same concept as S58, one turbo instead of two) |
| Fuel | single 350-bar HPFP |
| Valvetrain | Valvetronic + double VANOS (same as S58 — reuse builders) |
| Power / torque | ≈ 190 kW / 400 N·m (calibrate `brakeEff`/VE to hit this) |
| Sound | `firesPerRev: 2` |
| Scene layout | `cylX [-0.75, -0.25, 0.25, 0.75]` (keeps the 0.5 scene-unit bore pitch so per-cylinder builders look right), `blockHalfLen ≈ 1.15`, camera home pulled slightly closer |

- **~27 parts, all reusing existing builders** (no new geometry): block, head, valve cover, both camshafts, vanos, valvetronic, timing chain + cover, damper, crankshaft, piston-1..4, oil nozzles, turbo, single exhaust manifold, intake manifold (integrated charge cooler), throttle body, fuel rail, injectors, hp-fuel-pump, water pump, thermostat, oil pump, oil filter housing, oil pan.
- Removal sequence ~26 steps mirroring the S58 pedagogy (accessories → intake → exhaust/turbo → head → rotating assembly).
- Quiz: 10 questions, several deliberately contrasting with the S58 (single twin-scroll vs twin turbos, one HPFP vs two, firing order). Every `identify` target id must exist in the B48 part map (enforced — §8.7).
- `circuits.ts`: the four polylines re-threaded through B48 part positions by eye (shorter block, single turbo). **This is hand-authored visual work — budget time for it.**
- `content.zh.ts`: full zh overlay for all parts + quiz.
- `partUtil`: same formula family as S58 with I4 allowables (peak cylinder pressure normalization ~130 bar, single turbo/HPFP ids, pistons 1–4).

## 7. Migration phases

The app must build and run correctly after **every** phase.

### Phase A — Extract S58 behind the abstraction (zero behavior change)
1. Create `src/engines/types.ts` and `src/engines/s58/*` by **moving** code: `src/data/parts.ts` → `s58/parts.ts`, `src/data/quiz.ts` → `s58/quiz.ts`, `CIRCUITS` out of `src/sim/flow.ts` → `s58/circuits.ts`, `PARTS_ZH`/`QUIZ_ZH` out of `src/i18n/content.ts` → `s58/content.zh.ts`; new `s58/physics.ts` captures today's constants and the `partUtil` formulas verbatim.
2. Create the `src/engines/index.ts` registry (static imports) with the part-id validation check (§8.7).
3. Store: add `engine` (initialized to the S58 def for now — landing arrives in C); switch all action lookups; namespaced progress key + legacy migration.
4. Update consumers (`SidePanel`, `EngineScene`, `PartMesh`, `FlowParticles`, store) to read parts/quiz/circuits via the store. Delete `src/data/parts.ts` and `src/data/quiz.ts`.

**Verify:** `npx tsc -b && npm run build`; manual smoke of all 8 modes — app pixel-identical; localStorage shows `trainer-progress-v1:s58` with legacy data carried over.

### Phase B — Parameterize sims, sound, geometry
1. `engineCycle.ts` new signature + engine-keyed memo; delete `PIN_ANGLES`/`FIRE_DEG` exports.
2. `flow.ts` new signature, redline-normalized.
3. `engineSound.ts` + `EngineAudio` take `SoundParams`.
4. `geometry.tsx` layout prop; remove `CYLS` and the sim import.
5. `PartMesh.tsx`, `SimDriver.tsx`, `EngineScene.tsx` per §5.3.

**Verify:** combustion/stress/flow numbers match pre-refactor exactly (spot-check: ≈410 kW and ≈430 g/s MAF at 7200 rpm / full load; stress heat map identical); piston phases correct; `grep -rn 7200 src/` only hits the S58 engine def; no `for … < 6` loops outside `engines/`; no import cycles (`npx madge --circular src` or review).

### Phase C — Landing screen, engine switching, i18n
1. `LandingScreen.tsx`; `App.tsx` branches on `engine === null`; store `selectEngine`/`exitToLanding`; initial state `engine: null`.
2. `Toolbar.tsx`: `DualText`, brand from `engine.meta`, change-engine button.
3. `strings.ts` landing keys; `content.ts` engine-aware resolvers; `useI18n` binding.

**Verify:** cold start shows landing; select S58 ⇒ full app; change-engine round-trips without console errors; engine sound stops on exit; card progress summary updates after a quiz run; zh/en correct on landing and brand block; top bar width still identical across languages.

### Phase D — Author B48
1. `src/engines/b48/*` per §6; register in `index.ts`.
2. Tune circuits, camera home, explode offsets visually.

**Verify:** every mode on B48 — teardown completes all ~26 steps; reassembly; quiz identify ids resolve; combustion shows 4 flashes in 1-3-4-2 order at even 180° spacing; torque trace shows 2 pulses/rev; sound pitch lower than S58 at equal rpm; stress map covers all listed parts; switch S58⇄B48 repeatedly — no leaked meshes, memo returns the right engine's cycle, progress files independent.

### Phase E — Docs, cleanup, optional splitting
1. Update `docs/PRD.md` and `docs/IMPLEMENTATION.md`; add `docs/ENGINES.md` (how to author an engine — checklist mirroring §6); add a B48 accuracy section to `docs/PARTS.md`.
2. Optional: per-engine `import()` code splitting in the registry; rename `s58-theme`/`s58-lang`/`s58-*-collapsed` keys to `trainer-*` with read-fallback.

**Verify:** `vite build` bundle report; docs review.

## 8. Risks & gotchas

1. **`getCycle` memo staleness on switch** — the cache key must include `engine.meta.id`; a plain `rpm|load` key serves S58 curves to the B48 for a frame.
2. **`simClock` singleton + flash meshes** — reset `thetaDeg` in `selectEngine`; size `SimDriver` flash meshes per engine (`key` by engine id) or `fireDeg[i]` indexes past the array on I4.
3. **Import cycle removal** — after the refactor, `geometry.tsx` imports only `engines/types`. `engines/*/physics.ts` must not value-import from `sim/engineCycle` if `engineCycle` imports engine types; `import type` is safe.
4. **r3f context trap** — the engine flows through zustand only. A React `EngineProvider` will silently not propagate inside `<Canvas>`.
5. **Scene remount on switch** — `key={engine.meta.id}` on scene contents; otherwise lerp targets/material caches bleed across engines, and a part id shared by both engines (e.g. `crankshaft`) inherits stale visual state.
6. **localStorage migration** — copy legacy `s58-trainer-progress-v1` → `trainer-progress-v1:s58` once; keep the legacy key for rollback. Old quiz ids are harmless since progress is engine-scoped.
7. **Part-id referential integrity** — `engines/index.ts` runs a dev-time assertion (or a small vitest) that every id referenced by quiz targets, `dependencies`, `relatedPartIds`, `stressParts`, `movingPartIds`, and `partUtil` output exists in `partMap`. Cheapest correctness net for engine authors.
8. **Circuit polylines are hand-authored world coordinates** — not derivable from the part list; B48 circuits need visual iteration.
9. **`DualText` width reservation** — engine-def strings bypass the i18n Dict; if `DualText` doesn't replicate `DualLabel`'s both-languages width reservation, the top bar resizes on language switch (regression of commit `ba469a8`).
10. **Grep-able exit criteria** — `7200`, `piston-${i}` with i>cylinders, `/ 6` fuel divisor, `for … < 6`: none outside `src/engines/` after Phase B.
11. **CSV export semantics** — per-engine filename + engine column.
12. **B48 spec ambiguity** — CR and output vary by variant (Mini, M35i, 330i); fix on B48B20 high-output 10.2:1 / 190 kW and say so explicitly in content, following the `docs/PARTS.md` citation convention.

## 9. Verification strategy (end-to-end)

Beyond the per-phase checks in §7:

- **Numeric regression harness**: before Phase B, record `computeCycle`/`computeFlow` outputs for a grid of (rpm, load) pairs on current `main`; after Phase B, diff against the engine-parameterized S58 — must be bit-identical.
- **Playwright smoke** (pattern already used in this repo): drive landing → S58 → each mode → change engine → B48 → each mode; screenshot top bar in en/zh on both engines (width must not shift); assert per-engine localStorage keys.
- **Content audit**: B48 part copy gets the same citation-based review as `docs/PARTS.md` did for the S58.
