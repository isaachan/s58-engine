# BMW N52 Parts Audit & Citations

A per-part accuracy review for a planned **BMW N52** engine module (`src/engines/n52/`),
checked against public references **before** the model is authored. For every part the table
records a **citation** (a source that supports the claim) or, where no source could be located,
a **remark**. End sections list **distinctive N52 features**, parts **deliberately not modeled**,
**simplified** representations, and the **verified core specs**.

This file follows the conventions of [`docs/PARTS-S58.md`](PARTS-S58.md): the model is
**procedural and stylized**, so this audit checks the **part list and textual metadata** (name,
function, location, system, removal relationships) — not mesh geometry or coordinates.

## Calibration target & variant

The N52 came in 2.5 L and 3.0 L versions. This module calibrates to the **N52B30 high-output**
(e.g. E90 330i / E82 130i / Z4 3.0si grade) and notes the family where relevant — the same
"pick the high-output variant and say so" convention the other modules used.

| Parameter | Value |
|---|---|
| Displacement | **2,996 cc** |
| Bore × stroke | **85.0 × 88.0 mm** |
| Compression ratio | **10.7:1** |
| Power / torque | **≈ 200 kW (272 PS) / ≈ 315 N·m** |
| Redline | **7,000 rpm** (raised from 6,500 on the M54 predecessor) |
| Layout | **Naturally-aspirated inline-six**, firing order **1-5-3-6-2-4** |

Defining features: a **magnesium-aluminium composite crankcase** (the first water-cooled engine
to use one), **port (manifold) fuel injection** — *not* direct injection, so there is no
high-pressure pump or DI rail — **Valvetronic II** variable intake-valve lift, **double VANOS**
variable timing, an **electric main coolant pump**, a **3-stage DISA variable-length intake
manifold**, and a chain-driven DOHC valvetrain. These make the N52 the strongest contrast in
the trainer: the only **port-injected** and the only **NA inline-six** module.

## Sources

| Code | Source |
|------|--------|
| **[WIKI]** | Wikipedia — *BMW N52*: https://en.wikipedia.org/wiki/BMW_N52 (2,996 cc, 85 × 88 mm, 10.7:1, magnesium-aluminium block, Valvetronic II 0.18–9.9 mm lift, double VANOS, redline 7,000 rpm, 3-stage DISA on high-output variants). |
| [BP] | BimmerPulse — *BMW N52B30 specifications, problems and reliability*: https://bimmerpulse.com/engines/n52b30/ |
| [MML] | MyMotorList — *BMW N52B30*: https://mymotorlist.com/engines/bmw/n52b30/ (power/torque range, redline). |
| [BT] | BMW Tuning — *BMW N52 Engine* / *N52 Intake Manifold Upgrade Guide*: https://bmwtuning.co/bmw-n52-engine/ , https://bmwtuning.co/n52-intake-manifold-upgrade-guide/ (port injection, 3-stage DISA variable intake, chain-driven DOHC). |
| [PEL] | Pelican Parts — *N52 Engine Intake Manifold (DISA) technical article*: https://www.pelicanparts.com/techarticles/BMW-E60/147-FUEL-N52_Engine_Intake_Manifold_Upgrade/147-FUEL-N52_Engine_Intake_Manifold_Upgrade.htm |

---

## Per-part audit (planned model — 27 parts)

Verdict legend: ✅ accurate · ⚠️ partially right / needs a note · ➖ generic (no
N52-specific source, standard practice).

| # | Part (id) | Modeled as | Verdict | Citation / Remark |
|---|-----------|-----------|---------|-------------------|
| 1 | Cylinder Block (`cylinder-block`) | **Magnesium-aluminium composite** crankcase, 6 cylinders | ✅ | First water-cooled engine with a magnesium-alloy crankcase shell over an aluminium insert: **[WIKI]**, [BP]. *Teaching contrast:* magnesium block. |
| 2 | Cylinder Head (`cylinder-head`) | DOHC aluminium head, 24 valves, **port injectors in the ports** | ✅ | Aluminium DOHC head, chain-driven: [BT]. Intake-port (MPI) injection: [BT], [BP]. |
| 3 | Valve Cover (`valve-cover`) | **Magnesium** cam cover with PCV / oil separation | ✅ | The N52 uses a magnesium valve cover (weight focus): [WIKI]. *Remark:* PCV/oil-separator detail is standard practice. |
| 4 | Intake Camshaft (`camshaft-intake`) | Actuates intake valves; VANOS-phased; **Valvetronic** varies lift | ✅ | Intake timing by VANOS, lift by Valvetronic II (0.18–9.9 mm): **[WIKI]**. |
| 5 | Exhaust Camshaft (`camshaft-exhaust`) | Actuates exhaust valves; VANOS-phased | ✅ | Double VANOS on both cams: **[WIKI]**. *Note:* unlike the DI BMWs, it drives **no** high-pressure fuel pump (port injection — see Distinctive #2). |
| 6 | Crankshaft (`crankshaft`) | Forged steel, 7 main bearings | ✅ | Inline-six → 7 mains (standard, not separately cited). |
| 7 | Pistons & Rods ×6 (`piston-1…6`) | NA pistons rated for 10.7:1 | ✅ | [WIKI] (10.7:1). *Note:* no oil-spray cooling jets are modeled (see Not-modeled #2). |
| 8 | Harmonic Damper (`harmonic-damper`) | Crank-nose damper; drives accessory belt | ➖ | Standard practice; no N52-specific source. |
| 9 | Timing Cover (`timing-cover`) | Seals the front chain drive; front crank seal | ✅ | Chain-driven DOHC: [BT]. Cover detail is generic. |
| 10 | VANOS Units (`vanos-unit`) | Hydraulic phasers on **both** cams | ✅ | Double VANOS: **[WIKI]**. *Remark:* both phasers as one service unit. |
| 11 | Timing Chain & Guides (`timing-chain`) | Chain drive, front, hydraulically tensioned | ✅ | Chain drive: [BT]. |
| 12 | Valvetronic (`valvetronic`) | Eccentric shaft + servo varying intake-valve **lift** (primary load control) | ✅ | Valvetronic II, electric-motor eccentric shaft, intermediate levers, 0.18–9.9 mm: **[WIKI]**. The throttle is normally wide open. |
| 13 | Exhaust Manifold (`exhaust-manifold`) | Tubular header collecting all six cylinders | ✅ | Conventional NA exhaust manifold/header (no turbine). *Remark:* exact two-piece split not page-pinned; modeled as one header. |
| 14 | Intake Manifold (`intake-manifold`) | **3-stage DISA variable-length** plenum; **no charge cooler** | ✅ | High-output N52 uses a 3-stage variable-length (DISA) intake manifold: **[WIKI]**, [BT], [PEL]. Naturally aspirated → no intercooler. |
| 15 | Throttle Body (`throttle-body`) | Electronic throttle, normally wide open | ✅ | With Valvetronic metering load, the throttle is secondary (as on the other BMW modules): **[WIKI]**. |
| 16 | Fuel Rail (`fuel-rail`) | **Low-pressure** rail (~3.5–5 bar) feeding 6 port injectors | ✅ | Port injection → low-pressure rail fed by the in-tank pump; **no 350-bar DI rail**: [BT], [BP]. *Distinctive — #2.* |
| 17 | Port Injectors ×6 (`injector-set`) | Solenoid **port** injectors, one per intake port | ✅ | Manifold/port injection: [BT], [BP]. Modeled as one service set of six. |
| 18 | Electric Coolant Pump (`water-pump`) | **Electric** main coolant pump (no belt-driven pump) | ✅ | The N52 replaced the mechanical pump with an **electric coolant pump** — an N52 signature: [BP], [BT]. *Distinctive — #3.* |
| 19 | Thermostat Housing (`thermostat-housing`) | Map-controlled coolant temperature control | ➖ | Standard practice; characteristic-map thermostat detail not page-pinned. |
| 20 | Oil Filter Housing (`oil-filter-housing`) | Top-mounted cartridge filter; oil routing | ➖ | Standard BMW top-mounted filter; not N52-specifically cited. |
| 21 | Oil Pan / Sump (`oil-pan`) | Holds oil; oil-level sensor | ➖ | Standard practice; no N52-specific source. |
| 22 | Oil Pump (`oil-pump`) | Chain-driven, **map/volume-controlled** variable pump | ⚠️ | Later N52 (N52K) uses a volume-controlled oil pump; **[WIKI]** mentions the map-controlled oil pump. *Remark:* early-build N52 used a fixed pump — variant-dependent; modeled as the variable type. |

*(Pistons 1–6 occupy one table row; total selectable parts: 27.)*

---

## Distinctive N52 features (the teaching contrasts vs the other modules)

1. **Magnesium-aluminium composite crankcase** — the first water-cooled engine to use one;
   contrast with the aluminium blocks (S58/B48/Skyactiv) and the cast-iron EA888. **[WIKI]**.
2. **Port (manifold) injection** — the **only** non-direct-injection engine in the trainer.
   There is **no high-pressure fuel pump and no 350/500-bar DI rail**; a low-pressure rail feeds
   the port injectors. Contrast: S58/B48 (350-bar DI), Skyactiv (200-bar DI), EA888 (500-bar DI
   + MPI). **[BT]**, **[BP]**.
3. **Electric main coolant pump** — the mechanical belt-driven pump is gone; an electric pump
   circulates the main circuit for fast warm-up and demand-based cooling. **[BP]**, **[BT]**.
4. **Valvetronic + double VANOS on an NA engine** — load is set by intake-valve lift, the
   throttle normally wide open. **[WIKI]**.
5. **3-stage DISA variable-length intake manifold** — switches runner length for torque across
   the rev range. **[WIKI]**, **[PEL]**.

## A. Parts deliberately NOT modeled

1. **Turbocharger / charge-air cooler** — **correctly absent**: the N52 is naturally aspirated.
   **[WIKI]**.
2. **High-pressure fuel pump / DI rail** — **correctly absent**: port injection (#2 above).
   **[BT]**.
3. **Piston oil-spray cooling jets** — **not modeled**: not confirmed for the N52 from reviewed
   sources, so omitted rather than invented (same call as the Skyactiv-G module).
4. *(Vehicle-level / out of scope, as in the other modules)* belt drive / alternator /
   accessories, ignition coils & spark plugs, in-tank low-pressure fuel pump, evaporative
   canister, catalytic converters, flywheel and clutch.

## B. Simplified representations (documented per PRD accuracy rules)

- **VANOS phasers** — both modeled as one service unit (`vanos-unit`).
- **Port injectors** — six modeled as one service set (`injector-set`).
- **Valvetronic** — eccentric shaft, intermediate levers, springs and servo motor as one
  assembly (`valvetronic`). **[WIKI]**.
- **Timing chain/guides/tensioner** — one assembly (`timing-chain`).
- **DISA actuators** — the variable-length switching is represented within the `intake-manifold`
  mesh, not as separate flap parts. **[PEL]**.
- **Pistons/rings/pin/rod** — one assembly per cylinder (`piston-1…6`).

## C. Verified core specs (for the simulation)

Displacement **2,996 cc**, bore × stroke **85.0 × 88.0 mm**, compression **10.7:1**, firing
order **1-5-3-6-2-4**, redline **7,000 rpm**, peak **≈ 200 kW / ≈ 315 N·m**, **naturally
aspirated** — all from **[WIKI]**, [BP], [MML].

*Remark — connecting-rod length / recip mass:* not published in the reviewed sources; the scene
uses an estimated rod length (`rodM ≈ 0.145 m`) and recip mass, which drive only the stylized
animation, not any cited claim. Flagged so they are not mistaken for sourced figures.

---

*Audit date: 2026-06-13. Calibration target: N52B30 high-output, 10.7:1, ≈200 kW / 315 N·m.
Reconcile this file with `src/engines/n52/parts.ts` if part metadata changes.*
