# Prototype manufacturing release checklist

Template status: all gates below are open. Apply separately to P0 coupons, P1 head, P2 chassis and P3 full-body parts. Release status is a technical record; it does not by itself place an order.

## Requirements and purchased interfaces

- [ ] Release scope, prototype purpose and part revisions identified; visual baseline chosen.
- [ ] Shop/process/material/build envelope confirmed in writing.
- [ ] Exact purchased hardware, connectors and relevant datasheet revisions identified.
- [ ] Critical dimensions checked against physical samples or trusted manufacturer drawings; unresolved fits marked.
- [ ] Upstream provenance, modifications and applicable source notices recorded where used.

## Per-part CAD and assembly

- [ ] Each unique part has a stable ID, revision, quantity and manufacturing route; split families resolved to leaf parts.
- [ ] Finished part fits usable machine volume in the intended orientation with support allowance.
- [ ] Designed walls, bosses, ribs, openings and joints exist as geometry; no cosmetic-only vent marks mistaken for holes.
- [ ] Holes, bearing seats, inserts and fastener clearances follow selected parts and measured coupon results.
- [ ] Load path, joint loads and required material/orientation reviewed for each structural part.
- [ ] Supports/powder/resin can be removed; no inaccessible trapped volumes.
- [ ] Camera cones, stereo datums, plug insertion and cable bend/service space clear.
- [ ] Assembly sequence, tool access, retention and disassembly documented.
- [ ] All intended movements checked for shell/cable interference; physical testing remains distinct from CAD clearance.

## Printable exports

- [ ] One file per unique manufactured part; repeat quantity in manifest; distinguish left/right geometry.
- [ ] Mesh closed/manifold as appropriate, normals consistent, positive volume, no self-intersections or unintended disconnected solids.
- [ ] Tessellation meets chosen dimensional/surface-error allowance without unnecessary triangles.
- [ ] Units explicitly millimetres. Import back into the checking tool and measure three dimensions against drawing.
- [ ] Source solids, drawing, STL and optional 3MF agree on shape and revision.
- [ ] Slice in the chosen process profile or obtain shop preview; inspect layers for lost walls, holes, islands and supports.
- [ ] Fit-critical surfaces, finish, support restrictions and orientation requirements identified in drawing/RFQ.
- [ ] Material grade, colour, post-processing, inserts and quantity specified; no unspecified infill relied on for strength.

## Custom PCB only, when applicable

- [ ] Schematic, footprints, board outline, stackup, mounting and connector pinouts reviewed.
- [ ] Electrical and design-rule checks resolved or documented with justified exceptions.
- [ ] Gerber layers and plated/non-plated drill data match manufacturer instructions; viewer review completed.
- [ ] Bare-board drawing, finish, thickness and copper requirements included.
- [ ] For PCBA: BOM/MPNs, DNP choices, placement rotations/origins and assembly drawings included.
- [ ] Bring-up steps and acceptance tests documented; firmware/programming files included only if the assembler needs them.

## Shop handoff and receipt

- [ ] Release README clearly states prototype purpose and what is included/excluded.
- [ ] CAD/mesh/drawing/BOM quantities and names agree; no historical superseded files in the order bundle.
- [ ] SHA-256 manifest generated after final edits and verified; archive this exact order bundle.
- [ ] Shop confirms scale, material, critical dimensions, permitted deviations and quote/lead time.
- [ ] Fabrication authorization tied to the actual bundle and quote; subsequent changes get a new revision.
- [ ] Incoming dimensional/visual/fit checks recorded; nonconforming parts handled before assembly.
- [ ] As-built revisions and prototype test results archived.
