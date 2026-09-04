# Mechanical Sourcing List (China / Taobao)

> **Snapshot date: 2026-09-04.** Prices and sales counts change and links may die; check prices yourself before ordering.
> Electrical parts (main board / camera / ToF / power / PCBs / cables) are in the [Electronics Sourcing List](electronics-sourcing-list.md).
>
> Quantities come from counting mesh instances in the MJCF `robot_walk.xml` and from hole-feature reconstruction; **they are derived values, not official drawings**.

---

## 1. Bearings (14 in total, two sizes)

Quantities are counted directly from the mesh references in `robot_walk.xml`; all six MJCF variants agree exactly.
**The sizes come from measuring the mesh geometry, not from the file names**:

| Size | Qty | Measured (OD / bore / width) | Mesh |
|---|---|---|---|
| **Ø22 x 16 x 4** | **11** | 22.0 / **16.0** / 4.0 mm | `seeed_bearing__configuration__22x16x4` |
| **Ø15 x 10 x 3** | **3** | 15.0 / **10.0** / 3.0 mm | `seeed_bearing__configuration_default` |

| Store | Notes | Price | Link |
|---|---|---|---|
| **NBZH Yongtian Bearings** (16-year store) | Stainless thin-section `ET2216ZZ` / `MR16224` / `SET2216` / `DDA2216`, 16x22x4 | **¥2.2** | [taobao 539024647147](https://item.taobao.com/item.htm?id=539024647147) |
| **Xinyi Bearings** (7-year store) | NSK miniature bearings, **10x15x3 and 16x22x4 in the same listing** | **¥5** | [taobao 670727787832](https://item.taobao.com/item.htm?id=670727787832) |

> 💡 The Xinyi listing lets you buy both sizes from one link, which is convenient.

> ⚠️ **`bearing_roll` is not a bearing and not a purchased part.** The MJCF also contains a mesh named
> `bearing_roll` that appears 2 times; measured, it is a **23 x 3 x 40 mm flat plate with a Ø≈18 centre hole** (volume 625 mm³, fill ratio 23%),
> and it comes from the **same Onshape Part Studio** as `trunk_base` / `yaw2roll` / the shells
> (elementId `d6fcdccc8b25aaa256e7e213`), whereas the two real bearings come from a separate standard-parts library with a configuration string.
> It is the **retaining cap** for the Ø22 bearing on the hip_roll axis; **print it, do not buy it**. See [Printed parts](#4-printed-parts).

---

## 2. Fasteners (M2 system, about 325 pieces)

M2-class holes across the robot (Ø1.9-2.5 mm, wrap angle >= 300°) **total 237 weighted by assembly usage**:
60 on the servo bodies (15 x 4), 21 on standard parts such as bearings / PCBs / battery, about 156 on structural parts.
The list below gives 325 pieces, a **1.37x** margin over the 237 hole positions.

| Size | Suggested qty | Use |
|---|---|---|
| M2x4 socket cap | 60 | Thin-wall locations |
| **M2x6 socket cap** | **80** (the workhorse) | |
| M2x8 socket cap | 40 | Hole depth 3-5 mm |
| M2x12 socket cap | 15 | A few deep holes |
| M2 nut | 50 | Where there is no tapping |
| **M2 heat-set insert** | **60** | Recommended for printed parts, far stronger than tapping directly |
| M2.5x6 | 20 | A few Ø2.7 holes |

The derivation is in [Fastener Reconstruction](fastener-reconstruction.md).

### Screw kits

| Store | Notes | Price | Sales | Link |
|---|---|---|---|---|
| **Guangzhou Xinbang Electronics** (10-year store, free shipping) | **600 pcs** boxed stainless countersunk / flat-head hex socket **M2/M2.5/M3** assortment, **wrench included** | **¥26.8** | 42 | [taobao 842110292995](https://item.taobao.com/item.htm?id=842110292995) |
| Hongshuntong Hardware factory store (8-year store) | 600 pcs M2/M2.5/M3 countersunk hex socket + nuts + tool included | ¥23 | 2 | [taobao 842400332284](https://item.taobao.com/item.htm?id=842400332284) |
| Guangzhou Xinbang Electronics (10-year store, free shipping) | 304 stainless M2-M8 pan-head hex socket + nuts + washers kit | ¥19.8 | 71 | [taobao 888186264852](https://item.taobao.com/item.htm?id=888186264852) |

> 💡 **Prefer kits that explicitly include M2.** Many "M2M3M4M5M6M8 complete" titles mention M2 but actually start at M3 -
> read the SKU before ordering. In this project **M2 is the overwhelming majority**; M3 is barely used.

### Heat-set inserts + insertion tip

| Store | Notes | Price | Sales | Link |
|---|---|---|---|---|
| **Shenzhen Rongyu Microelectronics** (6-year store) | **400 PCS M2 + M3** brass heat-set inserts, double-knurled | **¥22** | 200+ | [taobao 1000673642588](https://item.taobao.com/item.htm?id=1000673642588) |
| Shenzhen Rongyu Microelectronics (6-year store) | 80/220 PCS M2-M6 brass heat-set inserts | ¥18 | 1000+ | [taobao 922318148975](https://item.taobao.com/item.htm?id=922318148975) |
| Tianzhuo Hardware official flagship store (free shipping) | Tuba heat-set inserts M1-M8, sold loose by size | from ¥0.77 | 40k+ | [tmall 809364062256](https://detail.tmall.com/item.htm?id=809364062256) |

> ⚠️ **Do not forget the insertion tip.** Heat-set inserts must be pressed in with a **dedicated soldering-iron tip**; an ordinary tip cannot hold them straight and they go in crooked.

| Store | Notes | Price | Sales | Link |
|---|---|---|---|---|
| **Luotie Gongju (soldering iron tools)** (7-year store) | 3D-printing heat-set insert tip kit M2-M8, fits **936 / T12 / T65** | **¥13** | 800+ | [taobao 902798112263](https://item.taobao.com/item.htm?id=902798112263) |
| Waimao Youpin (free shipping) | Same class M2-M8 tip kit | ¥11.5 | 200+ | [taobao 966212633086](https://item.taobao.com/item.htm?id=966212633086) |

### Thread locker (anti-loosening for metal-on-metal screw positions)

Medium-strength thread locker is recommended on servo output shafts and metal-to-metal joints.

| Store | Notes | Price | Sales | Link |
|---|---|---|---|---|
| **LOCTITE flagship store** | Henkel Loctite **243** medium-strength removable thread locker | **¥19.11** | 10k+ | [tmall 653848839737](https://detail.tmall.com/item.htm?id=653848839737) |
| LOCTITE enterprise store | 243 / 263 thread locker | ¥18.4 | 700+ | [taobao 663963768247](https://item.taobao.com/item.htm?id=663963768247) |
| Industrial Adhesive factory-direct store (free shipping) | Loctite 243 / 242 / 263 | ¥16.8 | 600+ | [taobao 925965306702](https://item.taobao.com/item.htm?id=925965306702) |

> ⚠️ **Be wary of anything under ¥15.** The search results include ¥8 and ¥10 "Loctite 243"; the genuine product never gets that cheap.
> Stick to the official LOCTITE store or authorised dealers.

---

## 3. Filament

| Material | Amount | Where it goes |
|---|---|---|
| **PLA / PETG** | About 300-500 g | The vast majority of structural parts |
| **TPU** | A small amount | `jaw_soft`, `soft_mouth_top` - judged from naming and purpose, a soft material is recommended |

> Print-process and tolerance evaluation has not been done yet; see the risk list in [PROGRESS.md](../PROGRESS.md).
> **Simulation STL ≠ printable engineering part** - it only guarantees shape and inertia; no fit tolerances, threaded holes or heat-set insert seats.

---

## 4. Printed parts

**30 kinds / 41 pieces.**

**9 kinds need multiple copies:**

| Part | How many |
|---|---|
| `leg` | **x4** |
| `hip_l` | x2 |
| `neck` | x2 |
| `power_support` | x2 |
| `sole_left` | x2 |
| `sole_right` | x2 |
| `upper_leg_rigidity_plate` | x2 |
| `yaw2roll` | x2 |
| **`bearing_roll`** | **x2** ← see the correction below |
| The other 21 kinds | x1 each |

> ⚠️ **Correction (2026-09-04)**: this repository previously classed `bearing_roll` under "standard parts, not printed"; **that was wrong**.
> Criteria: (1) measured, it is a 23x3x40 mm flat plate with a Ø≈18 centre hole, not the shape of any standard bearing (a real bearing is a body of revolution);
> (2) it comes from the same Onshape Part Studio as `trunk_base` / `yaw2roll` / the shells;
> (3) in the assembly it shares a body and position with `yaw2roll`; it is a cover plate sitting on its side face.
> The earlier Chinese label "bearing roller" was also wrong - it is neither a bearing nor a roller; it is now labelled "roll-bearing retaining cap".
> The printed-part count is therefore corrected from 29 kinds / 39 pieces to **30 kinds / 41 pieces**.

⚠️ **Do not mix up left and right**: `upper_leg_left` and `upper_leg_right` are mirror parts
(centre of mass **±0.006766 m = ±6.77 mm**), and both must be printed;
the same goes for `ankle_left`/`ankle_right`, `sole_left`/`sole_right`, `foot_left`/`foot_right`.

---

## 5. Not purchased here (in the official model but belonging to other categories)

| Mesh | What it is | What to do |
|---|---|---|
| `xl330` x15 | Servo | See [Actuator Selection](actuator-selection.md) |
| `np_f970` | NP-F battery (**actually an F550**) | See [Electronics Sourcing List](electronics-sourcing-list.md#5-power) |
| `elec_rpi_robot_hat_pcb` | HAT PCB | Fab it, see [Electronics Sourcing List](electronics-sourcing-list.md#6-the-two-pcbs) |
| `pcb__raspberry_pi_zero_2_w` | Main-board placeholder | Buy a Radxa Zero 3W |
| `lens` / `m12_lens_holder` | Lens and lens holder | ⚠️ Both come from the same Onshape Part Studio;<br>this repository classes `lens` as a standard part and `m12_lens_holder` as a printed part, **that split is questionable** and awaits a check against real parts |
| `speaker` | Speaker | 5 W, connected to the Wago terminal on the HAT |

---

## Unverified items

- All prices, sales counts, store details and link validity (2026-09-04 snapshot)
- Screw lengths are estimated from hole depth; **they are ranges, not measurements**; FDM shrinkage also changes the real hole diameter
  (Ø2.2 typically comes out 0.1-0.3 mm undersize)
- The TPU judgement comes from naming and purpose; the official project does not specify materials
- Whether `lens` / `m12_lens_holder` are purchased or printed
