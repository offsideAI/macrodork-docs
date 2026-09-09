# Mark-I development sequence

> Current product decisions: [PRODUCT-REQUIREMENTS-R001.md](PRODUCT-REQUIREMENTS-R001.md) supersedes conflicting provisional assumptions below. Overall height is confirmed at 60 inches (1524 mm), superseding the earlier 48-inch target.

Toolchain stage 1 is complete as of 2026-09-06; see [verification results](VERIFICATION-RESULTS.md). Immediate work is product definition, source inspection and a head concept; [next steps](NEXT-STEPS.md) detail the handoff. Body engineering follows a measured head budget and a decision on locomotion. Durations below are planning allowances for design effort, excluding user review, procurement and fabrication; they are not delivery commitments.

| Stage | Work and outputs | Exit evidence | Allowance |
|---|---|---|---|
| 0. Product definition | Confirm height, locomotion, currency, production quantity, assistant functions, audience and runtime | Versioned requirements and explicit open items | One review session |
| 1. Toolchain | Install Blender/FreeCAD, record versions, run geometry/render checks | Blender Python works; calibration cube measures correctly through export/import; first rendered frame | Half day if installation works normally |
| 2. Upstream baseline | Retrieve source at a full commit SHA; inventory mechanical files, CAD assemblies, simulation and licenses | Source manifest with paths, hashes, units and actual head/neck interfaces | 1–2 days |
| 3. Head concepts | Place component envelopes; build three silhouettes; test expression and proportions with a body proxy | Comparable renders, initial mass/cost table, selected direction | 1–3 days |
| 4. Mechanical head | Shells, carrier, service access, neck adapter, harness and thermal design | Editable solids, collision checks, drawings, STEP and print exports | 3–7 days |
| 5. Head prototype | Print fit coupons then shell; assemble selected components; exercise neck in a fixture | Photos, measured mass, interference/temperature/audio/display results | Iterative; fabrication dependent |
| 6. Body feasibility | Compare chosen locomotion architectures and joint counts against power, torque, stability and cost | Feasible architecture with supporting calculations and current quotes, or documented budget/scope change | 3–5 days initial study |
| 7. Body CAD and control | Design mounts/structure, integrate head, update masses/inertia, collision geometry and actuator model | Assembly exports, working bench subsystems, body simulation matched to actual design | Schedule after stage 6 |
| 8. Integrated prototype | Bring up power, communications, limits, perception and assistant; test motion progressively | Logged repeatable operation and measured capabilities | Schedule after hardware selection |
| 9. Campaign assets and build release | Render final verified geometry; capture prototype footage; prepare source package and production costing | Clear separation of prototype evidence and concept visuals; traceable manufacturing revision | Schedule after stage 8 |

## Source intake checklist

Acquire [menloresearch/asimov-1](https://github.com/menloresearch/asimov-1) under `references/asimov-1/`. Record the resolved commit, retrieval date, remote, submodule SHAs, and any LFS dependencies before using geometry. Preserve original files and licenses; save modifications separately. Avoid downloading unrelated upstream payloads merely to begin styling.

Start inspection at `mechanical/ASV1/`, then identify the head and neck assembly and source solids. Check units with known component dimensions. STEP solids are preferable for engineering; simulation meshes help visualization and articulation but do not establish fastener fits or fabrication quality. Record any missing native features, CAD dependencies, or purchasable components.

The current upstream README lists some onboard software as forthcoming while documentation describes functionality available in supplied firmware. Resolve exact code, images, policies and redistribution rights before planning a working derivative around them. Do not assume a published API or CAD repository is a complete deployable software stack. [Repository status](https://github.com/menloresearch/asimov-1), [Menlo availability table](https://docs.menlo.ai/asimov/1)

## Body decision criteria

The user's requested Asimov lineage remains the reference. A fixed pedestal or wheeled body would be an architectural departure requiring an explicit product decision. A miniature biped retains more of the humanoid intent but changes loads, actuation, packaging and control substantially. An original-size body requires a separate higher-cost feasibility path.

For each candidate, calculate supported mass, joint duty cycles, continuous torque/speed, current peaks and battery energy from the proposed real components. Check stability with the full head payload. Select motors using measured/vendor limits; estimate harness voltage drop, connector currents, regulator headroom and protection. Reducing cosmetic fabrication cost cannot compensate for an unsuitable actuator architecture.

If walking is selected, model actual servo dynamics, backlash, friction, saturation, latency and new masses/inertias; validate controlled motion in fixtures before any untethered trial. Asimov's original learned policy cannot be assumed valid after changing size, mass distribution or actuator behavior. Inspect the [official locomotion workflow](https://docs.menlo.ai/guides/locomotion-training) when choosing the training stack.

## Budget and campaign evidence

At every stage, update quoted BOM, expected landed hardware cost, recurring assembly/test cost, and development/tooling separately. Record replacement candidates and capability tradeoffs. Stop freezing parts that exceed the allocation until the overall plan is reconciled.

For the eventual general-public product, define intended age group, sales regions, reachable moving parts, battery/charger design and data controls early enough to affect engineering. Commission the applicable product testing once configuration and markets are known. No present plan establishes certification or readiness to sell.

Archive milestone bundles containing source CAD, scripts, parameters, component revisions, drawings, exports, render settings, source notices, measured results and file hashes. Keep campaign renders labeled as such and claims bounded by prototype evidence. Update the website with Mark-I assets in a later publication task after the underlying product direction is established.
