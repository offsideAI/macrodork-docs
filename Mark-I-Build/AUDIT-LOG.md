# Mark-I build audit log

This is an append-only project record of requests, actions, evidence, assumptions, decisions, concise rationale, validation results, and unresolved questions. Private internal deliberations are not recorded. This log and later checksums support review; without independent signed/versioned archival they do not constitute a tamper-proof or exhaustive system-event audit.

## 2026-09-06 — Session 001: setup and initial research

### A001 — Scope received

- Request: plan a custom cute/friendly Mark-I robot, starting with the head; explain required tool installation; use Asimov-1 open hardware as the reference; aim for a complete robot BOM below $800; keep project work and an audit trail under `Mark-I-Build/`.
- Authorized work: repository inspection, public-source research, local planning and design preparation. User asked for installation instructions; applications have not been installed.
- Deliverable for this session: reproducible toolchain instructions, initial head brief, staged head/body engineering plan, cost framework, source register, and audit records. Final CAD, renders, mechanical fit, and production cost require subsequent design and verification.

### A002 — Repository and environment inspection

- Checked repository status, file inventory, applicable `AGENTS.md` files, root and website READMEs, website Mark-I/Asimov references, existing Asimov study, and `NOTICE.md`.
- No applicable `AGENTS.md` was found in repository/ancestor checks. Initial Git working tree was clean.
- Host reports Apple Silicon (`arm64`), macOS 26.4. Homebrew, Git, Python, and agent-reach are available. Blender and FreeCAD were not found on PATH or at their standard `/Applications` locations; other locations were not exhaustively searched.
- `Mark-I-Build/` existed; a `spec/` directory appeared during inspection. Preserve any user-created content there.
- Root CAD, print files, and primary website content concern Pollen Robotics Microduck-derived work. They are not an Asimov-1 mechanical baseline.
- Existing `artifacts/asimov-1-budget-build.html` describes a miniature Asimov proposal: $784.55 fixed-head tier and $853.45 upgraded tier, excluding freight/tax. These are prior study figures, not newly verified quotes or validated working hardware.
- Large embedded mesh data caused one read of the existing HTML to truncate; a subsequent read stripped scripts/styles to inspect the study text.

### A003 — Clarifications requested

- Asked size/mobility (tabletop, small walking humanoid, or original scale).
- Asked $800 currency, prototype versus production basis, and production quantity.
- Asked face direction and camera/audio/head-motion requirements.
- Pending answers do not prevent preparing setup instructions and a provisional design brief. No unconfirmed architecture is treated as approved.

### A004 — Research tools and network outcomes

- Read agent-reach skill and its web/search routing references. Used its web platform / Jina Reader backend, plus the built-in browser for primary-source verification and citations.
- Sandboxed Jina requests failed DNS resolution. Retried the same public-document request with the required network escalation; it succeeded.
- `agent-reach check-update` reported installed v1.5.0 but could not determine update availability because DNS failed. No update was installed.
- Menlo docs and upstream GitHub repository were accessible through the browser. Blender LTS overview and FreeCAD downloads pages returned browser fetch errors; official release/manual and Homebrew cask sources are the fallback for installation details.

### A005 — Initial evidence and decisions

- Menlo documents Asimov-1 as approximately 1.2 m, 35 kg, 25 powered joints. A sub-$800 derivative cannot presently be described as an original-size robot with merely cosmetic changes; an architecture/cost study is necessary.
- Upstream repository identifies CERN-OHL-S-2.0 hardware and GPL-2.0 software licenses. Existing Microduck-derived assets have separate noncommercial notices. Preserve provenance and review the actual upstream terms before commercial distribution.
- Proposed toolchain: FreeCAD for mechanical solids and STEP exchange; Blender for styling, materials, lighting, rigging and rendering. Use application-provided Python runtimes for automation, avoiding unnecessary bridge plugins.
- All new authored deliverables will be placed under `Mark-I-Build/`. Existing website, prior study, and root CAD will remain reference material for this session.

### A006 — Additional source and user-file review

- Reviewed upstream hardware license text, source mechanical directory, system-tour navigation, Homebrew Blender LTS/FreeCAD listings, Blender Python CLI and Metal documentation, FreeCAD manual/releases, and optional PrusaSlicer/KiCad installer pages. URLs and limitations are in `SOURCES.md`.
- An initially guessed system-tour URL failed; following Menlo's navigation resolved `/asimov/1/overview/system-tour`.
- English Blender manual pages returned fetch errors; official localized manual pages and search extracts supplied CLI/Metal references. FreeCAD's main pages returned 403; official release/cask/manual sources supplied the setup references.
- Homebrew listings reported Blender LTS 5.2.1 and FreeCAD 1.1.3. These are researched versions, not locally installed versions.
- Read agent-reach's GitHub routing reference; no upstream clone, authenticated request, supplier contact, purchase or publication occurred.
- Python reports 3.12.13. RAM inspection via `sysctl -n hw.memsize` was denied by the sandbox; memory capacity remains unknown and is not required to finish setup planning.
- Two files appeared under `specification/`: `spec_1.png` and `spec_2.png`. Viewed both. They contain screenshots of the request/conversation/questions, not answered product requirements. Preserved them unchanged. The earlier observed `spec/` folder is not treated as the canonical user-input path.

### A007 — Planning artifacts authored

- Created `README.md`, `TOOLCHAIN-SETUP.md`, `HEAD-DESIGN-BRIEF.md`, `BUILD-PLAN.md`, `COST-PLAN.md`, `SOURCES.md`, `bom/budget-targets.csv`, and `scripts/toolchain_check.py` under this folder.
- Provided ordered Homebrew/manual installation routes, application-runtime verification, a FreeCAD calibration cube, explicit mm-to-m exchange convention, and deferred electronics/simulation tools.
- Proposed a rounded screen-face concept, component-first packaging, removable shell/carrier, and replaceable neck adapter. Study dimensions, head mass, movement limits and costs are labeled provisional. No geometry or hardware compatibility was asserted as verified.
- Chose to retain unanswered requirements as open. The head plan is reversible and modular; original-size versus miniature versus stationary/wheeled architecture is not selected on the user's behalf.
- Created a $700 hardware allocation plus $90 reserve, totaling $790 provisional USD. This is a target worksheet, not a quoted BOM. The original $784.55 proposal leaves only $15.45 below $800 and does not establish feasibility for the proposed expressive head.
- Documented why uniform geometric scaling and stall-torque comparisons are insufficient to qualify a smaller walking robot. Source software availability, component fit, and actual torque/thermal performance remain verification work.

### A008 — Validation results, 2026-09-06 22:52 UTC

- Ran `python3 Mark-I-Build/scripts/toolchain_check.py`. It produced `logs/toolchain-20260906T225222.550677Z.json` and returned expected status 1 because Blender and FreeCAD are absent at configured bundle paths. This is a missing-installation result, not a claim that either application cannot run on this Mac.
- Parsed the setup script's Python syntax successfully without creating bytecode caches.
- Checked local Markdown links in seven project documents: all targets existed.
- Parsed the CSV, checked unique allocation IDs, and summed exact decimal amounts: $790.
- Wrote machine-readable verification results to `logs/planning-validation-001.json`.
- `git status --short` reported only the untracked `Mark-I-Build/` folder. No files outside this folder were changed by this session. User screenshots are included in that untracked folder and remain user-owned input.
- Not run: installed-app functional checks, calibration geometry, actual renders, CAD import/export, physical assembly, dynamics, electrical/thermal tests or supplier-quote validation.

### A009 — Handoff and audit snapshot

- Installation instructions and planning are ready for review. User answers to size/mobility, currency/volume and face/functions are still pending at handoff.
- Next design action after setup and requirement resolution: pin Asimov source, measure the relevant head/neck interface, select component envelopes, then generate comparable 3D head concepts.
- Snapshot procedure for this handoff: create `logs/manifest-001.sha256` over the current files in this folder, excluding checksum manifests themselves. This supports later file comparison, but is not independent proof against tampering. Any later edits require a new revision/manifest and an appended log entry.
- No final CAD, custom render, BOM feasibility proof, application installation, Git commit or external publication is claimed complete.

## 2026-09-06 — Session 002: visible application setup

### A010 — User authorization and interaction constraint

- User reported installing the apps and asked the assistant to complete first launch and Blender Metal setup. Then explicitly required foreground operation on the connected second monitor so each UI step could be observed.
- Before that foreground constraint arrived, the inventory checker ran and invoked Blender `--version`; no background rendering or configuration session was started. Its result is `logs/toolchain-20260906T230700.593493Z.json`: Blender 5.2.1 was present; FreeCAD was absent at that time.
- Further setup uses visible application windows and mouse events. No background Blender sessions, Blender Python configuration commands, or direct preferences-file edits are used.

### A011 — Display discovery and Blender first launch

- macOS AppKit reported Built-in Retina Display (2056 × 1285 logical points) and LG UltraFine (2560 × 1440), with LG to the right at global x=2056. Recorded this layout to target mouse events and windows.
- Opened Blender through macOS `open`. Accessibility reported its main window at {2395,105}, size {1837,1218}, already within the LG display.
- Inspected display screenshots. The first-run Quick Setup screen was visible.
- A standard System Events accessibility click did not complete Blender's custom UI action. Created `scripts/foreground-click.js`, restricted to the observed LG bounds, to send visible mouse movement/down/up events.
- Early synthetic clicks focused/highlighted the control; adding ordinary short event intervals allowed the visible Continue button to complete setup. Dismissed the resulting splash and opened Edit → Preferences through mouse clicks.
- The new Preferences window appeared outside the LG view; moved it to {2700,250} using macOS Accessibility before changing/checking preferences.

### A012 — Metal configuration verified visually

- Selected System in the visible Preferences window. Metal was already selected; Apple M5 Max (GPU – 32 cores) was enabled and the CPU entry was unchecked. Preserved screenshot `logs/blender-metal-verified.png`.
- Opened the preferences menu and confirmed Auto-Save Preferences was checked. Issued the visible Save Preferences click; after interruption the menu was closed and Metal/GPU selections remained visible.
- The repeatedly captured `logs/blender-foreground-before.png` is a working inspection image and was overwritten as setup progressed; it is not an immutable before-state record. The separately named Metal screenshot is the retained evidence.
- No actual render, scene engine change, or GPU benchmark was performed in this setup step.

### A013 — FreeCAD installation timing and first launch

- Repeated filesystem checks initially found neither `/Applications/FreeCAD.app` nor its Homebrew cask directory. Proposed a visible Terminal installation; that tool call was interrupted and did not report completion. No successful assistant installation is claimed.
- User clarified FreeCAD was already installed. A new check found `/Applications/FreeCAD.app` and `/opt/homebrew/Caskroom/freecad`. Do not repeat installation.
- Issued a foreground FreeCAD launch, followed by a request to move its windows onto LG. The first immediate Accessibility check found no windows yet; wait for application initialization and recheck before claiming successful launch.

### A014 — First-launch completion confirmed

- Once initialization completed, Accessibility identified `FreeCAD 1.1.3`, positioned at {2800,150} with size {1800,1000}, wholly on the LG display.
- Visually inspected its welcome screen: Standard (mm, kg, s, °) units were selected. Preserved `logs/freecad-first-run-units.png`, then clicked the visible Done button.
- Verified the FreeCAD start page appeared; retained `logs/freecad-foreground.png`. FreeCAD is left open on the LG display. Blender remains open with the verified Metal/GPU preferences.
- Setup step 2 is complete for both applications. All application setup actions after the user's foreground instruction were visible GUI interactions. No background Blender session, render, geometry automation or duplicate installation was executed successfully by the assistant.
- This validates first launch and visible configuration only. CAD exchange, rendering and physical robot engineering remain separate tasks.
- Updated the workspace README to reflect first-launch completion. Session evidence is included in the next checksum snapshot, `logs/manifest-002.sha256`; the previous snapshot remains a historical record and naturally differs where files have since changed.

## 2026-09-06 — Session 003: foreground calibration and next-step planning

### A015 — Installation record and verification scope

- User requested step 4 and a next-step plan after completing the inventory check. Continued the standing requirement for visible application work on LG.
- Read `logs/toolchain-20260906T232144.466983Z.json`: both applications were present; Blender 5.2.1 and FreeCAD build 1.1.3. No duplicate installation was needed.
- Created `scripts/foreground-console.js` to enter single-line commands in an already-frontmost FreeCAD/Blender window and staged calibration helpers. Geometry operations run through visible application consoles, not headless processes.

### A016 — FreeCAD calibration results

- Enabled View → Panels → Python Console visibly. Loaded `scripts/freecad_calibration.py`, then called `create_cube()`.
- The cube measured 20 × 20 × 20 mm; validity passed. Kernel volume was 7999.999999999998 mm³, within 1e-6 mm³ of 8000.
- Creating the model moved focus to the viewport, so the first attempted export command did not execute. Refocused the console and ran `export_and_check()` successfully.
- Saved `cad/calibration-20mm-r001.FCStd`, `exports/calibration-20mm-r001.step`, and `exports/calibration-20mm-r001.stl`.
- STEP reimport remained valid with the same volume. STL reimport measured 20 mm on each axis and contained 12 triangles. Results: `logs/freecad-calibration-003.json`; screenshots: `logs/freecad-calibration-cube.png` and `logs/freecad-calibration-export.png`.

### A017 — Blender geometry and render preparation

- Activated Blender, closed Preferences, and used Shift-F4 to show its Python Console. Loaded `scripts/blender_calibration.py`, then ran `prepare_calibration()` visibly.
- Helper requires a foreground GUI session and creates a separate calibration scene, preserving the prior scene.
- Imported the STL with scale 0.001 and scene scale 1 metre/unit. Each dimension was 0.020000001415610313 m, within 1e-7 m of 0.020 m. Object scale remains 0.001: the recorded local mesh bounds (0–20) are not world-space metres.
- Saved `blender/calibration-20mm-r001.blend`, configured two lights/camera and Cycles GPU/Metal, and recorded `logs/blender-calibration-003.json` with render pending.
- Non-fatal material/world `use_nodes` deprecation notices concern a future Blender version; current 5.2.1 script execution succeeded.
- Returned to the viewport and selected Render → Render Image visibly. The render window was placed on LG; initial progress showed GPU kernel loading.

### A018 — Interruption and resumed verification

- Automatic approval review rejected the next window-resize action because the account had reached its usage limit. The planned audit append in that same tool call was not executed. A015–A017 above reconstruct those actions from the actual tool transcript and saved evidence.
- User stopped the session, then explicitly asked to resume. Retried GUI access under the normal approval mechanism; screen capture and window inspection succeeded.
- On resumption, no PNG existed and the render log remained pending. The visible render window still showed kernel loading near 75/77, not a completed render. Do not report the GPU render as passed without further evidence.

### A019 — Render completion and export correction

- Resumed inspection showed a completed cube render on LG, with displayed time 02:34.36 including initial kernel setup. Retained `logs/blender-render-complete.png`. This is a functional check, not a performance benchmark.
- Closed the render window to access Blender's visible console. The first save helper rejected Render Result metadata `(0, 0)` even though the image was complete. Diagnosed through the visible console; revised `save_render_result()` to save the existing buffer and verify the PNG signature and actual IHDR dimensions, while rejecting background mode or an active render job.
- Several synthetic input attempts did not enter commands because of application/editor focus timing. Rechecked screenshots, explicitly focused Blender and its console, added short delays, then successfully reloaded the helper and saved the result. Expanded the click helper's expected-app guard to accept FreeCAD or Blender; it refuses input when the requested app is not frontmost.
- Saved `renders/calibration-20mm-r001.png`; header dimensions are 640 × 480. Visually inspected the saved image: correctly framed, illuminated cube on a dark background. Updated `logs/blender-calibration-003.json` to complete only after the file check passed. Preserved successful console screenshot `logs/blender-render-save.png`.
- Attempted F11 to redisplay Blender's render; macOS interpreted it as Show Desktop. Reversed that action. A visible `bpy.ops.render.view_show()` returned `PASS_THROUGH` without displaying the result. Opened the saved PNG in Preview instead, positioned at {2800,220}, size {1000,800}, wholly on LG. Verified it visually and retained `logs/blender-calibration-handoff.png`.
- No headless application session or additional render was launched to resolve image saving. Application work remained through visible GUI interactions; scripts, documents and evidence are under `Mark-I-Build`.

### A020 — Verified setup handoff and next design decisions

- Added `VERIFICATION-RESULTS.md` and `NEXT-STEPS.md`; updated README, setup guide and build-plan status. Removed the obsolete background Blender verification command from the setup instructions to respect the user's standing foreground requirement.
- Planned the next sequence: product envelope → pinned Asimov source and measured interfaces → quoted component envelopes → three comparable head concepts → parametric mechanical head → physical prototype → body feasibility.
- Requested size/mobility, currency/quantity and face/functions using the user-input tool while completing independent documentation. These remain pending; the provisional head envelope and $790 allocation are not approved requirements or validated hardware costs.
- No custom robot head, upstream CAD retrieval, supplier-quote validation, physical print or body design is claimed complete. Calibration is sufficient to begin those tasks without installing additional tools now.
- Handoff checks will validate local document links, Python syntax, report consistency and required output files, recording `logs/setup-validation-003.json`. Then create and verify `logs/manifest-003.sha256` over current files, excluding checksum manifests. Earlier manifests remain historical snapshots.

- Handoff checks passed: 35 local document links, three Python scripts parsed, five calibration outputs present, report consistency and 640 × 480 PNG header confirmed. Results are in `logs/setup-validation-003.json`. Git status shows only the untracked `Mark-I-Build/` folder; no commit or publication was requested.

### A021 — Product answers and supplied appearance reference

- Recorded 2026-09-07T00:35 UTC (2026-09-06 Toronto). Consolidated the user's sequential product answers into `PRODUCT-REQUIREMENTS-R001.md`, including all selected hardware/features, updated ±90° yaw, CAD prototype cost basis and feature-preservation priority. This record supersedes conflicting initial planning assumptions.
- Read `specification-mocks/mock_1.png` using the image viewer; preserved the original bytes and recorded its SHA-256 in the requirements document. Observed silver/grey shell, black eye surrounds, amber/orange accents, rounded binocular head, stalks, articulated neck and wheeled body.
- Identified a discrepancy: user explicitly chose 48 inches; the image says 60 inches. Left final height unresolved and prepared a single multiple-choice clarification. Image lighting/stalks and wheel arrangement are observations, not automatically adopted engineering requirements.
- Inspected existing head brief, audit and spec-log README. The optional `.agents` directory was absent; repository file search found no AGENTS.md. No CAD application, rendering session, web research or image edit was needed for this reference review.
- Added current-requirements notices to earlier planning documents so historical screen-face, USD allocation and unresolved-product statements are not treated as current choices. Private internal reasoning is not recorded; this log captures actions, evidence, decisions and concise rationale.

### A022 — Overall height confirmed

- Recorded 2026-09-07T02:06:53.741975+00:00. User selected B: change to 60 inches as shown in the supplied mock. Updated current requirements to 60 inches (1524 mm), superseding 48 inches.
- Updated the current-requirements notices in README, head brief, next steps, build plan and cost plan. Preserved prior audit entries and the reference image. Verified the exact inch-to-millimetre conversion and removal of the pending-height notice from these documents. No CAD dimensions or parts were changed.

### A023 — Budget-based cosmetic discretion

- Recorded 2026-09-07T02:36:23.348608+00:00. User asked the assistant to retain head accents considered doable within budget. Interpreted this in the immediate cosmetic-question scope; the earlier instruction to preserve selected working features and estimate the required budget remains active.
- Selected a provisional baseline of simple amber eye accents and no decorative antenna-like stalks for the first prototype. Illumination depends on quoted cost and camera-glare checks; non-illuminated accents are an available simplification. Retained the silver/grey and black appearance direction.
- Updated PRODUCT-REQUIREMENTS-R001.md. No component purchases, pricing claims, CAD changes or reference-image edits were made. The full robot cost is still unverified.

### A024 — Full-body Blender workflow and MCP integration instructions

- Recorded 2026-09-07T02:42:04.723899+00:00. User requested advice on full-body Blender design and steps to integrate Blender MCP. Prepared BLENDER-MCP-SETUP.md and an inactive TOML example under config/; linked the guide from README.
- Used agent-reach GitHub CLI routing and OpenAI Docs guidance. Read local Codex MCP help first, then official OpenAI MCP documentation and the upstream Blender MCP README, package metadata, PyPI 1.9.1 page and selected add-on source lines. Observed upstream commit c5f35d9cc54451d785ac4c00c48bf9e98a2e8db9.
- Initial sandboxed GitHub read failed to connect; normal escalated read succeeded. One unquoted GitHub endpoint containing a question mark failed zsh globbing; retried quoted successfully. Blender manual/features web fetches failed; no installation-menu compatibility claim depends on them.
- Verified existing uv/uvx 0.11.14 and /Users/coder/.local/bin/uvx. Codex help confirmed mcp add environment and stdio syntax. The helper printed a sandbox PATH-alias warning; no active MCP configuration was modified.
- Explained foreground implications: modeling remains in visible Blender, while MCP requires a local communication helper and socket listener. No connection was started, package/add-on installed, user preference changed, or CAD model modified. Exact Blender 5.2.1 compatibility remains a test to perform.
- Recommended version-matched bundled add-on/server, telemetry disabled, localhost connection and a small visible test scene. Preserved FreeCAD for mechanical masters. The example adds startup/tool timeouts for inspection; CLI registration alone uses client defaults.
- Parsed the example TOML and checked local links in the guide and README successfully. Kept historical checksum manifests unchanged.

### A025 — Live Blender MCP connection verified

- Recorded 2026-09-07T03:16:20.859852+00:00. User requested a connection test after enabling the Blender listener. Codex exposes Blender MCP tools and lists blender-mcp==1.9.1 as enabled.
- get_addon_status succeeded: Blender 5.2.1 LTS; add-on reports version 1.6, protocol 5 matches expected protocol 5, up_to_date true, no warning, telemetry consent false. The add-on version is distinct from the server package version.
- get_scene_info read Scene with Cube, Light and Camera (three objects). get_viewport_screenshot returned an image; visually inspected the selected cube, camera and light on the grid. Scene access and viewport capture pass.
- Stored results in logs/blender-mcp-connection-001.json. No model modification, new scene, render or external asset request was performed. Modeling and rendering through MCP remain separate checks.

### A026 — Mark-I full-body concept R001 construction

- Recorded 2026-09-07T04:37:04.455977+00:00. User authorized full Mark-I design in Blender through MCP using mock_1.png. Re-read current requirements and visually inspected the original reference.
- Positioned Blender on LG at {2600,100}, size {1900,1250}. Created MarkI_R001 scene and preserved the original Scene. Staged all authored Python in scripts/mark-i-r001 and executed it as short MCP batches.
- Built original concept geometry: two main drive wheels, two smaller front support casters, low battery envelope, deck, curved split torso, service hatch/vents, two rigid shoulder-driven arms, three-axis neck and binocular camera head. Used satin silver, graphite, rubber and amber materials. No upstream Asimov CAD was imported or measured. Wheel architecture and all component envelopes are design proposals, not qualified hardware.
- Head yaw is constrained to +/-90 degrees. Pitch -20/+25 and roll +/-15 are provisional study limits. Added a 120-frame expression/arm gesture study; frame 1 is neutral. Pi 5 8 GB, cooling, camera, audio and battery envelopes are explicitly labeled unverified and hidden from beauty renders.
- Safe mode rejected computed setattr names before head execution; replaced them with explicit permitted attributes. Later rejected preference access in studio setup; removed that redundant setup, retaining prior Metal preference configuration. An attempted render before successful studio creation reported no camera and produced no image. Studio setup then succeeded and native full-body scene saved. Safe mode remained enabled.
- Rounded the rear head-cap outline after viewport inspection. Added four cameras, studio lighting and a visible Cycles GPU render invocation. Saving, image checks, additional views and final geometry measurements remain to complete this revision.

### A027 — Renders, comparison repair and export verification

- Recorded 2026-09-07T04:53:20.151744+00:00. Completed and visually inspected five Cycles GPU renders: full-body hero, front, rear, head detail and three-head comparison. Jobs were invoked in visible Blender and allowed to finish before scene changes. Repositioned the render window on LG and captured logs/mark-i-r001-foreground-handoff.png at handoff.
- Comparison studies A Explorer, B Scout and C Surveyor use different shell proportions with circular optical pupils. First comparison render revealed amber curves offset vertically because their points used world coordinates. Corrected the duplicate curve translations, updated the source stage and retained 04b as a repair record. Rerendered and visually verified aligned arcs.
- Measured evaluated native model geometry: 0.698000014 × 0.540000007 × 1.524000051 m, 222 visible geometry objects. Neutral height passed the 1 mm tolerance. Inspected animation values at frames 1/30/60/90/120 and visually checked frame 30, then restored frame 1. Detailed swept collision or physical dynamics checks were not performed.
- Initial GLB reimport failed height validation (2.524 m) because the exporter included selected objects from other scenes, including the original default cube. Inspected GLB scene list, removed only the temporary imported test scene, added use_active_scene=True, re-exported and reimported successfully: 222 meshes, height 1.524000070 m. Removed temporary check scene and saved the final native file. Original user scene remains preserved.
- Saved geometry and roundtrip reports, editable .blend (main robot and comparison scenes), static .glb, modeling/render scripts and design/MARK-I-R001.md. GLB contains one MarkI_R001 scene, embedded buffers and no animation; animation remains in the native file. No fabrication-ready STEP/STL, measured upstream compatibility or cost/runtime feasibility is claimed.
- Delivery checks passed: five PNG headers/dimensions plus visual review, native file present, GLB header/length/scene checks, Python syntax and local documentation links. Details in logs/mark-i-r001-delivery-checks.json. Updated README status; next snapshot manifest-004 records this handoff, with prior manifests preserved.

### A028 — Professional prototype manufacturing plan

- Recorded 2026-09-07T05:13:04.492581+00:00. User requested the next industrial-design-studio steps and a plan for STL/Gerber handoff to obtain a physical prototype. Prepared manufacturing/PROTOTYPE-RELEASE-PLAN.md, part-register-P001.csv (42 planning records), RELEASE-CHECKLIST.md and PRINT-SHOP-RFQ-DRAFT.md. These are planning artifacts, not a fabrication release or order BOM.
- Assessed R001 against manufacturing needs: solid visual shells, cosmetic vent marks, unverified component envelopes and visual joint geometry require mechanical development. Preserve 60-inch height, camera eyes, Pi 5 8 GB, three-axis neck and shoulder gestures. Explorer A is a working baseline, not a recorded final user selection. No application or geometry changes were made during this planning task.
- Planned small P0 fit/insert/seam and camera-eye samples, P1 working head on a bench fixture, P2 chassis with representative payload/COM, and P3 full-size skins/arms. Require shop-dependent segmentation, component selection, load/power/thermal work, parametric CAD, per-part export checks, quote and incoming inspection. Quantities/materials/MPNs remain TBD where not selected.
- Distinguished STL/3MF/STEP and drawings for mechanical manufacture from Gerber/drill outputs for a custom PCB; PCBA additionally needs component and placement information. Purchased electronics plus a harness are the initial route, with a custom PCB conditional on demonstrated need. No robot STL/STEP or Gerber file was produced.
- Used agent-reach web-reading guidance and official Prusa, Xometry, Formlabs and KiCad documentation. Initial network read failed in sandbox and succeeded with escalation. A guessed Prusa article ID 1776 resolved to Configuration snapshots; corrected to the verified supported-formats article 1772 before citation. Supplier URLs are cited in the plan. Process-specific clearances were not adopted as universal print tolerances. No supplier was contacted and no design was uploaded for a quote.
- Asked one multiple-choice question about an existing print shop, a local shop or an owned printer. No answer recorded at this point; continued supplier-independent planning without assuming a machine/build volume. Component selection and physical test workload also remain open.
- Updated README and NEXT-STEPS to the current prototype sequence. Corrected COST-PLAN's unresolved currency/quantity text to the established one-prototype CAD basis and explicitly labeled the former USD allocation as historical/superseded. Preserved earlier audit entries and all existing model/render artifacts.
- Planning checks passed: 33 local links resolved, all 42 register IDs unique with complete CSV columns and unreleased status, release checklist gates open, and supplied mock SHA-256 unchanged. Recorded logs/manufacturing-planning-001.json. These checks do not establish fabrication readiness. A new manifest-005 snapshot follows; previous snapshots remain historical.

### A029 — Mark 1 website replacement and preorder implementation

- Recorded 2026-09-07T05:59:08.475800+00:00. User authorized replacing the old robot in macrodork-web with Mark 1, a premium presentation, actual concept renders/specifications and Stripe preorder code. Used frontend-design, frontend-ui-engineering and agent-reach guidance. Authored website source in the requested macrodork-web folder; planning and evidence remain under Mark-I-Build/website. No sub-agents used.
- Replaced the old page with an editorial paper/graphite/amber design, responsive navigation, Mark 1 hero and head renders, interactive three-quarter/front/rear gallery, target specifications, prototype timeline, FAQ and preorder section. Updated metadata and favicon. Removed unused old-robot components/hooks and copied public assets; parent-repository historical originals remain untouched. Four Mark 1 PNG assets are byte-for-byte copies of original R001 renders, verified by SHA-256.
- Product copy follows current 60-inch wheeled companion requirements. Rendered images are labeled as concepts and hardware specifications as targets. No retail price, delivery date, tested autonomous capability, Asimov compatibility or new upstream licensing claim was invented. Requested one multiple-choice clarification for preorder type/amount/currency/refund/delivery terms; no answer has arrived. Public payment availability remains false.
- Added Node/Express + Stripe Checkout, fixed server-side Price selection, explicit live/configuration gates, origin/consent validation, request idempotency, durable SQLite checkout/offer records, raw-body signature verification, event deduplication, paid/pending/failed/expired and partial/full refund handling, and private-token status polling. Stripe handles card/address collection; no secrets are included in frontend code. Custom email, automatic shipment and automatic refunds are not implemented; README specifies Stripe receipts and operator support/refunds.
- Read Stripe fulfillment guidance using agent-reach/Jina after sandbox DNS failure and successful escalated read, plus official web search results. Installed and locked express, stripe, express-rate-limit, helmet and development browser/accessibility/format tools. Installation reported zero dependency vulnerabilities. No live Stripe keys, account access, payment or customer contact occurred.
- Validation: production Vite build passed; 15 server tests passed using fake Stripe API responses and SDK-signed webhook fixtures, including persistence after database reopen. Nine headed browser tests passed at 320/768/1024/1440 px, including gallery, FAQ, menu/keyboard, disabled/error/enabled test offer and verified confirmation states. Axe reported zero violations in tested scans. Git whitespace and Prettier checks passed. Tests are not a substitute for a real account-specific Stripe test Checkout before live activation.
- Corrected verification issues: initial npm commands used repo root instead of macrodork-web; corrected working directory. Test server setup needed to await listening; sandbox then denied localhost binding, so authorized local tests ran escalated. Browser selectors initially followed a menu label that changes on open and exact FAQ text including a decorative plus; corrected selectors and reran successfully. These were test harness issues, not payment confirmations.
- Application inspection remained in visible Chrome. Discovered current displays include a Samsung at x=2056 and LG UltraFine at x=3976; initial saved coordinates pointed at Samsung. Updated browser coordinates, reran all nine UI checks on LG and captured the corrected foreground review. Existing regular Chrome did not respond to AppleEvents (timeouts); left an isolated headed Chrome review open instead, with the site server running in a visible Terminal. Source script documents this foreground review.
- Added operational README and private .env.example with checkout disabled. Documented single-instance persistent-volume hosting, signature endpoint, test/live setup, fixed-charge tax/shipping treatment, privacy/retention, database backup, refunds and account-specific testing. Actual merchant settings, offer terms, Stripe configuration and hosting remain user inputs. No deployment or checkout activation performed.
- Evidence: website/VERIFICATION.json, server-tests.txt, browser-tests.txt, desktop/mobile/test-offer screenshots and foreground-lg-review.png. A website source manifest and manifest-006 will record this milestone after final documentation edits.

### A030 — Header dark-mode switch

- Recorded 2026-09-07T06:43:38.716211+00:00. User requested a dark-mode switch in the top header. Added an accessible moon/sun switch outside the collapsible menu, with a 44px target and keyboard operation.
- Added a saved light/dark preference, initial OS preference, system-change handling when no preference is saved, cross-tab synchronization and graceful operation when storage is unavailable. An external same-origin theme bootstrap runs before the app loads to avoid a wrong-theme flash without relaxing the server Content Security Policy. Browser theme-color follows the selection.
- Extended the existing design tokens to dark surfaces, readable muted text, table rules, focus/error states and button hover colors. Kept the original render imagery and explicit light caption surfaces intact. Product and payment behavior unchanged.
- Production build, formatting and git whitespace checks passed. Visible Chrome review on LG verified keyboard switching, reload persistence, system preference and return to light. No horizontal overflow at 320/768/1024/1440 px; axe reported zero violations at all four dark-mode widths. Initial ad hoc axe invocation required an explicit browser context; corrected the review harness and completed the checks. Evidence: website/dark-mode-checks.json and website/mark-1-dark-desktop.png. Left the dark preview visible.
- Added a theme source checksum record and manifest-007 snapshot. Earlier source/manifest files remain historical milestones.
