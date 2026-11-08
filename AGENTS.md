# Repository Guidelines

## Project Structure & Module Organization

This workspace currently contains planning materials for **My Literary Journey**, a Great Books notebook portfolio. Application code, tests, and package configuration have not been created.

`ProjectContext/` contains:

- `Great_Books_Website_Concept_and_Implementation_Plan.md`: architecture, phases, routes, and acceptance checks.
- `Great_Books_Website_Content.md`: draft website copy and source notes.
- `Great_Books_Design_System.md`, `Great_Books_Design_Tokens.json`, and `Great_Books_Design_Reference.png`: visual specifications.

Follow the plan's proposed layout when implementing: `src/components/` for UI, `src/content/` for Markdown and metadata, `src/lib/` for content, pagination, and navigation logic, `src/styles/` for styling, `public/` for assets, and `tests/unit/` and `tests/browser/` for tests. These directories do not exist yet.

## Build, Test, and Development Commands

No runnable commands are configured today. When scaffolding the planned React, TypeScript, and Vite application, define and document these proposed scripts:

- `npm run dev`: start local development.
- `npm run build`: check types and produce `dist/`.
- `npm run preview`: inspect the production build locally.
- `npm run lint`: run the configured linter.
- `npm test`: run focused Vitest tests.
- `npm run test:e2e`: run Playwright browser checks.

Commit the dependency lockfile and supported Node version. Do not report unconfigured checks as passing.

## Coding Style & Naming Conventions

Use two-space indentation for new TypeScript, TSX, CSS, and JSON. Use PascalCase component filenames such as `OpeningSpread.tsx`, camelCase functions, and stable kebab-case content slugs such as `tale-of-genji.md`. Keep Markdown copy separate from layout metadata and design tokens. No formatter or linter is currently configured.

Write website copy in simple B1 to B2 English without em dashes or semicolons. Preserve all five section labels and six answers per analysis.

## Testing Guidelines

Vitest and Playwright are planned, with no numerical coverage threshold specified. Use descriptive `*.test.ts` unit filenames and `*.spec.ts` browser filenames. Prioritize text conservation, pagination, deep links, rapid navigation, resize restoration, keyboard access, and reduced motion.

## Commit & Pull Request Guidelines

No Git history is available to establish conventions. Use short imperative subjects, for example `Add notebook navigation`. Keep changes focused. PRs should describe the outcome, reference the implementation phase and relevant issues, report checks and limitations, and include desktop/mobile screenshots for visual changes. Record phase results and next actions in the plan.
