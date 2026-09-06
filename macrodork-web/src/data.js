// Single place for every outbound link and every number the site quotes.
// Numbers come from the parent repository (README, BOM.md, print/README.md).

// TODO: point this at the published repository once it has a public URL.
export const GITHUB = 'https://github.com/offsideai/macrodork'
export const OFFSIDE_AI = 'https://offsideai.ai'
// TODO: replace with the address that should receive build enquiries.
export const CONTACT_EMAIL = 'hello@offsideai.ai'

export const LINKS = {
  repo: GITHUB,
  readme: `${GITHUB}#readme`,
  bom: `${GITHUB}/blob/main/BOM.md`,
  print: `${GITHUB}/blob/main/print/README.md`,
  buildLog: `${GITHUB}/blob/main/BUILD-LOG.md`,
  hardwarePrimer: `${GITHUB}/blob/main/docs/hardware-primer.md`,
  hardwareSpec: `${GITHUB}/blob/main/docs/hardware-spec-sheet.md`,
  teardown: `${GITHUB}/blob/main/docs/hardware-teardown.md`,
  fasteners: `${GITHUB}/blob/main/docs/fastener-reconstruction.md`,
  actuators: `${GITHUB}/blob/main/docs/actuator-selection.md`,
  sourcing: `${GITHUB}/blob/main/docs/electronics-sourcing-list.md`,
  notice: `${GITHUB}/blob/main/NOTICE.md`,
  provenance: `${GITHUB}/blob/main/docs/upstream/provenance.md`,
  cad: `${GITHUB}/tree/main/cad`,
  drawings: `${GITHUB}/tree/main/assembly-drawings`,
  asimovStudy: `${GITHUB}/blob/main/artifacts/asimov-1-budget-build.html`,
}

export const NAV = [
  { label: 'MacroDork', href: '#macrodork' },
  { label: 'Research', href: '#research' },
  { label: 'Docs', href: LINKS.readme, external: true },
  { label: 'Build', href: '#build' },
  { label: 'Contact', href: '#contact' },
]

export const TILES = [
  { src: '/images/drawings/01_front.png', caption: 'Front', alt: 'MacroDork front elevation' },
  { src: '/images/drawings/02_side.png', caption: 'Side', alt: 'MacroDork side elevation' },
  { src: '/images/drawings/03_back.png', caption: 'Back', alt: 'MacroDork rear elevation' },
  { src: '/images/build/first-printed-parts.jpg', caption: 'First print · Sept 2026', alt: 'First printed MacroDork parts on a workbench', photo: true },
]

export const FEATURES = [
  {
    title: 'Every part, drawn',
    body: 'Seven assembly drawings, exploded views and 15 CAD-importable sub-assemblies with world transforms already applied. Import and the robot is assembled.',
    image: '/images/drawings/06_exploded_three_quarter.png',
    alt: 'Exploded three-quarter view of MacroDork with every part labelled and weighed',
    href: LINKS.drawings,
    cta: 'See the drawings',
  },
  {
    title: 'Every board, decoded',
    body: 'One 1 Mbps serial bus carries fifteen servos and the IMU in a single read. Bus topology, power tree, control cycle and register maps, recovered from the runtime source.',
    image: '/images/hw/01-physical-layout.png',
    alt: 'Physical layout diagram of the five electronic modules in MacroDork',
    href: LINKS.hardwarePrimer,
    cta: 'Read the primer',
  },
  {
    title: 'Every screw, counted',
    body: 'A bill of materials counted from geometry, not estimated: servos, bearings, the M2 fastener system, both PCBs with part numbers, and sourcing lists with verified availability.',
    image: '/images/drawings/07_color_coded_assembled.png',
    alt: 'Colour-coded assembled MacroDork cross-referenced to the exploded view',
    href: LINKS.bom,
    cta: 'Open the BOM',
  },
]

export const SPEC_POINTS = [
  { title: 'Make it yours.', body: 'Printed shells and brackets around off-the-shelf servos. Reprint, recolour, redesign.' },
  { title: 'Learn by doing.', body: 'Assemble it from files and see how a bipedal walking policy meets real hardware.' },
  { title: 'Open design.', body: 'Geometry, electronics and fasteners documented down to the register and the screw.' },
  { title: 'Repair fast.', body: 'Cheap servos and reprintable parts. A fall costs a print, not a service ticket.' },
  { title: 'Sim ready.', body: 'The drawings come from the same model the walking policy was trained on.' },
  { title: 'Test your models.', body: 'Same main board as the original, so the open runtime and its nine policies run as-is.' },
]

export const PRODUCTS = [
  {
    eyebrow: 'Files released · September 2026',
    title: 'MacroDork',
    body: 'The full documentation set: drawings, CAD, BOM, printable parts and electronics.',
    href: LINKS.repo,
    cta: 'Explore MacroDork',
    image: '/images/hero/04_three_quarter-cut.png',
    tone: 'light',
  },
  {
    eyebrow: 'Variant · parts included',
    title: 'Roller-skate variant',
    body: 'Taller ankles, rims, tyres and blades. Fifteen extra pieces, no other changes.',
    href: LINKS.print,
    cta: 'Printable parts',
    image: '/images/hero/02_side-cut.png',
    tone: 'light',
  },
  {
    eyebrow: 'Research · study',
    title: 'Asimov-1 at 40 percent',
    body: 'Can a $20,000 humanoid become an $800 one? A priced BOM and a 3D render say how far scale gets you.',
    href: LINKS.asimovStudy,
    cta: 'Read the study',
    image: '/images/research/asimov-budget-render.png',
    tone: 'photo',
  },
]

export const RESEARCH = [
  { date: '2026-09-04', title: 'One bus does everything: how the servo bus and IMU share a single sync read', image: '/images/hw/03-bus-topology.png', href: LINKS.teardown },
  { date: '2026-09-03', title: 'Inside the 50 Hz control cycle, from sync read to policy to sync write', image: '/images/hw/04-control-cycle.png', href: LINKS.hardwarePrimer },
  { date: '2026-09-02', title: 'Why the XL330 is run over voltage, and what a Feetech swap actually costs', image: '/images/hw/06-bus-timing-comparison.png', href: LINKS.actuators },
]

export const FAQ = [
  { q: 'Can I buy a MacroDork?', a: 'No. MacroDork is a set of open files, not a product. You print the parts, buy the servos, boards and battery from the sourcing lists, and assemble it yourself. Fifteen XL330 servos alone run roughly $360 to $630 depending on region.' },
  { q: 'Is this affiliated with the company that makes the original robot?', a: 'No. MacroDork is an independent replica study derived from publicly released simulation files and open-source runtime code. The upstream vendor is credited in NOTICE.md and on the provenance page, and nothing non-public was used.' },
  { q: 'Do I need to design any electronics?', a: 'One small board. The main computer is an off-the-shelf Radxa Zero 3W and the HAT has a published KiCad project you can send straight to a fab. The IMU board is not published, so it has to be redrawn; its protocol and register layout are fully documented.' },
  { q: 'Will the printed parts fit straight off the printer?', a: 'Treat that as an open question. The parts come from a simulation model, which guarantees outer shape and mass but says nothing about tolerances, threads or insert bosses. The build log records what actually fits.' },
  { q: 'How long does a build take?', a: 'Printing is around two kilograms of filament over several days. Assembly of the mechanics is a weekend once parts fit; electronics, flashing and first standing take longer and are the subject of the build log.' },
  { q: 'What licence are the files under?', a: 'Scripts and tools are Apache-2.0. Drawings, CAD assemblies and documentation are CC BY-NC-SA 4.0, inherited from the upstream 3D models, so non-commercial use only.' },
]
