# Mark-I head — initial design brief

> Current product decisions: [PRODUCT-REQUIREMENTS-R001.md](PRODUCT-REQUIREMENTS-R001.md) supersedes conflicting provisional assumptions below. Overall height is confirmed at 60 inches (1524 mm), superseding the earlier 48-inch target.

Revision P001, 2026-09-06. **Proposed concept only**, pending product answers and component selection. No dimensions below are measured from Asimov CAD or released for fabrication.

## Appearance proposal

A softly rounded head with a broad dark face panel, two clearly readable animated eyes, a warm white matte shell, and a restrained muted teal accent. Keep the camera aperture visible and small, above the eyes; give recording status its own indicator. Avoid exposed screws on the face and exposed mechanisms around the neck. Use expression, slight tilt, and gaze direction to convey attention.

Prepare three comparable 3D variants after Blender is installed: a rounded horizontal capsule, a rounder oval, and a soft rectangular face. Use the same components, lighting, camera, and body proxy for comparison. Review front, side, rear, three-quarter, and eye-level views rather than selecting on one flattering render.

## Initial parameter envelope

These are adjustable study values for a small companion; do not lock them until overall size is chosen.

| Parameter | Study value | What determines the final value |
|---|---|---|
| Outer head width × height × depth | 160 × 130 × 110 mm | Body proportion, display assembly, camera and neck packaging |
| Face | One roughly 4-inch-class rectangular display behind a shaped bezel | Full module/PCB dimensions, view angle, brightness, interface, price |
| Shell nominal wall | 2.0–2.5 mm starting range for FDM trials | Material, print orientation, inserts, local stiffness and thermal testing |
| Moving head mass | Aim ≤350 g including moving hardware and wiring | Measured mass budget and selected neck's continuous capability |
| Neck movement for concept animation | Yaw ±60°, pitch −20° to +30° | Actual CAD collision sweep, harness limits, actuator and controller limits |
| Centre of mass | Keep close to pitch axis | Component placement and measured assembly mass properties |

If the product stays near original Asimov scale, rederive this envelope from its actual interface and aesthetic proportions. Uniformly scaling a shell does not scale purchased displays, connectors, screws, or actuators.

## Packaging and part structure

Use a front bezel, removable rear shell, internal carrier, and replaceable neck adapter. Attach with a small common fastener family and accessible captive nuts/inserts after coupon testing. Avoid glue-only service access. Keep the display's carrier independent of cosmetic surfaces so variants do not require redesigning electronics.

Model complete purchased components, including PCB backs, ribbon exits, plugs, cable bend volumes, speaker enclosure, and microphone ports. Reserve a camera keep-out cone so the bezel cannot clip its view. Evaluate the display with the intended cover material; dark covers can reduce brightness and create camera reflections. Do not assume a curved OLED or custom optical molding is necessary for a curved exterior.

Compare compute in the torso versus in the head. Torso compute can reduce moving mass and heat but increases cable/interface constraints across the neck. Head compute can simplify short camera/display connections but consumes mass and cooling allowance. Decide from selected components, not an aesthetic sketch. Put the battery low in the body during the initial study.

## Engineering checks before choosing neck hardware

Create an interface sheet with neck origin, axis directions, bolt pattern, mating surface, swept volume, cable passage, service path, and connector/power definition. A detachable adapter allows head styling to progress while the body interface is resolved; it is not yet a claim of drop-in Asimov compatibility.

Calculate pitch gravity torque using `m × g × horizontal COM offset`, then include inertia × angular acceleration, cable drag, friction and a justified design margin. Example only: a 0.35 kg head at a 0.035 m offset contributes about **0.12 N·m static torque**. This does not size a motor by itself. Use vendor continuous-duty data and bench temperatures, not advertised stall torque, to qualify a candidate.

Check full motion sweeps for neck pinch access, chin/chest collisions, cable rubbing and tight bends. Plan separate mechanical stops and software limits after measurement. Define a low-speed bench test with a secure fixture before powered motion on a body.

## First render and prototype deliverables

1. Three concept scenes with common scale and rough component blocks, clearly labeled concept.
2. Selected head in front/side/rear/three-quarter views, transparent-background image, and a short turntable.
3. Exploded view showing real shell splits, component carrier, electronics and adapter; annotations identify placeholders.
4. Editable mechanical head assembly with drawing dimensions, STEP export, print meshes and assembly notes.
5. Fit prototype record: actual part mass, display visibility, camera view, microphone/speaker performance, temperature, harness movement and service access.

The first attractive render passes a visual review. A manufacturable head requires the separate dimensional, thermal, electrical, strength and physical-fit checks above. Budget and mass changes must propagate to the body plan before its design is frozen.
