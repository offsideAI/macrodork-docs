# Mark-I build workspace

> Current product decisions: [PRODUCT-REQUIREMENTS-R001.md](PRODUCT-REQUIREMENTS-R001.md) supersedes conflicting provisional assumptions below. Overall height is confirmed at 60 inches (1524 mm), superseding the earlier 48-inch target.

The first full-body Blender concept is complete. Open [the R001 design notes](design/MARK-I-R001.md), [editable Blender file](blender/mark-i-full-body-r001.blend), or [full-body render](renders/mark-i-r001-hero.png). The model includes a 60-inch wheeled body, camera-eye head, gesture arms, editable head/arm motion, three head proportion studies, and labeled internal packaging allowances.

Status, 2026-09-07: native model and static GLB export measure 1.524 m tall in neutral pose; the GLB was reimported to verify scale. Five rendered views were inspected. Blender MCP is working with visible Blender on LG. Mechanical fit, Asimov interfaces, actual mass, runtime, stability and BOM cost remain unverified. See the current product requirements above for the agreed feature priorities.

| Document | Purpose |
|---|---|
| [NEXT-STEPS.md](NEXT-STEPS.md) | Current path from concept to physical prototype |
| [Prototype release plan](manufacturing/PROTOTYPE-RELEASE-PLAN.md) | Engineering stages, per-supplier files and first print orders |
| [Manufacturing part register](manufacturing/part-register-P001.csv) | Draft part families, fabrication routes and unresolved dependencies |
| [Release checklist](manufacturing/RELEASE-CHECKLIST.md) | Checks before a fabrication package is issued |
| [VERIFICATION-RESULTS.md](VERIFICATION-RESULTS.md) | Completed calibration, evidence, and limits |
| [BLENDER-MCP-SETUP.md](BLENDER-MCP-SETUP.md) | Versioned integration steps for visible Blender operation through Codex |
| [TOOLCHAIN-SETUP.md](TOOLCHAIN-SETUP.md) | Ordered installation, verification, and automation workflow |
| [HEAD-DESIGN-BRIEF.md](HEAD-DESIGN-BRIEF.md) | Initial appearance, packaging, interfaces, and acceptance criteria |
| [BUILD-PLAN.md](BUILD-PLAN.md) | Head-first work sequence through body engineering and campaign assets |
| [COST-PLAN.md](COST-PLAN.md) | Current CAD prototype basis, historical allocations and costing method |
| [budget-targets.csv](bom/budget-targets.csv) | Historical USD allocation worksheet; superseded, not a priced BOM |
| [SOURCES.md](SOURCES.md) | Primary-source links, observations, limitations, and provenance |
| [AUDIT-LOG.md](AUDIT-LOG.md) | Running action and decision record |
| [toolchain_check.py](scripts/toolchain_check.py) | Local installation inventory; writes a dated JSON record |

## Working conventions

All Mark-I authored work stays here. Future folders: `cad/` for mechanical masters, `blender/` for scenes, `renders/` for images, `exports/` for STEP/STL/GLB, `electronics/`, `simulation/`, `bom/quotes/`, `references/`, `logs/`, and `prototypes/`. Create these as used. User-provided material in `specification/` is preserved.

Use revisioned filenames such as `mark-i-head-r001.FCStd` and `mark-i-head-r001.blend`. Keep the corresponding scripts, parameters, component datasheets, source revision, and export settings with each revision. New native geometry and imported upstream solids must have distinguishable names and provenance.

Record every work batch in the audit log: request/input → action → evidence/output → concise decision rationale → checks → unresolved issues. Correct errors with new entries instead of silently rewriting prior records. Use UTC timestamps for machine logs and date/revision IDs for design records. Repository history and independently archived milestones are needed for stronger audit assurances; ordinary files and local hashes can be edited.

## Current prototype planning

The visual concept is complete; no robot fabrication files have been released. Follow the [prototype release plan](manufacturing/PROTOTYPE-RELEASE-PLAN.md): shop/component selection, mechanical CAD, fit coupons, working head bench prototype, loaded rolling chassis, then full-body skins and gesture arms. The [RFQ draft](manufacturing/PRINT-SHOP-RFQ-DRAFT.md) is prepared but has not been sent.

Height, mobility, physical camera eyes, head functions, two-hour runtime target and CAD prototype cost basis are recorded in the current requirements. Remaining inputs include print-shop capabilities, final head proportion choice, exact hardware, floor/speed/payload conditions and runtime duty cycle. Working Explorer head A remains a provisional engineering baseline.

## Mark 1 website

The [website implementation plan](website/IMPLEMENTATION-PLAN.md) and [verification record](website/VERIFICATION.json) cover the redesigned [macrodork-web application](../macrodork-web/README.md), Mark 1 render gallery, product specifications and Stripe preorder backend. Preorders remain closed pending business terms and account setup. Application source is in macrodork-web as requested; audit evidence stays here.
