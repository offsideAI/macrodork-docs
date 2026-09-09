# Mark-I prototype release plan — P001

Date: 2026-09-07. Status: **planning / not released for fabrication**. Builds on [visual concept R001](../design/MARK-I-R001.md) and [current requirements](../PRODUCT-REQUIREMENTS-R001.md). No printable robot part or custom PCB is released by this document.

## Recommendation

Move from visual design into mechanical/electrical development and design for manufacture. Use three prototype releases: P1 working head on a bench fixture; P2 rolling load-bearing chassis; P3 full-size cosmetic panels and gesture arms. These are staged builds of the same 60-inch robot, not a reduction in the agreed capabilities.

Carry Explorer head A as the working engineering baseline because it is on the full-body model. The user has not selected it over B/C for final fabrication. Confirm the direction before committing the shell split and tooling. Preserve selected functional features; CAD $800 is the original reference, and the user requested an estimate of actual cost rather than silent feature cuts.

Blender remains the visual assembly/reference tool. FreeCAD becomes the dimensioned mechanical master for interfaces and manufactured parts. KiCad is needed only if custom circuitry is justified. Application work stays visible on LG; authored designs, part evidence and release records stay under Mark-I-Build.

## What the existing model does and does not provide

R001 has 222 visible geometry objects and measured neutral dimensions approximately 698 × 540 × 1524 mm. Those objects include lens surfaces, decorative lines and screw appearances; they are not 222 manufactured parts. The 500 mm front head shell will need shop-specific segmentation or a sufficiently large build process.

| Current item | Gap before fabrication | Required output |
|---|---|---|
| Solid visual shell meshes | No hollow interior, designed wall thickness, ribs or fastening scheme | Real shell solids with serviceable splits, bosses and selected fasteners |
| Decorative vent/port surfaces | Dark marks do not make holes | Through-openings with support, acoustic/optical and finger-access considerations |
| Pi/audio/camera boxes | Allowances, not component models | Selected part numbers, datasheets and checked physical envelopes including plugs and cables |
| Neck cylinders and motion hierarchy | No qualified bearing/motor train or cable route | Supported mechanical axes, mounts, measured head mass/COM, torque/load checks and travel stops |
| Wheels and caster appearance | No selected hardware or verified sweep/stability | Real wheel assemblies, motor mounts, load path, ground clearance and support polygon |
| Gesture-arm paddles | Visual rigid parts, no verified shoulder drive | Lightweight shells, internal support and supported single-axis shoulder attachment |
| Amber arcs and optical glass | Appearance geometry | Purchased LEDs/diffusers and actual camera optical path; no opaque printed lens substitutes |
| Static GLB / animation | Correct scale and visual motion only | Mechanical tolerances, assembly instructions and physical test evidence |
| Asimov lineage | No upstream CAD measured in R001 | Pinned upstream source/interface review, or explicitly documented original interfaces |

## Files by supplier

| Item | Authoring master | Supplier package |
|---|---|---|
| Printed polymer shells, covers, jigs and qualified brackets | FreeCAD solids; Blender surface reference | One STL per unique printable part; 3MF where supported; STEP where the supplier accepts it; dimensions/material/quantity drawing and manifest |
| Chassis plates, bearing plates or metal brackets | FreeCAD | STEP plus dimensioned PDF; DXF flat patterns if requested; bends/material/thickness/finish specified |
| Camera optics, motors, bearings, wheels, Pi, batteries and fasteners | Purchased-item record | Manufacturer part number, quantity and sourcing BOM; no printer files |
| Cable harness | Wiring diagram and cable schedule | Connector/pinout, wire specification, length, labels, termination and inspection instructions |
| Custom bare PCB, if needed | KiCad schematic and layout | Gerber layers including board outline, drill files, stackup/fabrication notes and revision manifest |
| Assembled custom PCB, if needed | KiCad plus selected components | Bare-board package plus component BOM with MPNs, placement files, assembly drawings and bring-up instructions |

STL/3MF are supported mesh inputs in PrusaSlicer; its STEP import tessellates geometry. Supplier acceptance varies: Xometry lists STL/3MF for printed parts and STEP for broader manufacturing workflows. Gerber and drill output is for circuit-board fabrication, not polymer printing. Sources: [Prusa formats](https://help.prusa3d.com/article/supported-file-formats_1772), [Xometry accepted files](https://community.xometry.com/kb/articles/643-what-file-types-does-xometry-accept), [KiCad fabrication outputs](https://docs.kicad.org/9.0/en/pcbnew/pcbnew.html#fabrication_outputs_and_plotting).

## Ordered work and release gates

### 1. Define prototype acceptance and supplier constraints

Record head direction, supported indoor floor/threshold conditions, intended drive speed, payload and service access. Retain 60-inch height, remote driving, two stereo camera eyes, Pi 5 8 GB in head, microphone/speaker, yaw ±90°, nod/tilt, two single-axis gesture arms, hybrid assistant and a two-hour runtime target. The latter must be tied to a defined workload/duty cycle.

Ask the print shop for actual machine/process, usable build envelope after supports/brims, available material grades, tolerances, support removal, finishing and insert installation. The user has been asked whether a shop is already selected. Until answered, no specific shop, build size or quote is assumed. Do not split shells around an invented printer size.

Output: dated requirements/acceptance sheet, shop capability record and agreed visual baseline. Exit: component/geometry work can use a consistent set of constraints.

### 2. Select and measure purchased hardware

Select exact stereo cameras/lenses/interfaces and verify simultaneous capture, synchronization requirements and Pi/software support on the bench. Determine whether the current 268 mm camera-spacing study suits the intended viewing distance; do not freeze that spacing from the render. Capture Pi board, cooler, storage, power and connector envelopes from manufacturer data and physical samples.

Select microphone/audio amplifier/speaker, neck actuators/bearings, shoulder actuators and drive components. Prefer complete purchased wheel/hub/caster assemblies over printed tires and working bearings. Identify the actual low-voltage power architecture, controller, battery/charger and protective devices. Do not design direct motor drive from Pi GPIO.

Pin the relevant Asimov source revision and document what is reused, modified or newly designed. Preserve notices for any upstream parts in the release package. Cosmetic resemblance alone is not hardware derivation or compatibility.

Output: manufacturer-linked purchased BOM, measured component envelopes, interface/control/wiring diagram, mass and power worksheet, dated cost evidence in CAD. Unknown costs remain unknown, not zero. Exit: component interfaces, loads and thermal needs are sufficiently known to design mounts.

### 3. Build a mechanical assembly and manufacturing part structure

Turn the part families in [part-register-P001.csv](part-register-P001.csv) into individual CAD parts with stable IDs and revisions. Families with unresolved shell splits receive child IDs after selecting the process; do not export a family as one accidental solid. The register is a planning inventory, not an order BOM: `TBD` means unknown, families/assemblies must be expanded, and quantities across stages are not additive. Reuse successful P0/P1 hardware where appropriate. No manufacturing revision or geometry file is assigned until the part exists. Identical parts use one geometry file plus quantity. Mirrored/different parts get distinct IDs.

Create datums and a master coordinate convention. Keep the head/bearing/torso/chassis load path in a designed internal structure; do not assume printed cosmetic skins carry a 1.5 m robot. An aluminum plate/extrusion frame is a candidate to evaluate, not yet a selected gauge or purchased assembly.

For each printed part, design actual wall thickness, ribs where needed, fastener bosses, inserts/captive nuts, tool access, cable channels and keyed alignment. Break large skins into removable modules and join seams with designed flanges/keys. Keep seam locations away from camera datums and critical bearing seats. Derive fits from the chosen process and coupons. Do not treat a printer's smallest printable wall as a structurally adequate robot shell.

Candidate process comparison: FDM for economical fit/cosmetic trials; SLS/MJF nylon for suitable more intricate functional polymer parts; metal fabrication for load-bearing pieces where calculations require it. Final material, orientation and section sizes follow loads, temperature, the shop's process and testing. Formlabs publishes process/material-specific wall and assembly-clearance guidance; those numbers are not universal FDM tolerances. [Formlabs Fuse design guidance](https://formlabs.com/support/Design-specifications-for-3D-models-Fuse-1/)

Output: editable FreeCAD assembly, per-part drawings and initial assembly sequence. Exit: each part can be made, joined, accessed and removed; every purchased component has a supported mounting plan.

### 4. Engineer motion, power and heat before releasing moving parts

Calculate head mass/COM and axis loads, including acceleration, cable drag and supported bearing loads. Qualify motors from continuous-duty data and bench behavior, rather than stall-torque labels alone. Keep a fixed stereo-camera mounting cassette so changing decorative shells does not disturb camera alignment.

Check head and arm swept volumes with cable allowances, pitch/roll limits and mechanical stops. At the base, evaluate support polygon/COM through head and arm travel, drive acceleration and expected floor transitions. Define low-speed testing and a physical stop/drive-disable path; verify loss of remote connection causes the intended stop behavior before floor operation.

Develop a power budget with separate stationary, moving and assistant-compute loads. Battery capacity must support the two-hour workload after regulator losses and allowed usable capacity. Bench-check Pi supply under audio and motor loads. Establish airflow and evaluate whether fan/speaker placement degrades microphone performance.

Output: load/power/thermal calculations, harness routing and bounded bench-test plan. Exit: selected hardware and structure can proceed to prototype under defined test conditions; unresolved physical capability claims stay open.

### 5. First shop order: small coupons and one camera-eye assembly

Release a small P0 coupon package before a full head print: shell-joint samples, insert/fastener samples, fit-clearance samples, finish sample, one optical bezel and its actual camera mount. Include the selected real fastener/camera references and measured acceptance dimensions. Coupon values are a controlled experiment for the chosen shop/material, not generic tolerances.

Measure returned parts; record thread/insert retention, seam fit, support scars, cosmetic finish and camera field-of-view obstruction. Recheck LED reflections before committing the optical surround. Adjust CAD using measured results.

Output: first released small STL/3MF/STEP set with quantities and inspection sheet. Exit: mating details and critical optical interfaces fit the actual components and selected print process.

### 6. P1: head and neck on a bench fixture

Release the head shell segments, rear access pieces, internal carrier, camera cassette, optical bezels, speaker/microphone mounts, cable guides and qualified neck covers/mounts. Manufacture load-bearing bearing/yoke/fixture parts by the process selected in step 4. Assemble using purchased actuators, bearings, optics and electronics.

Validate camera capture/alignment, Pi operation, audio, neck travel, cable movement, service access and actual mass/COM. Run an agreed workload long enough to assess thermal behavior against manufacturer limits; log temperatures, noise, dropped capture, supply faults and mechanical interference. Correct failures before copying those interfaces into body parts.

Output: working head bench prototype and revisioned test report. This is the recommended first substantial print order.

### 7. P2: rolling chassis with representative payload

Build the structural chassis, motor/bearing mounts, battery tray, power distribution and remote-control system before covering them. Test on a fixture first, then under controlled low-speed floor conditions with representative payload and COM. Include the planned torso/head height and arm-motion mass distribution when assessing stability; a low dummy weight alone does not represent the finished robot.

Validate steering, stopping, lost-link behavior, power under load and the defined runtime duty cycle. Resolve drivetrain, frame and battery changes before releasing skins around them.

Output: documented moving base, wiring/harness record and test results. Exit: core structure and power layout stable enough to receive cosmetic panels.

### 8. P3: full-size panels and gesture arms

Release segmented torso panels, base covers, rigid arm shells, supported shoulder assemblies, bumpers and cosmetic covers using proven joints/materials. Dry-assemble and operate before sanding/painting. Quote unpainted and silver/black/amber finishing separately; printed plastic can carry the silver appearance without committing to metal skins.

Test full assembly/service sequence, clearances, arm/head movement and final mass/COM. Repeat affected power/stability/runtime checks after integration. Capture physical prototype evidence separately from renders.

Output: assembled 60-inch prototype and updated as-built files/BOM/test record.

## Electronics and Gerber decision

Start with Pi 5 8 GB and purchased camera, audio, controller, motor-driver and power modules, with a documented harness. A custom PCB is optional and should follow bench-proven interfaces. If a small LED board, connector carrier or distribution board is justified, create a KiCad schematic/layout after defining connectors, current, mounting holes and board envelope. Do not create an unqualified battery-management or high-current board merely to produce Gerbers.

For custom boards: run electrical/design checks, review real component availability and connector polarity, then inspect plotted copper/mask/outline/drill files in a Gerber viewer. The PCB assembler also needs BOM and position/orientation data; Gerbers alone are insufficient for assembly. [KiCad drill and assembly outputs](https://docs.kicad.org/9.0/en/pcbnew/pcbnew.html#drill_files)

## Release package and handoff

Use [release checklist](RELEASE-CHECKLIST.md) for each order. Do not send the present R001 concept STL/GLB as if it were a ready-to-build kit. Shop-facing files need one clear release status, part/revision/quantity mapping, material/process, millimetre dimensions and acceptance requirements.

The folder structure below is the planned production of step 5 onward, **not an existing release**:

```text
Mark-I-P1-head-r001/
  RELEASE-README.pdf
  parts.csv
  assembly/assembly.pdf
  assembly/assembly.step
  print/MI-Hxxx-r001.stl
  print/MI-Hxxx-r001.3mf          # if accepted
  cad/MI-Hxxx-r001.step
  drawings/MI-Hxxx-r001.pdf
  purchased/purchased-bom.csv
  wiring/harness.pdf
  inspection/inspection-sheet.csv
  source-notices/                # if upstream material is included
  manifest.sha256
```

Custom PCB files belong in a separate revisioned PCB/PCBA order package. The shop should generate machine-specific toolpaths; do not send generic G-code as a portable manufacturing master. Return revised/auto-repaired geometry for engineering review before printing it, since repairs can change fits.

[Print-shop RFQ template](PRINT-SHOP-RFQ-DRAFT.md) is prepared for later use. No supplier has been contacted, no design uploaded to an external quote service, and no order placed. Prepare the actual files and quote first; any later manufacturing authorization should refer to that specific release and cost.

## Cost and scheduling

Track design effort, purchased parts, print/material cost, machine setup, metalwork, inserts/fasteners, assembly, finishing, shipping/tax and reprint allowance separately. Obtain prices in CAD or retain source currency and dated conversion. Use quote validity and lead time to plan; no current dollar total or delivery date is justified by the concept.

The critical path is component/shop selection → engineering → coupon fabrication/measurement → head build → chassis/payload testing → full skins. Procurement and mechanical work can overlap where interfaces are settled. Date the schedule after supplier lead times and engineering scope are known; finishing comes after a successful dry build.

Immediate next work: collect the chosen shop's capabilities, shortlist and bench-check the head components, review upstream neck interfaces, then author the first real camera cassette/eye bezel and joint coupons in FreeCAD. This plan has no fabrication-ready outputs yet.
