# EA888 evo5 (2.0 TSI) Parts Audit & Citations

A per-part accuracy review for a planned **Volkswagen Group EA888 evo5** engine module
(the fifth-generation 2.0 TSI, sometimes written "EA888.5"). For every part the table records a
**citation** (a source that supports the claim) or, where no source could be located, a
**remark**. End sections list **distinctive EA888 features**, parts **deliberately not modeled**,
**simplified** representations, and the **verified core specs**.

This file follows the conventions of [`docs/PARTS-S58.md`](PARTS-S58.md) and
[`docs/PARTS-Skyactiv-G.md`](PARTS-Skyactiv-G.md): the model is **procedural and stylized**, so
this audit checks the **part list and textual metadata** (name, function, location, system,
removal relationships) — not mesh geometry or coordinates.

## Calibration target & variant

The EA888 is built in two "performance classes" (PC1 base, PC2 high-output). This module
calibrates to the **evo5 PC2 high-output** (the "GTI-grade" tune now spreading across the VW
Group lineup) and notes PC1 where it differs — the same "pick the high-output variant and say
so" convention the B48 and Skyactiv-G modules used.

| Parameter | PC1 (base) | **PC2 high-output — calibration target** |
|---|---|---|
| Compression ratio | 10.5:1 (raised from 9.6:1 in Gen 3) | **12.5:1** (raised from 12.2:1 in evo4; extreme Miller) |
| Power / torque | lower tune | **≈ 195 kW (265 PS) / ≈ 400 N·m** |

Shared across both: **1,984 cc**, bore/stroke **82.5 / 92.8 mm**, **DOHC chain drive**, dual
**VVT** cam phasers, **variable-geometry turbocharger (VGT)**, **dual injection** (500-bar
direct **+** port MPI), the signature **exhaust manifold cast into the cylinder head**, an
**air-to-water charge cooler integrated in the intake manifold**, a **cast-iron crankcase**,
two **balance shafts**, and a **gasoline particulate filter (GPF)**. Firing order **1-3-4-2**.
The evo5 raised the DI rail from **350 → 500 bar**, enlarged the crankpins **47.8 → 50.0 mm**,
shortened the con-rod **144 → 140 mm**, runs a **more extreme Miller cycle**, and reaches
**38 % thermal efficiency**.

## Sources

| Code | Source |
|------|--------|
| **[APTI]** | Automotive Powertrain Technology International — *Tech Insider: VAG EA888 Evo 5*: https://www.automotivepowertraintechnologyinternational.com/features/tech-insider-vag-ea888-evo-5.html (authoritative evo5: VGT; CR PC1 10.5:1 / PC2 12.5:1; DI 350→500 bar; more extreme Miller; crankpin 47.8→50.0 mm; con-rod 144→140 mm; integrated air-water intercooler; EGT 1,020 °C; GPF; 38 % thermal efficiency; +20 N·m PC2). |
| [MR] | MotorReviewer — *VW/Audi 2.0 TSI/TFSI EA888 Gen 1/2/3*: https://www.motorreviewer.com/engine.php?engine_id=119 (1,984 cc, bore 82.5 mm, stroke 92.8 mm, cast-iron block, exhaust manifold integrated into the head, dual injection DI+MPI, balance shafts, electronic wastegate, VVT/AVS). |
| [MML] | MyMotorList — *EA888 / VW TSI turbo engines*: https://mymotorlist.com/engines/volkswagen/ea888/ |
| [SG] | SlashGear — *Why the VW EA888 Is Considered One of VW's Most Reliable*: https://www.slashgear.com/1964202/volkswagen-ea888-engine-what-makes-it-reliable/ (integrated exhaust manifold, dual injection rationale). |
| [VWN] | Volkswagen Newsroom — *The legendary GTI turbocharged engine in two output levels*: https://www.volkswagen-newsroom.com/en/the-new-golf-gti-and-golf-gti-clubsport-18404/the-legendary-gti-turbocharged-engine-in-two-output-levels-18408 (output figures, two performance classes). |
| [MT] | MotorTrend/AOL — *VW Is Spreading the GTI Engine Further Across Its European Lineup*: https://www.aol.com/vw-spreading-gti-engine-further-172200410.html (2025 Tiguan/Tayron/Passat get the engine: 261 hp / 295 lb-ft ≈ 195 kW / 400 N·m higher-output tune). |

---

## Per-part audit (planned model — 27 parts)

Verdict legend: ✅ accurate · ⚠️ partially right / needs a note · ➖ generic (no
EA888-specific source, standard practice).

| # | Part (id) | Modeled as | Verdict | Citation / Remark |
|---|-----------|-----------|---------|-------------------|
| 1 | Cylinder Block (`cylinder-block`) | **Cast-iron** crankcase, 4 cylinders, two balance shafts | ✅ | The EA888 2.0 uses a **grey cast-iron** block (unlike the aluminium S58/B48/Skyactiv blocks) and carries two balance shafts: [MR]. *Teaching contrast:* iron block. |
| 2 | Cylinder Head (`cylinder-head`) | DOHC 16-valve aluminium head with the **exhaust manifold cast into it** | ✅ | The exhaust manifold is **integrated into the cylinder head** and liquid-cooled — an EA888 hallmark since Gen 3: [MR], [SG], [APTI]. *Therefore there is no separate exhaust-manifold part* (see Distinctive #1). |
| 3 | Valve Cover (`valve-cover`) | Cover with PCV / oil separation | ➖ | Standard practice; no EA888-specific source. |
| 4 | Intake Camshaft (`camshaft-intake`) | Actuates intake valves; VVT-phased | ✅ | Variable valve timing on the intake cam: [MR]. |
| 5 | Exhaust Camshaft (`camshaft-exhaust`) | Actuates exhaust valves (VVT, **AVS** lift on some); drives the HPFP | ✅ | VVT + Audi Valvelift (two-stage exhaust lift) on some variants: [MR]. Cam-driven 500-bar HPFP: [APTI]. *Remark:* AVS is variant-dependent and not separately modeled. |
| 6 | Crankshaft (`crankshaft`) | Forged steel, 5 mains, **50 mm** crankpins | ✅ | evo5 enlarged crankpins **47.8 → 50.0 mm**: [APTI]. I4 → 5 mains (standard, not separately cited). |
| 7 | Pistons & Rods ×4 (`piston-1…4`) | Turbo DI pistons; **140 mm** con-rods | ✅ | evo5 shortened the con-rod **144 → 140 mm** (Miller-cycle geometry): [APTI]. |
| 8 | Harmonic Damper (`harmonic-damper`) | Crank-nose damper; drives accessory belt | ➖ | Standard practice; no EA888-specific source. |
| 9 | Timing Cover (`timing-cover`) | Seals the front chain drive; front crank seal | ✅ | Chain-driven timing: [MR]. Cover detail is generic. |
| 10 | Camshaft Phasers (`cam-phasers`) | Hydraulic VVT phasers on **both** cams | ✅ | Dual VVT: [MR]. *Remark:* both phasers as one service unit; reuses the `vanos` builder as a visual proxy. |
| 11 | Timing Chain & Guides (`timing-chain`) | Chain drive, front, hydraulically tensioned | ✅ | Chain drive: [MR]. |
| 12 | VGT Turbocharger (`turbo`) | **Variable-geometry** single turbo, water-cooled | ✅ | evo5 adopts a **variable-geometry turbocharger** (notable on a gasoline engine) for higher boost and faster response: [APTI]. *Teaching contrast:* twin-scroll (B48) vs twin mono-scroll (S58) vs VGT (EA888). |
| 13 | Intake Manifold w/ Charge Cooler (`intake-manifold`) | Plenum with **integrated air-to-water** intercooler | ✅ | Air-water heat exchanger **integrated in the inlet manifold**, close-coupled for throttle response: [APTI]. |
| 14 | Throttle Body (`throttle-body`) | Electronic throttle metering airflow | ➖ | Standard practice; no EA888-specific source. |
| 15 | HP Fuel Rail (`fuel-rail`) | Stores fuel up to **500 bar**, feeds 4 DI injectors | ✅ | evo5 DI rail pressure raised **350 → 500 bar**: [APTI]. |
| 16 | Direct Injectors ×4 (`injector-set`) | Solenoid **DI**, one per cylinder, 500 bar | ✅ | High-pressure direct injection: [APTI]. Modeled as one service set of four. |
| 17 | Port Injectors ×4 (`port-injectors`) | Low-pressure **MPI** port injectors | ✅ | The EA888 combines **direct (FSI) + port (MPI)** injection to cut intake-valve carbon and aid part-load efficiency: [MR], [SG]. *Distinctive — see #2.* |
| 18 | HP Fuel Pump (`hp-fuel-pump`) | **Single** cam-driven pump, 500 bar | ✅ | Single cam-driven HPFP feeding the 500-bar rail: [APTI]. |
| 19 | Coolant Pump (`water-pump`) | Mechanical pump; main coolant circuit | ➖ | Standard practice; no EA888-specific source. |
| 20 | Electric Coolant Pump (`electric-coolant-pump`) | Auxiliary pump for split-cooling / thermal management | ✅ | The EA888 uses an **electric coolant pump + split cooling circuit** (thermal-management module) for fast warm-up: [APTI], [MR]. Reuses the `electricPump` builder. |
| 21 | Thermostat / Thermal-Management Module (`thermostat-housing`) | Map/rotary-valve coolant control | ✅ | Active thermal management (rotary/electronic coolant control) is part of the evo family's efficiency package: [APTI]. *Remark:* exact rotary-valve detail not page-pinned. |
| 22 | Oil Filter Housing (`oil-filter-housing`) | Cartridge filter; oil routing | ➖ | Standard practice; no EA888-specific source. |
| 23 | Oil Pan / Sump (`oil-pan`) | Holds oil; level/temperature sensing | ➖ | Standard practice; no EA888-specific source. |
| 24 | Oil Pump + Balance Shafts (`oil-pump`) | Variable oil pump with **integrated balance-shaft module** | ✅ | The EA888 oil-pump / balance-shaft module carries the two chain-driven counter-rotating balance shafts: [MR]. *Remark:* shafts modeled as part of the pump assembly. |

*(Pistons 1–4 occupy one table row; total selectable parts: 27. There is **no** separate
exhaust-manifold part — it is integrated into the head, #2.)*

---

## Distinctive EA888 features (the teaching contrasts vs the other modules)

1. **Exhaust manifold integrated into the cylinder head** — water-cooled, cast into the head;
   there is no bolt-on manifold to remove. Contrast: S58 split 1–3 / 4–6 manifolds, B48
   twin-scroll manifold, Skyactiv-G long 4-2-1 header. **[MR]**, **[SG]**, **[APTI]**.
2. **Dual injection (DI + MPI)** — the only module here with **both** 500-bar direct injectors
   **and** low-pressure port injectors. **[MR]**, **[SG]**.
3. **Variable-geometry turbocharger (VGT)** — variable vanes rather than a fixed scroll +
   wastegate; rare on a gasoline engine. Contrast with the twin-scroll/mono-scroll turbos and
   the naturally-aspirated Skyactiv-G. **[APTI]**.
4. **Cast-iron crankcase + balance shafts** — an iron block (vs the aluminium blocks of the
   other modules) and a Lanchester balance-shaft module. **[MR]**.
5. **More extreme Miller cycle + 12.5:1 CR + 38 % thermal efficiency** — early intake-valve
   closing with high geometric compression. **[APTI]**.

## A. Parts deliberately NOT modeled (present on the real engine, omitted on purpose)

1. **Separate exhaust manifold** — **correctly absent**: it is cast into the head (#2 above).
   **[MR]**, **[APTI]**.
2. **Gasoline particulate filter (GPF) / catalytic converter** — vehicle-level exhaust
   aftertreatment, out of the on-engine model scope (consistent with the S58 module). **[APTI]**.
3. **AVS two-stage valve lift** — variant-dependent; documented in the exhaust-cam copy but not
   modeled as separate hardware. **[MR]**.
4. *(Vehicle-level / out of scope, as in the other modules)* belt drive / alternator /
   accessories, ignition coils & spark plugs, low-pressure in-tank fuel pump, evaporative
   canister, dual-mass flywheel and clutch.

## B. Simplified representations (documented per PRD accuracy rules)

- **Camshaft phasers** — both VVT phasers as one service unit (`cam-phasers`), reusing the
  `vanos` geometry builder as a visual proxy. **[MR]**.
- **Direct injectors / port injectors** — each set of four modeled as one service set
  (`injector-set`, `port-injectors`). **[MR]**, **[APTI]**.
- **Balance shafts** — modeled as part of the `oil-pump` module rather than separate shafts.
  **[MR]**.
- **Timing chain/guides/tensioner** — one assembly (`timing-chain`).
- **Pistons/rings/pin/rod** — one assembly per cylinder (`piston-1…4`).
- **Integrated exhaust manifold** — represented within the `cylinder-head` mesh, not as a
  removable part. **[MR]**, **[APTI]**.

## C. Verified core specs (for the simulation)

Displacement **1,984 cc**, bore × stroke **82.5 × 92.8 mm**, con-rod **140 mm**, crankpin
**50.0 mm**, compression **12.5:1** (PC2; PC1 10.5:1), firing order **1-3-4-2**, peak
**≈ 195 kW (265 PS) / ≈ 400 N·m**, turbocharged (**VGT**), EGT up to **1,020 °C** —
all from **[APTI]**, **[MR]**, **[VWN]**, **[MT]**.

*Remark — redline / recip mass:* a precise published redline and reciprocating mass were not
located; a module should use ~**6,500 rpm** and an estimated recip mass, flagged here so they
are not mistaken for sourced figures. Revisit with a VW workshop manual.

---

*Audit date: 2026-06-13. Calibration target: EA888 evo5 PC2 high-output, 12.5:1, ≈195 kW /
400 N·m. Reconcile this file with the engine module (`src/engines/<id>/parts.ts`) if one is
authored.*
