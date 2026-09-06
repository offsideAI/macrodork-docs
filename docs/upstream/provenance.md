# Upstream Provenance

This page records where Macrodork's source material comes from, what the upstream vendor
has and has not published, and which upstream revisions the numbers in this repository were
taken from. Licence terms and the attribution statement are in [`../../NOTICE.md`](../../NOTICE.md).

Macrodork is an independent project. It is not affiliated with or endorsed by the upstream
vendor, Pollen Robotics, whose Microduck robot the geometry and electronics follow.

## What upstream has published

| Material | Where | Licence |
|---|---|---|
| On-board runtime (Rust): control loop, device paths, I²C addresses, register maps | [`pollen-robotics/microduck`](https://github.com/pollen-robotics/microduck) | Apache-2.0 |
| Simulation model: full MJCF kinematic tree and 47 STL meshes | [`pollen-robotics/microduck_rl`](https://github.com/pollen-robotics/microduck_rl) | Code Apache-2.0; **3D models CC BY-NC-SA** |
| RPI Robot HAT board: KiCad 9 project, Gerbers, BOM, pick-and-place, STEP | [`pollen-robotics/elec_RPI_Robot_HAT`](https://github.com/pollen-robotics/elec_RPI_Robot_HAT) | Apache-2.0 |
| KiCad symbol / footprint library needed to open the HAT project | [`pollen-robotics/lib_KiCAD`](https://github.com/pollen-robotics/lib_KiCAD) | - |
| Nine trained ONNX walking policies | [HuggingFace](https://huggingface.co/pollen-robotics/microduck-policies) | - |

## What upstream has not published

- **The `imu_to_dxl` board.** No schematic, layout or firmware exists in any public repository.
  The reconstruction in [`../hardware-teardown.md`](../hardware-teardown.md) recovers its bus
  behaviour from the runtime source; it is the only public description.
- **Editable mechanical CAD.** Only simulation STLs are released. They carry outer shape and
  inertia and nothing about tolerances, threads or insert bosses.
- **A whole-robot bill of materials** and **assembly documentation.** [`../../BOM.md`](../../BOM.md)
  and the drawings in this repository are reconstructed from the MJCF.
- **Cable routing.**

The vendor told the press not to call the robot "open-source hardware" for now. That is a
statement about the label for the whole robot; the HAT board is in fact fully published. The
press quote and the open community issues asking for STEP and print files are collected in
[`../community-intelligence.md`](../community-intelligence.md).

> Correction (2026-09-03): this repository previously stated "the hardware is not open, no PCB
> schematics". That was wrong. Only the main runtime repository had been searched, and the
> `elec_`-prefixed hardware repositories under the same organisation were missed.

## Why two public artifacts are enough

1. **The simulation model ships the complete kinematic tree.** Which part mounts to which,
   relative positions accurate to 0.1 mm, joint axes, travel limits, masses and inertia tensors.
2. **A runtime that drives real hardware must hard-code device paths, I²C addresses, register
   offsets, baud rates and protocols.** The code is the datasheet.

Everything in this repository falls out of reading both.

## Upstream baselines

| What | Upstream commit | Date | Note |
|---|---|---|---|
| Mesh set every count in this repository is taken from | `d424a0c` | 2026-08-27 | 47 STLs; `scripts/build_print_tree.py` pins this commit |
| Re-export that recoloured the meshes and deleted the two unused trunk shells | `8dfc08f` | 2026-09-01 | Geometry after this commit has not been re-counted |

Independent verification: on 2026-08-31 a hardware teardown posted on X by
[@tspy](https://x.com/tspy/status/2094249218735300630) reached the same conclusions as this
repository, including that the main board is a Radxa Zero 3W.

## How this repository uses the upstream material

Nothing from upstream is stored here. `scripts/fetch_upstream.sh` clones the three repositories
into `upstream/` (git-ignored); the scripts under `scripts/` then regenerate the drawings, the
CAD assemblies, the hole analysis and the `print/` tree from that checkout.
See "Reproducing This" in the [README](../../README.md).

A guide to the wider upstream ecosystem (simulators, policies, datasets, community projects)
is in [`ecosystem.md`](ecosystem.md).
