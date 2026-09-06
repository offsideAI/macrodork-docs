# Design inspiration notes

Screenshots of menlo.ai captured 2026-09-04 with headless Chrome and Playwright at 1440 px and 390 px.
They are reference material for layout and rhythm only. Nothing from the Menlo site (copy, imagery,
logo, typefaces) is reused in OffsideRobotics.

| File | What it shows |
|---|---|
| `menlo-home-desktop-fold.png` | Hero above the fold: full-bleed brand orange, robot photo, floating white pill nav |
| `menlo-home-scroll-00..10.png` | Home page, one viewport per step: media strip, three feature cards, build-in-public photo, testimonial carousel, product cards, research grid, contact form, footer |
| `menlo-home-fullpage.png` | Same page stitched |
| `menlo-home-mobile.png` | Hero at 390 px |
| `menlo-asimov-1-scroll-00..08.png` | Product page: media strip, feature grid with line illustrations, embedded simulator, pricing cards, FAQ accordion |
| `menlo-research-desktop.png`, `menlo-company-desktop.png`, `menlo-docs-desktop.png` | Secondary pages and the docs site |

## What Menlo does that works

- **One saturated colour owns the hero.** Orange (#FF5C00) fills the viewport; the robot photo sits on it; everything else on the page is white or near-black. Three grounds in total: brand colour, white, charcoal.
- **A floating pill navigation.** White, fully rounded, centred, with small uppercase monospace labels and one filled brand-colour pill for the primary action.
- **Accent words inside headings.** Headings are one weight; a phrase inside them takes the brand colour ("Enabling *the next 100k robot developers*").
- **Rounded media, square type.** Photos and video tiles use a large radius (about 24 px); text blocks do not sit in cards.
- **Frosted product cards.** A translucent white panel over a photo carries a mono eyebrow ("Launched on ..."), a title, one line, and a pill button.
- **A monospace utility layer.** Nav labels, eyebrows, form labels, footer links are all uppercase mono with tracking. Body copy is a plain humanist sans.
- **A giant wordmark in the footer.** Near-black ground, link columns in mono, then the wordmark set at full width.
- **Content is the robot.** Every section is anchored by a real photograph or render of the product, not by abstract illustration.

## OffsideRobotics direction (revision 3: direct inspiration)

Earlier revisions borrowed only Menlo's structure and went their own way on colour and type; they read
as unrelated. Revision 3 follows the Menlo design language directly while keeping copy, imagery and
logo our own:

- **Layout, section for section.** Full-viewport brand-colour hero with the robot standing on it and the
  headline bottom-left; four rounded media tiles; a centred heading with an accent phrase over three
  feature cards; a spec headline ("25 cm. 737 g. 14+1 DoF.") over six short points; a wide build-in-public
  photo with a row of outline pills; three frosted product cards; a research grid with a "View all"
  link; a wide image over a two-column contact form with mono labels and underline inputs; an FAQ on a
  grey band; a near-black footer with mono link columns and a giant wordmark.
- **Type.** Manrope for headlines and body and IBM Plex Mono for labels, the two open fonts Menlo's own
  stylesheet loads. Michroma supplies the wide techno wordmark in the nav and footer.
- **Colour.** One saturated brand colour owns the hero and the primary buttons. Ours is a warmer orange
  (#FF7A00) than Menlo's, chosen to sit between their hue and MacroDork's yellow so it is recognisably in
  the same genre without being their brand colour. Page ground #F8F8F8, ink #1E2022, cards #F0F0F1,
  footer #17181A.
- **Not reproduced.** No Menlo text, photographs, renders, videos, testimonials, logo or segmented
  display lettering. Every image is a MacroDork drawing, diagram, build photo or a capture of this
  repository's own Asimov-1 study page.
