# S58 Engine Training Simulator

A 3D interactive training simulator for the **BMW S58B30** twin-turbo inline-six, built for
professional mechanics and trainees. Implements the MVP scope of [docs/PRD.md](docs/PRD.md).

## Run it

```bash
npm install
npm run dev      # → http://localhost:5173
npm run build    # production build in dist/
```

Targets desktop Chrome/Edge with mouse + keyboard.

## Training modes

| Mode | What it does |
|---|---|
| **Explore** | Free inspection. Click to select, double-click to focus the camera, drag a selected part away from the assembly, hide/reset parts. Inspected parts count toward progress. |
| **Exploded View** | Animated full-engine explosion. Isolate any of the 10 systems (block, head/valvetrain, rotating assembly, timing, turbo, intake, exhaust, cooling, lubrication, fuel); other systems fade. |
| **Guided Teardown** | 29-step removal sequence. The next part pulses green; out-of-sequence attempts are rejected with the dependency that blocks them, and mistakes are counted. |
| **Reassembly** | Starts from a bare block. Pick parts from the tray, drag them onto the engine; they snap when close and validate against reverse-teardown order. Attempts and mistakes are recorded. |
| **Assessment** | 10-question quiz mixing click-to-identify (in the 3D view) and multiple-choice service knowledge. Scores, time, and missed topics are saved. |

Progress persists in `localStorage` and can be exported as CSV from the Explore panel
(instructor report: parts inspected, teardown/reassembly completion and mistakes, quiz history).

## Controls

- **Left-drag** rotate · **Right-drag** pan · **Scroll** zoom
- **Click** select · **Double-click** focus camera · **Drag selected part** move it
- Bottom toolbar: explode toggle, labels, reset view, reset all parts

## Architecture

- `src/data/parts.ts` — part catalog: 28 selectable parts with system, function, location,
  inspection notes, wear points, dependencies, and removal order. Training logic is data-driven
  from this file.
- `src/data/quiz.ts` — assessment items.
- `src/engine/geometry.tsx` — procedural part geometry builders (primitive composition).
- `src/engine/PartMesh.tsx` — per-part rendering: highlight states, exploded/removed animation,
  drag with camera-plane raycasting, snap-to-place.
- `src/engine/EngineScene.tsx` — canvas, lights, camera rig (focus/reset animations).
- `src/store.ts` — Zustand store: mode state machine, teardown/reassembly validation, quiz
  scoring, progress persistence, CSV export. Training logic is fully separated from rendering.
- `src/ui/` — learning panel, mode side panels, toolbar, feedback toasts.

## Model accuracy notes (per PRD §7.1)

The model is **procedurally generated**, not derived from BMW CAD data. Layout, part
relationships, and service sequencing are representative of the S58 architecture
(closed-deck I6, two mono-scroll turbos on split exhaust manifolds, air-to-water charge
cooler integrated in the intake plenum, top-mounted oil filter, cam-driven HPFP). Simplified
components are documented in each part's `simplified` field and shown in the Learning Panel
under "Model note" — notably: valves/springs/followers are not individually modeled, the six
injectors are one service set, the timing chain/guides/tensioner are one assembly, and one of
the two HPFPs is modeled. Geometry is stylized and **not suitable for dimensional reference**.

## PRD coverage

- Phase 1 (prototype) and Phase 2 (MVP) features are implemented, including local progress
  tracking and basic instructor CSV export.
- Phase 3+ (multi-user accounts, backend dashboard, VR) is out of scope for this build.
