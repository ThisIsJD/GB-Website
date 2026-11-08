# Implementation Decisions

## Project initialization: P2.1 foundation

The React and TypeScript scaffold uses Vite 8 and Tailwind CSS 4's Vite integration. Node 24.16.0 matches the installed runtime. React Router uses declarative routing. Existing planning documents and `AGENTS.md` are preserved.

Application content, UI components, styles, content parsing, navigation, pagination, hooks, public assets, and both test suites have separate directories. Unimplemented areas contain only directory markers. The starter cover is static, with real project wording and recovery for unknown routes.

Sketchbook UI's documented provider and stylesheet are wired into the entry point. Patrick Hand is configured through Fontsource for local bundling, rather than a remote font request. Application CSS is generated from the supplied token values. Fontsource packages retain the font license. No Oreo Doodle assets have been selected or copied, so asset licensing remains a later task.

### Dependency and verification status

- The manifest declares the planned runtime and development dependencies.
- npm registry requests are rejected with `EACCES` in this session.
- The local cache lacks several essential packages. Offline installation cannot complete.
- No complete installation or dependency lockfile is available yet.
- Theme generation and consistency checks passed. All 10 TypeScript/TSX files passed syntax parsing with cached TypeScript 5.9.3. Seven JSON files parsed successfully, and application tokens match the supplied JSON. JavaScript configuration and theme helper syntax checks passed.
- Build, lint, unit tests, and browser checks require the missing dependencies and remain unverified.
- No hosting configuration has been connected to an account or published.

Do not mark P2.1 complete until dependency installation, production build, and preview pass. The page-turn engine and Sketchbook UI compatibility still need their actual browser gates. Do not use `--force` or `--legacy-peer-deps` to hide compatibility failures.

### Next action

Run `npm install` when registry access is available, retain `package-lock.json`, install Chromium with `npx playwright install chromium`, then run `npm run check` and `npm run test:e2e`. Continue with P1 content import and P2 interaction prototypes according to the main plan.

### References checked

- [Vite setup and Node requirements](https://vite.dev/guide/).
- [Tailwind Vite plugin](https://tailwindcss.com/docs/installation/using-vite).
- [Sketchbook UI installation, stylesheet, and provider](https://github.com/SarthakRawat-1/sketchbook-ui).
- [React Router declarative installation](https://reactrouter.com/start/declarative/installation).
- [Vitest package compatibility](https://github.com/vitest-dev/vitest/blob/main/packages/vitest/package.json).
