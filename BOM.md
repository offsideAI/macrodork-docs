# Bill of Materials (BOM)

Everything needed to build one Macrodork. Quantities come from geom references in upstream
`robot_walk.xml` (**38 mesh types / 75 instances**) - counted, not estimated.

> ⚠️ **Upstream has never published a BOM.** This list is reconstructed from the public MJCF, STLs,
> Rust source and KiCad project. Every entry cites its basis. Prices vary enormously by region and
> date - treat them as **order of magnitude only**.
>
> Checked: **2026-09-04**. Upstream baseline: every count below is taken from upstream commit
> **`d424a0c`** (2026-08-27), the commit `scripts/build_print_tree.py` pins. The later upstream
> re-export `8dfc08f` (2026-09-01) has not been re-counted; see [Upstream Provenance](docs/upstream/provenance.md).

---

## 1. Cost at a glance

| Category | Qty | Order of magnitude |
|---|---|---|
| **Servos** | 15 | **$359 – €629** (huge regional spread, see below) |
| Compute and sensors | 4 items | ~$80 – 120 |
| Battery and power | 2 items | ~$30 – 50 |
| Bearings | 14 | ~$15 – 30 |
| Fasteners | ~325 pieces | ~$15 – 25 |
| **PCB fabrication (2 boards)** | 2 | ~$60 – 150 with assembly |
| Filament | - | ~$15 – 30 |

**The servos dominate**, and the channel spread is enormous: ROBOTIS international at $23.90 × 15 is
**$359** (below the robot's retail price), ROBOTIS US at $27.49 × 15 is **$412** (about equal to it), and
European inc-VAT retail runs **€603–629** (far above).

> $399 is Seeed-scale manufacturing with the upstream vendor's supply chain. **An individual build cannot reach it.**

---

## 2. Servos (the cost centre)

| Part | Qty | Basis |
|---|---|---|
| **Dynamixel XL330-M288-T** | **15** | the `xl330` mesh is referenced 15× in `robot_walk.xml` |

- 14 are in the policy action space; **the 15th is the mouth** (`JOINT_NAMES[9] = "mouth"`,
  `MOUTH_INDEX = 9`), which never enters the policy action space (every alpha policy is
  61-dim observation / 14-dim action).
  ⚠️ **This joint does not exist in the MJCF at all** - `robot_walk.xml` has only 14 hinge joints /
  14 actuators; in every MJCF the mouth is rigidly merged into the `jaw_soft` body, and the
  `passive_*` default class has zero references in the walking model
- IDs: left leg 20–24 / neck-head-mouth 30–34 / right leg 10–14
- ⚠️ **The model number is inferred.** The source only carries `motor_name="xl330"` with no suffix.
  Evidence for M288-T: [actuator selection](docs/actuator-selection.md#how-the-model-number-was-pinned-down)

**Prices** (2026-09-04):

| Source | Each | ×15 |
|---|---|---|
| Robotis US | **$27.49** | **$412** |
| Generation Robots (EU, ex-VAT) | €33.50 | €503 |
| Generation Robots (EU, inc-VAT) | €40.20 | €603 |
| MyBotShop | €41.95 | €629 |

> ⚠️ **Over-voltage warning**: the XL330 is rated 3.7–6.0 V, and the upstream design feeds it 6.6–8.2 V.
> In the official HAT schematic the Dynamixel connectors sit directly on `+BATT` (raw battery voltage);
> the only 5 V buck on the board feeds the Raspberry Pi. This is a deliberate upstream choice, not a typo.
> See [the voltage truth](docs/actuator-selection.md#-the-voltage-truth-the-xl330-is-run-over-voltage).

> 🛒 **Domestic (China) sourcing, with live Taobao links**: [electronics sourcing list](docs/electronics-sourcing-list.md)
> (compute / camera / ToF / power / PCBs / cables) and
> [mechanical sourcing list](docs/mechanical-sourcing-list.md) (bearings / fasteners / heat-set inserts / thread locker / filament).

---

## 3. Electronics

| Part | Model | Qty | Basis / note |
|---|---|---|---|
| Compute | **Radxa Zero 3W** | 1 | device tree `compatible = "radxa,zero-3w"`. ⚠️ Several RAM/eMMC SKUs. The official release page (2026-08-27) states **1 GB / 32 GB**, but nothing in the `microduck/` source corroborates it (the source never reflects the board SKU anyway); **2G/16G recommended for a replica** - reasoning in the [electronics sourcing list](docs/electronics-sourcing-list.md#which-configuration-to-buy). The OS image must carry the Rockchip vendor kernel (Armbian family) or the NPU does not exist |
| Camera | Raspberry Pi Camera v2 (**IMX219**) | 1 | `setup-board.sh` applies the `radxa-zero3-rpi-camera-v2` overlay. ⚠️ **Mounted a quarter turn off; corrected in software.** The current code default in `mediad/src/main.rs:82` is `--rotate` **90**; the comment reads verbatim "the head camera is mounted **a quarter turn off**, and this is the one place that fact is written down". The 180° in `media-bringup.md:472` is **alpha-unit** data. **The code wins = 90°** |
| Depth | **VL53L8CX** or VL53L5CX module | 1 | firmware supports both, identified by revision ID; address `0x29` or `0x52`; Stemma/Qwiic |
| Battery | **Sony NP-F550** (2S, 7.4 V) | 1 | ⚠️ see correction below |
| Battery holder | Any NP-F series holder | 1 | Upstream only has the printed `power_support` - **no contact model at all**; you must solve the pickup yourself |
| Speaker | Small loudspeaker | 1 | `speaker` mesh ×1; the HAT carries a PAM8406 amplifier and Wago terminals |

### ⚠️ Battery correction: it is an NP-F550, not an F970

The upstream mesh is named `np_f970`, **and that is misleading**:

| | |
|---|---|
| Measured mesh bounding box | **70.8 × 38.6 × 20.6 mm** ← these are **NP-F550/F570** dimensions |
| A real NP-F970 | ~**60 mm** thick, ~300 g |
| Model named in the source | **only ever NP-F550** (`model.rs`, `robotd-design.md`); F970 appears nowhere in the tree |

**An F970 will not fit, and 300 g eats more than a third of the 800 g whole-robot budget.**
Earlier versions of this repository said "NP-F970" in several places; corrected throughout.

---

## 4. Circuit boards (2, both need fabricating)

### Board 1: RPI Robot HAT - published; download and order

| | |
|---|---|
| Source | [`pollen-robotics/elec_RPI_Robot_HAT`](https://github.com/pollen-robotics/elec_RPI_Robot_HAT) (Apache-2.0) |
| Production files | `production/`: Gerbers, BOM, pick-and-place, schematic PDF, STEP |
| **Layers** | **4** (`F.Cu / In1.Cu / In2.Cu / B.Cu`) |
| **Thickness** | **1.0 mm** (KiCad `(thickness 1)`. The 0.84 mm measured from the STL is a simulation-mesh approximation - order to the KiCad value) |
| Size | **65.0 × 30.9 mm** (measured from KiCad `Edge.Cuts`, R3.5 corners) - 0.9 mm wider than a Pi Zero |
| BOM | 47 lines / **123 parts**, of which **5 lines are DNP** |
| Placements | **117 rows** in `POS.csv`, including 3 fiducials (FID1–3) and H3 → **113 actual components** |
| Hand-solderable? | ❌ **No** - VQFN-32 codec and LGA-16 IMU. Order with SMT assembly |

**Key parts** (for costing and substitution):

| Ref | Part | Function |
|---|---|---|
| U2 | TLV320AIC3104IRHBR | Audio codec (I²C `0x18`) |
| U1 | PAM8406D | Class-D amplifier |
| MK1 | MEMS microphone (LCSC **C7587901**) | On-board. ⚠️ The official BOM's Value field only says `Microphone_MEMS` and the schematic only annotates "Onboard Mic." - **no specific part number is given**; the LMA2718 this repository used to cite had no source and has been withdrawn |
| U11 | BMI088 | IMU - **fitted but unused by software** (the so-called "second IMU") |
| U8 | SIT3088E | RS-485 transceiver |
| U10 | LM5050-1 | Ideal-diode OR-ing + shutdown detection. ⚠️ Sits on the `+5V` rail after the buck, not as reverse-polarity protection at the battery input |
| U9 | AP63205 | Buck converter |
| U4 | CAT24C32 | EEPROM - **DNP**, so this is not a self-identifying HAT |
| J13/J14 | JST EH 3P | Dynamixel **TTL** |
| J3/J11 | JST EH 4P | Dynamixel **RS-485** |
| J5–J8 | JST SH 1 mm 4P | Qwiic / Stemma (for the ToF) |

⚠️ **Before you order:**

1. **There is no charging circuit and no USB-C input on this board.** The
   `pwr_supply_charge.kicad_sch` in the repository is an **orphan sheet** (`main.kicad_sch` never
   instantiates it; its title block still names another project). Charge the battery externally.
2. **Opening the KiCad project requires [`lib_KiCAD`](https://github.com/pollen-robotics/lib_KiCAD)**,
   or it loads as a page of unresolved symbols. Not needed if you only fabricate - use the Gerbers.

### Board 2: `imu_to_dxl` - no public project exists anywhere; you must design it

| | |
|---|---|
| Status | 🔧 **being rebuilt in this repository**, see [hardware teardown §3](docs/hardware-teardown.md) |
| Function | Presents the IMU as a Dynamixel slave (ID **200**) on the servo bus |

**Reference BOM** (this repository's design, not official):

| Ref | Part | LCSC | Note |
|---|---|---|---|
| U1 | **STM32G031F8P6** | TBC | MCU, TSSOP-20. ⚠️ **This is this repository's suggestion, not a reverse-engineered fact** - the MCU on the official board cannot be recovered (see [hardware teardown](docs/hardware-teardown.md#so-what-mcu-is-on-the-imu_to_dxl-board)). F8 (64 KB Flash) over F6 (32 KB) leaves headroom for dual-protocol firmware; the LCSC number must be re-confirmed against the final part |
| U2 | **LSM6DSV16XTR** | `C5267406` | 6-axis IMU with SFLP hardware fusion, LGA-14 |
| U3 | **SN74LVC2G241DCUR** | `C10430` | Tri-state buffer for single-wire half-duplex |
| U4 | **HT7533-1** | `C14289` | 3.3 V LDO, **30 V input rating** (JLC basic part - no setup fee) |
| J1/J2 | B3B-EH-A(LF)(SN) | `C160259` | Dynamixel 3P - **same part as the official HAT**, cables interchange |
| J3 | PZ254V-11-04P | `C2691448` | SWD header |
| C1–C5 | 100 nF 0402 | `C307331` | Decoupling (same part as the official HAT) |
| **C6** | 10 µF **≥25 V** | ⚠️ TBD | **LDO input** - sits directly on the 8.4 V bus |
| C7 | 10 µF 0603 10 V | `C19702` | LDO output (3.3 V); 10 V is fine here |
| R1/R2 | 10 kΩ 0402 | `C25744` | CS pull-up (**mandatory**), NRST pull-up |
| **C8** | 100 nF 0402 | `C307331` | **Right at the LDO input pin**, absorbs high-frequency spikes |
| **D1** | **TVS `SMAJ12A`** (or `SMF12A` SOD-123FL) | TBC | ⚠️ **Must sit next to the 3P connector.** Standoff 12 V > 8.4 V full charge; clamp **19.9 V** < C6's 25 V |
| **F1** | **PPTC resettable fuse**, hold 100–200 mA, 0805 | TBC | A fault on this board must not drag down the whole servo bus (the official HAT's TH1 100R thermistor is the same idea) |
| J4 | 2×2 or 1×4 pin header (optional, DNP) | - | Breaks out the IMU's four SPI lines. If the design later moves to SPI straight into the main board, leave the MCU unpopulated and fly-wire it - no need to redo the whole board |

#### Board outline and mounting

Upstream has **published no geometry at all for this board** (the MJCF has no mesh for it). The only
physical evidence is the printed part that holds it, `banana_pcb_locker` (`imu_board_retainer` in `print/`), measured and reasoned back:

| Quantity | Value | Source |
|---|---|---|
| Overall locker length | **54.05 mm** | measured from the mesh |
| **Centre distance of the two locating tabs** | **≈ 34 mm** | tab positions from slicing along X |
| Each tab | ≈ 4 × 2.3 × 2.0 mm | same |
| Arc height of the body | 6.7 mm (Z 48.97→55.63) | this is where the "banana" name comes from |

→ Inferred original board: **two mounting points 34 mm apart, long side ≤ 54 mm, curved outline**.

> 💡 **But the locker itself is a printed part** (`print/printed-parts/`, print 1) - so **the board
> outline and the locker can be redesigned together**; there is no need to honour the original's arc.
> The original is presumably curved to hug the trunk's inner wall and save space; for a replica a
> **flat board + modified locker** is far simpler, since a curved PCB is a pain to route and to panelise.

**Suggested outline: 40 × 18 mm (45 × 22 if you want slack), two M2 mounting holes 34 mm apart, 2-layer.**

- Net component area is roughly 230 mm² (dominated by the connectors: two JST EH 3P at about
  10 × 6 mm each); a 2-layer board at 2–3× that needs 460–700 mm² → 40 × 18 = 720 mm² is just right
- Keep the hole pitch at 34 mm and **the original printed locker can be used as-is**
- ⚠️ **Do not shrink the board to save money**: JLCPCB charges the same for any 2-layer board within
  100 × 100 mm; a 25×20 costs exactly what a 50×50 costs. Size should be set by assembly constraints only
- ⚠️ **Watch component height**: the locker's cavity is 6.65 mm tall, while a through-hole JST EH
  connector body is about 8 mm - either use side-entry footprints, or this board is not the one that
  locker clamps at all

#### ⚠️ Over-voltage protection: it shares a bus with the servos

**This is the easiest risk on this board to overlook.** Fifteen servos hang off the same `+BATT`; when
they decelerate, reverse or release from stall, **back-EMF lifts the bus**. This board sits at the end of
the bus, and with cable inductance plus fast reversals the spikes seen at its input are worse than at the
battery.

> Note the nature of the threat: **forward over-voltage, not reverse polarity** - so a series diode does
> not solve it.

Three lines of defence, in order of importance:

| Line | Part | Blocks | Status |
|---|---|---|---|
| **1. Wide-input LDO** | `HT7533-1` (30 V operating / 33 V absolute) | Sustained over-voltage. Even if the 8.4 V bus is lifted to 17 V it does not flinch - **3.5× margin** | ✅ selected |
| **2. TVS** | `SMAJ12A`, **next to the connector** | µs-scale spikes. Standoff 12 V > 8.4 V full charge (no leakage); clamp 19.9 V < C6's 25 V | ⚠️ added in this revision |
| **3. PPTC** | hold 100–200 mA | A short on this board must not pull the whole bus down - 15 servos would brown out and the robot falls over | ⚠️ added in this revision |

> **TVS placement matters more than the part number**: put it right beside the 3P connector, as close to
> the entry point as possible. Next to the LDO is too late - the spike has already run a lap of the board.
>
> ⚠️ **The actual back-EMF amplitude has not been measured by this repository**; it depends on cable
> inductance and reversal speed. Once the servos arrive, put a scope on the bus and come back to check
> the part choices here.

> ⚠️ **Two more traps, both of which destroy the board:**
>
> **1. LDO rating.** The bus reaches 8.4 V fully charged; the usual suspects all fall short
> (shown as **operating limit / absolute maximum**): AP2112K **6.0 / 6.5 V**,
> ME6211 **6.0 / 6.5 V**, TLV75533 **5.5 / 6.0 V**. Use the HT7533-1 (30 V operating,
> 33 V absolute) or equivalent.
>
> **2. Input capacitor rating - this table previously got it wrong.** `C19702` is a **10 V**
> X5R. On an 8.4 V bus that is only 1.2× margin, and an X5R at 8.4 V DC bias retains **less than
> half its nominal capacitance** - before the servo start/stop transients. **C6 must be a ≥25 V
> part** (0805 is safer); C7, on the 3.3 V output, is fine at 10 V.

---

## 5. Mechanical

### Bearings (14 total)

| Size | Qty | Basis |
|---|---|---|
| **Ø22 × 16 × 4** | **11** | `seeed_bearing__configuration__22x16x4` referenced 11× |
| **Ø15 × 10 × 3** | **3** | `seeed_bearing__configuration_default` referenced 3× |

### Fasteners (mostly M2, ~325 pieces)

Across the assembly there are **237 M2-class holes** (Ø1.9–2.5 mm, ≥300° wrap), weighted by how
many times each part is used: **60 in the servo bodies** (15 × 4), 21 in bought parts
(bearings / PCBs / battery), and **about 156 in printed structural parts**.

> ⚠️ **On the figure**: earlier versions of this repository said "213", which does not reconcile;
> corrected to 237. The gap came from two things - the earlier count was **not weighted by usage**
> (`leg` is actually ×4, `hip_l` ×2, and so on) and it **included unused meshes**. The
> diameter-distribution table uses a different basis; see
> [fastener reconstruction](docs/fastener-reconstruction.md).
>
> The quantities below total 325 pieces - still **1.37×** cover for 237 holes, so **ordering is unaffected**.

| Size | Suggested qty | Use |
|---|---|---|
| M2×4 socket cap | 60 | thin walls |
| M2×6 socket cap | **80** (the workhorse) | |
| M2×8 socket cap | 40 | 3–5 mm hole depth |
| M2×12 socket cap | 15 | a few deep holes |
| M2 nuts | 50 | where nothing is tapped |
| **M2 heat-set inserts** | **60** | recommended for printed parts - far stronger than tapping |
| M2.5×6 | 20 | a few Ø2.7 holes |

Derivation: [fastener reconstruction](docs/fastener-reconstruction.md).

### Printed parts (30 types / 41 pieces)

**Watch the quantities - 9 types need more than one:**

| Part | Print |
|---|---|
| `leg` | **×4** |
| `hip_l` | ×2 |
| `neck` | ×2 |
| `power_support` | ×2 |
| `sole_left` | ×2 |
| `sole_right` | ×2 |
| `upper_leg_rigidity_plate` | ×2 |
| `yaw2roll` | ×2 |
| `bearing_roll` | ×2 |
| The other 21 types | ×1 each |

**Flexible-material parts** (from naming and function - TPU suggested): `jaw_soft`, `soft_mouth_top`

⚠️ **Do not confuse left and right.** `upper_leg_left` and `upper_leg_right` are mirrored parts
(centroid X = **±0.006766 m = ±6.77 mm**, identical mass 0.0482067 kg) - you need both.
Same for `ankle_left`/`ankle_right`, `sole_left`/`sole_right`, `foot_left`/`foot_right`.

Files and classification: [`print/`](print/).

### Roller-skate variant (optional, extra)

To reproduce the skating function, print **additionally** and substitute:

| Part | Qty |
|---|---|
| `tire` | **×8** |
| `rim` | **×4** |
| `roller_blade` | ×2 |
| `ankle_l_v1` / `ankle_r_v1` | ×1 each (**replaces** the standard ankles) |

⚠️ **The skate ankles are 10 mm taller** than the standard ones (46.5 vs 36.5). The two sets are
not interchangeable.

See [`print/variant-roller-skate/`](print/variant-roller-skate/).

---

## 6. Still unsolved

Two things will stop you at the end, and public material cannot answer them:

1. **Battery contacts.** The CAD has only the printed `power_support` (×2) - **no contact PCB or
   spring model of any kind**. Whether upstream uses metal springs or an off-the-shelf NP-F adapter
   cannot be determined. The easy route is a commercial NP-F adapter plate.
2. **Cable harness.** No drawings exist for the Dynamixel 3P cable lengths between servos or the
   camera MIPI ribbon. Servos ship with short cables, but internal routing lengths must be measured
   on the build.

---

## Sources

| Data | Source |
|---|---|
| Part quantities | geom `mesh=` reference counts in upstream `robot_walk.xml` |
| Skate-variant quantities | upstream `robot_groundcontact_rollers.xml` |
| Screw counts | hole geometry from the STLs - see [fastener reconstruction](docs/fastener-reconstruction.md) |
| Electronics part numbers | Rust source, device tree, `robotd.toml` - see [hardware teardown](docs/hardware-teardown.md) |
| HAT board figures | the official KiCad project and `production/` files |
| Servo specification | [Robotis e-manual](https://emanual.robotis.com/docs/en/dxl/x/xl330-m288/) |
| LCSC part numbers | live query against the JLC EasyEDA component library |
