# Mark-I cost plan

> Current product decisions: [PRODUCT-REQUIREMENTS-R001.md](PRODUCT-REQUIREMENTS-R001.md) supersedes conflicting provisional assumptions below. Overall height is confirmed at 60 inches (1524 mm), superseding the earlier 48-inch target.

**Current basis: one prototype, Canadian dollars.** Preserve the selected features and estimate the actual required budget; CAD $800 is the original reference, not a firm cap authorizing feature cuts. No validated BOM total exists. Use the [prototype release plan](manufacturing/PROTOTYPE-RELEASE-PLAN.md) for current quoting and staged fabrication.

The USD allocation experiment below is retained as **historical and superseded**, including its screen-face and smaller-head assumptions. It is not a procurement budget for the current 60-inch design. The linked budget-targets.csv is the same historical worksheet; do not convert its amounts into current CAD commitments.

## Feasibility finding

Menlo's Asimov-1 is a roughly 1.2 m, 35 kg, 25-joint humanoid; its upstream README advertises a $20,000 unassembled kit. A near-original robot at $800 cannot presently be justified as a slight cosmetic modification. This is an engineering assessment of the gap, not a proof that every alternative architecture is impossible. [Menlo specifications](https://docs.menlo.ai/asimov/1), [upstream kit listing](https://github.com/menloresearch/asimov-1)

The repository's [earlier miniature study](../artifacts/asimov-1-budget-build.html) gives $784.55 for 23 powered joints and a fixed head, or $853.45 with upgrades. The first leaves **$15.45** below $800 before excluded costs; it is not a ready budget for an expressive moving head. No supplier prices in that study were revalidated in this session.

Do not transfer that study's uniform-scaling argument into a motor qualification. The ideal `mass ∝ scale³`, `gravity torque ∝ scale⁴`, and `inertia ∝ scale⁵` relationships assume similar geometry and density. Real purchased servos, batteries, electronics, cable sizes and minimum walls do not shrink proportionally. A motor's stall rating also does not establish continuous-duty operation. Recalculate from the actual proposed build and test it.

## Historical allocation experiment — superseded

The following **target caps** test whether a smaller, simpler architecture might fit. They do not show that a walking humanoid is achievable for this money. Budget is for one complete robot's hardware at an as-yet unspecified sourcing volume; no volume discounts are assumed as facts.

| Subsystem | Provisional USD target | Boundary |
|---|---:|---|
| Complete expressive head | 140 | Display, camera, audio, two neck actuators, head shells/carrier/adapter and local wiring |
| Main compute and storage | 85 | Main board, storage and cooling; count once even if physically in head |
| Body actuation and interfaces | 320 | Body motors, controllers/bus interfaces and actuator-specific hardware; excludes neck |
| Power | 65 | Battery, charger, regulation, protection and primary disconnect |
| Body structure | 65 | Body shells, brackets, bearings and general fasteners; excludes head and actuator-specific kits |
| System wiring and sensors | 25 | Harness, connectors and body sensors not counted above |
| **Target hardware subtotal** | **700** | Quote every required item before making feasibility claims |
| Unallocated parts-cost reserve | 90 | Price variation, omissions and substitution allowance; not a claimed shipping budget |
| **Planning envelope** | **790** | Leaves $10 strictly below an $800 limit |

The head's $140 allocation can initially be split into display $35, camera $15, audio $20, neck hardware $35, shells/carrier $20, and local wiring/indicator $15. These are design constraints, not selected parts. If real quotes exceed them, revise the design or rebalance the whole robot budget.

The prior study assigns about $502 to actuation and associated kits. Our $320 body allocation is deliberately demanding: retaining its joint count may fail this target. Show the user the priced tradeoff among joint count, mobility, head features and budget before changing requirements.

## Cost boundaries to maintain

Track prototype quantity, 100-unit and 1,000-unit scenarios separately when quoting; these are comparison quantities, not confirmed production plans. Keep original quote currency and dated exchange-rate source if conversion is required.

Separate BOM parts from shipping/duty/tax, recurring assembly and QA, packaging, rejects/spares, warranty support, cloud services, tooling, engineering and testing. An $800 BOM is not an $800 retail price. If the user intends an all-in $800 cost, fit all included categories inside that limit and reduce hardware allocations accordingly.

For each actual line item record: ID, subsystem, manufacturer/part number, revision, quantity per robot, supplier URL, quote file/date/expiry, purchase quantity/MOQ, unit price/currency, extended price, lead time, shipping/tax treatment, mass, voltage/interface, datasheet, substitute and confidence (`quoted`, `listed`, `estimated`, or `target`). Never count unknown-price items as zero in a completed total.

Before procurement: reconcile quantities with CAD, check electrical/mechanical compatibility, verify continuous motor capability and source availability, and sum all categories. Purchasing, supplier contact and checkout have not occurred.
