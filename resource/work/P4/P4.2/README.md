# P4.2 fitting and splitting

8 November 2026. Branch `work/p4-content`, worktree `.worktrees/p4-content`, base `0fd0a87`. Implementation: **uncommitted**. P4.1 is implemented in this worktree. P1 input files are copied unchanged from `e4f79eb`; committed P2 provides the engine, leaf, geometry, and measurement proof. P3 continues independently. Stop at this subphase boundary. Commit only after all Phase 4 work is implemented and JD approves.

## Scope and ownership

Own new canonical pagination/slicing/readiness/measurement modules in `src/lib/pagination/`, minimal image-metadata support in the shared content/leaf renderer and engine data protocol, scoped leaf styles, named unit/browser checks, and a review component under `src/prototypes/`. One additive `/prototype/content` registration in this worktree's router is an explicit integration exception. Do not change P3 files or dependency/configuration inputs. Keep P2's prototype parser and its evidence intact. P4.3 reconciles the shell and final composition; P4.4 owns production reflow and full-reading/print recovery.

## Implementation contract

- Consume P4.1 `ContentBlock` objects. Fragments retain canonical document/block/answer identity and contiguous Unicode code-point source ranges. Never split raw Markdown strings.
- Measure the real `PageLeaf`, using its shared styles, geometry, declared image dimensions, header and footer, outside the engine's transformed surface. Preserve 19/20 px handwriting and the tested 24 px option.
- Keep headings with initial writing, short blocks together, and complete list items together where possible. Split oversized paragraphs, list items, and quotations structurally, retaining emphasis, destinations, numbering, and nesting. Treat images as atomic. An impossible block must fail explicitly and leave original content available.
- Bound font/image waits, measurement time, pagination progress, and page count. Abort stale work and remove measurement roots/listeners/timers after success, failure, or cancellation.
- Use the existing notebook visual language for the review route: burgundy ink accents, cream paper, Patrick Hand, left-aligned writing, quiet controls. It demonstrates real undecorated P2 leaves without claiming final P3 shell integration.

## Result and public interfaces

P4.2 is **implemented and verified**, awaiting JD's review. P4.3 and P4.4 have not started. Phase 4 remains incomplete, unapproved, uncommitted and unintegrated. No commit, merge, push, publication or worktree deletion has been performed.

- `src/lib/pagination/contentFragments.ts`: structure-aware canonical fragments with contiguous Unicode source ranges, whole-item boundaries, atomic images, preserved nesting and list numbering, and Markdown serialization through the existing canonical parser.
- `src/lib/pagination/paginateContent.ts`: pure fitting orchestration with an injected DOM fitting callback, heading grouping, intact short blocks, oversized splitting, explicit impossible-block errors, cancellation checkpoints and a default 500-page limit.
- `src/lib/pagination/assetReadiness.ts`: registered image lookup, preload/decode, dimension checks, handwriting font readiness, abortable promises and animation frames.
- `src/lib/pagination/measureContent.tsx`: real `PageLeaf` measurement in an inert hidden root, per-request fitting cache, conservative initial and exact final footer checks, default 15-second deadline and guaranteed cleanup.
- Shared `MarkdownContent`, `ContentBlocks`, `PageLeaf`, leaf CSS and the engine data type now accept declared image dimensions. Shared leaf styles support lists/quotations, long URLs/code, and proportional image width. The engine protocol change is an optional plain-data `images` field, not a different engine or navigation convention.
- `/prototype/content`: selects all seven canonical works with their real source notes/citations. A separate optional exercise adds oversized paragraphs/list items/quotations, a long URL and JD's portrait. The complete original writing is always available through a keyboard-accessible disclosure. The route owns its small review hook/styles and does not change the P3 worktree.

## Checks

| Command/check                                         | Result                                                                                                            |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `npm.cmd run check`                                   | Passed theme consistency, zero-warning lint, **62 unit tests**, application/test TypeScript and production build. |
| `npm.cmd run format:check`                            | Passed the complete worktree.                                                                                     |
| `$env:PLAYWRIGHT_PORT = '4195'; npm.cmd run test:e2e` | **72 passed**, exit code 0. All 54 inherited P2 checks and 18 new P4.2 checks passed on desktop/mobile Chromium.  |
| `git diff --check`                                    | Passed.                                                                                                           |
| Screenshots                                           | Inspected [phone](phone.png), [desktop](desktop.png), and [list continuation on phone](list-phone.png).           |

The 17 new unit cases check all seven analyses and their sources/notes at narrow/wide capacities, personal section writing, contiguous ranges and text/order conservation, inline marks, Unicode, nested lists/quotations, ordered numbering, whole-item preference, short-block grouping, consecutive headings, unbroken text, source-entry roles, impossible blocks, cancellation/page limits, long image alt text, structural separators at tiny capacities, image registry inputs, and abort-listener cleanup. Two targeted regressions were found and fixed: a leading image with long alternative text must be probed as one image rather than the whole following paragraph, and structural list separators must stay with the preceding range rather than creating an empty fragment.

The 18 new browser checks validate every rendered word and all source-range boundaries, actual geometry and no horizontal/vertical clipping or header/footer overlap, unchanged font sizes, every original work with linked citations, nested/oversized list and quotation continuations, long URL wrapping, real image sizing/decode, keyboard access to full text, rapid replacement/cancellation, font/image failure, mismatched image dimensions, an image made too tall for the real leaf, stalled font timeout, and replacement while an image wait is pending. The existing suite verifies real curls, covers, engine disposal, bookmarks/jumps, focus, input and prototype reflow against the shared renderer changes.

The first scoped run completed all 12 then-current assertions but stalled at Windows preview teardown and was interrupted. The final full run completed all 72 tests; explicitly stopping its identified, completed preview process let Playwright finalize with exit code 0. Neither run required dependency/configuration changes. A Chromium GPU diagnostic log is retained only under ignored `.cache/evidence/`; it did not produce a test failure.

For the longest-title work plus sources and the synthetic exercise:

| Viewport width | Writing leaves | Body text |
| -------------- | -------------- | --------- |
| 320 px         | 26             | 19 px     |
| 390 px         | 25             | 20 px     |
| 768 px         | 24             | 20 px     |
| 1024 px        | 17             | 20 px     |
| 1440 px        | 17             | 20 px     |

The separate 24 px writing run also conserves all content with no clipping at 320 px. Metrics: `.cache/evidence/p4.2-desktop-chromium.json` and `p4.2-mobile-chromium.json`. Playwright HTML evidence is under ignored `playwright-report/`.

## Review and integration limits

Run `npm.cmd run dev -- --port 5194` in this worktree and open `http://127.0.0.1:5194/prototype/content`. The production build contains the same review route. This is a local review instruction, not a claim that a server is left running or the site is deployed.

Measurement and displayed proof leaves share P2's `PageLeaf` geometry/styles. P3's shell, ruled paper and final typography have not been incorporated, and combined P3/P4 acceptance remains unchecked. P4.3 must reconcile those dimensions before composing decorated openings and consumed-block records, covers/balancing leaves and maps. Writing-leaf footers here exclude those future composition elements. The optional review harness's resizing/reading disclosure does not satisfy P4.4's production semantic restoration, full-reading/print routing or engine failure recovery.

No prose, P1 metadata, portrait, selected stack, dependencies, token files, root tool configuration, or P3 file was changed. External URL availability and physical devices/other browser engines remain unverified. Keep the Phase 4 worktree and stop here. Next is P4.3 when JD continues after this checkpoint.
