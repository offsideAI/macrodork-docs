# OffsideRobotics web

Marketing site for **MacroDork**, the open bipedal robot duck, published by OffsideRobotics
(powered by Offside.AI). React 19 + Vite 6, no UI framework, no router: one page, eleven components.
Two constants in `src/data.js` need real values before publishing: `GITHUB` and `CONTACT_EMAIL`.

```bash
npm install
npm run dev       # local dev server
npm run build     # production build into dist/
npm run preview   # serve dist/ locally
```

## Layout

| Path | Purpose |
|---|---|
| `src/data.js` | Every outbound link and every number the site quotes. Change the `GITHUB` constant once the Macrodork repository has its public URL |
| `src/styles.css` | Design tokens and all styling, modelled on the menlo.ai design language (see `../_design-inspiration/NOTES.md`) |
| `src/components/` | Nav, Hero, MediaStrip, Features, Spec, BuildPublic, Products, Research, Contact, Faq, Footer |
| `public/images/` | Drawings, hardware diagrams and the build photo, copied from the parent repository (`../assembly-drawings`, `../assets/hw`, `../build-log`) |
| `public/images/hero/` | The same drawings with the white background keyed out, for use on the brand-colour hero |
| `../_design-inspiration/` | Reference screenshots of menlo.ai and `NOTES.md` describing what was borrowed (layout language, type, structure) and what was not (copy, imagery, logo) |

## Fonts

Loaded from Google Fonts: Manrope (headlines and body), IBM Plex Mono (labels), Michroma (wordmark).
Fallback stacks are declared in `styles.css`.

## Content

All figures come from the documentation in the parent repository and should be updated there first.
Images are CC BY-NC-SA 4.0 derivatives; see `../NOTICE.md`.
