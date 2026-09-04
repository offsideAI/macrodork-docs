# 3D-Printable Parts

> 🛒 Sourcing links for filament, fasteners, heat-set inserts and insert tips: [mechanical sourcing list](../docs/mechanical-sourcing-list.md).

Every STL for the whole robot, sorted into **print these** and **buy these**, under Macrodork part names.

| Directory | Count | What it is |
|---|---|---|
| `printed-parts/` | **30 types / 41 pieces** | Structural parts the walking assembly needs. **9 types need more than one copy - read the quantity table below** |
| `variant-roller-skate/` | 5 types / 15 pieces | Substitute parts for the roller-skating function; skip them if you are not building the skates |
| `standard-parts-not-printed/` | 8 | Models of the servos, bearings, battery and PCBs - **for fit and interference checking only** |
| `removed-upstream/` | 2 | Referenced by no assembly; deleted upstream on 2026-09-01. Kept for the record |

> These are **individual parts**, for printing.
> For **assembly relationships** see [`../cad/`](../cad/) - 15 sub-assemblies merged along the kinematic tree.

## Generating the files

The STL files are **not stored in this repository**. They are generated from the upstream mesh
release at a pinned commit, renamed and sorted:

```bash
bash scripts/fetch_upstream.sh          # once: clones upstream into upstream/ (git-ignored)
python scripts/build_print_tree.py      # writes print/**/*.stl
```

The script pins upstream commit `d424a0c` (2026-08-27), the baseline every count in this
repository was taken from, and fetches that commit if the local clone does not have it.
`python scripts/build_print_tree.py --table` prints the mapping below.

## ⚠️ How many: 9 parts need more than one copy

Quantities come from geom reference counts in the upstream `robot_walk.xml` - counted, not estimated.

| Part | Qty |
|---|---|
| `lower_leg` | **×4** |
| `hip_roll_link` | ×2 |
| `neck_base` | ×2 |
| `battery_support` | ×2 |
| `sole_left` | ×2 |
| `sole_right` | ×2 |
| `upper_leg_rigidity_plate` | ×2 |
| `hip_yaw_roll_bracket` | ×2 |
| `hip_roll_bearing_cap` | ×2 |
| The other 21 types | ×1 each |

**Roller-skate variant**: `skate_tire` **×8**, `skate_rim` **×4**, `skate_blade` ×2, `skate_ankle_left` / `skate_ankle_right` ×1 each.

> ⚠️ The skate ankles are **10 mm taller** than the standard ones (46.5 vs 36.5). The two sets are not interchangeable.

The full bill of materials (servos, bearings, screws, electronics) is in [`../BOM.md`](../BOM.md).

## Part names

Files carry Macrodork names. The upstream mesh name is what the MJCF, `../cad/parts_manifest.json`,
`../docs/hole_analysis.json` and the analysis documents cite, so both are listed here.

| Macrodork name | Upstream mesh | Qty | Note |
|---|---|---|---|
| **`printed-parts/`** | | | |
| `trunk_base` | `trunk_base` | ×1 | Trunk core; the hip servos and the neck bolt to it |
| `trunk_shell_left` | `left_shell` | ×1 | Trunk side shell, left |
| `trunk_shell_right` | `right_shell` | ×1 | Trunk side shell, right |
| `battery_support` | `power_support` | ×2 | Holds the NP-F battery; no contact model, see BOM |
| `imu_board_retainer` | `banana_pcb_locker` | ×1 | Clip that holds the imu_to_dxl board |
| `hip_yaw_roll_bracket` | `yaw2roll` | ×2 | Links the hip-yaw servo to the hip-roll axis |
| `hip_roll_bearing_cap` | `bearing_roll` | ×2 | Retaining cap for the 22 mm hip-roll bearing (not a bearing) |
| `hip_roll_link` | `hip_l` | ×2 | Hip-roll body between bracket and upper leg |
| `upper_leg_left` | `upper_leg_left` | ×1 | Thigh, left |
| `upper_leg_right` | `upper_leg_right` | ×1 | Thigh, right (upstream also ships a duplicate export, dropped) |
| `upper_leg_rigidity_plate` | `upper_leg_rigidity_plate` | ×2 | Stiffening plate on each thigh |
| `lower_leg` | `leg` | ×4 | Shin plate, two per leg |
| `ankle_left` | `ankle_left` | ×1 |  |
| `ankle_right` | `ankle_right` | ×1 |  |
| `foot_left` | `foot_left` | ×1 |  |
| `foot_right` | `foot_right` | ×1 |  |
| `sole_left` | `sole_left` | ×2 |  |
| `sole_right` | `sole_right` | ×2 |  |
| `neck_base` | `neck` | ×2 | Neck base halves, around the neck servo |
| `neck_pitch` | `neck_pitch` | ×1 |  |
| `head_yaw_roll_link` | `yaw_roll_motion` | ×1 | Head yaw/roll mechanism body |
| `head_shell_top` | `top_head_shell` | ×1 | Cosmetic |
| `head_shell_bottom` | `bottom_head_shell` | ×1 | Cosmetic |
| `face_plate` | `face_part` | ×1 | Front face with camera and ToF openings |
| `head_servo_mount` | `motor_support` | ×1 | Mount for the jaw servo inside the head |
| `noenoeil` | `noenoeil` | ×1 | Small part at the jaw-servo mount; upstream name kept, purpose not identified |
| `m12_lens_holder` | `m12_lens_holder` | ×1 | Holder for the M12 camera lens |
| `jaw` | `jaw` | ×1 | Lower beak, rigid |
| `jaw_soft` | `jaw_soft` | ×1 | Lower beak, flexible (TPU suggested) |
| `mouth_top_soft` | `soft_mouth_top` | ×1 | Upper beak, flexible (TPU suggested) |
| **`standard-parts-not-printed/`** | | | |
| `servo_xl330` | `xl330` | ×15 | Dynamixel XL330 envelope |
| `bearing_22x16x4` | `seeed_bearing__configuration__22x16x4` | ×11 | 22 x 16 x 4 mm bearing |
| `bearing_15x10x3` | `seeed_bearing__configuration_default` | ×3 | 15 x 10 x 3 mm bearing (ankles and head) |
| `battery_np_f550` | `np_f970` | ×1 | Upstream mesh is named F970 but measures as an F550, see BOM |
| `mainboard_zero_footprint` | `pcb__raspberry_pi_zero_2_w` | ×1 | Zero-footprint main board; the real board is a Radxa Zero 3W |
| `robot_hat_pcb` | `elec_rpi_robot_hat_pcb` | ×1 | RPI Robot HAT outline |
| `camera_lens` | `lens` | ×1 | M12 lens |
| `speaker` | `speaker` | ×1 | Placeholder mesh (12 triangles) |
| **`variant-roller-skate/`** | | | |
| `skate_ankle_left` | `ankle_l_v1` | ×1 | Replaces ankle_left; 10 mm taller |
| `skate_ankle_right` | `ankle_r_v1` | ×1 | Replaces ankle_right; 10 mm taller |
| `skate_blade` | `roller_blade` | ×2 |  |
| `skate_rim` | `rim` | ×4 |  |
| `skate_tire` | `tire` | ×8 | Flexible (TPU suggested) |
| **`removed-upstream/`** | | | |
| `legacy_trunk_shell_left` | `trunk_shell_left` | - | Referenced by no assembly; deleted upstream in `8dfc08f` (2026-09-01) |
| `legacy_trunk_shell_right` | `trunk_shell_right` | - | Referenced by no assembly; deleted upstream in `8dfc08f` (2026-09-01) |

## Differences from upstream

At the baseline commit, the upstream assets directory held **47 STLs**; **45** are generated here.

**The 2 duplicates dropped**: the upper legs ship upstream under two names each, `upper_leg_left` /
`left_upper_leg` and `upper_leg_right` / `right_upper_leg`, with identical face count (12250), bounding
box and centroid - two exports of the same geometry. Only `upper_leg_left` and `upper_leg_right` are used.

**Re-sorted**: the skate-only parts go into `variant-roller-skate/`; the two trunk shells that no MJCF
references, and that upstream has since deleted, go into `removed-upstream/`.

> Upstream's XL330 test-bench fixtures (`bench_holder`, `weight`, `spacer`, `axis`, `arm`, `part_1..5`)
> live in a separate upstream directory, `robot/xl330_test_bench/assets`; they are not robot parts and were
> never among the 47.

## Printing notes

No official print settings exist (upstream never published any). Measured findings so far are in
[`../BUILD-LOG.md`](../BUILD-LOG.md).

A few things the geometry itself tells you:

- **Head and trunk shells** are cosmetic - 0.12–0.16 mm layers suggested
- **Leg structural parts** carry load - increase wall thickness and infill
- **`mouth_top_soft` / `jaw_soft`** are named *soft* upstream; the originals are presumably a flexible
  material (TPU family)
- **`skate_tire`** likewise - a roller-skating tyre printed in rigid filament will simply slip
- Use **heat-set inserts** for the M2 holes on printed parts rather than tapping the plastic. Screw list:
  [`../docs/fastener-reconstruction.md`](../docs/fastener-reconstruction.md)

## Licence

A generated tree is a **derivative** (renaming and sorting) of the upstream meshes and carries their
**CC BY-NC-SA 4.0** terms: attribution, share-alike, non-commercial. See [`../NOTICE.md`](../NOTICE.md).

---

## Correction (2026-09-04)

The part now named `hip_roll_bearing_cap` (upstream `bearing_roll`) was previously filed under
`standard-parts-not-printed/` (taken for an off-the-shelf bearing). **That was wrong.** The evidence:

1. **Geometry** - measured **23 × 3 × 40 mm**, a flat plate with a Ø≈18 mm centre hole, volume 625 mm³
   (23 % fill ratio). No standard bearing has this shape; the two real bearings measure as bodies of
   revolution at 22.0/**16.0**/4.0 and 15.0/**10.0**/3.0.
2. **Provenance** - the Onshape `elementId` in the upstream `assets/*.part` files: `bearing_roll` shares
   `d6fcdccc8b25aaa256e7e213` with `trunk_base`, `yaw2roll`, `left_shell`, `right_shell`,
   `power_support` and `neck` (the trunk Part Studio of in-house printed parts); the two real bearings
   are in `92eaf48a756ec816309fc756` with configuration strings `..._22x16x4` / `..._Default`, the
   signature of a standard-parts configuration library.
3. **Assembly** - it sits in the same body and at the same `pos` as `yaw2roll`, with a quat that differs
   only by an overall sign (the same rotation): a plate attached to the side of the hip yaw/roll bracket
   and extending 19.5 mm further down. Functionally it is the **retaining cap / keeper** for the Ø22
   bearing on the hip_roll axis (the Ø18 hole is smaller than the Ø22 outer diameter, so it retains the
   outer race exactly).

The earlier descriptive name "bearing roller" was also wrong - it is neither a bearing nor a roller,
hence the Macrodork name `hip_roll_bearing_cap`.
The printed-part count therefore goes **29 types / 39 pieces → 30 types / 41 pieces**, and standard parts **9 → 8**.

> Also note: in the upstream `robot_walk.xml:264` the right-leg hip_yaw link was named `<body name="bearing_roll">`
> by onshape-to-robot, but the visual inside it is `yaw2roll_2` - a coincidence of link naming, with no
> bearing on what the part is.
