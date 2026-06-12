# S58 Parts Audit & Citations

A per-part accuracy review of the engine model in `src/data/parts.ts`, checked against
public BMW S58 references. For every part the table records a **citation** (a source that
supports the model's claim) or, where no source could be located, a **remark**. The end
sections list parts that do **not** exist as modeled, parts that are **missing**, and parts
that are **in the wrong place**.

## Scope & method

- The 3D model is **procedural and stylized** (see the model-accuracy note in `README.md`);
  geometry is not dimensionally accurate. This audit therefore checks the **part list and the
  textual metadata** (name, function, location, system, removal relationships) — not mesh
  shapes.
- Positions are in abstract scene space (the model's convention: intake side = `+Z`, exhaust/
  turbo side = `−Z`, timing/front = `−X`, flywheel/rear = `+X`). Placement is judged
  qualitatively (correct side / correct end), not by coordinates.
- The **primary source** is BMW's own technical training manual; enthusiast/vendor sources are
  used only to corroborate.

## Sources

| Code | Source |
|------|--------|
| **[ST1926]** | BMW Group University — *S58 Engine, Technical Training / Reference Manual*, ST1926, 1 Sept 2019 (authoritative). Hosted copy: https://www.billswebspace.com/ST1926%20S58%20Engine.pdf — cited by section/page. |
| [VOX] | VoxelMatters — *BMW's new S58 engine features a 3D-printed cylinder head*: https://www.voxelmatters.com/bmw-s58-engine-3d-printed-cylinder/ |
| [GOP] | Go-Parts — *S58 Intercooler: The Hidden Coolant Leak Risk*: https://www.go-parts.com/garage/intercooler-bmw-m3-bmw-m4-bmw-x3-m-2020-2024 |
| [SPOOL] | Spool Performance — *S58 350 bar HDEV6 DI injectors*: https://spoolperformance.com/products/bmw-s58-ifx350-upgraded-di-injectors |
| [BM] | Bimmer-Merch — *BMW S58 Engine, The Complete Guide*: https://www.bimmer-merch.com/blogs/articles/bmw-s58-engine-everything-you-need-to-know |
| [BW] | BimmerWorld — Genuine BMW HPFP P/N 13518631642 and injector P/N 13538671991 (B58/S58): https://www.bimmerworld.com/Intake-Fuel/Fuel-Filters/ |

Key authoritative figures from **[ST1926]**: engine **S58B30T0**, inline-six, **2993 cc**,
bore/stroke **84.0 / 90.0 mm**, based on the **B58TU** (p.1–2); **twin** high-pressure fuel
pumps, **350 bar**, Bosch **HDEV6** solenoid injectors (§10); **indirect** (air-to-water)
charge-air cooler on a separate low-temperature circuit with an **electric** coolant pump
(§11.2.2); **Valvetronic** valve-lift control + double **VANOS** (§5.2); map-controlled
variable oil pump with **piston oil-spray cooling nozzles** (§7.3–7.7); electric wastegate
actuators (§8.2.3); vacuum pump (§9).

---

## Per-part audit

Verdict legend: ✅ accurate · ⚠️ partially right / misleading · 📍 wrong place · ➖ generic
(no S58-specific source).

| # | Part (id) | Modeled as | Verdict | Citation / Remark |
|---|-----------|-----------|---------|-------------------|
| 1 | Cylinder Block (`cylinder-block`) | Closed-deck aluminium crankcase, wire-arc-sprayed iron bores | ✅ | Closed-deck crankcase: **[ST1926 §4.1.2]**, [BM]. *Remark:* twin-wire-arc-sprayed bore coating is carried over from the B58; not separately page-verified here. |
| 2 | Cylinder Head (`cylinder-head`) | Houses valves; **3D-printed-core** cooling passages | ✅ | 3D-printed cylinder-head core with optimised coolant channels: [VOX]; **[ST1926 §4.1.4]**. |
| 3 | Valve Cover (`valve-cover`) | Composite cover, integrated PCV/oil separators | ✅ | Cylinder-head cover: **[ST1926 §4.1.5]**. *Remark:* composite + oil-separator detail is standard BMW practice; not separately cited. |
| 4 | Intake Camshaft (`camshaft-intake`) | Actuates intake valves; VANOS-phased | ⚠️ | **[ST1926 §5.1.1]**. Incomplete: intake-valve **lift** is also varied by **Valvetronic** (§5.2.2), which the model omits — see Missing #1. |
| 5 | Exhaust Camshaft (`camshaft-exhaust`) | Actuates exhaust valves; drives the HPFP at the rear | ⚠️ | Drives the high-pressure pump(s) via **triple-lobe** drive cams: **[ST1926 §5.1.1, §10.3]**. It drives **two** pumps, not one (Missing #2); "single lobe / rear" is imprecise (see #20). |
| 6 | Crankshaft (`crankshaft`) | Forged steel, seven main bearings | ✅ | **[ST1926 §4.2.1]** (crankshaft with bearings); inline-six → 7 mains. |
| 7 | Pistons & Rods ×6 (`piston-1…6`) | Forged pistons rated for high boost | ✅ | **[ST1926 §4.2.3]** (piston with wrist pin & rings), §4.2.2 (rod). *Note:* pistons are oil-jet cooled; the cooling nozzles are not modeled (Missing #3). |
| 8 | Harmonic Damper (`harmonic-damper`) | Crank-nose torsional damper; drives accessory belt | ✅ | Belt drive / ancillary components: **[ST1926 §6.1]**. |
| 9 | Timing Cover (`timing-cover`) | Seals front timing drive; front crank seal | ✅ | Camshaft/chain drive is at the **front**: **[ST1926 §4.3]**. *Remark:* cover-specific detail is generic. |
| 10 | VANOS units (`vanos-unit`) | Hydraulic phasers on both cams | ✅ | Double VANOS: **[ST1926 §5.2.1]**, [BM]. |
| 11 | Timing Chain & Guides (`timing-chain`) | Chain drive, front, hydraulically tensioned | ✅ | **[ST1926 §4.3]** (camshaft drive / chain drive). |
| 12 | Turbo, Cyl 1–3 (`turbo-front`) | Mono-scroll turbo, electric wastegate | ✅ function / 📍 placement | Two mono-scroll turbos, one per 3-cyl bank, electric wastegate: **[ST1926 §8.2.2–8.2.3]**, [BM]. *Placement:* real units sit **low on the exhaust side, close together**; the model spreads them along the side at mid-height (stylised). |
| 13 | Turbo, Cyl 4–6 (`turbo-rear`) | Mono-scroll turbo, parallel with front | ✅ function / 📍 placement | As #12. |
| 14 | Exhaust Manifold 1–3 (`exhaust-manifold-front`) | Collects cyl 1–3 → front turbo | ✅ | "Exhaust manifold with turbocharger": **[ST1926 §8.2.2]**. |
| 15 | Exhaust Manifold 4–6 (`exhaust-manifold-rear`) | Collects cyl 4–6 → rear turbo | ✅ | As #14. |
| 16 | Intake Manifold w/ Charge Cooler (`intake-manifold`) | Plenum with **integrated air-to-water charge cooler** | ⚠️ | Indirect (air-to-water) charge-air cooler is correct: **[ST1926 §11.2.2]**, [GOP]; coolant-leak failure mode: [GOP]. **But** it sits on its own **separate low-temperature circuit** (own electric pump, radiator, expansion tank) — not simply "integrated in the manifold" fed by the main pump. See Wrong/Misleading #2. |
| 17 | Throttle Body (`throttle-body`) | Electronic valve **metering airflow** into the plenum | ⚠️ | A throttle exists, but on a Valvetronic engine **load is set primarily by intake-valve lift**, not the throttle (normally wide open): **[ST1926 §5.2.2, §8.1]**. Described role overstated. |
| 18 | HP Fuel Rail (`fuel-rail`) | Stores fuel up to **350 bar**, feeds 6 injectors | ✅ | 350 bar rail: **[ST1926 §10.3]**, [SPOOL]. |
| 19 | Direct Injectors ×6 (`injector-set`) | **Solenoid** DI, one per cylinder | ✅ | Bosch **HDEV6 solenoid** valve injectors at 350 bar: **[ST1926 §10.3]**, P/N 13538671991 [BW], [SPOOL]. (Older BMW DI engines used piezo; S58 is solenoid.) |
| 20 | HP Fuel Pump (`hp-fuel-pump`) | "One pump; two on later variants"; single lobe; rear of head | ⚠️📍 | **Incorrect:** the S58 has **two** HPFPs **as standard** (parallel, alternating every 30 s, both at full load), driven by **triple-lobe** cams: **[ST1926 §10.1, §10.3]**, P/N 13518631642 [BW]. Only one is modeled (Missing #2); "later variants" and "a lobe" are wrong; rear-of-head placement is imprecise. |
| 21 | Coolant Pump (`water-pump`) | Circulates coolant through block, head **and charge-cooler circuits** | ⚠️ | Main engine coolant pump is correct, but it does **not** feed the charge-cooler circuit — that has its **own electric** low-temperature pump: **[ST1926 §11.2.2]**. |
| 22 | Thermostat Housing (`thermostat-housing`) | Map-controlled thermostat | ✅ | Map/characteristic-controlled engine thermostat: **[ST1926 §11.2]**. |
| 23 | Oil Filter Housing (`oil-filter-housing`) | Top-mounted canister; oil-pressure port | ✅ | Top-mounted filter with integrated engine-oil cooling: **[ST1926 §7.8]**. |
| 24 | Oil Pan / Sump (`oil-pan`) | Holds oil; oil-level sensor | ✅ | Oil sump: **[ST1926 §4.1.1]**. |
| 25 | Oil Pump (`oil-pump`) | Chain-driven, **map-controlled variable-displacement**; feeds bearings + VANOS | ✅ | Map-controlled variable oil pump with map control valve: **[ST1926 §7.3–7.4]**. *Note:* it also supplies the piston oil-spray nozzles (§7.6–7.7) — not modeled (Missing #3). |

---

## A. Parts that don't exist / are misrepresented as modeled — ✅ FIXED

1. **HP Fuel Pump — "two HPFPs on later variants; one is modeled here."** Wrong on both counts:
   the S58 has **two** high-pressure pumps **from launch / as standard**, operating in parallel
   (alternating every 30 s, simultaneous at high load), each driven by **triple-lobe** cams so
   the pair delivers every 60°. **[ST1926 §10.1, §10.3]**.
   **Fixed:** part renamed *High-Pressure Fuel Pump 1* with corrected function text;
   `hp-fuel-pump-2` added; exhaust-camshaft description updated to "two pumps via triple-lobe
   cams"; quiz q1/q8 updated (either pump accepted as a correct click).
2. **Throttle body as primary air-metering device.** The throttle exists but is secondary;
   the S58 meters load with **Valvetronic** intake-valve lift. **[ST1926 §5.2.2]**.
   **Fixed:** function text now states the throttle is normally wide open and load is metered
   by Valvetronic.
3. **Coolant pump "circulates coolant through … charge-cooler circuits."** The charge-air
   cooler is on a **separate low-temperature circuit with its own electric pump**; the main
   pump does not serve it. **[ST1926 §11.2.2]**.
   **Fixed:** main pump description corrected; intake-manifold text now describes the separate
   LT circuit; `coolant-pump-electric` added as a part.

## B. Missing parts (present on the real S58, absent from the model)

1. **Valvetronic** — ✅ **added** (`valvetronic`: eccentric shaft, intermediate levers, servo
   motor as one assembly; teardown step 16). **[ST1926 §5.2.2]**, [BM].
2. **Second high-pressure fuel pump** — ✅ **added** (`hp-fuel-pump-2`, teardown step 6).
   **[ST1926 §10]**. *Remark:* the volume control valves are part of each pump assembly, not
   separate parts.
3. **Piston oil-spray cooling nozzles** — ✅ **added** (`oil-spray-nozzles`, ×6 + relay valve as
   one service set; teardown step 26). **[ST1926 §7.6–7.7]**.
4. **Indirect charge-air-cooler low-temperature circuit** — ✅ **partially added**: the on-engine
   electric coolant pump (`coolant-pump-electric`, teardown step 22) is modeled; the LT
   radiators and expansion tank are off-engine (vehicle side) and remain unmodeled, documented
   in the part's `simplified` note. **[ST1926 §11.2.2]**.
5. **Turbocharger cooling circuit** (after-run coolant flow to the turbos). **[ST1926 §11.2.1]**.
   *Deliberately not modeled:* it is plumbing within existing circuits, not a discrete
   serviceable part at this model's granularity.
6. **Vacuum pump** (brake-booster vacuum). **[ST1926 §9]**. *Deliberately not modeled:* exact
   mounting location not confirmed from available sources; adding it with a guessed position
   would introduce a new inaccuracy. Revisit with ST1926 §9.1.1 figure access.
7. *(Vehicle-level / out of MVP scope — unchanged)* engine & transmission oil coolers
   (**[ST1926 §11.1]**), carbon canister / tank-ventilation (**[ST1926 §8.1.5]**), ignition
   coils & spark plugs, belt drive / alternator / accessories (**[ST1926 §6]**), low-pressure
   in-tank fuel pump (**[ST1926 §10.2]**), catalytic converters / OPF / downpipes
   (**[ST1926 §8.2]**).

## C. Wrong place / imprecise location

1. **Turbochargers (`turbo-front`, `turbo-rear`).** Function and 1–3 / 4–6 split are correct,
   but the real units mount **low on the exhaust side and close together**; the model spreads
   them front/rear at mid-height. Stylised — **left as-is intentionally**: the spread placement
   keeps both selectable and visually distinct for training. **[ST1926 §8.2.2]**, [BM].
2. **HP Fuel Pump location.** Was modeled at the *rear* of the head. ✅ **Fixed:** both pumps
   now sit at the **front-top** of the head, driven by the exhaust camshaft. **[ST1926 §10]**.

## D. Verified correct (no change needed)

Cylinder block (closed-deck), cylinder head (3D-printed core), crankshaft (forged, 7 mains),
pistons/rods (forged), VANOS (double), timing chain (front), exhaust manifolds (split 1–3 /
4–6), fuel rail (350 bar), injectors (HDEV6 solenoid), oil pump (map-controlled variable),
oil filter (top-mounted), oil pan, thermostat (map-controlled). Engine basics used by the
simulation (`src/sim/engineCycle.ts`) — **2993 cc, 84.0 × 90.0 mm, 9.3:1** — match
**[ST1926 p.2]** exactly. Firing order **1-5-3-6-2-4** is the standard BMW straight-six order
*(remark: universal for BMW I6; not separately page-cited)*.

---

*Audit date: 2026-06-12. Primary source: BMW ST1926 (9/2019). Fixes applied 2026-06-12:
sections A and C resolved; section B items 1–4 added to the model (catalog now 34 parts,
33-step teardown). Reconcile this file with `src/data/parts.ts` if part metadata changes.*
