# Mark-I product requirements — R001

Recorded 2026-09-07 UTC (2026-09-06 Toronto). Source: the user's sequential answers in this session and supplied concept image. These decisions supersede conflicting initial proposals in the earlier planning documents. They establish design intent, not verified hardware performance.

| Topic | User decision |
|---|---|
| Architecture | Wheeled companion; remote-controlled driving for the first prototype |
| Overall height | 60 inches (1524 mm) overall, as shown in the supplied mock. User explicitly selected option B, superseding the earlier 48-inch target. |
| Head styling | Blend the user's Disney BDX / BD-1 explorer-droid reference with Reachy Mini, especially its two-eye appearance |
| Personality | Playful and adventurous |
| Eyes | Two actual camera lenses form the eyes; expression through head movement |
| Head yaw | Motorized turntable, ±90° from forward. This supersedes the earlier ±180° request. |
| Other head motion | Up/down nodding and sideways tilt; angular ranges not yet specified |
| Head contents | Raspberry Pi 5, 8 GB RAM; two cameras for stereo vision; microphone; speaker |
| Software | Hybrid: local basic functions and cloud assistance for complex requests |
| Arms | One powered joint per arm for raising/lowering gestures |
| Runtime | Target approximately two hours per charge; duty cycle and battery not yet specified |
| Cost basis | One prototype, Canadian dollars |
| Budget priority | Preserve selected features and estimate the required budget. CAD $800 is the original reference, not a firm cap authorizing feature removal. |
| Head accents | User delegated selection based on budget. Assistant baseline: simple amber eye accents, with illumination conditional on component pricing and optical checks; omit antenna-like stalks from the first prototype. These cosmetics may be simplified without removing selected working features. |
| Colour/finish reference | User supplied `specification-mocks/mock_1.png` in response to the palette question |
| Workflow | Ask questions one at a time in multiple-choice format here. Keep application work visible on LG second monitor and authored work/audit under Mark-I-Build. |

## Observations from the supplied image

[mock_1.png](specification-mocks/mock_1.png) shows a metallic silver/grey rounded rectangular head, black circular eye surrounds joined by a dark bridge, amber/orange illuminated eye arcs and body accents, two antenna-like stalks, and a visible articulated dark neck. The torso has matching metallic panels and a wheeled base. The drawing labels overall height as **60 in**.

Use silver/grey, black, and amber/orange as the interpreted visual palette. The image does not establish material, manufacturing process, dimensions, camera optics or working mechanics. Decorative lighting and antenna-like stalks are visual cues. Under delegated cosmetic selection, amber accents are retained provisionally and stalks are omitted from the first prototype; neither is a mandatory functional requirement. Preserve the user's camera-lens eyes and gesture arms: the image alone does not cancel them or define a final wheel arrangement.

Image SHA-256: `0aee1fe185e55f5d456b31004a1078be7313acad6a346537cd641aea977cffff`. Original image preserved without edits.

## Effect on the next head concepts

Explore three original silhouette/proportion variants within this common visual direction; the earlier screen-face, physical-eye and duck comparison is superseded. Include the Pi, stereo-camera, microphone and speaker envelopes and the yaw/pitch/roll neck in each packaging study. Specific modules, camera baseline, cooling, head dimensions and mass must be derived rather than carried over from the initial small screen-head proposal.

Overall height is confirmed at 60 inches. Cosmetic selection is delegated. Next measure upstream interfaces, select real component candidates and establish packaging, mass and cost before detailed mechanical design. Original Asimov compatibility and the prototype's actual price remain unverified.

## Decision update

The user selected 60 inches overall in response to the height clarification. The earlier 48-inch choice is superseded; the original discrepancy remains recorded in audit entry A021.

The user subsequently delegated head-accent choices according to budget. Keep the silver/grey shell, dark camera-eye surrounds and simple amber accents as the design baseline; cost illumination separately and use non-illuminated accents if needed. Check for glare/reflections into the stereo cameras before committing illuminated parts. Omit decorative antenna-like stalks for the first prototype to reduce part count. This is a design allowance, not a quoted cost or a claim that the full robot fits CAD $800.
