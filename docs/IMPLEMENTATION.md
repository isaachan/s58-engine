# Code Implementation Design Spec

Maintainer documentation for the S58 Engine Training Simulator. Read this alongside
[PRD.md](PRD.md) (product requirements) and the root [README.md](../README.md) (user-facing
overview). This document explains *how the code works* and *how to change it safely*.

> **Planned refactor:** multi-engine support (engine registry, landing screen, BMW B48 as the
> second engine) is designed in [MULTI_ENGINE.md](MULTI_ENGINE.md). This document describes the
> current single-engine architecture; sections describing engine-specific data will move behind
> the `EngineDefinition` abstraction described there.

---

## 1. Tech stack

| Concern | Choice | Why |
|---|---|---|
| Build | Vite 5 + TypeScript 5 (strict) | Fast dev server/HMR, simple config |
| UI | React 18 | PRD-suggested; UI is plain CSS, no component library |
| 3D | three.js via @react-three/fiber (r3f) + @react-three/drei | Declarative scene graph; drei for `OrbitControls`, `Html`, `RoundedBox`, `Grid`, `ContactShadows` |
| State | zustand 4 | One store, no providers, usable from both React and imperative 3D event handlers via `useStore.getState()` |
| Persistence | `localStorage` | MVP scope; see §9 for the backend seam |

There is no router, no test framework, and no CSS preprocessor. `npm run dev`, `npm run build`
(runs `tsc -b` then Vite), `npm run preview`.

## 2. Directory layout

```
src/
  main.tsx              React entry; renders <App/>
  App.tsx               Layout shell: TopBar / SidePanel / viewport / InfoPanel
  index.css             All styling (CSS custom properties, dark workshop theme)
  types.ts              All shared types (PartDef, Mode, QuizQuestion, Progress, …)
  store.ts              Zustand store: ALL training logic and persistence
  data/
    systems.ts          The 10 engine systems: id, display name, color
    parts.ts            Part catalog (single source of truth, see §4)
    quiz.ts             Assessment questions
  sim/                  Pure physics models (no React/three imports except types)
    flow.ts             Lumped-parameter fluid model + particle circuit paths
    engineCycle.ts      Crank-angle cycle model: pressure, torque, stress, sim clock
  engine/               Everything rendered inside the r3f <Canvas>
    EngineScene.tsx     Canvas, lights, grid, OrbitControls, CameraRig
    PartMesh.tsx        Per-part: visibility, animation, highlight, drag, click routing
    geometry.tsx        Procedural geometry builders, keyed by PartDef.build
    FlowParticles.tsx   Particle streams along the sim/flow circuit splines
    SimDriver.tsx       Advances the crank-angle clock; combustion flash FX
  i18n/                 Localization (see §9a)
    strings.ts          Lang type, UI-chrome dictionary (en/zh), t() interpolator
    content.ts          Chinese overlay for part/system/quiz/circuit data + resolvers
    index.ts            Re-exports + useI18n() hook (binds helpers to the active lang)
  ui/                   Everything rendered as DOM
    Toolbar.tsx         TopBar (mode tabs, theme + language switch), BottomToolbar, Toast
    SidePanel.tsx       Left panel: one sub-panel per mode (incl. sim panels + canvases)
    InfoPanel.tsx       Right panel: selected-part metadata ("Learning Panel")
```

**Dependency direction (enforce when editing):**
`data/` depends on `types.ts` only. `sim/` is pure TypeScript physics (flow → engineCycle),
imported by `engine/`, `ui/`, and `geometry.tsx` (crank pin angles). `i18n/strings` +
`i18n/content` are pure (no app imports) and are consumed by `store.ts`, `engine/`, and `ui/`;
`i18n/index` (the `useI18n` hook) imports the store, but the store imports only the pure i18n
modules, so there is no cycle. `store.ts` depends on `data/` + `i18n` (pure). `engine/` and
`ui/` depend on `store.ts` + `data/` + `sim/` + `i18n`. Nothing imports from `engine/` or
`ui/` except `App.tsx`. Training logic must never live in `engine/` — that separation is a
PRD requirement (§14).

### Simulation modes (flow / combust / stress)

`sim/flow.ts` (`computeFlow`) is a quasi-steady 1D model: boost/spool curves, ideal-gas
manifold density, AFR/fuel/power balance, coolant and oil pump curves. `sim/engineCycle.ts`
(`computeCycle`, memoized via `getCycle`) integrates cylinder pressure per crank degree
(Wiebe heat release with a lumped wall-loss knockdown of 0.74, polytropic γ 1.32/1.28),
then sums slider-crank torque across six cylinders using the real firing order
(`FIRE_DEG = [0,480,240,600,120,360]`, pins `PIN_ANGLES = [0,240,120,120,240,0]` — geometry
and animation share these constants) and derives component-stress utilizations (`partUtil`).
Calibration targets: ~430 g/s MAF, ~116 bar peak pressure, ~26 bar IMEP, ~570 N·m / ~430 kW
at 7200 rpm full load.

All three sim modes share an `engineRunning` store flag (Start/Stop button, `EngineButton`
in `SidePanel.tsx`; reset to false on every mode change). It gates the sim clock and
combustion flashes in `SimDriver`, zeroes particle speeds in `FlowParticles`, and drives
`sim/engineSound.ts` — a Web Audio synthesizer (harmonics of the I6 firing frequency
`rpm/60×3` through a load-opened lowpass, plus band-passed noise; no audio assets).
`EngineAudio` in `App.tsx` starts/stops/retunes it from the active mode's rpm/load.
Oscillator nodes are single-use, so the synth rebuilds its graph on every `start()`.

Animation: `simClock` (module-level mutable, degrees 0–720) is advanced by `SimDriver`
inside the canvas, scaled by the `simTimeScale` slow-motion slider. `PartMesh.useFrame`
reads it to rotate crank/damper (1×), cams/VANOS (½×), and stroke the pistons via a
scene-unit slider-crank (`pistonOffsetY`). In stress mode `PartMesh` overrides
`material.color` with an HSL blue→red ramp from `partUtil`; the color lerps back to the
base color when leaving the mode. Sim modes also override opacity (moving parts opaque,
statics ghosted). Charts in the side panels are plain 2D `<canvas>` redrawn on input change
(`SimCanvas` in `SidePanel.tsx`).

## 3. Coordinate system & scene conventions

- **X** = crankshaft axis. Front of the engine (timing end, cylinder 1) is **−X**; rear
  (flywheel) is **+X**. The block spans roughly x ∈ [−1.65, 1.65].
- **Y** = up. Block deck at y ≈ 0.58, valve cover top ≈ 1.4, oil pan bottom ≈ −1.2.
- **Z** = intake side is **+Z**, exhaust/turbo side is **−Z**.
- Cylinder centerlines: `CYL_X = [-1.25, -0.75, -0.25, 0.25, 0.75, 1.25]` (cylinder 1 first).
  This constant is duplicated in `data/parts.ts` and `engine/geometry.tsx` (as `CYLS`); keep
  them in sync if the block is ever resized.
- Units are arbitrary scene units (~½ m feel). Camera home: position `(4.6, 2.6, 5.2)`,
  target `(0, 0.3, 0)` — defined in `EngineScene.tsx`.

## 4. The part catalog (`data/parts.ts`) — single source of truth

Every behavior in the app is driven by `PartDef`:

| Field | Drives |
|---|---|
| `id` | Stable key used everywhere: store sets, progress records, quiz `targetPartId`, `dependencies`, `relatedPartIds`. **Never rename a shipped id** without migrating stored progress (§9). |
| `system` | Material tint, exploded-view isolation grouping |
| `build` | Which geometry builder renders it (key into `BUILDERS` in `geometry.tsx`) |
| `position` | Assembled (home) location; also the snap target in reassembly |
| `explodeOffset` | **Absolute** offset added to `position` in exploded view. Not system-relative — each part encodes its own escape direction so parts don't collide mid-air. Also reused (scaled ×1.6 / ×1.3) as the "removed" parking spot in teardown and the staging spot in reassembly. |
| `removalOrder` | 1-based position in the guided teardown. `-1` = never removable (only the block). Orders must be **unique and contiguous**; `REMOVAL_SEQUENCE` is derived by sorting on it. |
| `dependencies` | Part ids that must already be removed. Used only for *better error messages* on wrong-order clicks — the teardown is strictly sequential regardless. Keep them consistent with `removalOrder` (a dependency must have a smaller order). |
| `function/location/inspectionNotes/failurePoints/difficulty/relatedPartIds` | InfoPanel content; `inspectionNotes` also shown as the current step's text in teardown |
| `simplified` | PRD §7.1 accuracy documentation, surfaced in InfoPanel under "Model note" |

Derived exports: `PART_MAP` (id → def) and `REMOVAL_SEQUENCE` (teardown order, block excluded).
Reassembly order is `REMOVAL_SEQUENCE` reversed — there is no separate assembly list.

### Adding a new part (checklist)

1. Add a builder in `geometry.tsx` and register it in `BUILDERS` (or reuse one, e.g. both
   turbos share `turbo`).
2. Add the `PartDef` with a free `removalOrder` — you will likely need to renumber subsequent
   parts to keep the sequence contiguous.
3. Check `dependencies` of neighbors: if your part blocks something, add your id there.
4. Position check: toggle exploded view and teardown in the browser; make sure the exploded
   position doesn't intersect other parts.
5. If the part is quiz-worthy, add questions in `data/quiz.ts`.
6. Stored progress is forward-compatible (unknown ids are simply never matched), but the
   "parts inspected x/y" denominator changes automatically via `PART_MAP.size`.

## 5. State management (`store.ts`)

One flat zustand store. Notable design points:

- **Mode is a state machine.** `setMode(m)` resets all transient state (selection, offsets,
  hidden, isolation, carrying, feedback) and then seeds mode-specific state:
  teardown → empty `removedIds`, step 0; reassembly → `startReassembly()` (all parts removed,
  attempts counter incremented, step = last index counting *down*); quiz → `startQuiz()`.
  Re-clicking the current mode tab is the supported "restart" gesture (the side panels' Restart
  buttons do exactly that).
- **Sets, not arrays** for `removedIds`/`hiddenIds`. Zustand needs new instances on update —
  always `new Set(old)` before mutating.
- **Validation lives here, not in 3D code.** `attemptRemove` (teardown) checks the clicked id
  against `REMOVAL_SEQUENCE[disasmStep]`; on mismatch it builds the explanation from unmet
  `dependencies`. `attemptPlace` (reassembly) checks against `REMOVAL_SEQUENCE[reasmStep]`
  counting down. Both are deterministic (PRD reliability requirement).
- **Feedback**: `flash({kind, text})` sets `feedback` and clears it after ~4 s. The Toast
  component re-mounts on `ts` change (key), restarting its CSS animation.
- **Persistence**: `Progress` is the only persisted object (`STORAGE_KEY =
  's58-trainer-progress-v1'`). Every mutation that touches progress calls `persist()`
  immediately. Bump the key suffix if you change the `Progress` shape incompatibly.
- **Imperative access**: 3D event handlers call `useStore.getState().xyz()` rather than
  subscribing — avoids re-render churn during pointer events.

### State ownership map

| State | Written by | Read by |
|---|---|---|
| `selectedId/hoveredId` | PartMesh clicks/hover, InfoPanel related-chips | PartMesh (highlight), InfoPanel, labels |
| `offsets` | PartMesh drag commit | PartMesh target position |
| `exploded/isolatedSystem/hiddenIds/showLabels` | Toolbar, SidePanel | PartMesh |
| `removedIds/disasmStep/reasmStep/carryingId` | store actions only | PartMesh visibility/position, SidePanel |
| `quiz*` | store actions only | SidePanel (QuizPanel), PartMesh click routing |
| `resetViewToken/focusPartId` | Toolbar / double-click | CameraRig |

## 6. Rendering & animation (`engine/`)

### PartMesh — the workhorse

Each part is one `<group>` whose **target position** is computed in a `useMemo`:

```
target = position
       + explodeOffset                  (if exploded)
       + explodeOffset * 1.6            (if removed in teardown — "parked" pose)
       + explodeOffset * 1.3            (if carried in reassembly and not yet dragged)
       + offsets[id]                    (manual drag offset)
```

Every frame (`useFrame`) the group lerps toward the target (`dt * 6`), which gives all
transitions — explode, collapse, removal flight, reset — for free. **Don't set positions
directly**; change the inputs to the target computation instead.

The same `useFrame` drives material state (no React re-render): emissive color/intensity for
selected (blue) / hovered (light blue) / next-removable (pulsing green, driven by
`performance.now()`), and opacity lerp for isolation ghosting (0.08) and removed-in-teardown
ghosts (0.3). `depthWrite` is disabled below 0.5 opacity to avoid sorting artifacts.

Each part owns **one** `MeshStandardMaterial` (created in `useMemo`, color = system color
lerped 55 % toward neutral `#878d94`). Builders attach this material to every sub-mesh, so
highlights cover the whole part. If you need multi-material parts, you must extend the
highlight logic accordingly — currently a deliberate single-material constraint.

### Click routing

`onClick` dispatches **by mode**: quiz → `answerIdentify`, teardown → `attemptRemove` (+
select), otherwise → `select`. Double-click → `focusPart` (camera). `onPointerMissed` on the
Canvas clears selection. When adding a new mode, extend this dispatch and the visibility
rules in the same file.

### Drag system

Dragging is allowed when (explore mode ∧ selected ∧ not the block) or (reassembly ∧ carrying).
Implementation: on pointer-down, build a `THREE.Plane` through the part, normal facing the
camera; pointer-moves raycast onto that plane and write `group.position` directly (bypassing
the lerp — `dragging` guards `useFrame`). OrbitControls are disabled for the duration
(`controls.enabled = false`). On pointer-up:

- **Reassembly**: if dropped within **0.5 units** of `position` → `attemptPlace(id)`. The
  store either installs it (removes from `removedIds`, so it renders at home) or rejects it
  (mistake++, part returns to tray). Otherwise the drop position persists as an offset.
- **Explore**: drop position is committed to `offsets[id]` so reset can undo it.

### Geometry builders (`geometry.tsx`)

Builders are React components `({material}) => JSX` composing primitives; registered in the
`BUILDERS` record under the key referenced by `PartDef.build`. Shared helpers:

- `Tube` — `TubeGeometry` along a `CatmullRomCurve3` (manifold runners, chain loop, hoses).
  Curves are memoized once; points are builder-local constants.
- `CastBody` — rounded-rectangle cross-section extruded along X (castings: block tiers,
  plenum, oil pan).
- `Bolt` — 6-segment cylinder hex head; sprinkle on flanges for mechanical feel.
- `Sprocket` — toothed wheel (cylinder + radial boxes).
- Module-level `lobeGeo` / `weightGeo` — extruded cam-lobe and crank-counterweight profiles,
  built once and shared by reference.

Performance rules: segment counts are deliberately modest (8–28); geometry is static after
mount (animation moves groups, never rebuilds geometry); keep `useMemo`/module-scope for
anything built with `new THREE.*`. The whole engine is a few hundred draw calls — fine for
the 60 FPS target, but batch via merged geometry if part count grows a lot.

### EngineScene & CameraRig

`EngineScene` owns the Canvas, lights (no HDR environment — deliberate, the app must work
offline), grid/contact shadows, and OrbitControls (`makeDefault`, damped). `CameraRig`
animates camera + controls target toward a goal when `resetViewToken` increments (home view)
or `focusPartId` is set (frames the part at distance 2.4, accounting for exploded offset),
then clears the goal on arrival or after 2 s.

## 7. UI layer (`ui/`)

Pure-DOM React, styled by `index.css` (single file, CSS variables at `:root`, with a light
palette under `[data-theme='light']`). The theme lives in the store (`theme`, persisted under
the `s58-theme` localStorage key, toggled from the TopBar); `ThemeApplier` in `App.tsx` sets
`document.documentElement.dataset.theme`, and `EngineScene` maps the same value to scene
colors (`SCENE_THEME`: background, grid, hemisphere intensity, shadow opacity). Layout is
fixed: TopBar (brand + mode tabs) / left SidePanel (mode-specific) / center viewport (Canvas +
floating BottomToolbar + Toast) / right InfoPanel. The SidePanel switches sub-panels on
`mode`; each sub-panel reads store slices with narrow selectors. No UI component talks to
three.js directly — everything goes through the store.

Accessibility per PRD: state is never color-only (icons/text accompany green/amber states),
no audio dependency.

## 8. Data flows by mode (reference)

- **Explore**: click → `select` → InfoPanel + `markInspected` (progress). Drag → `offsets`.
  Hide/isolate/explode → visibility flags. Reset all → clears the three of them.
- **Exploded**: `exploded=true` forced on entry; isolation panel sets `isolatedSystem`.
- **Teardown**: green pulse on `REMOVAL_SEQUENCE[disasmStep]` → click (or the panel's
  "Remove this part" button, which calls `attemptRemove` on the current step's id) →
  correct: part flies to parked pose, step++; wrong: mistake++, toast explains blockers.
  Completion writes `disassemblyCompleted` + mistakes to progress. Note: the cylinder block
  (`removalOrder: -1`) is never removed but encloses the pistons and crankshaft, so in
  teardown/reassembly `PartMesh` ghosts it (`enclosingGhost`, opacity 0.16) and disables its
  meshes' raycast so clicks reach the parts inside. The button guarantees the procedure is
  completable regardless of occlusion or camera angle.
- **Reassembly**: entry marks every sequenced part removed (attempt++ in progress). Tray click
  → `pickUpRemoved` (part appears staged near its exploded pose) → drag within 0.5 of home →
  `attemptPlace` → snap or reject. Completion writes `reassemblyCompleted` + mistakes.
- **Quiz**: `QUIZ_QUESTIONS[quizIndex]`; `identify` answered by 3D click (wrong answers
  highlight the correct part), `choice` by panel buttons. `nextQuestion` past the end appends
  a `QuizResult` to progress and shows the results panel.

## 9. Extension seams

- **Real 3D model**: replace builders with a glTF: load nodes, map `PartDef.modelNodeId`
  (field reserved in the PRD data model) to scene nodes, keep PartMesh's state/animation logic
  by wrapping each node in the same group contract (home position = authored transform).
  Everything outside `geometry.tsx`/`PartMesh.tsx` should survive unchanged.
- **Backend / instructor dashboard**: `persist()`/`loadProgress()` in `store.ts` are the only
  storage touchpoints; swap for API calls. CSV export (`exportCsv`) builds rows from
  `Progress` — extend both together.
- **New training module/sequence**: today the teardown is the single global
  `REMOVAL_SEQUENCE`. To support multiple modules (PRD Phase 3), parameterize the store's
  sequence (`disasmStep` indexes into a selected module's part-id list) instead of importing
  the constant directly — the validation logic itself needs no change.
## 9a. Localization (i18n)

The app ships English and Simplified Chinese; the language lives in the store (`lang`,
persisted under `s58-lang`, switched from the TopBar `LangSwitch`). `App.tsx` mirrors it to
`document.documentElement.lang`. The layer is in `src/i18n/`:

- `strings.ts` — `Lang` type, `LANGS` list, and the UI-chrome dictionary (`en`/`zh`) with the
  `t(lang, key, params?)` interpolator (`{name}` placeholders). English is the source of
  truth; every key is mirrored in `zh`, falling back to English if missing. **No app imports**
  — safe for the store to use.
- `content.ts` — translation *overlay* for data that lives in English in `data/*` and
  `sim/flow.ts`: `PARTS_ZH` (part name + all service-prose fields, keyed by part id; pistons
  generated), `SYSTEMS_ZH`, `CIRCUITS_ZH`, `QUIZ_ZH`. Resolvers (`pName`, `pField`, `sysName`,
  `circuitName`, `quizPrompt`, `quizOptions`) take a `Lang` and fall back to the English field.
- `index.ts` — re-exports the above plus the `useI18n()` hook, which reads `lang` from the
  store and returns `t` and the content resolvers already bound to the current language.

Components call `useI18n()` and re-render on language change because they subscribe to the
store. Non-React code (the store's feedback messages, the r3f `PartMesh` 3D label) imports the
pure functions from `i18n/strings` / `i18n/content` directly with an explicit `lang` argument
— this also avoids a cycle, since `i18n/index` imports the store but the store never imports
`i18n/index`.

**Adding a language**: add the id to `LANGS`, add a dictionary in `strings.ts`, and add the
content maps in `content.ts` (any missing key/field automatically falls back to English).
**Adding a translated string**: add the key to *both* dictionaries in `strings.ts` and call
`t('your.key')`; never inline a user-visible literal in a component. Canvas-drawn chart labels
are passed translated strings via the `SimCanvas` draw closures and listed in the `deps` array
so they repaint on language change.

## 10. Verification

No automated tests yet. The proven manual check (used during development) is driving the app
headless with `playwright-core` against the installed Chrome (`channel: 'chrome'`): load,
switch every mode, click parts, drag a tray part onto the engine, and assert side-panel text
("Step 2 of 33", "Installed 1 of 33") plus screenshots. Minimum bar before merging:

1. `npx tsc --noEmit` and `npm run build` are clean.
2. All five modes load without console errors.
3. Teardown: correct part removes, wrong part toasts with a reason.
4. Reassembly: tray pick → drag → snap installs exactly the expected next part.
5. Refresh the page: progress survives (localStorage).

If you add logic to `store.ts`, it is plain TypeScript with no three.js imports — it is the
natural place to start unit testing (vitest) when the project grows.
