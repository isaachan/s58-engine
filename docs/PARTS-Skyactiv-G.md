# Skyactiv-G 2.0 Parts Audit & Citations

A per-part accuracy review for the planned **Mazda 2.0 Skyactiv-G** engine module
(`src/engines/skyactiv-g/`), checked against public references **before** the model is
authored. For every part the table records a **citation** (a source that supports the
claim) or, where no source could be located, a **remark**. End sections list parts that are
**deliberately not modeled**, parts that are **simplified**, and the **verified core specs**.

This file follows the same conventions as [`docs/PARTS-S58.md`](PARTS-S58.md): the model is
**procedural and stylized**, so this audit checks the **part list and textual metadata**
(name, function, location, system, removal relationships) — not mesh geometry or coordinates.

## Calibration target & variant

The Skyactiv-G 2.0 (engine family code **PE-VPS**) appeared in the MX-5 ND in two states of
tune. This module calibrates to the **ND2 high-output** (2019+) version, and notes the ND1
figures where they differ — the same "pick the high-output variant and say so" convention the
B48 module used.

| Parameter | ND1 (2015–2018) | **ND2 (2019+) — calibration target** |
|---|---|---|
| Power | 118 kW (160 PS) | **135 kW (181 hp / 184 PS) @ 7,000 rpm** |
| Torque | 200 N·m @ ~4,600 rpm | **205 N·m @ 4,000 rpm** |
| Redline | ~6,800 rpm | **7,500 rpm** |
| Internals | — | lighter pistons (−27 g) & con-rods (−41 g), strengthened crank, dual-mass flywheel |

Shared across both: **1,998 cc**, bore/stroke **83.5 / 91.2 mm**, **DOHC chain drive**,
**Dual S-VT** (variable timing on both cams), **direct injection (~200 bar)**, signature
**4-2-1 long-tube exhaust manifold**, **cavity pistons**, firing order **1-3-4-2**.
Compression is **13.0:1** in the US and other regular-fuel markets, **up to 14.0:1** elsewhere;
this module uses **13.0:1** and states the family range. **Naturally aspirated** — no
turbocharger, no charge-air cooler (the headline contrast with the S58 and B48 modules).

## Sources

| Code | Source |
|------|--------|
| **[WIKI-ND]** | Wikipedia — *Mazda MX-5 (ND)*: https://en.wikipedia.org/wiki/Mazda_MX-5_(ND) (ND2 output, redline, dual-mass flywheel, direct injection). |
| **[WIKI-SKY]** | Wikipedia — *Skyactiv*: https://en.wikipedia.org/wiki/Skyactiv (4-2-1 exhaust, cavity pistons, 13:1 US / up-to-14:1 CR, DI, Dual S-VT). |
| [MR] | MotorReviewer — *Mazda 2.0 SkyActiv-G*: https://www.motorreviewer.com/engine.php?engine_id=95 (code PE-VPS, 83.5×91.2 mm, 14.0:1 / 13.0:1 US, Dual S-VT with roller-follower rocker arms, DI up to 200 bar, firing order 1-3-4-2, timing chain). |
| [M1] | Motor1 — *Mazda PE-VPS, the refined 2.0 SKYACTIV-G engine for the MX-5*: https://www.motor1.com/news/693621/mazda-skyactive-g-engine-mx5/ |
| [UHS] | UnderhoodService / BrakeAndFrontend — *Mazda's SKYACTIV Technology*: https://www.underhoodservice.com/mazda-s-skyactiv-technology/ (4-2-1 header role, cavity-piston combustion, DI residual-gas control). |
| [CS] | Carscoops — *2019 Mazda MX-5 Unveiled … 181 HP And 7,500 RPM Redline*: https://www.carscoops.com/2018/06/2019-mazda-mx-5-miata-unveiled-japan-181-hp-7500-rpm-redline/ |
| [AE] | autoevolution — *2019 Mazda MX-5 (ND2) … 181 Horsepower, Minor Upgrades*: https://www.autoevolution.com/news/2019-mazda-mx-5-miata-nd2-coming-with-181-horsepower-minor-upgrades-124887.html (piston −27 g, con-rod −41 g, new heads, higher intake/exhaust flow). |

---

## Per-part audit (planned model — 25 parts)

Verdict legend: ✅ accurate · ⚠️ partially right / needs a note · ➖ generic (no
Skyactiv-specific source, standard practice).

| # | Part (id) | Modeled as | Verdict | Citation / Remark |
|---|-----------|-----------|---------|-------------------|
| 1 | Cylinder Block (`cylinder-block`) | Open-deck aluminium crankcase, 4 cylinders | ✅ | Aluminium Skyactiv-G block: [MR], [WIKI-SKY]. *Remark:* Skyactiv-G uses an **open-deck** aluminium block; deck type not page-pinned, stated as standard Skyactiv practice. |
| 2 | Cylinder Head (`cylinder-head`) | DOHC aluminium head, 16 valves, central DI, cavity-piston combustion | ✅ | DOHC 16-valve; ND2 received **new cylinder heads** with higher intake/exhaust flow: [AE]; combustion design (DI + cavity piston): [UHS], [WIKI-SKY]. |
| 3 | Valve Cover (`valve-cover`) | Cover with PCV/oil separation | ➖ | Standard practice; no Skyactiv-specific source. |
| 4 | Intake Camshaft (`camshaft-intake`) | Actuates intake valves; **S-VT** phased | ✅ | Dual S-VT — variable timing on the **intake** cam: [MR], [WIKI-SKY]. Roller-follower rocker-arm valvetrain: [MR]. *Note:* no Valvetronic-style variable lift — load is set by the **throttle** (see #16, contrast with S58/B48). |
| 5 | Exhaust Camshaft (`camshaft-exhaust`) | Actuates exhaust valves; **S-VT** phased; drives the HPFP | ✅ | Dual S-VT on the **exhaust** cam: [MR], [WIKI-SKY]. Cam-driven single high-pressure pump: [MR] (DI). |
| 6 | Crankshaft (`crankshaft`) | Forged steel, 5 main bearings | ✅ | I4 → 5 mains. ND2 **strengthened crankshaft** for the higher redline: [AE]. *Remark:* 5-main-bearing count is standard for this layout, not separately page-cited. |
| 7 | Pistons & Rods ×4 (`piston-1…4`) | Lightweight **cavity-top** pistons, lighter rods | ✅ | Cavity (bowl) pistons are a core Skyactiv-G feature: [UHS], [WIKI-SKY]. ND2 reduced piston mass by ~27 g and rod mass by ~41 g: [AE]. |
| 8 | Harmonic Damper (`harmonic-damper`) | Crank-nose damper; drives accessory belt | ➖ | Standard practice; no Skyactiv-specific source. |
| 9 | Timing Cover (`timing-cover`) | Seals the front chain drive; front crank seal | ✅ | Front **timing chain** drive: [MR]. Cover detail is generic. |
| 10 | Dual S-VT Phasers (`svt-phasers`) | Hydraulic cam phasers on **both** cams | ✅ | Dual Sequential Valve Timing on intake **and** exhaust: [MR], [WIKI-SKY]. *Remark:* both phasers modeled as one service unit; reuses the `vanos` builder (visual proxy, not a BMW VANOS). |
| 11 | Timing Chain & Guides (`timing-chain`) | Chain drive, front, hydraulically tensioned | ✅ | Timing **chain** with automatic tensioner: [MR]. |
| 12 | 4-2-1 Exhaust Manifold (`exhaust-manifold`) | Long-tube **4-into-2-into-1** header | ✅ | Signature Skyactiv-G long 4-2-1 header that cuts residual gas to enable the high CR: [UHS], [WIKI-SKY]. **Key teaching point vs the turbo modules** (which feed a turbine close-coupled to the head). |
| 13 | Intake Manifold (`intake-manifold`) | Plenum + runners feeding 4 cylinders; **no charge cooler** | ✅ | Naturally aspirated → **no intercooler/charge cooler**: [WIKI-SKY], [WIKI-ND]. ND2 received an **optimized air intake**: [AE]. *Contrast:* S58/B48 manifolds carry an air-to-water charge cooler; this one does not. |
| 14 | Throttle Body (`throttle-body`) | Electronic throttle **metering airflow** (primary load control) | ✅ | On a Skyactiv-G (no variable-lift system) the **throttle is the primary load control** — unlike the Valvetronic S58/B48 where it is normally wide open. Reasonable as modeled. |
| 15 | High-Pressure Fuel Rail (`fuel-rail`) | Stores fuel up to **~200 bar**, feeds 4 injectors | ✅ | DI rail pressure **up to ~200 bar (≈2,900 psi)**: [MR]. *Note:* much lower than the S58/B48 **350 bar** — a deliberate spec contrast. |
| 16 | Direct Injectors ×4 (`injector-set`) | Multi-hole **solenoid** DI, one per cylinder, spraying into the piston cavity | ✅ | Gasoline direct injection into the cavity piston: [UHS], [WIKI-SKY], [MR]. Modeled as one service set of four. |
| 17 | High-Pressure Fuel Pump (`hp-fuel-pump`) | **Single** cam-driven pump | ✅ | Single engine-driven HPFP for DI: [MR]. *Contrast:* S58 has **two**; B48 and this engine have **one**. |
| 18 | Coolant Pump (`water-pump`) | Belt/mechanically driven; circulates block + head coolant | ➖ | Standard practice; no Skyactiv-specific source. Single main coolant circuit (no separate low-temp charge-cooler loop, since NA). |
| 19 | Thermostat Housing (`thermostat-housing`) | Engine thermostat | ➖ | Standard practice; no Skyactiv-specific source. |
| 20 | Oil Filter Housing (`oil-filter-housing`) | Cartridge filter; oil routing | ➖ | Standard practice; no Skyactiv-specific source. |
| 21 | Oil Pan / Sump (`oil-pan`) | Holds oil; oil-level/temperature sensing | ➖ | Standard practice; no Skyactiv-specific source. |
| 22 | Oil Pump (`oil-pump`) | Crank-driven, **variable-displacement** | ✅ | Skyactiv-G uses a **variable-flow oil pump** to cut pumping losses (efficiency focus): [WIKI-SKY]. *Remark:* exact control strategy not page-pinned. |

*(Pistons 1–4 occupy rows 7a–7d; the table lists the assembly once. Total selectable parts: 25.)*

---

## A. Parts deliberately NOT modeled (present on the real engine, omitted on purpose)

1. **Turbocharger / charge-air cooler** — **correctly absent**: the Skyactiv-G 2.0 is
   **naturally aspirated**. [WIKI-ND], [WIKI-SKY]. This is the headline architectural contrast
   with the S58 and B48 modules and is reflected in the flow model (`peakBoostBar: 0`).
2. **Valvetronic / variable valve lift** — **correctly absent**: Mazda controls load with the
   **throttle** and **Dual S-VT timing**, not a variable-lift mechanism. [MR], [WIKI-SKY].
3. **Piston oil-spray cooling jets** — **not modeled**: no reviewed source confirms oil-squirter
   piston cooling on the PE-VPS, so adding them would invent an unverified part. Revisit if a
   Mazda workshop manual confirms them. (The S58/B48 modules *do* model jets, which are
   documented for those engines.)
4. **Cooled EGR** — later/larger Skyactiv-G variants use cooled EGR; not confirmed for this
   PE-VPS MX-5 application from reviewed sources, so omitted.
5. *(Vehicle-level / out of scope, as in the S58 module)* belt drive / alternator / accessories,
   ignition coils & spark plugs, low-pressure in-tank fuel pump, catalytic converter / downpipe,
   evaporative-emissions canister, the dual-mass flywheel ([WIKI-ND], ND2) and clutch.

## B. Simplified representations (documented per PRD accuracy rules)

- **Dual S-VT phasers** — both cam phasers as one service unit (`svt-phasers`), reusing the
  `vanos` geometry builder as a visual proxy. **[MR]**.
- **Injectors** — four DI injectors modeled as one service set (`injector-set`). **[MR]**.
- **Timing chain/guides/tensioner** — one assembly (`timing-chain`). **[MR]**.
- **Pistons/rings/pin/rod** — one assembly per cylinder (`piston-1…4`).
- **Cavity-piston bowl, valves/springs/roller-followers** — not individually modeled; noted in
  the relevant parts' `simplified` fields. **[UHS]**, **[MR]**.

## C. Verified core specs (used by the simulation)

Displacement **1,998 cc**, bore × stroke **83.5 × 91.2 mm**, compression **13.0:1**
(family range up to 14.0:1), firing order **1-3-4-2**, redline **7,500 rpm** (ND2),
peak **135 kW @ 7,000 rpm** / **205 N·m @ 4,000 rpm**, **naturally aspirated** —
all from **[MR]**, **[WIKI-ND]**, **[WIKI-SKY]**, **[CS]**.

*Remark — connecting-rod length:* no reviewed source gives the PE-VPS rod length. The scene
kinematics use an estimated value (`rodM ≈ 0.139 m`); this drives only the stylized
slider-crank animation, not any cited claim. Flagged here so it is not mistaken for a sourced
figure. Revisit with a Mazda workshop manual.

---

*Audit date: 2026-06-12. Calibration target: MX-5 ND2 (2019+) 2.0 Skyactiv-G PE-VPS, 13.0:1.
Reconcile this file with `src/engines/skyactiv-g/parts.ts` if part metadata changes.*
