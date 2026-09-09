# Mark-I — full-body concept R001

A complete editable Blender concept based on the user's `mock_1.png`, with a 60-inch neutral height target. This revision establishes appearance, part organization and an articulation study. It is not a fabrication release or an Asimov-compatible mechanical assembly.

## Open and review

Open [mark-i-full-body-r001.blend](../blender/mark-i-full-body-r001.blend) in Blender on the LG monitor. The file contains:

- **MarkI_R001**: whole robot with Explorer head, named component collections, studio, four cameras and a 120-frame gesture study.
- **MarkI_Head_Concepts_R001**: three head proportion studies with a comparison camera.

Use the scene selector at the top to switch between them. Main-scene frame 1 is neutral; frames 30 and 60 show expression/arm poses; frame 120 returns to neutral. Playback is a visual motion study, not a validated controller or motor simulation.

The internal-envelopes collection is hidden in viewport and render. Enable it and use X-ray/hide cosmetic shells to examine its labeled Pi 5 8 GB, cooling, stereo-camera, microphone, speaker, battery and controller allowances. These are intentionally simple packing boxes; the Pi envelope includes allowance and does not claim an accurate board model.

## Appearance and architecture

Retained the reference's rounded silver shell, black binocular eyes, amber crescents, exposed dark articulated neck, tapered torso and wheeled stance. Omitted decorative antenna stalks under the user's delegated budget choice. Added the requested rigid gesture arms, one shoulder axis each.

The proposed base has two 330 mm drive-wheel envelopes and two 200 mm front passive support-wheel envelopes. It simplifies the reference's visually complex wheel pods into a differential-drive concept. Caster/fork detail is styling geometry; actual components and swivel sweep are not selected or validated. Battery volume sits low in the base.

The main head has a 500 × 250 mm front-shell outline, a removable-looking rear cap, optical barrels, side acoustic covers, microphone ports and rear vent details. Optical pupils are separated from the decorative amber arcs. No camera module, field of view, stereo baseline or lighting-glare performance has been qualified. The exterior shells are solid visual meshes without engineered wall thickness; vent slots and screws are appearance details rather than manufactured openings and fasteners.

## Three head studies

| Concept | Direction | Front-shell outline | Purpose |
|---|---|---|---|
| A / Explorer | Balanced rounded rectangle | 500 × 250 mm | Closest to the supplied mock; used on the full-body concept |
| B / Scout | Narrower, taller face | 445 × 282.5 mm | More compact, upright personality |
| C / Surveyor | Wider, lower face | 540 × 225 mm | Broader binocular stance |

Eye pupils stay circular at the same diameter in all studies; only placement and shell proportions vary. These are three proportion variants of the agreed styling direction, not three unrelated robot designs. Body attachment and internal fit for B/C require further work.

## Articulation

- Yaw: ±90°, reflecting the user requirement.
- Pitch: −20° to +25° study range.
- Roll: ±15° study range.
- Arms: one shoulder X axis each, provisionally constrained to ±60°; gesture animation uses a smaller range.

Pitch/roll/arm travel values are assistant-selected study parameters. Neck/arm hierarchies and rotation constraints are editable. Swept clearances, cable paths, pinch protection, bearing supports, travel stops and required torque remain to be engineered.

## Outputs

- [Full-body hero](../renders/mark-i-r001-hero.png)
- [Front view](../renders/mark-i-r001-front.png)
- [Head close-up](../renders/mark-i-r001-head-detail.png)
- [Rear service view](../renders/mark-i-r001-rear.png)
- [Three head concepts](../renders/mark-i-r001-head-concepts.png)
- Native `.blend` scene linked above, including editable materials, modifiers, camera/light setup and animation.
- Static GLB preview under `exports/mark-i-full-body-r001.glb`; excludes studio and internal packing boxes. Native Blender is the authoritative visual source; GLB does not carry the motion study.

## Reproducibility and limits

Scripts are under `scripts/mark-i-r001/`. Each modeling batch is sent as `common.py` followed by its numbered stage to Blender MCP. Start from a fresh Blender scene/file when reproducing; stages intentionally reject duplicate main/comparison scenes. Stage 04 includes the corrected arc placement; 04b records the repair made during the original run and is unnecessary in a fresh build. Render jobs must complete before switching scenes or validating/exporting.

No external model generation or asset library was used. Geometry is newly authored from the user's reference and requirements; no Asimov CAD was fetched, imported or certified as compatible in this revision. No new parts were purchased and no BOM cost was asserted. CAD $800 remains the original reference; the user prioritized retaining the working features and estimating their actual cost.

Next engineering work: choose the head direction, select real camera/audio/cooling/actuator components, inspect the upstream interfaces, revise packaging and mass, and create dimensioned FreeCAD mechanical parts. The two-hour runtime, mobile stability and total prototype cost require real component data and testing.

## Revision checks

Neutral evaluated bounds: approximately 698 mm wide × 540 mm deep × 1524 mm tall. The static GLB reimported with 222 mesh objects and the same overall dimensions within 1 mm. The initial export unintentionally included selected objects from other scenes; restricting export to the active Mark-I scene corrected it. See [geometry measurements](../logs/mark-i-r001-geometry.json) and [GLB roundtrip](../logs/mark-i-r001-glb-roundtrip.json).
