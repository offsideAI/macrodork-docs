# Toolchain setup — Apple Silicon Mac

## 1. Use the current Mac

Initial inspection found macOS 26.4 on `arm64`, Homebrew, Git, and Python 3.12.13. Blender and FreeCAD were initially absent; the user subsequently installed both. Step 4 is now complete: see [verification results](VERIFICATION-RESULTS.md). Retain the installation instructions below for reference; no reinstall is needed.

The two core apps are sufficient to begin. Blender creates the visual model and renders; FreeCAD creates dimensioned solids and fabrication exports. FreeCAD supports Python scripting and STEP exchange. [FreeCAD manual](https://www.freecad.org/manual/a-freecad-manual.pdf)

## 2. Install Blender LTS

Run in Terminal:

```sh
brew install --cask blender@lts
```

The Homebrew LTS listing reports **5.2.1** at research time, 2026-09-06. The cask follows releases, so record what actually installs. The `blender` and `blender@lts` casks conflict: choose one; use an existing compatible installation if already present. [Official Homebrew cask](https://formulae.brew.sh/cask/blender@lts)

Manual alternative: download a stable/LTS **macOS Apple Silicon** build from [Blender](https://www.blender.org/download/), open the DMG and drag Blender to Applications. Choose this route OR Homebrew.

Open Blender once from Applications and complete the normal macOS first-launch prompt. In Preferences → System → Cycles Render Devices, select **Metal** and the Apple GPU. For a Cycles scene, select GPU Compute in Render Properties. CPU rendering remains a useful fallback. [Blender GPU documentation](https://docs.blender.org/manual/nl/4.5/render/cycles/gpu_rendering.html)

## 3. Install FreeCAD

```sh
brew install --cask freecad
```

The cask reports **1.1.3** at research time. Open FreeCAD once from Applications. Manual alternative: choose the stable macOS arm64 DMG from the official project's release assets. [Homebrew cask](https://formulae.brew.sh/cask/freecad), [FreeCAD releases](https://github.com/FreeCAD/FreeCAD/releases)

Set the displayed units to millimetres. We will use FreeCAD's own Python console/macros for mechanical automation, and Blender's bundled Python for rendering automation. A normal shell Python environment does not automatically provide `FreeCAD` or `bpy`.

## 4. Verify installation and record it

From the repository root:

```sh
python3 Mark-I-Build/scripts/toolchain_check.py
```

The inventory script writes a dated JSON under `Mark-I-Build/logs/`. It returns status 1 if a core app is missing at the standard locations; pass explicit app-bundle paths if installed elsewhere. This checks installation metadata and the Blender executable, not rendering or FreeCAD geometry.

Standing user requirement: perform application work in the foreground on the LG UltraFine second monitor. Use the visible Blender and FreeCAD Python consoles; do not launch headless/background application sessions. The inventory script reads installation metadata and invokes Blender only for its version string. Functional verification uses the visible apps.

In FreeCAD, enable View → Panels → Python console and enter:

```python
import FreeCAD as App, Part
doc = App.newDocument("MarkI_SetupCheck")
cube = doc.addObject("Part::Box", "CalibrationCube20mm")
cube.Length = cube.Width = cube.Height = 20
doc.recompute()
print(App.Version(), cube.Shape.Volume)
```

Expected volume: **8000 mm³**. This geometry check and STEP/STL export/reimport passed on 2026-09-06. The actual visible-console workflow is preserved in [freecad_calibration.py](scripts/freecad_calibration.py), with native geometry under `cad/`, exports under `exports/`, and measurements under `logs/`. Existing revision files should be inspected before any repeat run.

Before modeling the robot, import that calibration STL into Blender. Our exchange convention is **FreeCAD millimetres → Blender metres**, so 20 mm must become **0.020 m** in Blender. STL contains no reliable unit metadata: apply the conversion once, measure the result, and document importer settings. Use +Z up, +X robot-right, and −Y forward in our Blender scene; document any transform from upstream coordinates. GLB exports use metres and their format's axis convention.

This import and a 640 × 480 Cycles/Metal render also passed. [blender_calibration.py](scripts/blender_calibration.py) preserves the preparation and image-save commands; rendering was started through the visible Render → Render Image menu. See [verification results](VERIFICATION-RESULTS.md) for evidence and limitations.

## 5. Add a slicer when ready to print

Download the macOS build of [PrusaSlicer](https://www.prusa3d.com/p/prusaslicer/) or keep a slicer already suited to your printer. Select the actual printer, nozzle, and material. Import the 20 mm cube and verify its dimensions before printing head parts. A print service can make initial prototypes; buying a printer is not a prerequisite for the first render.

## 6. Defer specialized tools until needed

| Tool | Install when | Role |
|---|---|---|
| KiCad | We inspect or modify circuit boards | Schematics, PCB, board geometry; use the [official macOS installer](https://www.kicad.org/download/macos/) |
| MuJoCo + project Python environment | The body architecture and actuator candidates are selected | Joint travel, collisions, masses and control modeling; follow [MuJoCo's Python instructions](https://mujoco.readthedocs.io/en/stable/python.html) at that stage |
| Git LFS | Retrieved upstream attributes or our asset sizes require it | Large CAD/binary storage; inspect before fetching large datasets |
| Video encoder | A turntable image sequence exists | Convert rendered frames to a campaign video |

No bridge/MCP plugin is required for the initial workflow: scripts and exported files provide a direct, auditable path. We do not need to set up a robot runtime or a large reinforcement-learning training system for head modeling.

## 7. What happens after setup

We acquire a pinned Asimov source revision under `Mark-I-Build/references/`, record licenses and file hashes, and inspect the head/neck CAD at original units. FreeCAD imports STEP solids; Blender receives tessellated copies for presentation. STEP imports generally do not recover the upstream feature history: new mounts and shell features will be authored parametrically in our own FreeCAD document.

Then I can write and run scene-generation scripts, create variants, inspect renders, refine the chosen head, and produce a `.blend` scene, `.FCStd` mechanical model, STEP, print meshes, and a GLB preview. Blender renders come from the actual scene geometry; no image-generation service is required. Final validation includes a real render and an export/reimport size check.

Keep tool versions stable during each design revision. Save the actual installed versions and exact invocation with each generated artifact; a moving Homebrew cask is not a reproducibility lock.
