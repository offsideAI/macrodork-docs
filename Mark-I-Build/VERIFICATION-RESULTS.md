# Foreground toolchain verification — 2026-09-06

Setup step 4 passed. Geometry creation, export/import, and rendering ran in the visible FreeCAD and Blender applications on the LG UltraFine second monitor.

| Check | Observed result | Evidence |
|---|---|---|
| FreeCAD geometry | 1.1.3; 20 × 20 × 20 mm box; volume 7999.999999999998 mm³ | [FreeCAD report](logs/freecad-calibration-003.json) |
| STEP roundtrip | Reimported solid valid; volume preserved | [STEP](exports/calibration-20mm-r001.step) |
| STL roundtrip | Reimported bounds 20 mm each; 12 triangles | [STL](exports/calibration-20mm-r001.stl) |
| Blender scripting and scale | 5.2.1 LTS; GUI mode; each dimension 0.020000001415610313 m | [Blender report](logs/blender-calibration-003.json) |
| Rendering | Cycles GPU, Metal, enabled Apple M5 Max GPU; 32 samples; saved 640 × 480 PNG | [Calibration render](renders/calibration-20mm-r001.png) |

Native masters: [FreeCAD document](cad/calibration-20mm-r001.FCStd), [Blender scene](blender/calibration-20mm-r001.blend). The image was visually inspected: the cube is present, framed correctly and illuminated against a dark background. PNG signature and IHDR dimensions also passed. Screenshots preserve the [completed render window](logs/blender-render-complete.png) and [successful save console](logs/blender-render-save.png).

STL import used scale 0.001, with Blender scene scale 1 metre/unit. Local mesh coordinates remain 0–20 and object scale remains 0.001; use world dimensions for the unit check. Do not apply that conversion again. Geometry tolerance was 1e-7 m in Blender and 1e-6 mm³ for FreeCAD volume.

The visible initial render reported 2 minutes 34.36 seconds including first-use kernel setup. This is not a representative performance benchmark. The initial save helper incorrectly required Render Result metadata to report 640 × 480; Blender reported (0, 0) despite the completed image. The revised helper saves the render and checks the actual PNG header. No second render was needed to resolve this.

These checks establish a working modeling and rendering path. They do not establish Asimov compatibility, robot-specific geometry quality, head mass, motor sizing, physical print accuracy, runtime, or the $800 BOM. The cube is a calibration artifact, not a Mark-I head design.
