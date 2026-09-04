# Project Progress

**Project**: Macrodork
**Started**: 2026-08-28
**Last updated**: 2026-09-04 (project identity: upstream vendor named only in NOTICE.md and docs/upstream/; `print/` STLs now generated, not stored)
**Repository**: to be republished under the Macrodork name (the earlier `microduck-replica` repository name is retired)

---

## Goal

Build **Macrodork**, an open replica of an upstream commercial bipedal robot duck (25 cm, $399 retail, on sale Christmas 2026; see [Upstream Provenance](docs/upstream/provenance.md)).
The official software is open source; the hardware is **partly open** - **the HAT board has a complete KiCad project and production files**
([`elec_RPI_Robot_HAT`](https://github.com/pollen-robotics/elec_RPI_Robot_HAT), Apache-2.0),
but the `imu_to_dxl` board, editable mechanical CAD, the whole-robot BOM and the assembly documentation have not been published.

> **Correction 2026-09-03**: this was previously recorded as "hardware not open source, no PCB schematics". **That judgement was wrong.**
> The cause: only the `microduck` main repo was searched, and the `elec_`-prefixed hardware repositories under the same organisation were missed.

This project recovers everything needed for a mechanical replica from the officially published **MJCF simulation model + 47 STLs**.

---

## Overall Status

| Area | Status | Notes |
|---|---|---|
| Part geometry | ✅ Done | 47 STLs |
| Assembly relationships | ✅ Done | Accurate to 0.1 mm, exploded views produced |
| CAD assemblies | ✅ Done | World transforms applied, import directly |
| Joint parameters | ✅ Done | Axes and travel of the 14 controlled joints |
| Mass / inertia | ✅ Done | 15 rigid bodies |
| Fastener list | ✅ Done | Reverse-engineered from hole features, M2 system |
| Actuator selection | ✅ Done | XL330 ×15, BAM M6 parameters |
| Bearing specs | ✅ Done | Ø22×16×4, Ø15×10×3 |
| **Electronics** | ✅ Done | Fully recovered from the Rust source, see "Batch 6" |
| Main board selection | ✅ Done | **Radxa Zero 3W, off-the-shelf module**, not a custom carrier |
| **HAT board** | ✅ Officially open source | KiCad + Gerbers + BOM + pick-and-place, order directly (4-layer board) |
| **`imu_to_dxl` board** | ⚠️ Must be redrawn | No public project anywhere; chips / addresses / protocol fully recovered |
| **Cable routing** | ❌ Missing | Nothing published officially |
| **Control software** | ✅ Usable | Same main board → the official Rust runtime runs as-is; porting only needed if the main board changes |
| **Policy retraining** | ✅ Not required | Same hardware → the official 9 ONNX policies work as-is; retraining only needed if the body / electronics change |

---

## Completed

### Batch 1 · Initial survey

- ~~Confirmed **the upstream hardware is not open source**~~: the `microduck` repo is all Rust software,
  the 5 subdirectories under `docs/` are all software docs, and a repo-wide search finds no `.stl/.step/.f3d/bom` files
  - **this conclusion was wrong** (corrected 2026-09-03). Only the main repo was checked, not the `elec_`-prefixed
  hardware repos under the same organisation; **the HAT board is fully open source in [`elec_RPI_Robot_HAT`](https://github.com/pollen-robotics/elec_RPI_Robot_HAT)**
  (Apache-2.0, including KiCad + Gerbers + BOM + pick-and-place).
  Lesson: when judging "did project X open-source part Y", search the **whole organisation**, not just the main repo.
- Confirmed **`microduck_rl` contains 47 STLs + the complete MJCF**; this is the only source of geometry
- Confirmed **the 3D model license is CC BY-NC-SA** (non-commercial); the code is Apache-2.0
- Ruled out the Open Duck Mini v2 route (see "Decision Log")

### Batch 2 · Assembly drawings

- Off-screen rendering with MuJoCo, white skybox, 1600×2100
- 4 regular views + 2 exploded views + 1 color-coded reference
- Exploded views offset level by level along the kinematic chain (48 mm per level); the further down the chain, the further out
- Implemented the world-to-pixel projection myself, for drawing label leaders and collision-avoiding layout
- Output: `assembly-drawings/` (7 images), script `scripts/render_assembly.py`

### Batch 3 · CAD assemblies

- The 47 upstream STLs are all in **their own part coordinate frames**; importing them directly into CAD piles everything at the origin
- Took each geom's world transform from the MJCF, applied it, and exported grouped by rigid body
- Output: `cad/` - whole robot in one file (796792 triangles) + 15 parts, units mm
- Measured whole-robot envelope **144 × 141 × 264 mm** (matches the official 25 cm figure)
- Script `scripts/export_assembly_stl.py`

### Batch 4 · Fastener reconstruction

- Wrote hole-feature recognition: weld vertices → build face adjacency graph → split smooth patches at a 35° dihedral angle
  → fit a cylinder to each patch (axis = eigenvector of the normal covariance with the smallest eigenvalue) → project and fit a circle for the diameter
  → classify hole / boss by normal orientation
- Scanning all 47 parts takes 2.5 s
- Output: `docs/fastener-reconstruction.md`, `docs/hole_analysis.json`, `scripts/analyze_holes.py`

### Batch 10 · English documentation

- Background: the awesome list that picked us up specifically flagged "In Chinese"; traffic data showed only 5 visits from Google
  vs 132 from Bing - the English-speaking world basically had not arrived
- Prioritised by traffic: translated the hardware teardown first (2nd most-visited page on the site, 84 visits),
  because it is **content that exists nowhere else** - the 3D anatomy page by HF staffer @mishig25 (36k views)
  already covers the "what does the whole robot look like" layer, and the spec-type documents overlap with it,
  whereas chip addresses, bus protocol and the 12-byte data block layout exist only in this repository
- Output: `docs/hardware-teardown.md` (426 lines) + `docs/actuator-selection.md` (459 lines),
  each cross-linked with the Chinese version at the time
- The English README's document index switched to a 🇬🇧 marker for which documents had English versions

### Batch 9 · Actuator selection analysis

- Answered two frequent questions: why servos rather than closed-loop steppers; can the cheap STS3215 be swapped in without changing mechanical parts
- **Hard-data comparison**: both are 15-body bipedal ducks - the XL330 version is **737.2 g** vs **2107.1 g** for the STS3215 version,
  a 2.86× difference - Open Duck Mini v2 *is* "the STS3215 answer" (42 cm / 2.1 kg)
- **Actuator parameter comparison**: kp differs 32×, forcerange 3.5×, damping and frictionloss 11× each,
  armature 15.5× - every item differs by an order of magnitude
- Counter-intuitive finding: the XL330 is modeled with *more* backlash (±1.0° vs ±0.5°)
- Conclusion: **there is no middle road** - keep the XL330 (¥4500 in servos) or switch to the STS3215
  (which amounts to building Open Duck Mini v2)
- **Added a cross-comparison of same-class servos**: Feetech STS3032 (20 g / 23.2×12.1×28.5 mm / 0.44 N·m /
  4.8–6 V) is even smaller than the XL330 at comparable weight, but about 85% of the torque (at the same voltage) with a 6 V ceiling;
  the SCS0009 is only 11 g but only 0.23 N·m (upstream uses it on their Amazing Hand)
- Conclusion: the gap is clearly "18–20 g / ≥0.9 N·m / 7.4 V / bus"; currently only Robotis fills it
- **Deep assessment of the Unitree S288** (read the full 11-page official manual): 19.5 g / 34×20×23 mm /
  **gear ratio 288.35:1, identical to the XL330** / M2 mounting / single-wire half-duplex - mechanically almost a drop-in
- Two substantive upgrades in the S288: **impedance control** (τ = τ_ff + k_p·Δp + k_d·Δω) and an
  **output-side encoder** (OutPos, 13-bit) - the latter eliminates the entire complexity of backlash modeling outright
- Three hard constraints on the S288: 12.6 V (3S) vs the 7.4 V (2S) used here;
  the bus address space is only 0–14 and cannot fit a 16th device (the IMU would have to go over SPI);
  **the torque rating is questionable** (neither the rotor-side nor the output-side reading adds up); four questions to put to the vendor are listed
- Output: rewrote `docs/actuator-selection.md` (106 → 424 lines)

### Batch 8 · X community intelligence and external verification ⭐

- Read public X posts via opencli's twitter read commands (search / thread)
- **Key win: the reverse-engineering conclusions received independent external verification** - @tspy's hardware teardown (169 likes)
  independently lists Radxa ZERO 3W / RK3566, exactly matching this repository
- Recorded popularity data: the three official posts total about 8.6 million views; GitHub stars grew 3.7× in three days
- Recorded community derivative work (R2D2 voice synthesis, laser-pointer tracking, somersaults, breakdancing)
- **Identified and flagged noise**: lots of meme coins riding the hype; "Microdino" was checked - its replies are
  full of scam accusations and it is evasive about CAD questions, **judged untrustworthy, not cited**
- Stated one premise clearly: **as of 8/31 there was no physical unit on the market**; every public teardown is inference, not a physical disassembly
- Output: `docs/community-intelligence.md` (150 lines)

### Batch 7 · Cross-check against official specs + community news

- Official launch on 2026-08-27 published partial specs; **compared item by item** against this repository's reverse-engineering results
- Mutually confirmed: RK3566 / NP-F550 / 8×8 ToF / 140 mm width all match
- Officially filled in: RAM 1 GB + 32 GB eMMC (**exactly the Radxa Zero 3W SKU, which corroborates the main-board conclusion**; not evidenced in source; for a replica we recommend 2G/16G),
  NPU 0.8 TOPS, dual NFC antennas
- Unique to the reverse-engineering: main board model, main bus scheme, all chip addresses and protocols
- **Found one contradiction**: the official spec lists 2 IMUs, but only 1 is in use in the source (the BMI088 is marked dormant)
- Recorded the official open-source position: the upstream vendor explicitly asked the press **not** to call it "open-source hardware" (but added "for now")
- Recorded three community issues left without a reply (#175 STEP / #173 print source files / #174 power-board schematic)

### Batch 6 · Hardware teardown ⭐

- Approach: **a runtime that drives real hardware must hard-code device paths, I2C addresses, register offsets,
  baud rates and protocols - the code is the datasheet**
- Dug the complete electronics scheme item by item out of `duck-control/src/{model,imu,bus}.rs`, `deploy/*.dts`, `deploy/robotd.toml`,
  `tof/`, `mediad/`
- Output: `docs/hardware-teardown.md` (394 lines, full derivation) + `docs/hardware-spec-sheet.md` (270 lines, one-page reference)

### Batch 5 · Actuator selection

- Compiled the BAM M6 configuration, the three domain-randomization ranges, and the backlash-encoder modeling
- Extracted the 5 native PD parameter sets from BAM measurements in `joints_properties.xml`
- Output: `docs/actuator-selection.md`

---

## Key Findings

1. **The whole robot is an M2 screw system.**
   Ø2.2 through-holes ×77, Ø4.4 counterbores ×28, Ø1.6 tap-drill holes ×20.
   Ø2.2 and Ø4.4 appear in pairs = the through-hole + counterbore combination of an M2 socket-head cap screw.
   Cross-check: `xl330.stl` itself has Ø2.0×4 + Ø1.6×8, matching the XL330's M2 mounting holes.
   About **146** through-holes across the structural parts.

2. **It is 15 servos, not 14.**
   The `xl330` mesh is referenced **15 times** in the whole-robot MJCF. 14 enter the policy action space
   (left leg 5 + neck/head 4 + right leg 5); the 15th drives the beak / lower jaw through the `passive_*` linkage.
   This agrees with the official README's "15 servos" - counting only the joint list misses it.

3. **The head is a quarter of the robot's weight.**
   Trunk 199 g, head assembly 189 g, whole robot 737 g. The center of mass sits high,
   which explains why its walking policy is hard to train.

4. **Backlash modeling is the key sim2real detail.**
   The real servo's magnetic encoder sits on the **output side** of the gear backlash; the firmware position loop closes on
   `main joint angle + backlash angle`; while the servo spins freely inside the dead zone the measured position does not change, and neither does the PD error.

5. **Building it yourself costs more than buying.**
   Fifteen XL330s range from $359 (ROBOTIS international) to €629 (MyBotShop) depending on channel,
   i.e. from slightly below to well above the robot's $399 retail price. Costing in BOM.md.

6. **⭐ The main board is an off-the-shelf module, not a custom carrier - the earlier judgement was wrong.**
   (Added 2026-08-31: this conclusion has been verified by @tspy's independent teardown on X.)
   The device tree hard-codes `compatible = "radxa,zero-3w", "rockchip,rk3566"`,
   which is the commercially available **Radxa Zero 3W** (Pi Zero form factor, 65×30 mm, matching the STL).
   This directly overturns the "electronics are a wall" conclusion.

7. **The IMU hangs on the Dynamixel bus, not on I2C.**
   Custom `imu_to_dxl` v2 board: LSM6DSV16X, bus ID 200, register 124, a 12-byte block
   (gyro 6 bytes + SFLP quaternion fp16 6 bytes). Read back in **the same sync_read** as the 15 servos,
   zero extra bus overhead, no host-side sensor fusion.

8. **No fuel gauge, no ADC.**
   Pack voltage is read directly from the supply voltage the servos report over Dynamixel.
   So 6.6–8.2 V is the "usable range under load", not the cell range. A replica **does not need any battery-monitoring circuit**.

---

## Decision Log

| Decision | Outcome | Rationale |
|---|---|---|
| Replicate the upstream robot or build Open Duck Mini v2 | **Replicate the upstream robot** | The user explicitly wants that robot itself. Open Duck Mini v2 is fully open source (BOM / CAD / STL / assembly guide all present), but it is a different robot |
| Public or private repository | **Public** | User's choice. CC BY-NC-SA allows redistribution; attribution, share-alike and non-commercial notices are in place |
| Bundle the 6 upstream repos | **Do not bundle** | Re-hosting other people's code is inappropriate and loses upstream updates. Use `scripts/fetch_upstream.sh` + links instead<br>(2026-09-04: `print/` was briefly an exception; revised the same day - the STLs are no longer stored, `scripts/build_print_tree.py` generates them locally from the pinned upstream commit) |
| Project identity | **Macrodork; upstream vendor named only where attribution requires it** | Attribution consolidated in NOTICE.md, provenance in `docs/upstream/`, neutral vocabulary ("upstream") in the technical docs, Macrodork part names in `print/` (2026-09-04) |
| License | **Dual license** | `scripts/` is original → Apache-2.0; `assembly-drawings/` `cad/` are CC BY-SA-NC derivatives → same license under ShareAlike |
| What to do about the PCB wall | **Copy the mechanics + build the electronics** | 100% replication is impossible. The user says they can make PCBs themselves, so this route is viable |

---

## Next Steps

### High priority
- [ ] **Draw the `imu_to_dxl` board** - LSM6DSV16X + MCU (Dynamixel V2 slave) +
      half-duplex TTL transceiver. Protocol and register layout fully recovered; drawing can start now
- [x] ~~**Reverse-engineer the PCB outline**~~ - **obsolete**: the official KiCad project and Gerbers give the exact outline,
      hole positions and connector cutouts; no need to derive them from the STL
- [ ] **Decide whether to build the HAT board** - if you don't need audio recording / the speaker it can be skipped entirely,
      with the ToF hung directly on i2c3 and power from an off-the-shelf UBEC

### Medium priority
- [x] ~~Translate to English~~ **Done**: the hardware teardown / actuator selection / fastener reconstruction documents were all translated,
      plus the README - 4 bilingual documents. `community-intelligence.md` and `PROGRESS.md` were not translated -
      the former is time-sensitive and will go stale, the latter is internal progress
- [ ] `hardware-spec-sheet.md` not translated for now - high overlap with @mishig25's 3D anatomy Space
- [ ] **STL printability check** - verify whether the 47 meshes are watertight and free of non-manifold edges,
      to judge whether they can be sliced directly
- [ ] **Print-process assessment** - simulation meshes carry no fit tolerances; assess which holes need clearance
      and which faces need support
- [ ] **Cable-channel analysis** - derive feasible cable routes from the internal cavities of the assembly

### Low priority
- [ ] **Control software plan** - the Rust runtime is bound to the RK3566; assess the porting cost
      vs rewriting the control loop in Python
- [ ] **Policy retraining** - the official ONNX policies break after changing the electronics; retrain with `microduck_rl`
      (needs a CUDA GPU, or run on HuggingFace with `--hf-jobs`)

---

## Risks and Known Limitations

1. **Simulation STLs are not manufacturing files.** Simulation only guarantees outer shape and inertia, not fit tolerances,
   threads, heat-set insert bosses or cable clearance. Printing them directly will most likely not assemble.
2. **The fasteners are reverse-engineered, not from drawings.** Screw lengths are estimated from hole depth; they are ranges, not measurements.
   Print shrinkage also changes the actual hole diameter (on FDM, Ø2.2 typically comes out 0.1–0.3 mm undersize).
3. **The `imu_to_dxl` board must be redrawn.** No public project exists anywhere; it can only be designed from the recovered protocol.
   (The HAT board is officially open source including Gerbers and **is not a blocker**.)
4. **The official policies do not transfer.** After changing the electronics all 9 ONNX policies break and must be retrained.
5. **Non-commercial restriction.** All derived geometry is bound by CC BY-SA-NC and may not be used in commercial products.

---

## File Index

| Path | Contents |
|---|---|
| `README.md` | Project overview, assembly structure, joint parameters, feasibility analysis |
| `PROGRESS.md` | This document |
| `NOTICE.md` | Attribution and sources |
| `assembly-drawings/` | 7 assembly drawings |
| `cad/` | 16 STLs (whole robot + 15 parts) + parts manifest |
| `docs/fastener-reconstruction.md` | M2 screw system, purchase quantities, bearing specs |
| `docs/actuator-selection.md` | XL330 parameters, BAM M6, 5 calibrated PD sets, backlash modeling |
| `docs/hardware-spec-sheet.md` | One-page hardware spec sheet |
| `docs/hardware-teardown.md` | Full derivation of the electronics with evidence |
| `docs/community-intelligence.md` | X / GitHub intelligence, external verification, noise and risks |
| `docs/hole_analysis.json` | Raw hole-scan data |
| `scripts/` | Fetch upstream / render / export CAD / scan holes - 4 scripts |
