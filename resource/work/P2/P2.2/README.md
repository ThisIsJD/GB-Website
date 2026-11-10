# P2.2 Physical Engine Verification

Date: 8 November 2026. Status: **implemented and verified**, approved by JD and included in the Phase 2 commit on 8 November 2026. Verification details below record the P2.2 checkpoint. See [the combined handoff](../README.md) for current whole-phase evidence.

Branch: `work/p2-prototypes`.
Worktree: `C:/Users/LENOVO/.codex/worktrees/8a5a/GB-Website`.
Implementation commit: `c3bfbed`, `Implement Phase 2 notebook interaction prototypes`. Base: `d2d6b5f`.
Nothing has been merged or published.

## Implemented behavior

The prototype at `/prototype/book` uses react-pageflip 2.0.3 and StPageFlip 2.0.7, with actual hard covers, soft page curls, and engine shadows. `PageLeaf` follows the documented forwarded DOM-reference pattern. Geometry selects portrait or spread mode while keeping body text at 19–20 px.

`FlipAdapter` communicates with a same-origin disposable page document, `turning-pages.html`. Commands use the engine's public methods. Messages check both origin and the sending window. Readiness and turn requests have bounded failure recovery. Replacing content, resizing, or removing the notebook disposes the previous document and its callbacks. No engine source or internals were patched.

Native whole-page mouse handling and hover corners are disabled. A local edge-gesture handler accepts deliberate horizontal edge swipes, ignores interactive content and nonempty text selections, and leaves vertical touch scrolling to the browser. Previous/next and page-selection controls provide keyboard alternatives.

Inactive leaves and temporary engine copies are inert and hidden from the accessibility tree. Embedded source links open separately, and local recovery links navigate the parent page. Complete Odyssey writing remains available through “Read without page turns.”

## Why the lifetime boundary is necessary

The installed upstream wrapper has no unmount cleanup effect. Its underlying renderer continually schedules animation frames, and the public destroy method does not stop that render loop.

A reproducible browser probe removed the raw wrapper: **zero engine elements remained, but 16 animation callbacks still ran during the next 250 ms observation interval**. This fails the intended cleanup gate for a raw same-document mount.

Run `node scripts/probe-wrapper.mjs` to repeat the diagnostic on port 5174. The fixture lives under `tests/fixtures/` and is excluded from the production HTML entry list. Results are saved to `.cache/evidence/p2.2-upstream-lifetime.json`.

The accepted adapter retains the unmodified physical engine but makes its document the unit of ownership. Browser checks instrument the child frames, remove and recreate the notebook three times, and verify that detached documents produce no further callbacks. This contains both renderer callbacks and the wrapper's retained listeners without relying on undocumented cleanup methods.

The engine emits its state event before assigning the corresponding state property. Settlement is deferred to a microtask so the public `getState()` call and final page index are consistent.

## Acceptance evidence

| Requirement                     | Evidence                                                                                                                |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Forwarded page references       | Actual PageLeaf DOM references accepted by the installed React wrapper                                                  |
| Hard cover, soft curls, shadows | Browser assertions during real turns; mid-turn screenshots inspected                                                    |
| Portrait/spread                 | Mobile portrait and desktop landscape verified                                                                          |
| Controlled navigation           | Previous/next and direct page selection land on the requested visible leaf                                              |
| Changed/unchanged counts        | Sample refresh preserves ten leaves with new writing; reduced sample rebuilds with eight; old frame is detached         |
| Cleanup                         | Three removal/recreation cycles per browser project; zero callbacks after disposal and no stale frames                  |
| Selection/links                 | Mouse-selected text remains selectable; no accidental turn; embedded recovery link reaches the parent route             |
| Safe gestures/scrolling         | Trusted CDP touch input turns from the edge; vertical touch motion scrolls the outer document without changing the leaf |
| Hidden pages/copies             | Inert and aria-hidden checks; hidden links reject focus; active links remain accessible                                 |
| Integration checks              | Theme, lint, two unit tests, strict TypeScript, and production build pass                                               |
| Browser regression              | **26 tests passed**, including 12 P2.2 checks and 14 P2.1/recovery checks                                               |

Screenshots: `.cache/screenshots/p2.2-curl-desktop-chromium.png` and `p2.2-curl-mobile-chromium.png`. Playwright reports are ignored artifacts under `playwright-report/` and `test-results/`.

## Limits and next action

This is a representative interaction prototype, not the complete portfolio shell. The separate engine document must remain a static entry during hosting setup. Chromium is verified; later cross-browser and final print/accessibility review remain P7/P8 work.

The complete Odyssey fixture is copied from the separate Phase 1 lane. Its Git blob hash matches `e4f79eb:src/content/analyses/odyssey.md`. Canonical data remains owned there and has not been merged into this worktree.

Next: P2.3, prove bookmark reveal and bounded near/middle/far jumps together, including newest-target handling, focus, no-hover phones, and reduced motion. P2.4 measured continuation pages remains pending.

## References

- [React wrapper page-reference pattern](https://nodlik.github.io/react-pageflip/).
- [StPageFlip public API](https://nodlik.github.io/StPageFlip/docs/classes/pageflip.html).
- Installed package source and the browser probe establish the lifetime and event-order findings for these exact versions.
