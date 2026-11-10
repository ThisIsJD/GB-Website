# P5.2 bounded jumps and requested notebook interaction

**Root startup fix, 9 November 2026:** use `npm.cmd run dev` from the repository root. It now selects this Phase 5 worktree on 5193 and redirects old 5173 links with their paths/queries intact. Verified the actual root command, served checkout, old-link redirect and latest hold behavior with no browser runtime errors. Application source remains in this worktree pending whole-phase implementation/approval. Earlier instructions requiring `--prefix` are superseded.

**Current preview:** [Phase 5 on port 5193](http://127.0.0.1:5193/analyses/odyssey), per JD's port preference on 9 November 2026. The launcher defaults to 5193. Live HTTP and hold-to-grab Chromium checks passed without runtime errors. Restart from the repository root with `npm.cmd --prefix .worktrees/p5-navigation run dev`. Earlier 5197 links below are historical.

The visual/turning follow-up below supersedes the original crease hiding, type sizes, page number layout and assembly centering described in this initial checkpoint.

Implemented 9 November 2026 on `work/p5-navigation`, worktree `.worktrees/p5-navigation`. Implementation is **uncommitted**, base `e985264`. JD requested these reference-led changes when resuming after P5.1. Stop after this subphase. Whole-phase approval is still required before committing, and the worktree stays until the approved commit is preserved.

## Reference contract

The three images supplied by JD are the visual authority for this change: Image #1 supplies the colored right-side bookmarks and visible center crease; Images #2 and #3 supply corner arrows and a paper curl that follows the held pointer. The documents pictured in those references are not imported as portfolio content.

Keep the approved palette: burgundy `#762B3B`, warm canvas `#E8E4DE`, paper `#FBF5E8`, ink `#2F2926` and ruled lines `#CBD4D9`, with all five bookmark fill/accent pairs from existing tokens. Patrick Hand remains the typeface. Paper is the primary surface, with quiet controls above it, bookmarks to the right and work/answer tools below. Text stays left aligned. No new artwork, prose rewriting, dashboard cards or replacement UI kit is included.

Primary action: grab a paper edge/corner or use a corner arrow. Secondary action: select a section/work/answer. Required states include arranging, normal reading, bounded jumping with a newer target, semantic reflow, reduced motion and complete-text failure recovery. Narrow phones use a single leaf and compact side tabs with short visible labels plus the exact accessible section names. Tab movement is disabled for reduced motion.

## Implementation

- `ReaderBook`, `ReaderBookmarks` and `ReaderPageControls` compose the paper-first layout. Tabs have sliding, tilted hover/focus feedback and a brief press response. A shaded crease is shown on settled spreads and hidden while the paper moves. Curved SVG arrows sit directly below each lower paper corner, outside the grab area.
- The reader reserves the tab rail before measuring pages, including a 64 px phone rail. Existing pagination prototypes keep their prior geometry defaults.
- `useNotebookJumps` connects the existing P2 controller to the reader's current page maps and navigation controller. Bursts sample direction/distance, cap animation at three steps, retain the newest target and verify the final visible destination. Active tab, count and a live destination message settle once, with no intermediate URL history updates. The final message also identifies an answer heading when available.
- Old controllers cancel on revision changes, removed iframe commands abort, and stale results are ignored. New ready snapshots restore read state. Readiness includes route settlement. Ordinary arrows return to normal timing. Commands arriving during a live grab wait for its settlement.
- The guarded pointer adapter calls the unmodified engine's public folding methods. Mouse corner pulls can be diagonal. Touch candidates yield to vertical scrolling. Short taps do not turn pages. Reduced-motion gestures land immediately. A phone forward pull past half the sheet commits at release, accommodating the engine's hidden facing page.

References consulted: [PlopUI's interaction description](https://github.com/Snorlark/plop-ui) and [StPageFlip public pointer methods](https://nodlik.github.io/StPageFlip/docs/classes/pageflip.html). Installed engine source was checked for portrait settlement behavior. No PlopUI code/assets were copied and no dependency was added.

## Verification

- Production Vite build and strict TypeScript passed; zero-warning ESLint and Git whitespace checks passed.
- Fifteen targeted unit tests passed: jump controller, notebook routes and composition.
- Final `playwright test tests/browser/notebook-interaction.spec.ts`: **10 passed**, desktop/mobile Chromium. Tests cover side tabs, focus motion, spread crease, corner arrows, reverse retargeting during an active burst, at most three sampled turns, one final announcement, normal arrows after a burst, held mouse curl, touch drag, reflow cancellation and reduced motion.
- A combined reader/routing/interaction run passed all **20 existing reader/routing cases** plus eight interaction cases. Its two phone drag failures were then fixed, passed in a targeted two-case phone run, and passed again in the final ten-case interaction run. This is evidence across focused runs, not a claim that the earlier combined run exited green.
- Early failures identified a removed-frame abort race during reflow, transient initial readiness, a drag test whose starting corner was outside the viewport, and portrait release before crossing the hidden spine. Fixes and focused reruns are reflected above.
- Windows Playwright preview cleanup required stopping only the verified test-server processes before the reports finalized. The interactive dev preview stays on port 5197.
- Live checks at 320, 768, 1024 and 1440 px found no horizontal overflow or page runtime errors. Screenshots were inspected. The final answer-heading detail added to the live message received fresh TypeScript/lint checks; browser evidence predates that text-only adjustment.

Review images: [desktop notebook](desktop.png), [320 px phone](phone.png), [paper held mid-curl](held-drag.png). Live preview: `http://127.0.0.1:5197/analyses/odyssey`.

## Remaining scope

Stop for JD's P5.2 review. P5.3 owns the complete keyboard/scroll/selection/short-tap and hidden-page/clone focus audit, destination focus behavior and final reduced-motion verification. Browser touch simulation does not establish physical-phone or screen-reader acceptance. P6 artwork/composition and P7 academic/accessibility/release gates remain open. No commit, main integration, push, deployment or worktree deletion occurred.

## Visual and turning follow-up

9 November 2026, same branch/worktree, **uncommitted**, base `e985264`. JD requested confirmation of the React page-flip stack and adjustments to animation, crease, centering, page numbers, typography and paper rules.

- `react-pageflip` still wraps StPageFlip. No engine/library was replaced or patched.
- The center crease remains visible while pages turn. Equal rail space on either side centers the paper/crease at wider sizes, rather than centering the combined pages and right tabs. The main reader can occupy up to 1280 px. Compact phones keep their legible single leaf and right rail.
- Page numbers are plain 12 px numerals at the outer bottom corners. Left leaves align left, right/phone leaves align right. Full page/total labels remain accessible. The duplicate counter under the book is now visually hidden.
- Writing is 17/26 px on spreads and 16/25 px on phones (font/line height), with smaller headings and metadata. Surrounding controls and full-reading headings are also smaller. Rules use a lighter 0.5 px stroke. Pagination measures the resulting styles before fitting blocks, rather than shrinking an already-composed page.
- Engine synchronization reuses the existing original-leaf map and writes visibility/access attributes only when changed. This removes redundant allocation/writes during turns. No measured FPS gain is claimed.

Fresh checks: strict TypeScript and Vite build, zero-warning lint, Git whitespace. Twelve focused desktop/mobile Chromium cases passed using `playwright test tests/browser/notebook-interaction.spec.ts tests/browser/reader.spec.ts --grep 'smaller writing|paper follows|rapid reverse|touch dragging|reflow restores|complete reading'`. Assertions include crease visibility during a held fold, crease centering within 2 px, smaller fonts/line height, numeric corner footers, mouse/touch turns, latest-target jumps, semantic reflow/text scaling, and complete reading/print conservation. Windows preview shutdown was scoped to the matching test process before Playwright finalized. A subsequent live four-width smoke check found no horizontal overflow or runtime errors. The final rule-stroke-only lightening was visually checked after the production test build, without rerunning the same browser cases.

Updated review images: [centered desktop](refined-desktop.png), [phone](refined-phone.png), [held curl](refined-held-drag.png). Preview remains `http://127.0.0.1:5197/analyses/odyssey`. P5.3 and whole-phase approval/commit remain pending.

## Click/press and crease-layer follow-up

9 November 2026, same worktree/branch, **uncommitted**, base `e985264`. JD supplied two more references and clarified the intended input: a quick click turns the selected page, while a hold picks up its bottom corner at the pressed position. The crease should be hidden only by the physical paper crossing it.

The outer overlay is removed. An inert, pointer-transparent crease is now in the engine's own page container. Static pages use layer 2, the crease uses layer 5 and the folding sheet uses layer 6, with the engine's moving shadows above it. This keeps the uncovered crease visible while letting the moving sheet cover it. The engine library remains unmodified.

`usePaperGestures` replaces `useEdgeGestures`. A quick mouse release turns forward on the right page or backward on the left. A 180 ms stationary hold picks up the bottom corner, even in the interior of the page. The initial fold establishes the lower corner before following the actual press position. Edge drags can still start immediately with deliberate movement. Body-text selection cancels the candidate; links, form controls and existing text selections are excluded. Touch keeps its guarded edge drag/vertical-scroll behavior. Phone clicks advance except at the left edge, which goes back. Reduced motion lands immediately without a fold. Timers/capture clear on cancellation, blur and disposal.

Verification: production build/strict TypeScript, zero-warning lint and whitespace checks passed. All **12 targeted desktop/mobile Chromium cases passed**: quick clicks forward/back, stationary interior holds, stacking below the folding sheet, selection without a turn, existing held edge drags, browser touch drags, centering, smaller rules/type and corner numerals. The screenshot was visually reviewed: [stationary interior press](interior-press.png). The test preview required scoped Windows process shutdown to finalize its report. Full P5.3 access/input/focus and P7 gates remain pending. Nothing was committed or integrated into main.
