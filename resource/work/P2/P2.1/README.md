# P2.1 Foundation Verification

Status: **P2.1 acceptance passed**. Phase 2 was approved by JD and committed on 8 November 2026 as `c3bfbed`, `Implement Phase 2 notebook interaction prototypes`. Verification details below record the P2.1 checkpoint. See [the combined handoff](../README.md) for current whole-phase evidence.

Worktree: `C:/Users/LENOVO/.codex/worktrees/8a5a/GB-Website`.
Branch: `work/p2-prototypes`. Base: `d2d6b5f`.

## Implemented behavior

- Installed compatible runtime and development dependencies and retained `package-lock.json`. Node remains 24.16.0. A clean offline `npm ci` reproduced the installation successfully.
- Replaced deprecated ESLint 9 with ESLint 10.14.0 and @eslint/js 10.0.1 after verifying the installed plugins' peer ranges.
- Added a locally themed Sketchbook UI button. The cover's keyboard-operable “Open my notebook” action opens `/prototype`; “Close notebook” returns to the cover.
- Added one readable ruled-paper page using supplied profile copy stored in `src/prototypes/fixtures/profile.md`. This is a P2 sample, separate from the Phase 1 content agent's canonical files.
- Verified self-hosted Patrick Hand at 19–20 px body size, including the original apostrophe. Preserved license notices under `public/licenses/`: Patrick Hand SIL OFL 1.1 and Sketchbook UI MIT.
- Loaded the prototype route separately so Markdown does not enlarge the initial cover bundle.
- Isolated development port 5174 and browser-preview port 4174. Browser tests refuse to reuse another session's server; `PLAYWRIGHT_PORT` can override the test port.
- Excluded generated theme CSS from formatting; token checks still verify it matches the generator.

## Design and scope

Retained burgundy #762B3B, ivory #FBF5E8, dark ink #2F2926, gray surroundings #E8E4DE, Patrick Hand, and the cover's three selected details. The sample uses a left-aligned reading leaf with no extra design system or animation framework.

This lane owns dependency/root configuration, entry/routes, shared styles, notebook prototypes, and P2-specific tests. Phase 1 owns canonical content and content assets in its separate worktree. The updated root contributor guide, parallel workflow, and plan were copied here because they were uncommitted at the base revision.

## Verification evidence

| Check                                   | Result                                                                               |
| --------------------------------------- | ------------------------------------------------------------------------------------ |
| `npm ci --offline --no-audit --no-fund` | Passed: clean installation from the lockfile                                         |
| `npm run format:check`                  | Passed                                                                               |
| `npm run check`                         | Passed: generated theme, ESLint, 2 Vitest tests, TypeScript, production build        |
| `npm run test:e2e`                      | Passed: 14 Chromium checks across desktop/mobile projects                            |
| Production preview                      | HTTP 200; no failed asset requests or page errors in the interaction check           |
| Reading widths                          | 320, 768, 1024, and 1440 px; font loaded, body >=19 px, no horizontal overflow       |
| Keyboard/focus                          | Cover action, reading-heading focus, close action, and unknown-route recovery passed |
| Visual review                           | Desktop and 320 px phone screenshots inspected                                       |
| Git                                     | HEAD remains `d2d6b5f`; no implementation commit                                     |

Screenshots are local ignored artifacts under `.cache/screenshots/`, including `p2.1-reading-mobile-chromium-320.png` and `p2.1-reading-desktop-chromium-1440.png`. Playwright's HTML report is in `playwright-report/`.

The first reproducibility attempt encountered a Windows lock on Lightning CSS because the owned preview server was still running. Stopping that server allowed the clean installation to pass. Stop preview/dev processes before replacing native dependencies on Windows.

## Next action: P2.2

Prove the physical engine's cover/soft-page turns, shadows, portrait/spread behavior, controlled navigation, mount/cleanup, and content replacement. Verify links, text selection, gestures, and phone scrolling. The wrapper's source does not provide an unmount effect cleanup, and the core renderer continuously schedules frames; investigate the actual lifecycle before accepting an adapter. These are open P2.2 checks, not passing engine evidence.

The Phase 1 agent has supplied a complete Odyssey analysis and registry contracts for subsequent prototypes. Consume scoped copies without editing that agent's canonical files. P2.3 and P2.4 remain pending.

## Installation references

- [Tailwind Vite integration](https://tailwindcss.com/docs/installation/using-vite).
- [Sketchbook UI provider and stylesheet](https://github.com/SarthakRawat-1/sketchbook-ui).
- Installed package metadata, declarations, and license files were used to verify the actual dependency combination.
