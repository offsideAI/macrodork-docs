# Next steps: visual concept to working prototype

Updated 2026-09-07. [Current requirements](PRODUCT-REQUIREMENTS-R001.md) and the [prototype release plan P001](manufacturing/PROTOTYPE-RELEASE-PLAN.md) govern this phase. The 60-inch Blender concept and three head proportion studies are complete. This replaces the earlier post-installation checklist; prior actions remain in the audit log.

1. **Set fabrication constraints.** Record the print shop/process/build envelope, confirm the head proportions before freezing shells, and define the intended floor/speed/payload and runtime workload. A shop-selection question is pending.
2. **Select actual hardware and interfaces.** Specify the Pi accessories, synchronized stereo cameras, audio, neck and drive hardware. Check physical envelopes, mass, power and CAD pricing. Retrieve and measure relevant Asimov source before claiming compatibility.
3. **Engineer the parts in FreeCAD.** Establish a supported load path and real mounts; add hollow shells, serviceable seams, openings, fasteners and cable clearance. Resolve families in the [part register](manufacturing/part-register-P001.csv) into unique manufactured parts. Continue visible application work on LG.
4. **Release small fit samples first.** Export and check shop-specific joint/insert coupons and a camera-eye assembly. Measure the returned parts before releasing a full head.
5. **Build P1: working head on a bench fixture.** Verify camera/audio/compute, neck travel, wiring, mass/COM and thermal behavior. Keep unresolved performance claims open.
6. **Build P2: loaded rolling chassis.** Validate frame, drivetrain, stop/control behavior, stability and the two-hour duty-cycle target with representative payload and COM.
7. **Build P3: full-size body and arms.** Fit segmented skins and supported gesture arms. Dry-assemble and test before final finishing; update the as-built BOM and release records.

The first electronics prototype uses purchased modules and a documented harness. Custom PCB files are a later conditional deliverable; Gerbers do not go to a polymer print shop. Each actual order uses the [release checklist](manufacturing/RELEASE-CHECKLIST.md), per-part files/drawings/quantities and a reviewed quote. The [RFQ draft](manufacturing/PRINT-SHOP-RFQ-DRAFT.md) has not been sent. No robot STL, manufacturing STEP or Gerber package is ready for fabrication yet.
