# Mark-I source register

Access/review date: **2026-09-06**. Linked remote branches and release pages can change. No Asimov CAD has been downloaded or pinned locally in this session; mechanical interface dimensions remain unverified. The parent repository baseline inspected was `18a54e2275be31db892b905905de7b4097d1c95d`.

| ID | Source | Observation / use | Limitation |
|---|---|---|---|
| S01 | [Menlo docs](https://docs.menlo.ai/) | Official hardware documentation entry point | Fetched via browser and agent-reach/Jina reader |
| S02 | [Asimov-1 overview](https://docs.menlo.ai/asimov/1) | Size, mass, joint count, platform structure and availability | Published specifications; not measured here |
| S03 | [Asimov-1 repository](https://github.com/menloresearch/asimov-1) | CAD/electrical/simulation inventory, kit listing, software status | Main branch read online; full commit pin pending |
| S04 | [Mechanical source directory](https://github.com/menloresearch/asimov-1/tree/main/mechanical/ASV1) | Starting point for CAD intake | File-tree browsing did not establish head dimensions or assembly compatibility |
| S05 | [Asimov hardware license](https://raw.githubusercontent.com/menloresearch/asimov-1/main/HARDWARE-LICENSE.txt) | CERN-OHL-S-2.0 terms reviewed | Preserve a pinned copy with actual source intake |
| S06 | [System tour](https://docs.menlo.ai/asimov/1/overview/system-tour) | Correct system overview route discovered via navigation | Used for orientation; detailed subsystem validation pending |
| S07 | [Blender LTS Homebrew cask](https://formulae.brew.sh/cask/blender@lts) | Install command, Apple Silicon app path; reports 5.2.1 | Moving cask; record installed version |
| S08 | [FreeCAD Homebrew cask](https://formulae.brew.sh/cask/freecad) | Install command and app path; reports 1.1.3 | Moving cask; compatibility checked after installation |
| S09 | [Blender command line](https://docs.blender.org/manual/fr/5.2/advanced/command_line/arguments.html) | Background Python invocation and exception exit status | Official localized documentation; English latest/versioned routes failed fetch |
| S10 | [Blender Cycles GPU rendering](https://docs.blender.org/manual/nl/4.5/render/cycles/gpu_rendering.html) | Metal preferences and scene device selection | Official manual; selected installed version still needs a render check |
| S11 | [FreeCAD releases](https://github.com/FreeCAD/FreeCAD/releases) and [manual](https://www.freecad.org/manual/a-freecad-manual.pdf) | Official app source; scripting and exchange workflow | Main downloads page returned 403; manual is older, UI/API checks pending |
| S12 | [PrusaSlicer](https://www.prusa3d.com/p/prusaslicer/) | Optional macOS print preparation tool | No printer profile selected |
| S13 | [KiCad macOS](https://www.kicad.org/download/macos/) | Optional electronics-stage installer | Deferred |
| L01 | [Root README](../README.md), [website README](../macrodork-web/README.md), `macrodork-web/src/data.js` | Existing site primarily represents a robot duck and links a separate Asimov study | Not a Mark-I specification |
| L02 | [Prior budget study](../artifacts/asimov-1-budget-build.html) | Existing miniature cost/geometry hypothesis | Prices, packaging and performance not revalidated; some claims require fresh engineering |
| L03 | [Existing NOTICE](../NOTICE.md) | Distinguishes Microduck noncommercial assets from Asimov-derived study meshes | Preserve provenance; do not silently relicense existing assets |
| L04 | `specification/spec_1.png`, `specification/spec_2.png` | User-added screenshots of this request and the clarification prompts | Reviewed visually; contain no answers or additional design specification |

Additional official links in the plan, such as MuJoCo installation and locomotion training, are future-stage references, not evidence of a configured or validated simulation environment.

## Commercial source planning

Asimov's hardware license permits making/distributing products subject to its terms. Sections 3–4 address preserving notices, documenting modifications, reciprocal licensing, and providing Complete Source or its location to recipients. Plan a corresponding-source release alongside a shipped derivative; cosmetic changes do not remove those obligations. The precise source boundary and any component exceptions must be reviewed against the files actually used. [Upstream license text](https://raw.githubusercontent.com/menloresearch/asimov-1/main/HARDWARE-LICENSE.txt)

The upstream repository identifies GPL-2.0 software separately. Inventory actual code and third-party components before reuse/distribution. Its licenses do not establish an endorsement of Mark-I. [Upstream repository](https://github.com/menloresearch/asimov-1)

The existing repository applies noncommercial notices to Microduck-derived geometry and associated content. Those files are not our planned commercial geometry source. New Mark-I derivative files need explicit source notices; do not infer their license from their folder name or overwrite the repository's existing notices. [Local attribution record](../NOTICE.md)
