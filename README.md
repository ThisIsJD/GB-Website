# My Literary Journey

A Great Books digital portfolio for John Daniel P. Labing. The planned interface is a burgundy notebook with handwritten pages, five section bookmarks, and physical page turns.

## Setup

Use Node **24.16.0** (recorded in `.nvmrc` and `.node-version`) and npm.

```sh
npm install
npx playwright install chromium
npm run dev
```

Development serves at `http://127.0.0.1:5173`. On Windows PowerShell with script execution disabled, use `npm.cmd` and `npx.cmd` in place of `npm` and `npx`.

**Installation status:** this environment blocked access to the npm registry. Dependencies are declared but have not been installed. A complete lockfile cannot be generated until installation succeeds. Run `npm install` with registry access, then commit the generated `package-lock.json`. After that, use `npm ci` for reproducible installs.

## Stack

- React, strict TypeScript, and Vite.
- Tailwind CSS through its Vite plugin, plus custom notebook CSS.
- React Router in declarative mode.
- Sketchbook UI for selected hand-drawn controls, Rough Notation for annotations.
- StPageFlip (`page-flip`) and `react-pageflip`, pending the plan's P2 engine checks.
- Markdown through `react-markdown`, with unified and remark-parse for future content blocks.
- Self-hosted Patrick Hand through Fontsource, including its bundled font license.
- ESLint, Prettier, Vitest, and Playwright.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Generate theme and start Vite |
| `npm run build` | Generate theme, check TypeScript, and build `dist/` |
| `npm run preview` | Serve the build at `http://127.0.0.1:4173` |
| `npm run typecheck` | Check application, configuration, and test types |
| `npm run lint` | Lint source and configuration |
| `npm run format` / `npm run format:check` | Apply / check formatting |
| `npm test` / `npm run test:watch` | Run unit tests once / watch |
| `npm run test:e2e` | Build and run desktop/mobile Chromium checks |
| `npm run theme` / `npm run theme:check` | Generate / check CSS from tokens |
| `npm run check` | Check theme, lint, unit tests, and build |

## Structure

```text
resource/                 Plans, source writing, design reference, and decisions
scripts/                  Build helpers
src/
  app/                    Application composition and routes
  components/
    content/              Shared Markdown renderer and future reading components
    notebook/             Notebook cover and future page engine adapter
    ui/                   Future wrappers for selected Sketchbook UI controls
  content/analyses/        Future per-work Markdown files and typed metadata
  hooks/                  Future sizing, font, and motion hooks
  lib/
    content/              Future parsing and validation
    navigation/           Future route and page coordination
    pagination/           Future measurement and composition
  styles/                 Application tokens, generated theme, and global styles
public/                   Future portrait, illustrations, doodles, and font assets
tests/unit/               Vitest tests
tests/browser/            Playwright tests
```

The starter renders a static notebook cover and unknown-route recovery. Opening the cover, section routes, imported analyses, annotations, and the page engine are future implementation work. No dependencies on a backend, authentication, CMS, or animation framework are included.

`src/styles/tokens.json` starts as an unchanged copy of the supplied design tokens. Change its values and run `npm run theme` to regenerate CSS. Keep the design references consistent with deliberate design changes.

## Checks and deployment

The supplied tests cover Markdown text/links, raw HTML exclusion, cover rendering, overflow, and unknown-route recovery. They have not been run while installation is blocked.

Vercel configuration uses the Vite build, `dist/` output, and an SPA rewrite for deep links. Hosting is not connected or deployed. Follow the implementation phases in [the plan](resource/Great_Books_Website_Concept_and_Implementation_Plan.md) and record outcomes in [decisions](resource/decisions.md).
