# My Literary Journey: Concept and Implementation Plan

**Phase 6 profile annotation re-animation fix, 11 November 2026 (main, uncommitted, base `834802e`):** JD reported that the Student Profile Rough Notation marks animated once and then vanished, instead of re-animating on every turn like the others. The profile's marks all come from `characterMatches`, which wraps matched text in persistent `.character-highlight` spans; on redraw the tree walker skipped text already inside those spans, so after the first removal nothing was re-annotated (story pages hid this because their `<strong>` key terms still re-animated). Fixed `characterMatches` to store each span's notation type in `data-mark` and, at the start of every pass, collect existing `.character-highlight` spans so their marks are recreated and re-animated on each redraw. Validation: TypeScript, ESLint, 70 unit tests and the production build pass; live browser smoke confirmed the profile keeps 7 marks after navigating away and back (previously 0 on return), re-animating every time. Next action: JD review; commit only after approval.

**Phase 6 notebook sound tuning, 11 November 2026 (main, uncommitted, base `834802e`):** JD reported the multi-page jump sound ran longer than the animation (which turns at most three pages) and asked for lower, subtler volume. Capped the riffle playback to 0.85s (about three 280ms flips) with a short tail fade so it ends with the animation instead of droning, and lowered both sample gains (single turn 0.45, riffle 0.38). Validation: TypeScript, ESLint, 70 unit tests and the production build pass; live browser instrumentation confirmed the riffle now starts with a 0.85s trimmed duration and the single turn plays its 0.6s region, both at the reduced gains. Next action: JD review; commit only after approval.

**Phase 6 bookmark feedback and notebook sounds, 11 November 2026 (main, uncommitted, base `834802e`):** JD requested four refinements. (1) The bookmark onboarding hint now dismisses on any bookmark activation, including the Literary Analyses tab that only toggles its flyout, by routing every bookmark click through an interact callback. (2) The active section bookmark is now clearly emphasised: it slides out of the rail (translateX with a stronger shadow and inset accent) in both full and compact rails, over the previous underline-only treatment. (3) Added notebook sounds in `src/lib/audio/notebookSounds.ts`: a subtle synthesised tick on bookmark hover/focus. (4) Two page-turn sounds play JD's own recordings, copied from the `assets/` staging folder to `public/sounds/` (`page-turn.mp3` for a single page turn, `page-riffle.mp3` for a multi-page section jump) and chosen by JD. Because both recordings carry long silent padding (the single turn's audio sits at 2.25s), the module decodes each sample once and auto-detects its audible region so playback starts instantly and stays short, stopping any prior play of the same sample so rapid turns stay crisp. The engine (iframe) classifies turns definitively, emitting a `sound` message (`turn` on each flip start when not jumping, `burst` once per section jump on input-lock) that the parent plays through one resumed AudioContext, covering in-iframe clicks, drags, keyboard, arrows and bookmark jumps. Validation: TypeScript, ESLint, 70 unit tests and the production build pass (`dist/sounds/*.mp3` served verbatim; the hashed `dist/assets` duplicates are the pre-existing `/public/**` asset-validation glob, not new). Live browser smoke confirmed the hint disappears on the Literary Analyses toggle, the active bookmark is translated out, one `turn` fires per arrow turn, exactly one `burst` fires per bookmark jump with no stray single sounds, both samples decode and auto-trim (turn 2.25s/0.60s, riffle 0.39s/2.04s), and a full turn-plus-jump sequence runs with no console errors. Next action: JD review; commit only after approval.

**Phase 6 Rough Notation replay fix, 11 November 2026 (main, uncommitted, base `834802e`):** JD reported that Student Profile annotations appeared only once. The engine previously skipped visible leaves already present in its annotation WeakSet, so repeated turns could leave the same DOM leaf without a new animation. Added an explicit redraw path that removes existing marks and recreates them for every visible leaf whenever a page turn settles, while still clearing hidden leaves. Validation: pending focused annotation and production checks. Next action: JD review; commit only after approval.

**Deployment engine-entry fix, 11 November 2026 (main, uncommitted, base `399a54c`):** JD reported that the notebook failed to open on Vercel. Production probing showed that the tracked `turning-pages.html` existed in the repository but was absent from `dist`, so Vercel's SPA fallback returned the main app HTML to the iframe instead of the page engine document. Configured Vite with explicit `index.html` and `turning-pages.html` Rollup inputs so the iframe document and engine bundle are emitted for deployment. Validation: pending production build and preview smoke. Next action: JD review; commit only after approval.

**Phase 6 legacy reading-query fix, 11 November 2026 (main, uncommitted, base `8e69ada`):** JD reported that Vercel URLs containing `?view=reading` displayed the closed cover above the writing instead of the notebook. Removed the public reading-mode query behavior: legacy `view=reading` URLs now replace themselves with the canonical route, direct routes never render the cover handoff, and normal notebook pagination is restored. Updated route tests to assert that notebook URLs do not emit the obsolete query. Validation: local browser smoke confirmed `/profile?view=reading` canonicalizes to `/profile` and renders page 2 of the notebook; TypeScript, ESLint, route unit tests and production build pass. Next action: JD review; commit only after approval.

**Phase 6 landing cover visual fix, 11 November 2026 (main, uncommitted, base `62cad57`):** JD reported that the closed landing cover was visually collapsed after integration. The generated theme exposes color tokens but not the size and typography custom properties used by the cover, so the cover rendered at content width with undersized text. Restored the intended 440px by 620px cover proportions and title width in the shared landing styles, and added defensive fallbacks for cover sizing, spacing, radius and texture tokens. Validation: live browser screenshot and computed layout confirm the centered 440px by 620px cover; TypeScript and ESLint pass. Next action: JD review; commit only after approval.

**Phase 6 landing and first-spread regression fix, 11 November 2026 (main, uncommitted, base `62cad57`):** JD reported that the root landing path opened the notebook without changing to the reader path, and that page 2 could still turn back to the cover. Restored explicit notebook routes, made the cover hit target fill the cover with accessible focus styling, and blocked backward paper gestures from the first readable page while preserving the existing disabled arrow and keyboard guards. Updated cover smoke expectations to `/profile`. Validation: live browser smoke confirmed `/` remains the closed cover and clicking it navigates to `/profile`, where page 2 shows a disabled previous control; TypeScript, ESLint, production build and notebook route tests pass. Next action: JD review; commit only after approval.

**Phase 6 integration regression fix, 11 November 2026 (main, uncommitted, base `62cad57`):** JD reported that the website showed the missing-page cover at `/profile` instead of the notebook. The integration had retained the initial scaffold router, which sent every non-root path to `NotebookCover`; restored the Phase 5 route wiring so valid notebook sections and legacy `/notebook` deep links render `NotebookReader`, while invalid paths retain the fallback cover. Validation: notebook route unit tests, TypeScript, ESLint and production build passed; live browser smoke confirmed `/profile` renders the Student Profile notebook and `/` renders the cover. The isolated routing E2E still times out waiting for the iframe document to become ready after the fallback recovery path, which is separate from the fixed route regression. Next action: JD review; commit only after approval.

**Phase 6 Voice Out of the Whirlwind attribution cleanup, 11 November 2026 (work/p6-content, uncommitted, base `db4dd53`):** JD asked to remove the visible “Unknown” attribution from the Voice Out of the Whirlwind opening. Cleared that attribution and added a title fallback so the opening still has a meaningful label without displaying an unknown author. Validation: `npm.cmd run check` passed. Next action: JD review; no commit until JD approves.

**Phase 6 Literary Analyses introduction, 10 November 2026 (work/p6-content, uncommitted, base `db4dd53`):** JD supplied replacement introductory copy for the Literary Analyses section. Updated `src/content/reading-list.md` while keeping the existing section heading and the seven-work structure unchanged. Documentation-only content change; no additional validation required.

**Phase 6 first-page navigation lock, 10 November 2026 (work/p6-content, committed `9361e1b`, `Complete Phase 6 notebook experience`, base `db4dd53`):** JD requested that the Student Profile opening spread behave like the final page: turning left must be unavailable after opening. The previous-page control is disabled at the first readable page, and the obsolete close-cover callback was removed from that interaction. Validation: `npm.cmd run check` passed. The full Phase 6 worktree was committed as `9361e1b`; main integration is pending.

**Phase 6 profile metadata annotations, 10 November 2026 (work/p6-content, uncommitted, base `db4dd53`):** JD requested specific marks in the Student Profile: underline the name, course, year, university and class code; highlight `JD`; and circle the class section. Added explicit profile annotation targets in `noteMarks.ts`, including a case-insensitive `fourth-year` match for the rendered prose, while preserving the existing prose-only scope that excludes headers, tags, captions and sticky-note labels. Browser smoke confirmed all seven requested profile values are marked. Validation: `npm.cmd run check` passed. Next action: JD review; no commit until JD approves.

**Phase 6 numbered ending and close transition, 10 November 2026 (work/p6-content, uncommitted, base `db4dd53`):** JD requested the ending on page 41, removal of the unnumbered final page treatment, and a closing interaction from the first reading page. The composition now pads the final sequence to 41 pages, displays the ending page number, and no longer hides its footer. The previous-page control remains available on the first reading page; activating it shows the centered duplicated notebook cover, hides the open engine, and returns to `/` after the cover close transition. Validation: `npm.cmd run check` passed; browser smoke confirmed `/profile` reports Page 2 of 41 and the first-page left turn returns to `/` with the landing cover visible. Next action: JD review; no commit until JD approves.

**Phase 6 tooltip simplification, 10 November 2026 (work/p6-content, uncommitted, base `db4dd53`):** JD asked to remove the gesture arrows and retain only the tooltip in the marked lower-middle area. Removed the arrow SVG and placed the page/drag hint in the center of the right page at the requested vertical position. Validation: `npm.cmd run check` passed. Next action: JD review; no commit until JD approves.

**Phase 6 tooltip arrow refinement, 10 November 2026 (work/p6-content, uncommitted, base `db4dd53`):** JD requested that the gesture cue match the supplied reference more closely. The page/drag tooltip is now centered on the right page, with two larger diagonal hand-drawn arrows rising from it toward the page corners, using the reference's contrasting red and orange strokes. Validation: `npm.cmd run check` passed. Next action: JD review; no commit until JD approves.

**Phase 6 tooltip refinement, 10 November 2026 (work/p6-content, uncommitted, base `db4dd53`):** JD requested both left and right turn hints, an info-colored tooltip treatment, and a more specific page gesture cue. The initial page now renders both directional arrow labels, including the left-side guidance, while the page/drag hint sits at the lower-right of the notebook with hand-drawn arrows pointing toward both lower corners. Tooltip surfaces now use the design system focus/info blue with light text. Validation: `npm.cmd run check` passed. Next action: JD review; no commit until JD approves.

**Phase 6 annotation scope fix, 10 November 2026 (work/p6-content, uncommitted, base `db4dd53`):** JD reported Rough Notation highlights appearing on tags, headers and titles. Character highlights now scan prose text only, excluding headings, page labels, opening metadata, portraits, sticky-note labels and hidden UI text. Profile highlighting is limited to the full student name rather than the `JD` owner tag, and continuous reading sections carry their work IDs so character terms stay scoped to the correct story. Validation: `npm.cmd run check` passed. Next action: JD review; no commit until JD approves.

**Phase 6 direct landing route, 10 November 2026 (work/p6-content, uncommitted, base `db4dd53`):** JD reported that opening navigated through `/notebook` before settling on `/profile`, causing an extra handoff. The landing cover now navigates directly from `/` to `/profile` while preserving the route state used by the duplicated closed-cover overlay. Legacy `/notebook` parsing remains available for existing deep links, but it is no longer part of the landing flow. Validation: direct browser smoke reached `/profile` immediately after clicking the cover, with no `/notebook` URL; `npm.cmd run check` passed. Next action: JD review; no commit until JD approves.

**Phase 6 overlap fix, 10 November 2026 (work/p6-content, uncommitted, base `db4dd53`):** JD reported a brief overlap between the route-owned closed-cover overlay and the underlying open notebook. During the handoff, the reader engine is now hidden while the overlay is present, so only one notebook surface is visible; the engine is revealed after the cover animation is removed. Validation: `npm.cmd run check` passed. Next action: JD review; no commit until JD approves.

**Phase 6 route handoff and character marks, 10 November 2026 (work/p6-content, uncommitted, base `db4dd53`):** JD requested that the landing notebook remain visible while the destination reader loads, rather than disappearing between `/` and `/profile`, and requested highlight notation for story characters and the student's name. Implemented a destination-owned duplicate cover overlay: `NotebookReader` keeps a non-interactive closed cover above the reader route and starts its hinge animation only after the composed engine is ready, then removes it without adding a close path. Added work-scoped character terms and profile name terms to `noteMarks.ts`, rendered as Rough Notation `highlight` marks alongside the existing key-term marks; leaf annotations are cleared and redrawn on page turns. Updated the leaf protocol and DOM metadata to carry `workId`. Validation: `npm.cmd run check` passed (theme check, zero-warning ESLint, 70 unit tests, TypeScript build and production build). Focused Chromium smoke passed: landing click reached `/profile`, the reader became ready with the transition overlay removed, profile name highlights were present, and the Iliad page showed character highlights. Next action: JD review; no commit until JD approves.

**Phase 6 reader polish set, 10 November 2026 (work/p6-content, uncommitted, base `db4dd53`):** JD requested five refinements; all implemented in `.worktrees/p5-navigation`. (1) Landing open — the notebook no longer fades to nothing. Clicking the landing cover now routes into the reader and the engine turns its front cover open to the first page (JD chose this "turn the cover open" option). Implemented by no longer treating `openedFromCover` as a deep link in `NotebookReader` (so the tested entering/open page-turn plays), shortening the landing hand-off animation to a quick spine-swing (`NotebookCover` 460 ms, `cover-slide-open`), and adding a soft fade-in on the reader via `data-from-cover`. (2) Zoom hint now dismisses for the whole session once any photo is zoomed, surviving page turns and recomposition — `Polaroid` persists the state in `sessionStorage` and syncs across the engine iframe and the reading view with a window event plus the `storage` event. (3) Literary Analyses sub-bookmarks gained hover, focus, active and current-selection styling (`reader.css`, `aria-current` wired in `ReaderBookmarks`). (4) Margin and closing notes now render as a yellow sticky note held by a tape strip instead of a highlight: `MarkdownContent` tags the note paragraph `.note-sticky` at render time (so the measurement host and engine agree on height) and injects a `.note-tape`; styling lives in `leaf.css` so it applies in the engine, the reading view and the measurement host. (5) Rough Notation now draws varied hand-drawn marks (box, circle, multi-line underline) over bold key terms rather than only highlighting, re-animating every time a page is turned to: `noteMarks.ts` was rewritten to `decorateLeaf`/`undecorateLeaf` (per-leaf, animate-on-enter, clear-on-leave) and `decorateReading` (one pass for the continuous view), driven from `useEngineController`'s visible-leaf pass and `FullReadingView`. Validation (inside the worktree): `npm run check` passed — theme check, zero-warning ESLint, 70 unit tests, `tsc -b`, production build. Focused Chromium smoke (production preview): the landing click opens the book to the Student Profile via a page turn; the zoom hint stays gone after the first zoom across page turns; the sticky note renders with tape; Rough Notation marks appear and re-animate on each turn and target only `strong` key terms; the accordion opens with styled sub-items; zero console/page errors. Known limitation: the Playwright browser suite has pre-existing stale assertions from the P5/P6 UI changes (it expects six bookmarks, a `/notebook` URL after opening, and header text inside `.leaf-body`); a direct `/notebook` load — a path this change does not touch — reproduces the same `/profile` redirect, five bookmarks and two spread headers, confirming these failures predate and are independent of this change. Reconciling those specs is a separate follow-up. Next action: JD review; no commit until JD approves.

**Phase 6 onboarding tooltips, 10 November 2026 (work/p6-content, uncommitted, base `db4dd53`):** JD re-requested the four specific onboarding tooltips (after the earlier pause), referencing the Sketchbook UI tooltip style. Implemented as hand-drawn notebook-styled nudges (handwriting font, annotation-highlight fill, ink border, pointer, gentle opacity pulse that is disabled under reduced motion), built in the app's own CSS rather than adding a dependency (Sketchbook UI is not installed). (1) Each page-turn arrow shows a "Click to turn left/right" hint (`ReaderPageControls`, only on the enabled arrow). (2) The bookmark rail shows "Click a bookmark to open a section" (`ReaderBookmarks`) that disappears once any bookmark is selected. (3) The page area shows "Click a page or drag a corner to turn" (`ReaderBook` over the shell) that disappears once a page is turned or a corner is dragged. (4) Each zoomable polaroid shows a "Click to zoom" badge (`Polaroid`, bottom-right of the photo) that disappears after that photo is zoomed. Dismissal is parent-managed in `NotebookReader`: a `turnHintDone` flag covers the arrow and page hints (set on arrow click, on index change away from the start page, and on engine `user_fold`/`fold_corner` states once ready), and a `bookmarkHintDone` flag covers the rail hint. The zoom badge dismisses via local `Polaroid` state so it works both inside the engine iframe and in the full reading view. Validation (run inside the worktree): `npm run check` passed — theme check, zero-warning ESLint, 70 unit tests, `tsc -b`, production build. Focused Chromium smoke (reduced motion, production preview): on load the page/arrow/bookmark hints and the profile zoom badge are all present; turning a page removes the page and arrow hints while the bookmark hint stays; clicking a bookmark removes the bookmark hint; clicking a polaroid opens the lightbox and removes that photo's zoom badge; zero console/page errors. Note: the earlier scope-correction entry's `npm run check` ESLint failure was because those commands were run from the repo root (branch `main`) instead of this worktree; re-running `npm run check` inside `.worktrees/p5-navigation` passes cleanly. Next action: JD review; no commit until JD approves.

**Phase 6 scope correction, 10 November 2026 (work/p6-content, uncommitted, base `db4dd53`):** JD asked to keep only the first item from the latest UI change set and stop the tooltip-expansion follow-up. Implemented behavior: the ending is now the final notebook page (not the back cover), forward navigation stops at that last page, and a notebook-styled end alert is shown when that page is reached. In-progress wiring for the extra tooltip-specific asks (arrow/bookmark/drag-picture onboarding hints) was removed so this update stays scoped to the first request only. (JD later re-requested these tooltips; see the entry above, which supersedes this removal.) Validation: `npm.cmd run build` passed (`tsc -b` + Vite production build). The `npm.cmd run check` ESLint failure noted here came from running in the repo root instead of the worktree; it passes in the worktree.

**Phase 6 content + UI change request, 10 November 2026 (work/p6-content, uncommitted, base `db4dd53`):** JD supplied the seven book covers and asked for four UI features. Content: copied the seven covers into `public/images/works/<work-id>.jpg` (Les Misérables cover supplied separately; the `TheSongOfRoland.jpg` in assets was a mismatch and is unused), added `src/content/covers.ts`, and wired each analysis opening to show its real book cover as a taped polaroid (new `cover` portrait variant) via `composePortfolio`. Removed the per-story source note from the composed pages (`work.sourceNote` no longer appended; the global Sources and credits section still carries full citations, and the `work.sourceNote` property is retained so the conservation test passes). UI: (1) polaroids are now zoomable — clicking opens a full-viewport `Lightbox` with a dimmed/blurred backdrop, caption, credit, and Escape/scrim/button close; engine polaroids post a `zoom` message across the iframe to the parent (`FlipAdapter`→`ReaderBook`→`NotebookReader`), reading-view polaroids call `onZoom` directly; polaroids are `<button>`s so a page turn is not triggered. (2) Landing page shows a nudging "Click the notebook to open" tooltip on the left (above on narrow via a container query) that disappears when the cover opens. (3) The notebook gesture hint now covers turning, corner-drag, photo zoom, and arrow keys; interactive controls have native `title` tooltips. (4) The back cover renders as a textured "The End" closing cover (shared woven texture, hidden page number). Fixed a critical recomposition loop: `useReadingInputs` bumped the layout revision on every measurement-host image `load`, so the new cover images restarted composition forever — measurement-host images (`.page-measurement`) are now ignored. Checks: `npm run check` passed (theme, zero-warning ESLint, 70 unit tests, `tsc -b`, production build). Focused Chromium smoke (production preview): landing tooltip present; each analysis opening shows its real cover with a zoom button and no source note; the lightbox opens from both the engine and the reading view and closes on Escape; the back cover reads "The End"; no horizontal overflow at 360 px; zero console/page errors. Limitations: the back cover is a textured "The End" page (a full book-closing animation with the right page physically peeling away was not built); the lightbox backdrop blur relies on `backdrop-filter` (dim fallback where unsupported); book-cover images are not yet compressed (P7.4); distinct per-opening art arrangement (P6.2 variety) beyond the cover polaroid is still open. Next action: JD review; no commit until JD approves.

**Phase 5 committed, 9 November 2026:** the whole of Phase 5 (P5.1–P5.3 plus JD's two change requests: remove Contents/profile-first/portrait polaroid, then headers-once/corner-tag, continuous flow, temporary story polaroids, inline-accordion dropdown) is committed as `b78fdb9` **Implement Phase 5 notebook navigation and reading layout** on `work/p5-navigation`, base `e985264` (Phase 4). The "uncommitted" notes below predate this commit; they now describe commit `b78fdb9`. Not yet integrated into `main` or pushed. The main worktree's unrelated edits remain untouched. Next: Phase 6 arrangement continues from this commit on `work/p6-content`.

**Phase 5 change request 2 (headers, continuous flow, story polaroids, accordion dropdown), 9 November 2026:** implemented in `work/p5-navigation`, `.worktrees/p5-navigation`, **uncommitted**, base `e985264`. JD asked to: (1) stop repeating the full section/work header on every page, showing it once on the opening page and a small corner tag on continuation pages; (2) remove the blank "A pause between readings" leaves so readings flow continuously regardless of spread side; (3) add a temporary taped polaroid placeholder to each of the seven stories (photos to be supplied later); (4) fix the Literary Analyses dropdown that covered the page on hover, chosen approach: an inline accordion inside the rail. Concrete changes: `OpeningMetadata` gained an optional `portrait` spec in `src/lib/navigation/engineProtocol.ts`; refactored the polaroid into a generic `src/components/content/Polaroid.tsx` + `polaroid.css` (real photo or a "Photo coming soon" placeholder), removing the old `ProfilePolaroid.*`; `composePortfolio.ts` now threads `portrait` through profile and each work opening and no longer inserts inter-section balance leaves (only the end parity filler remains); `PageLeaf.tsx` renders the polaroid from `opening.portrait` and drops the opening label when it equals the title; `src/styles/leaf.css` styles the continuation-page header as a small corner tag (excluding covers, mirrored for left/right pages); `FullReadingView.tsx` renders a polaroid for every group that has portrait data; `ReaderBookmarks.tsx` makes the works list a click-toggle inline accordion (Escape closes) and `reader.css` restyles `.reader-work-flyout` as an in-flow list. Updated tests: `tests/unit/composition.test.ts` (removed the odd-leaf-index opening assertion now that flow is continuous) and `tests/browser/access.spec.ts` (click-to-open accordion, `.polaroid` selector). Checks: `npm run check` passed (theme check, zero-warning ESLint, 70 unit tests, `tsc -b`, production build). Focused Chromium smoke (production preview): profile opening shows one header and no duplicate label with the taped "JD" polaroid; a continuation page shows a small corner tag; `/analyses/odyssey` shows the "Photo coming soon" taped placeholder and The Iliad flows straight into The Odyssey with no pause page; the Literary Analyses accordion opens in-flow inside the rail (position static, within the rail bounds, not over the page); no horizontal overflow at 360 px; `/profile?view=reading` renders 8 polaroids and contains no "A pause between readings"; zero console/page errors. Limitations: the full Playwright e2e suite was not executed (the edited specs were updated, not run); story polaroids are placeholders awaiting JD's photos; captions use the nickname/title and can be adjusted. Next action: JD review; no commit, main integration, push, deployment or worktree deletion performed.

**Phase 5 change request (remove Contents, profile-first, portrait polaroid), 9 November 2026:** implemented in `work/p5-navigation`, `.worktrees/p5-navigation`, **uncommitted**, base `e985264`. JD changed direction: remove the Contents bookmark and page, make the Student Profile the first page, and show JD's photo as a physical polaroid taped to the page (reference: looseleaf polaroid + supplied `assets/polaroid.png`). Concrete changes: dropped the `contents` composition group and its two-part measure in `src/lib/pagination/composePortfolio.ts`; removed the `/contents` path and defaulted routing to `student-profile` in `src/lib/navigation/notebookRoutes.ts`; removed `contents` from the engine link-interception regex in `src/engine/useEngineController.ts`; removed the Contents tab button in `src/components/notebook/ReaderBookmarks.tsx` and its CSS in `src/app/reader.css`; relabeled the unused `ReaderControls` button. Added `src/components/content/ProfilePolaroid.tsx` + `profile-polaroid.css` (taped, tilted polaroid of `/images/profile/jd.jpg` with a handwritten "JD" caption and screen-reader credit), rendered on the profile opening leaf via `PageLeaf` (so pagination measurement stays consistent) and in `FullReadingView` (replacing the plain figure). Updated tests: `tests/unit/composition.test.ts` (group order + 13 openings), `tests/browser/access.spec.ts` and `tests/browser/routing.spec.ts` (profile-first, no Contents tab, 13 full-reading documents). Checks: `npm run check` passed (theme check, zero-warning ESLint, 70 unit tests, `tsc -b`, production build). Focused Chromium smoke (production preview): `/notebook` opens to the Student Profile, the polaroid renders at ~175x207 with no clipping on desktop and no horizontal overflow at 360 px, `/profile?view=reading` shows the polaroid with 13 documents, zero console/page errors. Limitations: the full Playwright e2e suite was not executed (the three edited specs were updated, not run); the pre-existing duplicate opening label (section title shown as both header and opening line) is unchanged and now more visible on the first page; `/contents` review URLs in older notes below no longer resolve (review at `/` or `/profile`). Next action: JD review; no commit, main integration, push, deployment or worktree deletion performed.

**P5.3 / whole-Phase-5 implementation checkpoint, 9 November 2026:** implemented in `work/p5-navigation`, `.worktrees/p5-navigation`, **uncommitted**, base `e985264`. JD requested the top toolbar and bottom work/answer panel removed, a smaller separate Contents tab, seven-title analysis flyout, tighter full-width rules with aligned text, and a sliding/opening clickable cover without the separate Open button. JD confirmed the separate Contents tab, the flyout and full-width rules. These changes and the P5.3 input/access behavior are implemented. Review at `http://127.0.0.1:5193/` or `/contents`; root `npm.cmd run dev` continues to select this worktree, with old 5173 links redirecting. P5.1–P5.3 are now implemented and locally verified within their recorded scopes. Stop for JD's whole-phase review. No Phase 5 commit, main integration, push, deployment or worktree deletion has occurred. Commit only after JD approves the entire phase, then preserve the resulting SHA and remove the worktree as requested. P6/P7 remain pending. Detailed checks and limitations: [P5.3 handoff](work/P5/P5.3/README.md).

**Root command and old-link correction, 9 November 2026:** JD found that root `npm.cmd run dev` still served `.cache/phase4-preview` on 5173. The root launcher now prefers the active `.worktrees/p5-navigation` reader and defaults to 5193. When dispatching to that worktree on 5193, it redirects old 5173 requests to the same path/query on 5193. The worktree launcher shares the source-selection/default-port logic, with the legacy redirect confined to root dispatch. The actual root npm command was started and its served checkout verified in logs. A live Chromium check of `5173/notebook?at=odyssey-reflection` confirmed redirect/path/query preservation, current reader readiness and the latest interior hold behavior, with zero runtime errors. Syntax, focused formatting and whitespace checks passed. Only verified project preview listeners were replaced; no broad checks were rerun. Implementation remains **uncommitted**, Phase 5 base `e985264`; root launcher/docs are a separately authorized startup fix on base `d2d6b5f`. Phase 5 application source remains isolated here, with no main merge, commit or deletion. `npm.cmd run dev` from the root is now the normal startup command. This supersedes the previous requirement to use `--prefix` to see Phase 5. P5.3 and JD's whole-phase commit approval remain pending.

**Stable Phase 5 preview port, 9 November 2026:** JD requested keeping port **5193** after the previously supplied 5197 preview was unreachable. The Phase 5 launcher now defaults to 5193, and a hidden background preview was started from `.worktrees/p5-navigation`. Its startup log confirms the actual Phase 5 checkout. HTTP at `http://127.0.0.1:5193/` returned 200; a live Chromium check at `/analyses/odyssey` reached ready state, exercised stationary hold-to-grab and reported zero page runtime errors. Launcher syntax and Git whitespace checks passed. No application build or broad suite was needed for this default-port change. Implementation remains **uncommitted**, branch `work/p5-navigation`, base `e985264`. Restart from the root with `npm.cmd --prefix .worktrees/p5-navigation run dev`. Use port 5193 for subsequent Phase 5 review. Earlier 5197 links describe historical checks and are superseded by this entry. Root/main's separate Phase 4 snapshot launcher and other worktrees were not changed. No commit or worktree removal occurred.

**P5.2 click/press and crease-layer follow-up, 9 November 2026:** implemented in `work/p5-navigation`, `.worktrees/p5-navigation`, **uncommitted**, base `e985264`. JD clarified that the crease should be covered by paper crossing it, rather than appearing above the moving sheet. The crease is now inside the engine document, above resting pages and below the folding sheet/shadows, replacing the outer iframe overlay. It remains visible where uncovered and is naturally occluded by the folding page. Its position/centering and smaller typography remain unchanged.

Quick mouse clicks now turn the right page forward and the left page backward. On a single phone leaf, ordinary clicks advance and a click on the left edge goes back. A stationary mouse press of 180 ms picks up the selected page's bottom corner at the pressed position, then follows movement until release. Existing edge/corner mouse and touch drags remain supported. Starting a body-text selection cancels the hold/click gesture, and links/controls are excluded. Reduced motion uses immediate landings. The new `usePaperGestures` replaces the previous edge-only hook and cleans up hold timers and pointer capture on cancellation/unmount. The reader hint now describes click and hold.

Fresh production build/strict TypeScript, zero-warning lint and Git whitespace checks passed. Twelve targeted desktop/mobile Chromium checks passed for quick forward/back clicks, stationary interior holds, crease/folding-sheet stacking, text selection without turns, existing held edge drags, browser touch drags, centered crease and smaller corner numerals. The held-press screenshot was visually inspected. See [press/click follow-up](work/P5/P5.2/README.md#clickpress-and-crease-layer-follow-up). This supersedes prior crease-overlay behavior and the earlier rule that short mouse clicks do not turn. Full P5.3 keyboard/access/focus and release audits remain open. Stop at this follow-up checkpoint. No commit, merge, push, deployment or worktree deletion occurred.

**P5.2 visual/turning follow-up, 9 November 2026:** JD requested a persistent center crease during turns, crease-based centering, smaller corner page numbers and smaller overall type with tighter rules. Implemented in `work/p5-navigation`, `.worktrees/p5-navigation`, **uncommitted**, base `e985264`. The application continues to use `react-pageflip` over the unmodified StPageFlip engine. The crease no longer disappears during animation. At widths that support a balanced rail, equal space is reserved on both sides, centering the physical paper/crease instead of the combined paper-plus-bookmarks. The reader can use up to 1280 px overall width; narrow phones retain a single usable leaf and compact side tabs. Paper numerals are 12 px at the outer bottom corners, left aligned on left leaves and right aligned on right/phone leaves. The redundant visible aggregate page counter is hidden visually while remaining available semantically. Writing is 17 px with 26 px line spacing on spreads and 16 px with 25 px spacing on phones; headings, metadata and surrounding controls are smaller too. Rules are thinner and lighter. All geometry changes participate in measurement/recomposition, preserving semantic locations and source writing.

The engine adapter now reuses its registered-original lookup and skips unchanged `inert`/`aria-hidden` writes during leaf synchronization, reducing avoidable DOM allocation/writes without changing physical curl/shadow behavior. No frame-rate improvement is claimed without a performance benchmark. Production build/strict TypeScript and zero-warning lint passed. Twelve focused desktop/mobile Chromium cases passed for persistent crease during a held turn, centered crease geometry, type/rule spacing, page numeral placement, mouse/touch turns, rapid reverse jumps, resize/text scaling and complete reading/print. Four-width live checks (320/768/1024/1440) found no sideways overflow or runtime errors. The final rule-stroke lightening is verified in the live preview/screenshots; the production browser run used the same layout with the prior stroke opacity/thickness. See the [follow-up evidence and screenshots](work/P5/P5.2/README.md#visual-and-turning-follow-up). Stop at this follow-up checkpoint. P5.3 remains pending. Nothing was committed, merged, pushed or deployed, and the Phase 5 worktree remains in place.

**Active P5.2 checkpoint, 9 November 2026:** P5.1 and P5.2 are implemented and locally verified on `work/p5-navigation`, worktree `.worktrees/p5-navigation`, **uncommitted**, base `e985264`. JD resumed after P5.1 and requested side bookmarks with sliding/wobbly feedback, a visible spread crease, paper grabbing and corner arrows before continuing. These changes are included in P5.2. The reader preview remains `http://127.0.0.1:5197/analyses/odyssey`. Stop for the P5.2 summary/review. P5.3 remains pending. No commit, main integration or worktree deletion is authorized until the whole phase is implemented and JD approves it. See [P5.2 handoff and screenshots](work/P5/P5.2/README.md). This supersedes older active/next-action notes below.

**Active Phase 5 checkpoint, 9 November 2026:** P5.1 is implemented and locally verified in branch `work/p5-navigation`, worktree `C:/Users/LENOVO/Projects/GB-Website/.worktrees/p5-navigation`, **uncommitted**, base `e985264` (Phase 4 implementation `5b42e43` plus its actual-SHA record). This supersedes older next-action notes that stop before P5. No main integration is claimed. JD requested the entire Phase 5 in this worktree, with a stop and summary after every subphase. Commit only after P5.1 through P5.3 are implemented and JD approves the whole phase, then remove the worktree while preserving the committed branch. P5.2 and P5.3 remain unchecked. See [P5.1 handoff](work/P5/P5.1/README.md).

**Phase 4 implementation commit, 9 November 2026:** `5b42e43a83b3fa4e7229f2aa52bc61eca171850e`, **Implement Phase 4 notebook reader**, branch `work/p4-content`, base `0fd0a87`. P4.1 through P4.4 and the preview launcher fixes are implemented, verified, explicitly approved by JD and committed. Final production build/type checking, launcher syntax and Git whitespace checks passed. Earlier 67-unit/74-browser and focused 10-browser evidence remains scoped to its recorded runs. This documentation follow-up records the actual resulting implementation SHA. No main application merge, push or publication occurred. The branch is preserved; the approved worktree will be removed after this record is committed and its preview is preserved at ignored `.cache/phase4-preview`. Port 5173 will serve the preserved frontend build after removal. Unrelated main edits are excluded.

**Phase 4 approval and commit preparation, 9 November 2026:** JD explicitly requested the Phase 4 commit after P4.1 through P4.4 and the preview corrections. Status: implemented, verified and approved for commit; implementation still **uncommitted**, base `0fd0a87`, branch `work/p4-content`. Scope includes canonical content/validation, measured fitting and composition/maps, functional notebook entry, semantic reflow, complete reading/print, failure recovery, proportional checks and scoped P1/P3 prerequisites. Final build/type checking, launcher syntax and whitespace checks are recorded with the commit. Earlier unit/browser evidence is retained without rerunning broad suites. Preserve the current working build in ignored `.cache/phase4-preview` before removing the worktree, and allow the root launcher to serve that snapshot after cleanup. Main application integration and push are not authorized by this commit request. Unrelated main edits and flattened untracked files are excluded. Add the actual implementation SHA and subject in the next plan update after committing, then remove only this worktree while preserving its branch.

**Preview startup repair, 9 November 2026:** JD again saw the static cover at port 5173 because restarting the root checkout launched its original scaffold. Added `scripts/start-dev.mjs` and changed only the `dev` command in each checkout's package manifest. The root command now selects `.worktrees/p4-content` until main contains the actual reader, regenerates that checkout's theme, and serves port 5173. If neither checkout has the reader it fails clearly. Existing dependency-version edits were preserved. No main application implementation was copied or merged. The launcher changes are uncommitted: root base `d2d6b5f`, Phase 4 base `0fd0a87`. Replaced only the verified old preview listener, with elevated stop permission required by Windows, then started the corrected root command and left the working preview running for JD. Syntax checks and a focused live Chromium smoke check passed at the exact URL: Open reached `/notebook`, Next advanced Page 2 to Page 4 of 66, and no page runtime errors occurred. Phase 4 approval/commit/main integration remain pending. Next action is review at `http://127.0.0.1:5173/notebook`; no broad test suite was rerun for this launcher fix.

Prepared for John Daniel P. Labing. Updated 9 November 2026.

**Current delivery priority, JD's instruction on 8 November 2026:** build the working frontend as soon as possible. This portfolio has no backend. Prioritize layout, composition/pagination, navigation, responsive use, full reading and print using the approved writing/assets. Defer additional artwork, prose refinement and decorative polish until the platform works. Keep checks focused on build/types and material risks such as lost writing, clipping, broken navigation and runtime failures. Do not expand or repeatedly run broad test suites without a concrete failure. Retain P7's final audit gates and report checks not run. Existing phase acceptance, subphase summaries, the isolated Phase 4 worktree and whole-phase commit approval still apply.

Build a personal Great Books portfolio that feels like opening JD's own bound notebook. A burgundy cover opens into ruled paper, neat handwriting, short reading pages, illustrations, physical-photo-style images, and personal notes. Five side bookmarks lead to the required sections. Page turns bend and curl with moving shadows.

This plan records work across separate implementation branches. P1 is approved and committed as `e4f79eb`. P2 is approved and committed as `c3bfbed`, with documentation follow-up `0fd0a87`. P3 is approved and committed as `f79d9f7`, with documentation follow-up `5244310`. P4.1 through P4.4 are implemented and locally verified in `work/p4-content`, still uncommitted and awaiting whole-phase approval. `main` remains at scaffold `d2d6b5f`; no combined main/release acceptance is claimed.

Companion document: [Great_Books_Website_Content.md](Great_Books_Website_Content.md).

## 1. Confirmed project decisions

| Item                                            | Confirmed detail                                                                  |
| ----------------------------------------------- | --------------------------------------------------------------------------------- |
| Student                                         | John Daniel P. Labing, displayed as JD on the cover                               |
| Degree and year                                 | BS Computer Science, Fourth Year                                                  |
| University                                      | University of Nueva Caceres                                                       |
| Great Books class/section                       | Great Books-GEC-GB-NRs                                                            |
| Class code                                      | 1560                                                                              |
| Title and subtitle                              | My Literary Journey: A Great Books Digital Portfolio                              |
| Favorite                                        | The Odyssey by Homer                                                              |
| Most influential lens in the overall reflection | Reader-Response                                                                   |
| Hosting and source                              | Vercel and GitHub                                                                 |
| Editing                                         | Edit repository content files personally or through a coding agent, then redeploy |
| Writing                                         | Concise B1 to B2 English, no em dashes or semicolons                              |
| Current state | P1/P2/P3 approved and committed on their own branches. P4.1–P4.4 implemented and locally verified, uncommitted on base `0fd0a87`, awaiting whole-phase approval. Main integration pending. |
| Remaining personal asset                        | Portrait supplied. `assets/picnijd.jpg` is included unchanged as `public/images/profile/jd.jpg` in P1 |
| Deadline                                        | Use the date announced in Google Classroom                                        |

Use the class string exactly as supplied. Do not invent a separate BSCS section.

The companion file contains new writing developed from JD's answers. The assignment originally requests earlier completed analyses. If JD supplies those original submissions, compare them and preserve their substance in requested revisions. Do not describe these drafts as verified copies of earlier submissions.

## 2. Academic requirements

The uploaded project guide and score sheet are the authority for course requirements.

| Assessment            | Points | Website evidence                                                                                                                  |
| --------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Completeness          | 20     | Student Profile, Literary Analyses, Favorite Masterpiece, Summary of Learning, Personal Reflection                                |
| Seven analyses        | 30     | Seven clearly labeled works, accurate authors or traditional attributions, lenses, complete six-point analyses, specific examples |
| Favorite masterpiece  | 15     | The Odyssey overview, reasons, character choices and lessons, personal connection                                                 |
| Summary of learning   | 10     | Cultures and periods, useful lenses, literature and human experience, interpretation skills                                       |
| Personal reflection   | 15     | Renewed interest, actual challenges and responses, leading lens, realizations and applications                                    |
| Design and navigation | 10     | Distinct notebook, readable pages, five clear destinations, instructor access                                                     |
| Total                 | 100    | Complete portfolio and working published link                                                                                     |

Each analysis must visibly answer all six points:

1. Literary lens and a short reason for using it.
2. Values emphasized.
3. How those values reflect its civilization.
4. Similar values or traditions in Bikol culture.
5. Contemporary issue or Sustainable Development Goal connection.
6. Personal reflection, slightly longer than the other answers.

Points 2 through 5 preserve all four Comparative Reading Guide questions. Never remove an answer to fit an illustration or a fixed page count.

The cover and inside title page provide the clear homepage. Its inside menu and five bookmarks expose the required sections. All seven analyses must be readable website text, not only images or downloads.

## 3. Locked notebook design

| Element                | Treatment                                                             |
| ---------------------- | --------------------------------------------------------------------- |
| Cover                  | Burgundy red with subtle texture and a visible bound edge             |
| Three personal details | Small JD label, hand-drawn book, small code-bracket sticker           |
| Entry                  | Closed cover that opens on click or keyboard activation               |
| Binding                | Visible spine and a center crease on a two-page spread                |
| Paper                  | Warm paper appearance with faint school-notebook rules                |
| Writing                | Neat readable handwriting throughout, including body and controls     |
| Page composition       | Illustrations, physical-photo-style images, writing, and margin notes |
| Openings               | Individually arranged opening spread for each work                    |
| Continuations          | Automatically paginated short reading pages                           |
| Large screens          | Two-page spread when each page remains readable                       |
| Phones                 | One page at a time                                                    |
| Background             | Quiet surface with a soft shadow beneath the notebook                 |
| Navigation             | Five side bookmarks and a contents page inside Literary Analyses      |
| Section jumps          | Short accelerated burst suggesting distance                           |
| Ordinary turns         | Bending/curling paper and moving shadows                              |

The notebook is the main composition. Controls should belong to it visually, as small tabs, arrows, and written labels. Do not revert to a conventional header and generic card grid.

### Starting visual values

These are implementation defaults to refine with real content.

| Token        | Starting point                                                                     |
| ------------ | ---------------------------------------------------------------------------------- |
| Cover        | Burgundy `#762B3B`, darker spine `#54202C`                                         |
| Paper        | Warm ivory `#FBF5E8`                                                               |
| Ink          | Dark brown-black `#2F2926`                                                         |
| Surroundings | Warm gray `#E8E4DE`                                                                |
| Rules        | Faint blue-gray with spacing matched to body line height                           |
| Tabs         | Muted burgundy, olive, ochre, dusty blue, mauve with tested contrast               |
| Handwriting  | Evaluate Patrick Hand or a similarly neat family, then self-host the selected font |
| Body size    | Start near 20 px desktop and 19 px phone, supporting larger text through reflow    |
| Line spacing | Start near 1.65 to 1.75                                                            |
| Decoration   | One main visual and one short note on an opening, less on continuations            |

Check the actual font with long titles, punctuation, accented names, and pagtinarabangan. Record its license before bundling. Do not shrink writing to reach a preferred page count.

Photos may use a restrained paper frame, tape, or slight rotation. Keep paragraphs level. Illustrations do not all need photo frames. Decorative pictures are optional and should help the meaning.

## 4. Reading and navigation behavior

### Cover and homepage

- A normal first visit to `/` shows the closed cover and an obvious “Open my notebook” action.
- Opening reveals the inside title and five-section menu, followed by the profile.
- Selecting a bookmark from the cover opens its section.
- Direct section/work links open their destination immediately, without forcing the visitor through the cover.
- Closing the notebook is an explicit action. Resizing or route changes must not unexpectedly close it.

### Five bookmarks

Use the exact visible labels Student Profile, Literary Analyses, Favorite Masterpiece, Summary of Learning, and Personal Reflection.

On hover or keyboard focus, the paper layers above the selected bookmark become partially transparent so its label is readable. Limit the effect to the relevant covering region. Restore it on exit or blur and prevent confusing overlapping body text.

Test this with the engine's transformed pages and shadows early. If transparency is fragile, use the already accepted fallback: the bookmark slides outward. No new approval is required for that fallback. Record why it was used.

On phones, labels must be usable without hover. Keep an outward labeled rail or a compact labeled bookmark menu, reserving space so it does not cover writing. Each required section remains directly discoverable.

### Turns and accelerated jumps

- Previous/next buttons and safe edge gestures perform one ordinary turn.
- Text selection, links, and buttons must not accidentally turn a page.
- Section and work jumps calculate distance from the current pagination map.
- Prototype one suggested turn for a nearby target, two for a middle-distance jump, and three for a far target.
- Aim for a complete burst near one second, with an upper bound around 1.4 seconds. These are motion budgets, not development estimates.
- Never enqueue all intervening pages. Use a small number of sampled turns and supported engine jumps, verifying the final landing.
- If public APIs cannot produce a clean burst, prototype a bounded decorative transition layer synchronized with the final page. Do not patch undocumented engine internals.
- Retain only the newest requested target while a jump runs. Resolve it at a safe transition boundary instead of growing a queue.
- Reduced-motion mode opens the target immediately, with static annotations.
- Browser Back/Forward follows the requested destination without replaying old bursts.

### Responsive layout

Choose spread or single-page mode from the notebook container's usable size. As a starting point, allow two pages when each leaf can remain about 340 px wide after the bookmark rail. Confirm the actual threshold with the selected handwriting.

Phone and desktop page counts may differ. Restore the current work and semantic content block after reflow, not an obsolete physical page number. On short screens, permit document scrolling around the notebook rather than shrinking text.

## 5. Tech stack

| Technology                        | Responsibility                                                         | Status                                             |                                             |
| --------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------- |
| React and TypeScript              | Components, typed content, reading state                               | Selected                                           |                                             |
| Vite                              | Development and production builds                                      | Selected                                           |                                             |
| Tailwind CSS plus custom CSS      | Responsive layout, cover, spine, paper, tabs, shadows, photo treatment | Selected                                           |                                             |
| Sketchbook UI                     | Selected hand-drawn buttons and simple controls                        | Selected, installation and compatibility to verify |                                             |
| Rough Notation                    | A few underlines, circles, brackets, highlights                        | Selected                                           |                                             |
| Selected Oreo Doodle SVGs         | Small illustrations and icons                                          | Selecte                                            | d asset source, verify each asset's license |
| StPageFlip through react-pageflip | Physical page turning and shadows                                      | Preferred engine, conditional on P2 checks         |                                             |
| React Router                      | Direct URLs and browser history                                        | Selected                                           |                                             |
| Markdown plus TypeScript metadata | Writing and opening-layout choices                                     | Selected                                           |                                             |
| react-markdown                    | Consistent trusted Markdown rendering                                  | Supporting implementation choice                   |                                             |
| unified/remark-parse if needed    | Structured blocks for measured pagination                              | Supporting implementation choice                   |                                             |
| Vitest                            | Focused composition and navigation tests                               | Development-only choice                            |                                             |
| Playwright                        | Small set of important browser checks                                  | Development-only choice                            |                                             |
| GitHub and Vercel                 | Version history, review, preview, production                           | Selected                                           |                                             |

Use compatible stable versions at implementation time. Commit the lockfile and supported Node version. No specific current package combination has been proven by this planning work.

The physical notebook shell is custom. No selected UI kit supplies the cover, automatic pagination, bookmark layering, and coordinated jumps as one finished component.

Sketchbook UI is the main control style. Recreate the subtle button lift/press/drawn underline JD liked from PlopUI with custom CSS. PlopUI remains a reference rather than a second full design system. Do not add a CMS, browser editor, database, authentication, or general animation framework for this fixed-content portfolio.

### Engine decision gate

StPageFlip documents HTML pages, portrait/landscape modes, soft/hard pages, shadows, and jump methods. The React wrapper is a suitable candidate, not a guarantee that the planned interactions work together.

P2 must test React mount/cleanup, page references, controlled navigation, reflow, mobile input, bookmark layering, and bursts. If only the wrapper fails, evaluate a direct StPageFlip adapter. If the core engine cannot meet the chosen paper-turn requirement, document the failure and revisit that choice. Do not silently replace physical turns with a flat crossfade.

## 6. Content architecture and routes

### Work registry

| Order | Slug             | Work                               | Main lens      | Supporting lens |
| ----- | ---------------- | ---------------------------------- | -------------- | --------------- |
| 1     | `job-38`         | Voice Out of the Whirlwind, Job 38 | Formalist      | Reader-Response |
| 2     | `panchatantra`   | The Panchatantra                   | Structuralist  | Archetypal      |
| 3     | `mahabharata`    | The Mahabharata                    | Historical     | None            |
| 4     | `iliad`          | The Iliad                          | Psychoanalytic | Historical      |
| 5     | `odyssey`        | The Odyssey                        | Archetypal     | Psychoanalytic  |
| 6     | `tale-of-genji`  | The Tale of Genji                  | Psychoanalytic | Feminist        |
| 7     | `les-miserables` | Les Misérables                     | Marxist        | Historical      |

Each record holds a stable ID, slug, title, author/attribution label, order, lenses, Markdown path, source IDs, layout key, optional image metadata, and margin note. The favorite references `odyssey`.

Writing belongs in Markdown. Metadata chooses placement but does not duplicate or rewrite the analysis. Margin notes are original portfolio wording, not quotations from the books.

### Route map

| URL                   | Destination                                             |
| --------------------- | ------------------------------------------------------- |
| `/`                   | Cover on initial entry, inside title/menu after opening |
| `/profile`            | Student Profile                                         |
| `/analyses`           | Handwritten seven-work contents                         |
| `/analyses/:slug`     | Selected work opening and full analysis                 |
| `/favorite`           | The Odyssey favorite discussion                         |
| `/learning`           | Summary of Learning                                     |
| `/reflection`         | Personal Reflection                                     |
| Unknown route or slug | Recovery links to cover and reading list                |

Full-reading mode can use the same routes with `?view=reading`. Shareable within-work locations use semantic IDs, such as `?at=odyssey-reflection`, rather than device-dependent page numbers.

Explicit section/work jumps add history entries. Ordinary leaf turns can replace the semantic position without adding an entry for every leaf. One navigation controller coordinates route requests and final engine events to prevent feedback loops.

### Content-to-page flow

1. Import repository Markdown and typed metadata.
2. Parse supported headings, paragraphs, lists, simple quotations, and source entries into ordered blocks.
3. Assign stable IDs such as `iliad-values` and `iliad-reflection`.
4. Place selected blocks in a decorated opening and track what it consumes.
5. Measure the remaining blocks and compose continuation leaves.
6. Build maps from routes/block IDs to current leaves and spreads.
7. Give the composed HTML pages to the flip adapter.

Openings and continuations consume one ordered body of content. They must not repeat or omit answers. The same source also generates full-reading and print views.

### Automatic pagination

The flip engine turns composed pages. It does not split essays.

- Establish page geometry, margins, font, rule spacing, footer and crease space before measuring.
- Wait for `document.fonts.ready` and required image sizing/decoding. Add a controlled fallback so failed assets cannot block content indefinitely.
- Measure in an off-screen, non-interactive container with the same width and typography as actual leaves.
- Reserve illustration and note areas before fitting writing.
- Keep a heading with its first paragraph where possible. Keep short lists/notes together when they fit.
- Move blocks to the next page when space runs out.
- Split oversized paragraphs/lists at safe text or list-item boundaries. Preserve inline emphasis and links through the Markdown structure rather than cutting raw strings.
- Wrap long URLs. An unsplittable block must trigger a development issue and a readable fallback, never clipping or omission.
- Track intentional balancing leaves separately from engine cover pages.
- Cache by content revision, font readiness, and measured dimensions.
- Debounce ResizeObserver events and avoid measuring a transformed animation surface.
- Capture the current semantic block before rebuilding and restore its containing page afterward.
- Invalidate affected layout when a photo changes or an asset loads/fails late.

Keep semantic locations, engine indexes, and visible page numbers separate. Verify cover/front/back ordering instead of assuming index 0 is the first reading page. Page labels use the current layout total.

## 7. Folder structure

Create modules when needed. The paths below define responsibilities, not empty scaffolding to generate in advance.

| Path                                                      | Responsibility                                       |
| --------------------------------------------------------- | ---------------------------------------------------- |
| `resource/implementation-plan.md`                         | This plan, current subphase, evidence, next action   |
| `resource/website-content.md`                             | Master writing and source decisions                  |
| `resource/decisions.md`                                   | Compatibility findings and accepted fallbacks        |
| `resource/work/Px/Px.y/`                                  | Focused spec/tickets only when a subphase needs them |
| `src/main.tsx`                                            | React entry                                          |
| `src/app/App.tsx`, `src/app/router.tsx`                   | Composition, routes, recovery, reading mode          |
| `src/components/notebook/NotebookShell.tsx`               | Surface, spine, crease, paper stack                  |
| `src/components/notebook/NotebookCover.tsx`               | Cover and three personal details                     |
| `src/components/notebook/BookmarkRail.tsx`                | Five tabs and responsive reveal                      |
| `src/components/notebook/PageLeaf.tsx`                    | Composed leaf with stable engine reference           |
| `src/components/notebook/PageControls.tsx`                | Previous/next and page labels                        |
| `src/components/notebook/FlipAdapter.tsx`                 | Isolate engine APIs from application state           |
| `src/components/notebook/JumpTransition.tsx`              | Bounded distance-based jumps                         |
| `src/components/content/MarkdownContent.tsx`              | Consistent writing renderer                          |
| `src/components/content/OpeningSpread.tsx`                | Per-work compositions from the same content blocks   |
| `src/components/content/PhysicalPhoto.tsx`                | Frame, tape, caption, credit                         |
| `src/components/content/MarginNote.tsx`                   | Short handwritten note                               |
| `src/components/content/AnnotatedText.tsx`                | Rough Notation lifecycle and cleanup                 |
| `src/components/content/ReadingContents.tsx`              | Seven-work contents page                             |
| `src/components/content/FullReadingView.tsx`              | Complete sequential text and print presentation      |
| `src/content/profile.ts`                                  | Exact personal details, portrait, introduction       |
| `src/content/works.ts`                                    | Seven-work registry                                  |
| `src/content/layouts.ts`                                  | Opening arrangements, art and notes                  |
| `src/content/analyses/*.md`                               | Seven analysis files named with registry slugs       |
| `src/content/favorite.md`, `learning.md`, `reflection.md` | Three personal sections                              |
| `src/content/sources.ts`                                  | Editions, cultural sources, SDG links, media credits |
| `src/lib/content/`                                        | Markdown blocks, IDs, validation                     |
| `src/lib/pagination/`                                     | Measurement, splitting, composition, page maps       |
| `src/lib/navigation/`                                     | Locations, jump plans, route synchronization         |
| `src/hooks/`                                              | Sizing, font readiness, reduced motion, restoration  |
| `src/styles/`                                             | Theme, paper, cover, controls, print                 |
| `public/images/profile/`                                  | JD's actual photograph                               |
| `public/images/works/`, `public/doodles/`                 | Selected local visual assets                         |
| `public/fonts/`                                           | Handwriting font and license                         |
| `tests/unit/`, `tests/browser/`                           | Meaningful logic and browser checks                  |
| `vercel.json`                                             | Direct-route SPA rewrite                             |
| `package.json`, lockfile, Node version file               | Reproducible scripts and dependencies                |

## 8. Detailed implementation phases

Each subphase ends with an observable result. Record its outcome, checks, and next action. No development time estimates are assigned.

### Implementation checklist and record, reconciled 9 November 2026

Checked tasks below indicate completed work in the named implementation lane. They do not mean the change is merged into `main` or that the integrated website passed release checks. The release checklist in section 11 remains a separate gate.

- [x] P1.1: decisions and writing imported.
- [x] P1.2: linked citations, edition details, supplied portrait, and asset records prepared.
- [x] P1.3: personal and academic content audit passed.
- [x] P2.1: compatible dependencies, readable page, selected control, production build, and preview verified in the Phase 2 worktree.
- [x] P2.2: physical engine acceptance verified in the Phase 2 worktree.
- [x] P2.3: bookmark reveal and bounded jumps verified in the Phase 2 worktree.
- [x] P2.4: measured continuation-page acceptance verified in the Phase 2 worktree.
- [x] P3: shell/shared controls implemented, locally verified, approved and committed on work/p3-shell. Main integration pending.
- [x] P4.1: canonical ordered content, shared block renderer, and validation verified in the Phase 4 worktree. Live view integration remains P4.3/P4.4.
- [x] P4.2: canonical fitting/splitting, shared-leaf measurement, bounded asset readiness, conservation, and browser overflow checks verified in the Phase 4 worktree.
- [x] P4: canonical content and integrated pagination implemented and verified in `work/p4-content`. Awaiting whole-phase approval and commit, not integrated into main.
- [ ] P5: routing and interaction.
- [ ] P6: complete portfolio arrangements.
- [ ] P7: integrated academic, engineering, access, and loading review.
- [ ] P8: hosting and submission.

Earlier implementation checkpoint rows below are preserved as history. Their old uncommitted/pending statements are superseded by the current consolidated status dated 9 November 2026.

| Scope | Implementation and commit | Evidence and limits | Next action |
| --- | --- | --- | --- |
| Initial scaffold | `d2d6b5f`, `Initialize Great Books portfolio` | React/TypeScript/Vite skeleton, static cover, route recovery, tokens and test configuration. This commit alone did not complete P2.1. | Use the verified P2 foundation for integration. |
| P1.1 | `e4f79eb`, `Prepare Phase 1 portfolio content and assets`, branch `work/p1-content`, worktree `.worktrees/p1-content` | Five exact section labels, seven ordered works, 42 complete answers and original notes, class facts, favorite, lenses, and control copy. Wording conserved against the companion draft. | Integrate the approved commit. |
| P1.2 | Same Phase 1 commit, `e4f79eb` | Thirteen linked citations, edition limits and source notes, JD's 400 by 400 JPG copied unchanged, exact portrait alt text and supplier credit. Placeholder removed. Optional illustrations remain unselected. Font notice comes from P2. | Integrate source records, portrait, and P2 notices. |
| P1.3 | Same Phase 1 commit, `e4f79eb`, approved by JD on 8 November 2026 | All six answers per work, four learning requirements, five reflection topics, The Odyssey favorite, and Reader-Response leading lens audited. Eight focused Node checks, scoped strict TypeScript, ESLint and Prettier passed. No integrated browser/build claim. | Retain later rendering, pagination, print, and accessibility gates. |
| P2.1 | `c3bfbed`, `Implement Phase 2 notebook interaction prototypes`, branch `work/p2-prototypes`, worktree `C:/Users/LENOVO/.codex/worktrees/8a5a/GB-Website`, base `d2d6b5f` | Per the Phase 2 owner's P2.1 handoff: clean lockfile installation, format check, theme/lint/two Vitest tests/types/build, 14 Chromium checks, production preview, font and control license notices passed. Phase 2 is now approved and committed, awaiting integration. | Ready for later integration. Retain this subphase checkpoint evidence. |
| P2.2 | `c3bfbed`, `Implement Phase 2 notebook interaction prototypes`, 8 November 2026, branch `work/p2-prototypes`, worktree `C:/Users/LENOVO/.codex/worktrees/8a5a/GB-Website`, base `d2d6b5f` | Disposable-document adapter retains real curls and shadows; lifetime probe and three-cycle disposal checks; portrait/spread, replacements, selection, links, touch scrolling and hidden-page focus checks. Theme/lint/two unit tests/types/build and 26 combined Chromium checks pass. See [P2.2 evidence](work/P2/P2.2/README.md). Verified, approved and committed. Not integrated. | Ready for later integration. Retain this subphase checkpoint evidence. |
| P2.3 | `c3bfbed`, `Implement Phase 2 notebook interaction prototypes`, 8 November 2026, branch `work/p2-prototypes`, worktree `C:/Users/LENOVO/.codex/worktrees/8a5a/GB-Website`, base `d2d6b5f` | Five bookmarks; selected-region transparency, focus/restore and no-hover layout; verified slide fallback; bounded 1/2/3 real turns, newest-target replacement, safe handoff and zero-turn reduced motion. Final timings 221–741 ms. Nine unit tests and 46 combined Chromium checks, lint/types/build pass. Portrait reverse-turn and instant-focus fixes included. See [P2.3 evidence](work/P2/P2.3/README.md). Verified, approved and committed. Not integrated. | Ready for later integration. Retain this subphase checkpoint evidence. |
| P2.4 and Phase 2 review | `c3bfbed`, `Implement Phase 2 notebook interaction prototypes`, 8 November 2026, branch `work/p2-prototypes`, worktree `C:/Users/LENOVO/.codex/worktrees/8a5a/GB-Website`, base `d2d6b5f` | Complete source-identical Job/Odyssey fixtures, longest title, labeled long paragraph/URL exercise, shared-DOM measurement, bounded Unicode/markup-safe splitting, 19/20/24 px writing, semantic answer/block/offset restoration, cancellation and full-text recovery. Four desktop widths and mobile pass with no lost/clipped writing. Complete checks: 14 unit tests, 54 Chromium checks, theme/lint/types/build, format:check and git diff --check pass; phone/desktop screenshots inspected. See [P2.4 evidence](work/P2/P2.4/README.md). All P2 gates implemented and verified here. JD approved committing Phase 2 on 8 November 2026. Implementation commit: `c3bfbedf76977dcf132afdf65d348e4f15c2125d`. Not integrated, pushed, or deployed. | Phase 2 commit recorded. Ready for separately requested integration and combined checks. Stop before P3. Canonical integration, richer blocks, final routes/history, printing, decoration, and deployment remain later phases. |

Phase 2 commit record, 8 November 2026: JD explicitly authorized committing the completed phase. Implementation: `c3bfbedf76977dcf132afdf65d348e4f15c2125d`, `Implement Phase 2 notebook interaction prototypes`. This documentation follow-up records the resulting ID without amending the implementation commit. Checks before commit: 14 unit tests, 54 desktop/mobile Chromium checks, theme/lint/types/build, format:check, and Git whitespace checks passed. Only documentation changed afterward. Branch/worktree and later-phase limitations remain as recorded above. Next action is separately authorized integration, not a merge or push in this task.

Phase 1's detailed evidence is tracked in `resource/work/P1/handoff.md` in commit `e4f79eb`. Phase 2's current combined evidence is [the phase handoff](work/P2/README.md) in its worktree. Neither handoff path is claimed to exist in `main` before integration. The earlier registry failure in `decisions.md` records the initialization attempt, not the later successful P2.1 installation.

After every implementation, update this checklist and its record with changes, checks, limitations, next action, and implementation commit ID. Use `uncommitted` and the base revision until the implementation has a commit, then add its actual SHA in the next documentation update. Preserve each lane's approval and integration status.

### P1. Prepare content and inputs

**P1.1 Import decisions and writing**

- [x] Put both documents in `resource/`.
- [x] Populate the seven works, favorite, class information, and lens choices.
- [x] Preserve the six-answer structure and slightly longer personal reflections.

**Done when:** the inventory has all five sections and seven complete analyses matching the companion file.

**P1.2 Prepare sources and assets**

- [x] Convert the source list into linked per-work metadata.
- [x] Keep edition distinctions, including Job's KJV, the Genji excerpt, and Butler's character names.
- [x] Add JD's photo when supplied and record credits for actual selected illustrations.
- [x] Keep the development portrait placeholder identifiable until replaced.

**Done when:** citations and asset records are present, with JD's supplied photo linked or an unavailable photo explicitly tracked as a release task. The supplied-photo path is complete in `e4f79eb`.

**P1.3 Check personal and academic accuracy**

- [x] Check the six points per analysis and all five overall reflection topics.
- [x] Confirm The Odyssey as favorite and Reader-Response as most influential.
- [x] Apply requested writing changes without rewriting unrelated sections.

**Done when:** the content checklist passes and personal claims match JD's answers.

### P2. Prove difficult interactions before decoration

**P2.1 Establish compatible dependencies**

Initialization created the scaffold in `d2d6b5f`, but registry access initially prevented installation. The later Phase 2 worktree resolved installation, retained its lockfile, and passed the P2.1 build and preview gates. P2.1 is verified there and included in Phase 2 commit `c3bfbed`. See the progress record above for evidence. P2.2 through P2.4 are also verified and included in the same approved Phase 2 commit, with detailed evidence below.

- [x] Create a minimal React TypeScript Vite project.
- [x] Verify Sketchbook UI's maintained installation, styles/theme, license, and selected controls.
- [x] Install compatible core packages and Tailwind's supported Vite integration.
- [x] Record the Node version/lockfile and evaluate handwriting with real text.

**Done when:** production build and preview show one readable page and usable hand-drawn control without runtime errors.

**P2.2 Test the physical engine**

- [x] Wrap react-pageflip behind an adapter using the documented page-reference pattern.
- [x] Test hard cover, soft curl, shadows, portrait/spread, and programmatic jumps.
- [x] Test mount/cleanup and content replacement with both changed and unchanged page counts.
- [x] Verify links, writing selection, gestures, and normal phone scrolling.

**Done when:** a browser demonstrates stable turns and rebuilds without stale pages or duplicate engine instances.

**P2.3 Test bookmark reveal and jump bursts together**

- [x] Use representative leaves and five targets.
- [x] Prove bounded near/middle/far jumps with accurate landing and newest-target handling.
- [x] Try transparency inside the transformed paper/shadow layers.
- [x] Use the accepted slide-out fallback if transparency fails.
- [x] Test focus, no-hover phone use, and reduced motion.

**Done when:** the actual reveal and jump methods work together and their implementation is recorded in decisions.

**P2.4 Prove measured continuation pages**

- [x] Use a real analysis, longest title, long source URL, and oversized paragraph.
- [x] Create multiple readable leaves without shrinking handwriting.
- [x] Change width and restore the same answer after reflow.

**Done when:** single-page and spread layouts lose or clip no text. This gate comes before full decoration.

### P3. Build shell and shared controls

**P3.1 Establish the visual foundation**

- [x] Define colors, handwriting, rules, margins, shadows, and tab tokens.
- [x] Build the quiet surface, cover, spine, crease, and paper-edge stack.
- [x] Check contrast and long-paragraph reading before adding art.

**Done when:** the undecorated notebook is recognizable and readable.
P3.1 progress, 8 November 2026: **implemented and locally verified, uncommitted**, base `d2d6b5f`, branch `work/p3-shell`, worktree `C:/Users/LENOVO/Projects/GB-Website/.worktrees/p3-shell`. Added reusable static notebook materials, token-generated CSS including all five tab palettes, textured burgundy cover, bound spine, ruled paper, center crease, edge stack, natural-height leaves, and a review route using actual inside-title/profile paragraphs. The supplied reference sheet guided the visual review. Font and control license notices and the P2.1 dependency/config snapshot were imported as prerequisites, then dependencies installed independently. No P2 worktree files were changed.

Evidence: `npm run check` passed theme consistency, ESLint, two unit tests, TypeScript and production build. All 20 isolated Chromium cases passed with clean exit using the P3 configuration and manually started production preview on 4175. They cover 320, 360, 390, 768, 1024 and 1440px, long paragraphs, 200% text, short viewport scrolling, selection, keyboard recovery, font failure, cover overflow and unknown destinations. Computed contrast is 13.18:1 for body/paper, 6.08:1 for secondary text, 8.87:1 for cover text and 8.44–9.97:1 for tab labels. Screenshots of desktop, phone and cover were inspected and saved with the [brief and handoff](work/P3/P3.1/README.md).

Limitations: this is static material verification, not accepted P2 engine integration, measured pagination, completed P3 entry/navigation, or completed P6 content arrangement. Narrow layouts stack the two review leaves in source order. The 904px container breakpoint and rail reservation remain provisional until P2 integration. Repository-wide formatting retains inherited warnings in six untouched scaffold/workflow files, listed in the handoff. The theme generator now follows the repository's formatting configuration. Windows could not reap the runner-managed preview, so the documented external-preview mode was used and exited successfully. JD authorized this parallel start despite the normal Wave C prerequisite. No P3 approval, commit, merge or main integration is claimed. The user reports P2.2 verified separately. That evidence has not been integrated here. Next: review P3.1, then implement P3.2 in this same worktree. Commit only after the entire phase 3 is implemented and JD approves it.

**P3.2 Build personalized entry**

- [x] Add the exact title/subtitle and three personal cover details.
- [x] Implement open/close and inside title/menu.
- [x] Support keyboard opening and direct destinations that skip the closed cover.

**Done when:** the homepage exposes all five sections through clear actions.

P3.2 progress, 8 November 2026: **implemented and locally verified, uncommitted**, base `d2d6b5f`, branch `work/p3-shell`, worktree `C:/Users/LENOVO/Projects/GB-Website/.worktrees/p3-shell`. Added a Sketchbook-backed opening button, exact title/subtitle and existing three personal cover details, the inside title/identity and five-section menu, explicit closing with focus restoration, and route destinations that bypass the closed cover. Opening remains at `/`, with open state in that browser-history entry. Choosing a section on the closed cover first records that entry as open, so Back returns to the inside title. Resize does not change the open state. A decorative 650ms cover layer has no cloned text/controls and is removed from display under reduced motion.

Imported 19 unchanged content files from approved P1 `e4f79eb` as immutable inputs and checked their Git blob hashes. No P1 or P2 worktree was changed, no merge was performed, and P1 portrait/media integration is still separate. Existing P1 section IDs map to planned public routes. The older `job-38` URL redirects to P1's canonical `voice-out-of-the-whirlwind` slug. All seven works and six answers are accessible as ordinary scrollable paper text while P4/P6 composition is pending. Markdown rendering loads separately, removing the newly observed bundle-size warning.

Evidence: `npm run check` passed theme consistency, ESLint, two unit tests, TypeScript and production build. Forty Chromium cases passed in the isolated P3 setup, including 20 new entry cases across desktop and mobile projects: Enter/Space, focus restoration, all five destinations from the cover and inside menu, direct URLs/refresh, Back retaining open entry, all seven work links and six answers, unknown work recovery, 320px/200% text and reduced motion. Existing 20 P3.1 checks also passed. Scoped Prettier and Git whitespace checks passed. Repository-wide formatting still reports the same six inherited warnings. Cover, inside title and phone profile screenshots were inspected without runtime errors. [P3.2 brief, evidence and handoff](work/P3/P3.2/README.md).

Limitations: this is locally verified entry and simple route rendering, not accepted engine integration, measured leaf turns, full-reading/print recovery, finished P6 layouts, production hosting or P5 engine/history synchronization. The phone entry currently flows as two paper leaves vertically. The stronger 320px/200% closed-cover check initially exposed intrinsic grid and fixed-SVG overflow. Bounded grid sizing, wrapped labels and a responsive drawing that fills the label and padding resolved it without shrinking text. The wrapper also restores a solid focus outline suppressed by library CSS, with ivory on burgundy, and disables inherited transitions under reduced motion. P3.3 bookmark rails, page controls and control feedback remain unchecked. Approval, commit and integration are pending. No commit exists. Next: stop at this subphase boundary, then implement P3.3 in the same worktree when JD requests it. Commit only after all P3 is implemented and JD approves it.


**P3.3 Finish navigation controls**

- [x] Add tested bookmarks, active state, page arrows, and labels.
- [x] Add restrained button hover/press feedback.
- [x] Reserve room for tabs and focus indicators.

**Done when:** pointer, keyboard, and phone readers can identify and use every control.

P3.3 progress, 8 November 2026: **implemented and locally verified, uncommitted**, base `d2d6b5f`, branch `work/p3-shell`, worktree `C:/Users/LENOVO/Projects/GB-Website/.worktrees/p3-shell`. Added a shared frame with a reserved 176px desktop rail, five native bookmark links in the exact section colors/order, current dot/underline/semantics including nested work routes, a focus/hover reveal limited to a decorative 32px paper strip, and the accepted 20px slide alternative. The cover and live reading routes use these bookmarks. No writing becomes transparent. Phones have an in-flow Sections panel with all five labels, first-link focus, Escape/toggle close, destination focus, normal Tab order and resize focus recovery.

Added reusable PageControls with caller-owned one-based position/count and previous/next callbacks, drawn labeled arrows, unavailable boundary controls that retain their places, and a polite position announcement. Verified it at `/preview/controls` using three actual supplied leaves. Final portfolio page-arrow/engine integration is deliberately still a P4/P5 task. Route indexes are not used as physical page counts. Centralized Sketchbook overrides limit hover to 2px, press to baseline, keep disabled controls stationary and make reduced-motion immediate. Typography, palette values and dependencies remain unchanged.

Evidence: `npm run check` passed theme, ESLint, two unit tests, strict types and production build. The final isolated Chromium suite passed **58 cases**, comprising 18 control cases plus 40 existing entry/foundation checks across desktop/mobile. Control checks cover each bookmark destination, pointer and keyboard, active state on works, strip isolation, reading/focus reservation, slide fallback, phone opening/selection/Escape/Tab, responsive focus recovery, arrow counts/boundaries, 320/390/768/952/1024/1440px with 200% text, feedback and reduced motion. Scoped Prettier and Git whitespace checks passed. Full formatting retains the same six inherited warnings documented in P3.1. Five screenshots were visually inspected with settled text and no runtime errors. [P3.3 brief and handoff](work/P3/P3.3/README.md), [complete P3 review](work/P3/README.md).

Issue resolved: the first browser run passed 56 of 58 cases. CSS hid the phone panel before the resize callback could inspect activeElement, so both responsive focus tests failed. Remembering focus within the control and moving it after layout fixed both cases. The targeted pair and full suite then passed. Entry checks now target the intended full menu because the rail is a valid additional destination list. Screenshot helpers wait for the lazy renderer/fonts and avoid a GPU capture artifact. Unfocused skip links are explicitly clipped.

State and limits: P3.1 through P3.3 shell/shared-control implementation is complete and locally verified in this lane. Full-phase approval, commit and integration are still pending. The P2 owner now reports all four prototypes verified, still uncommitted. Their engine and measurement implementation were not imported or altered here. Final measured pagination, arrow commands through the physical engine, combined engine/reveal evidence and semantic history synchronization remain P4/P5 gates. Main and release checks are not claimed. Next: stop for JD's review of the entire phase 3. Commit only after JD explicitly approves it, then record the actual resulting commit ID in the next plan update. No implementation commit exists yet.


### P4. Implement content and pagination

**Phase 4 lane, 8 November 2026:** branch `work/p4-content`, worktree `C:/Users/LENOVO/Projects/GB-Website/.worktrees/p4-content`. Implementation is **uncommitted**, base `0fd0a87` (approved P2 implementation `c3bfbed` plus its commit record). The approved P1 content, portrait, and evidence from `e4f79eb` are copied into this worktree as unchanged inputs. This is local composition of prerequisites, not a merge into `main`. P3 continues independently in `work/p3-shell`. No P3 files were edited or integrated. P4.3 must reconcile the actual shell before its integrated acceptance gate.

**P4.1 implementation record:** typed sections, works, sources, registered images, placement keys, ordered AST blocks, and semantic answer maps now form one validated registry. Supported Markdown includes headings, paragraphs, lists, quotations, inline marks/code, links, local images, and resolved reference syntax. Raw HTML is excluded. IDs are independent of pagination and preserve unaffected blocks after unrelated insertions. Notebook partitions and uninterrupted reading use the same `ContentBlocks` renderer. Source notes, citation text, image credit, and every original answer are preserved. Validation rejects duplicate identities/slugs, missing files/sources/layouts/assets/local destinations, invalid answer order, and empty answers. Job retains P1's `voice-out-of-the-whirlwind` ID/slug. See [P4.1 scope, contract, and evidence](work/P4/P4.1/README.md).

**P4.1 checks:** reproducible `npm.cmd ci --no-audit --no-fund` succeeded after the sandbox blocked registry access. `npm.cmd run check` passes theme consistency, zero-warning lint, **45 unit tests**, strict TypeScript, and production build. A separate production transform/import of the registry loads 12 writing documents, seven works, 42 answers, and 13 sources. Detailed formatting, content-audit, and whitespace results are recorded in the handoff. No new browser, final-shell, full-reading-route, print, or integrated release acceptance is claimed by these library/renderer checks.

**Status and next action:** P4.1 implemented and verified, awaiting JD's review. Phase 4 remains incomplete, unapproved, uncommitted, and unintegrated. Stop after P4.1 as requested. Next is P4.2 fitting/splitting using these canonical blocks and accepted P2 geometry. Keep this worktree for the remaining subphases. Commit only after all of Phase 4 is implemented and JD approves, then remove the worktree after preserving the approved commit. No push, merge, or publication was performed.

**P4.1 Build canonical content blocks**

- [x] Define typed sections, works, blocks, sources, images, and layout metadata.
- [x] Parse supported Markdown into stable ordered blocks.
- [x] Disable raw HTML and validate unique slugs, missing references/assets, and six-answer completeness.

**Done when:** notebook and full-reading views derive from the same ordered writing.

**P4.2 Implement fitting and splitting**

- [x] Match measurement geometry/styles to real leaves.
- [x] Wait for fonts/images with controlled failure handling.
- [x] Implement fitting, heading grouping, list handling, long-link wrapping, and safe oversized-block splitting.
- [x] Test conservation of text/order and progress when a block is too tall.

**Done when:** each block appears once in order, with no endless pagination loop or clipping.

**P4.2 record, 8 November 2026:** implemented and verified in `work/p4-content`, worktree `C:/Users/LENOVO/Projects/GB-Website/.worktrees/p4-content`. Implementation remains **uncommitted**, base `0fd0a87`, including the preceding uncommitted P4.1 changes and unchanged P1 inputs from `e4f79eb`. JD requested proceeding to P4.2 after its P4.1 checkpoint. This does not authorize a commit or accept the entire phase.

Canonical blocks now produce structured fragments with stable document/block/answer IDs and contiguous Unicode source ranges. Fitting keeps short paragraphs/lists together, groups consecutive headings with initial writing, prefers whole list items, and safely splits oversized paragraphs, nested lists, quotations, inline marks/code, links, and source entries. Ordered list starts and full link destinations survive continuation. Images remain atomic. The measurement function uses the actual `PageLeaf`, geometry, image dimensions, header/footer and shared leaf styles in an inert offscreen root. Font/image readiness, image dimension mismatches, cancellation, measurement time and page count have controlled outcomes. Impossible writing or images fail explicitly while complete original text remains available in the review harness.

**Checks:** `npm.cmd run check` passes theme consistency, zero-warning ESLint, **62 unit tests**, strict TypeScript and production build. `npm.cmd run format:check` and `git diff --check` pass. On dedicated port 4195, the complete Chromium suite passes **72 tests** with exit code 0, including all 54 P2 regressions and 18 new desktop/mobile P4.2 checks. The completed preview process needed explicit shutdown before the Windows runner finalized. Browser conservation and overflow checks cover all seven works with citations, 320/390/768/1024/1440 px widths, 19/20/24 px text, oversized lists/quotations/URLs, actual portrait loading, font/image failure, dimensions changing, an image too tall to fit, stalled readiness and cancellation. Phone and desktop screenshots were inspected. Detailed scope, metrics, failure-path evidence and integration limits: [P4.2 handoff](work/P4/P4.2/README.md).

**Status and next action:** P4.2 is implemented and verified, awaiting JD's review. P4 remains incomplete, unapproved, uncommitted and unintegrated. Stop before P4.3. The `/prototype/content` route demonstrates undecorated writing leaves, not final portfolio arrangements. P4.3 must reconcile the P3 shell/typography, compose decorated openings and continuations, and build physical/semantic page maps. Production reflow restoration, full-reading/print routes and engine recovery remain P4.4. Keep the worktree until the whole phase is implemented and JD approves its commit. No commit, merge, push or publication was performed.

**P4.3 Join decorated openings and continuations**

- [x] Give each opening a layout key and consumed-block record.
- [x] Paginate unused content afterward.
- [x] Map sections, works, answers, leaves, and spreads, including covers/balancing leaves.

**Done when:** every answer is reachable without duplicate opening paragraphs.

**P4.3 record, 8 November 2026:** implemented and verified in `work/p4-content`, `.worktrees/p4-content`. Implementation **uncommitted**, base `0fd0a87`; includes preceding P4.1/P4.2 local work. JD clarified that P4.3 should precede P4.4. Copied the approved P3 material shell, notebook CSS and theme generator from `5244310` (P3 implementation `f79d9f7`). Generated theme normally, without changing tokens or dependencies. This is scoped local integration, not a merge into main or integration of P3's final routing/bookmark controls.

Thirteen opening groups cover five sections, seven works and shared source entries. Each opening has its placement key, author/lens metadata where applicable, consumed full-block IDs and exact consumed ranges when a paragraph continues. Remaining ranges follow once in order. Shared citations are emitted once. Covers and intentional balancing leaves have distinct kinds; openings begin on the engine's first leaf of a spread. Final maps expose section/work/answer/block leaf indexes and spread indexes. Composition validates ordered, contiguous ranges before returning. Measurement includes opening decoration and P3-derived margins; the material shell stays outside the real engine and ruled paper is shared by measurement and rendering. Review route: `/prototype/composition`. P6 still owns final illustrated arrangements.

Checks passed: theme/lint, **67 unit tests**, strict types, production build, full formatting and Git whitespace. The full desktop/mobile Chromium run passed **74 tests**, exit code 0, including a composed-engine Odyssey opening, all 42 answer destinations, all displayed leaves without clipping and all earlier regressions. The completed Windows preview process was explicitly stopped to finalize the runner. Phone and desktop screenshots inspected. These broad checks preceded JD's new instruction to prioritize delivery; future work uses focused checks unless a concrete regression warrants broader testing. See [P4.3 handoff](work/P4/P4.3/README.md).

Status: P4.3 implemented and verified, awaiting review. Phase 4 is incomplete, unapproved, uncommitted and unintegrated. Stop at this checkpoint. Next: P4.4 production reflow, semantic restoration, complete reading/print views and engine-failure recovery. Keep the worktree. No commit, merge, push or publication.

**P4.4 Add reflow and readable fallback**

**Live preview correction, 8 November 2026:** JD's screenshot showed the original static main cover at port 5173. Replaced only the verified old preview process (Windows required elevated stop permission) and started the Phase 4 worktree's Vite server on the same port. `http://127.0.0.1:5173/` now serves this worktree and remains running for interactive review. Main application files are unchanged. A focused live Chromium check opened the real notebook and advanced from Page 2 to Page 4 of 66, with zero runtime errors. Screenshot and details are in [the updated P4.4 handoff](work/P4/P4.4/README.md). Earlier notes saying 5173 still serves main describe the prior checkpoint and are superseded by this correction. No implementation commit or main integration occurred.

- [x] Rebuild for meaningful size/font/image/text-scale changes.
- [x] Restore the semantic block and refresh maps before navigation resumes.
- [x] Provide full-reading and print views.
- [x] Recover to complete text if the engine fails.

**Done when:** resizing preserves the current work/answer and all text is available without animation.

**P4.4 and whole-phase checkpoint, 8 November 2026:** implemented and verified in `work/p4-content`, worktree `C:/Users/LENOVO/Projects/GB-Website/.worktrees/p4-content`. Implementation remains **uncommitted**, base `0fd0a87`, including preceding P4.1 through P4.3 local work and approved P1/P3 inputs. JD explicitly requested P4.4 plus functional notebook opening. Both the cover surface and Open button now open `/notebook` using the real composed engine, with keyboard access, ordinary page arrows, all five section controls and work/answer selection. Initial cover turning respects reduced motion. Closing returns to the cover. This corrects the former Open button's destination, which was only `/prototype`.

Meaningful geometry, root text scale, handwriting-size and late font/image events invalidate layout. Stale work is aborted and detached measurement/engine roots are disposed. New maps and the restored semantic block/offset are ready before navigation resumes. Complete reading uses the same ordered canonical blocks, all analyses/notes/citations, confirmed student facts, supplied portrait and credits. `/notebook?view=reading` works independently of measurement and engine readiness. Print CSS exposes complete writing and hides the engine/controls. Font/measurement/engine failure exposes complete text automatically, including a render-error boundary. Reading mode retains location when returning to the notebook.

Focused verification: strict TypeScript and production build pass, zero-warning ESLint passes after correcting ref reads during rendering. Ten targeted desktop/mobile Chromium checks pass with exit code 0: keyboard/button and cover opening, actual page arrows, answer restoration across spread/phone resize, root font scaling and larger writing, reading/return, complete text/unique block IDs/print media, and failed font/engine recovery. The completed test preview needed explicit process shutdown before the Windows runner finalized. No broad suite or numerical coverage work was added. Prior P4.1-P4.3 evidence remains historical, not rerun or relabeled as fresh P4.4 checks. See [P4.4 handoff](work/P4/P4.4/README.md).

**Review status:** P4.1 through P4.4 are implemented and verified locally. The entire phase awaits JD's review/approval. No commit, merge, push, publication or worktree deletion has occurred. Keep the worktree until the approved commit is preserved. JD's current preview `http://127.0.0.1:5173/` serves the older main checkout. Review the new worktree with `npm.cmd run dev -- --port 5194`, then open `http://127.0.0.1:5194/`. No main application file or existing preview process was changed. P5 still owns complete section/work URL/history routing, bounded jumps and final navigation synchronization. P6 owns final content arrangements/artwork, followed by P7 release audit. Stop at the whole-Phase-4 checkpoint.

### P5. Connect routing and interaction

**P5.1 Implement one navigation controller**

- [x] Connect routes to section/work blocks and current page maps.
- [x] Add deep-link recovery, previous/next work, and return-to-contents.
- [x] Coordinate history and engine events without route loops.

**Done when:** pasted URLs, refresh, Back, and Forward reach the correct content.

**P5.1 checkpoint, 9 November 2026:** implemented and locally verified in `work/p5-navigation`, worktree `.worktrees/p5-navigation`, **uncommitted**, base `e985264`. The dedicated worktree now uses the committed Phase 4 base. It began as a snapshot while Phase 4 was uncommitted; its branch/index were aligned after the other session committed Phase 4, retaining working files. Main and the Phase 4 branch are unchanged by P5 implementation.

One reader navigation controller coordinates semantic destinations, current composition maps, engine completion, full-reading locations and browser history. All five planned section routes and seven `/analyses/:slug` routes open directly, including `?view=reading` and within-work `?at=` targets. Legacy `/notebook?at=` links remain supported. Explicit selections push history. Ordinary page turns replace stable block/character-offset locations, with no device-dependent page number in the URL. Refresh and Back/Forward restore continuation positions. Engine echoes do not trigger new route turns. Back before an intervening selection commits is handled explicitly. Unknown routes/slugs expose cover and reading-list recovery links; incompatible or missing anchors open the requested section with an explanation. Previous/next work controls respect the first/last work, return-to-contents opens `/analyses`, and work/answer selectors follow the route.

Verification: production build with strict TypeScript, zero-warning ESLint, three focused route unit tests (including every canonical block/offset round trip), and 16 focused desktop/mobile Chromium cases passed across two successful targeted runs. The browser cases cover pasted URLs, refresh, resize, section/work/contents controls, Back/Forward, replace-only ordinary turns, full-reading history, Back during normal animation, invalid targets, cover opening and complete reading/print conservation. Initial runs exposed and fixed a full-reading history race and an incorrect test expectation for the profile's first canonical anchor. Windows test preview processes required scoped shutdown before Playwright finalized exit code 0. A live 320 px smoke check found no horizontal overflow or runtime errors. Desktop/phone screenshots were inspected. Broad suites, screen-reader audit, final hosting refresh and P7 release gates were not run or accepted here.

**Review state and next action:** P5.1 awaits JD's subphase review. Stop here. Continue with P5.2 only after JD resumes. The ordinary engine transition is still used for section/work jumps; P5.2 owns bounded/latest-target jumps and final destination announcements. P5.3 owns complete input, hidden-leaf/focus and reduced-motion verification. No commit, push, merge, deployment or worktree deletion occurred. Review from this worktree at `http://127.0.0.1:5197/analyses/odyssey` using `npm.cmd run dev -- --port 5197`; the existing root preview remains separate.

**P5.2 Integrate bounded jumps**

- [x] Calculate direction/distance and apply the P2 mechanism.
- [x] Keep the newest target, settle safely before reflow/unmount, and restore normal turns.
- [x] Update active tab/page count and announce the final destination once.

**Done when:** repeated clicks and reverse jumps finish at the requested location without long queues.

**P5.2 checkpoint, 9 November 2026:** implemented and locally verified in `work/p5-navigation`, worktree `.worktrees/p5-navigation`, **uncommitted**, base `e985264`. JD explicitly expanded this subphase to prioritize the supplied notebook references. The notebook now comes before the work/answer tools. Five colored paper bookmarks sit on its right edge and slide/tilt on hover or keyboard focus, with brief press feedback inspired by PlopUI. This uses project tokens and the existing React/Sketchbook stack, with no library/dependency replacement. Narrow phones retain side tabs with short visible labels and the full accessible section names. Desktop spreads show a central shaded crease. Page controls are unboxed curved arrows immediately below the left/right paper corners, leaving the actual grab area free.

P2's bounded jump mechanism is connected to the canonical page maps: direction/distance sampling, at most three animated burst steps, newest pending target, verified final landing and a single destination announcement. Intermediate engine events do not replace the URL or active tab/count during a burst. Destination controls remain available while jumping. Ordinary arrows restore normal timing. Reduced motion uses no animated burst steps or tab motion. Recomposition cancels obsolete controllers and safely disposes the engine document while retaining the latest semantic destination. Queued commands wait for an ongoing paper gesture to settle.

Paper edges/corners now use StPageFlip's public pointer-fold methods, producing continuous curls while held and settling on release. Short taps do not turn a page. The input adapter preserves body-text selection and rejects vertical touch movement before grabbing. A deliberate portrait forward pull past the middle commits on release because the engine's physical facing page lies outside the phone viewport. No vendor patch or flat animation replaces the page engine.

Checks: production build/TypeScript and zero-warning lint passed. Fifteen focused unit tests passed for jump bounds, routes and composition. The final P5.2 browser file passed all ten desktop/mobile Chromium cases, including hover/focus structure, crease/corner arrows, retargeting during an active burst, single final announcement, real held mouse curls, browser touch drags, reflow during a jump and reduced motion. The focused combined run also passed all twenty existing reader/routing cases, including pasted URLs/history, semantic resize/text scaling, complete reading/print and failure recovery. That run initially exposed two phone drag completions, both corrected and passed in a targeted phone rerun and the final ten-case P5.2 run. Earlier failures also exposed a frame-replacement abort race and a test attempting to grab below the viewport; these were fixed. Windows test preview processes required scoped shutdown before final reports. Manual 320/768/1024/1440 px checks found no horizontal overflow or runtime errors; final screenshots and a held-curl image were inspected. The last announcement-detail wording adjustment received fresh TypeScript/lint checks; browser evidence above predates that text-only adjustment.

**Next action:** stop for JD's P5.2 review. P5.3 still owns the complete keyboard, short-tap/scroll/selection, hidden-leaf/clone, focus and reduced-motion access audit. Chromium touch emulation is not a physical phone or screen-reader audit. P6 artwork and final content arrangements, and P7 academic/release acceptance, remain pending. No commit, merge, push, deployment or worktree removal occurred.

**P5.3 Finish access and input behavior**

- [x] Test deliberate swipes, short taps, scrolling, text selection, and keyboard controls.
- [x] Keep hidden leaves and engine clones out of focus/accessibility order.
- [x] Focus the destination heading after explicit navigation without disrupting ordinary reading.
- [x] Respect reduced motion across cover, turns, bursts, and annotations.

**Done when:** readers can use the full portfolio without mouse or animation.

**P5.3 checkpoint, 9 November 2026:** same branch/worktree/base above, **uncommitted**. The requested top controls (close, full-reading, print, handwriting checkbox) and bottom selector/work-navigation panel are removed. Corner page arrows remain as the keyboard-accessible page controls, as stated during implementation. Full-reading URLs, automatic complete-text recovery and browser print CSS remain functional. A separate Contents destination precedes the five required sections, with section links on the first leaf and work links/authors/lenses on the facing leaf (readable continuation pages on phones). Contents has its own smaller bookmark without changing the five academic section labels. The Literary Analyses tab opens a seven-work flyout plus an overview link on hover/focus/tap; Escape and focus leaving close it. Internal contents links use the shared route controller across the iframe, preserving URL/history and bounded turns.

Keyboard ArrowLeft/Right and PageUp/Down turn inside the engine. Ordinary turns no longer force focus to a new heading. Explicit navigation focuses the requested question heading or destination title after settlement. Original-leaf registration/inert/ARIA exclusion is retained and verified for hidden pages/clones. Reduced motion avoids cover animation, physical turns, bursts and bookmark movement. No Rough Notation marks are mounted in the production reader yet; P6 must apply the same reduced-motion rule when adding them. The closed cover alone is the opening button, with keyboard access and a single rightward slide/open animation; an initial stylesheet-loading defect was fixed by importing the material CSS with the cover. Body text, question headings, paragraph/list spacing and thin full-width paper rules now use a shared 24 px grid, with measured repagination rather than visual shrinking.

Verification: strict TypeScript/production build, zero-warning ESLint and whitespace checks passed. Eight targeted composition/route unit tests passed after updating expected opening/order counts for the new Contents document. Ten initial desktop/mobile Chromium access checks passed; twelve further click/press/touch/selection/flyout checks passed in a focused run, whose two normal-cover cases exposed the stylesheet issue and then passed in a targeted rerun. Four updated cover/resize/root-text-scale regression cases passed. Final contents/complete-reading checks passed after separating the contents leaves. A live browser touch-scroll probe scrolled the parent 249 px without changing pages. Four-width live smoke checks (320/768/1024/1440) found no sideways overflow or runtime errors. Screenshots were reviewed. Older reader/routing/foundation tests were adapted to the deliberately removed controls; not every historical prototype/browser file was rerun. Windows test preview processes required scoped shutdown before reports finalized. P7's integrated academic, physical-device, screen-reader and release gates remain unchecked. No blanket WCAG or cross-browser certification is claimed.

**Next action:** JD reviews the whole Phase 5 at port 5193. Keep the worktree and all uncommitted implementation until explicit approval to commit. Record the actual implementation SHA after that commit before worktree cleanup. Main still does not contain Phase 5 application source.

### P6. Arrange the portfolio

**P6.1 checkpoint, 9 November 2026 (work/p6-content, uncommitted, base `db4dd53`):** profile content is complete from P1 (`src/content/profile.ts` + `src/content/profile.md`: name, course, year, university, class section/code, introduction, interests, experience) and JD's portrait is placed as the taped polaroid. The "handwritten contents" task is **obsolete**: JD removed the Contents page/tab in Phase 5; the seven works are now reached through the Literary Analyses inline-accordion dropdown, so that acceptance ("all seven works are easy to find") is met without a contents document.

**P6.1 Complete profile and contents**

- [x] Add exact personal/class details, introduction, interests, and experience.
- [x] Place the actual portrait when available.
- [ ] ~~Build handwritten contents with all titles, authors, main lenses, and direct links.~~ Obsolete: Contents removed by JD in Phase 5; works are reached via the Literary Analyses dropdown.

**Done when:** profile requirements are covered and all seven works are easy to find.

**P6.2 Arrange seven distinct openings**

- [ ] Follow the companion file's visual directions.
- [ ] Vary art placement, notes, spacing, and emphasis while retaining all numbered answers.
- [x] Credit selected pictures and never label generated fiction as an archival photograph.
- [x] Allow as many readable continuation pages as needed.

**Done when:** openings are distinct and every analysis is complete at phone and desktop sizes.

_P6.2 status: JD's seven book covers are placed as taped, zoomable polaroids on each analysis opening (credited as supplied by JD; none labelled as archival photographs), and readings reflow across as many continuation pages as needed. Remaining: genuinely distinct per-opening art placement/spacing/emphasis variety beyond the shared cover-polaroid treatment._

**P6.3 Complete personal sections**

- [x] Give the Odyssey favorite its own personal treatment.
- [x] Use organized notes for learning and quiet paragraphs for reflection.
- [x] Keep Reader-Response prominent in the overall reflection.
- [x] Add margin notes without duplicating body copy.

**Done when:** all five required sections contain the actual reviewed drafts.

_P6.3 status: complete from P1 drafts — `favorite.md` (Odyssey, personal, margin note), `learning.md` (organized notes, margin note), `reflection.md` (Reader-Response most prominent, closing note). Margin/closing notes are distinct from body copy._

**P6.4 Finish annotations and credits**

- [x] Add a few Rough Notation marks after font/layout readiness.
- [x] Reposition or clean up marks during reflow/unmount.
- [ ] Include only used SVG assets.
- [x] Add local media/font credits and per-work sources.

**Done when:** highlights align after turns/resizing and all external material is acknowledged.

**P6.4 checkpoint, 9 November 2026 (work/p6-content, uncommitted, base `db4dd53`):** added restrained Rough Notation highlights (`src/lib/annotations/noteMarks.ts`, color token `color.annotation.highlight` #E8CE72, `motion.annotationMs` 420) on the margin/closing notes — one per leaf, animate-once, reduced-motion static. Applied in the notebook engine via the settle lifecycle (`useEngineController.annotateVisibleNotes` + `EngineBook` init) so marks only draw on settled visible leaves and are discarded with the leaf on reflow/unmount, and in the full-reading view (`FullReadingView`) via a reduced-motion-aware effect. The marking is idempotent per element, measured off-screen separately so it never affects pagination. Credits are present and rendered (font, margin-note origin, per-work source notes, editions/SDG disclaimers). Checks: `npm run check` passed (theme, zero-warning ESLint, 70 unit tests, `tsc -b`, production build). Focused Chromium smoke: the reading view and engine both show the highlight correctly positioned behind the note ink, traveling with the leaf, static under reduced motion, with no console/page errors and page turns still working. Remaining P6.4: "Include only used SVG assets" pertains to per-opening decorative art, which is deferred with P6.2 until JD supplies photos/art. Next action: JD review; P6.2 awaits photos; no commit until JD approves the phase.


### P7. Review the completed notebook

**P7.1 Check the assignment**

- [ ] Verify five sections, exactly seven works, six answers per work.
- [ ] Check attributions, source locations, favorite discussion, learning, and five reflection topics.
- [ ] Check simple English, respectful culture/religion wording, and confirmed personal facts.
- [ ] Compare rendered text with the content source.

**Done when:** no required content has been omitted or changed by layout.

**P7.2 Run focused engineering checks**

- [ ] Run TypeScript, lint, content validation, relevant unit tests, and production build.
- [ ] Run browser checks for deep links, accurate landing, repeated jumps, and resize restoration.
- [ ] Avoid tests that merely mirror decorative implementation.

**Done when:** the relevant checks pass without unresolved reading/navigation defects.

**P7.3 Review real reading and access**

- [ ] Inspect about 360 px, 390 px, tablet, desktop, short viewports, and increased text size.
- [ ] Check long titles/URLs, crease space, page edges, continuations, photo replacement, and loading failures.
- [ ] Use keyboard-only navigation, reduced motion, and screen-reader labels/order.

**Done when:** no clipped text, sideways overflow, unreadable labels, or focus on hidden pages remains.

**P7.4 Check motion and loading cost**

- [ ] Keep measurements separate from animation.
- [ ] Start with the modest real page set and optimize only demonstrated problems.
- [ ] Size/compress images, preload only needed fonts, and avoid blocking text on optional art.
- [ ] Confirm bounded transitions and no growing engine/annotation instances.

**Done when:** the notebook stays responsive and loading cannot hide required writing indefinitely.

### P8. Deploy to Vercel and prepare submission

**P8.1 Connect source and hosting**

- [ ] Commit source, writing, lockfile, and asset credits.
- [ ] Connect GitHub to Vercel using the Vite setup.
- [ ] Use the build script, `dist` output, and documented SPA rewrite.
- [ ] Review a preview deployment.

**Done when:** hosted section/work URLs open and refresh correctly.

**P8.2 Verify the production link**

- [ ] Publish the reviewed revision on the stable production domain.
- [ ] Check signed-out instructor access and all five sections, seven works, media, and source links.
- [ ] Replace the development portrait with JD's real photograph.

**Done when:** the shared production URL exposes the complete reviewed portfolio without an account prompt.

**P8.3 Record release and submission status**

- [ ] Record production URL, commit, final checks, and any minor limitation.
- [ ] Confirm the deadline in Google Classroom.
- [ ] Mark the chosen seven works on the score sheet if required.
- [ ] JD submits the published link through the designated assignment.

**Done when:** release and separate Classroom submission status are recorded accurately. Do not claim submission without confirmation.

## 9. Verification matrix

| Scenario                    | Required result                                      |
| --------------------------- | ---------------------------------------------------- |
| First visit                 | Burgundy cover, clear opening, discoverable sections |
| Direct work URL             | Correct work immediately, no forced cover            |
| Near versus far jump        | Different suggested distance, bounded and accurate   |
| Rapid selections            | Newest destination wins, no growing queue            |
| Hover/focus reveal          | Readable tab, no confusing overlapping writing       |
| Phone without hover         | Five usable destinations                             |
| Long block/reference        | Reflows/splits with no missing text                  |
| Font/image failure          | Content remains accessible                           |
| Update with same page count | New writing appears, no stale engine leaves          |
| Resize                      | Same work and answer retained                        |
| Reduced motion              | Immediate navigation and static annotations          |
| Hidden leaves/clones        | No duplicate reading/focus order                     |
| Full-reading/print          | Complete source-order writing                        |
| Production refresh          | Valid routes load, unknown routes recover            |
| Signed-out access           | Instructor can view all text and media               |

## 10. Workflow and review checkpoints

The phase plan is the project source of truth. Load only the current subphase, relevant decisions, and needed content during coding. At each subphase end, record the result, checks, unresolved issue if any, and next action.

For parallel implementation, follow the [parallel workflow](parallel-implementation.md) for dependency waves, file ownership, shared contracts, integration gates, and initial agent briefs. Start P1 content preparation alongside P2.1 foundation verification. Later work depends on the accepted engine, geometry, content blocks, and page maps. These waves change scheduling, not the acceptance criteria below.

Keep small work in the checklist. Larger subphases may use a focused spec and tickets under a matching path such as `resource/work/P4/P4.2/`. Link from the plan instead of duplicating details. Avoid loading all seven analyses for every technical task.

Recommended PR/review checkpoints:

- After P2: engine, measured sample, and bookmark/jump evidence.
- After P3 through P5: complete shell, composition, routing, and input behavior.
- After P6: all real content and distinct openings.
- After P7: academic and release checks.

Use short check results and a few relevant screenshots as evidence. Run checks once after relevant changes. Repeat them only for new changes, failures, or unresolved concerns.

## 11. Release checklist

- [ ] Exact name, degree/year, class string, and code.
- [ ] Real recent photograph.
- [ ] Burgundy cover and three personal details.
- [ ] Clear homepage and five exact section labels.
- [ ] Seven confirmed works in the agreed order.
- [ ] Six complete answers and longer personal reflection per work.
- [ ] The Odyssey favorite with perseverance/career connection.
- [ ] Reader-Response leads the overall reflection.
- [ ] Neat handwriting readable on phone and desktop.
- [ ] Single/spread modes preserve semantic location.
- [ ] Physical turns and bounded jumps verified.
- [ ] Transparency or accepted slide-out bookmarks verified.
- [ ] Sources and asset credits, no invented page numbers/quotes.
- [ ] Full text accessible without animation.
- [ ] Type, lint, content, relevant tests, and build pass.
- [ ] Hosted deep links survive refresh.
- [ ] Stable production link works signed out.
- [ ] Actual deadline and Classroom submission status recorded.

## 12. References

### Course documents

- [Great Books Final Project guide](https://chatgpt.com/library?file_id=libfile_e1d09b7be0d08191ae6f11f009713c8f\&account_id=personal).
- [Final Exam Score Sheet](https://chatgpt.com/library?file_id=libfile_aa053a87951c81919c4a5b7a8f80c731\&account_id=personal).
- [Companion website content](Great_Books_Website_Content.md), including literary editions and SDG sources.

### Official implementation references

- [Vite guide](https://vite.dev/guide/) and [static deployment](https://vite.dev/guide/static-deploy).
- [Tailwind with Vite](https://tailwindcss.com/docs/installation/using-vite).
- [React Router setup](https://reactrouter.com/start/declarative/installation).
- [Sketchbook UI project](https://github.com/SarthakRawat-1/sketchbook-ui) and [documentation](https://sarthakrawat-1.github.io/sketchbook-ui/). Verify the maintained installation if the older `/docs/` link is unavailable.
- [react-pageflip](https://github.com/Nodlik/react-pageflip) and [StPageFlip](https://nodlik.github.io/StPageFlip/).
- [Rough Notation](https://roughnotation.com/).
- [Oreo Doodle Icons](https://doodle.oreoui.com/). Check licenses for actual selected assets.
- [react-markdown](https://github.com/remarkjs/react-markdown).
- [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), including SPA deep-link configuration.
- [Vercel Deployment Protection](https://vercel.com/docs/deployment-protection) for instructor access.

Documentation supports the proposed tools. Motion budgets, page composition, project-specific acceptance checks, and fallback rules are implementation choices to verify during the build.

### Current consolidated status, 9 November 2026

This reconciliation uses Git refs and the existing subphase handoffs. It changes documentation only. Check results below are recorded evidence from the implementing worktrees, not fresh test runs on 9 November. Earlier checkpoint status/next-action paragraphs remain historical and are superseded by this table.

| Scope | Implemented and verified | Approval/commit/integration state | Remaining action |
| --- | --- | --- | --- |
| P1.1–P1.3 | Five sections, seven works, 42 answers, source metadata and JD's portrait. Eight original content/source checks recorded. | Approved; `e4f79eb`, `Prepare Phase 1 portfolio content and assets`, branch `work/p1-content`. Checkout removed at JD's request. P4 consumes unchanged content/assets locally. | Preserve content during later rendering and final academic audit. No main integration claimed. |
| P2.1–P2.4 | Compatible stack, physical engine/disposal, bookmarks/reveal/bounded jumps, measured sample/reflow. Recorded combined evidence: 14 unit tests, 54 Chromium checks, theme/lint/types/build/format. | Approved; `c3bfbed`, `Implement Phase 2 notebook interaction prototypes`; follow-up `0fd0a87`. Branch `work/p2-prototypes`; retained worktree `C:/Users/LENOVO/.codex/worktrees/8a5a/GB-Website`. P4 is based on this branch. | Integrate final navigation through P5 and retain combined release checks. |
| P3.1–P3.3 | Notebook materials, personalized entry, direct destinations, desktop bookmarks, phone menu, shared page-control component and motion feedback. Recorded evidence: 2 unit tests, 58 Chromium cases, theme/lint/types/build; six inherited formatting warnings. | Approved; `f79d9f7`, `Build notebook shell and shared controls`; follow-up `5244310`. Branch `work/p3-shell`. P3 checkout removed at JD's request. Uncommitted P1 documentation was archived in that implementation commit. | P4.3 consumes the material shell locally. P3's separate final routing/bookmark controls are not claimed fully integrated into P4 or main. |
| P4.1 | Canonical ordered blocks, parser, stable IDs, shared renderer, validation of writing/assets/sources. Recorded evidence: 45 unit tests, eight P1 checks, production registry import, theme/lint/types/build/format. | **Uncommitted**, branch `work/p4-content`, base `0fd0a87`, worktree `.worktrees/p4-content`. Implemented and verified locally. | Retain canonical conservation and validation in later integration. |
| P4.2 | Measured fitting/splitting, source-range conservation, heading/list/link handling, bounded asset readiness and failure outcomes. Historical recorded evidence: 62 unit tests and 72 Chromium cases, plus checks/build/format. | Same uncommitted P4 lane. | Keep measured rendering and source text aligned. |
| P4.3 | Thirteen opening groups, consumed-block/range records, continuation pages, balancing leaves, section/work/answer/block leaf and spread maps, P3 material-shell composition with the real engine. Historical recorded evidence: 67 unit tests and 74 Chromium cases, plus checks/build/format. | Same uncommitted P4 lane; scoped P1/P3 input integration only. P6's final illustrated arrangements remain pending. | Preserve unique ordered writing and semantic destinations. |
| P4.4 | Functional cover opening/closing into `/notebook`, real page arrows, section/work/answer selection, reflow and semantic restoration, complete reading/print, font/measurement/engine recovery. Recorded focused evidence: build/types/lint and 10 targeted Chromium checks. A separate live smoke check opened the reader and advanced Page 2 to Page 4 of 66 without runtime errors. | All P4 subphases locally implemented and verified; **whole-phase approval and commit pending**. Keep the P4 worktree. | Stop for JD's Phase 4 review. Commit only after explicit approval. |
| P5–P8 | Some supporting controls exist, but complete route/history/bounded-jump integration, final portfolio arrangements, P7 audit and deployment/submission gates remain open. | Not accepted as complete. Main remains `d2d6b5f`. | Next implementation phase after P4 approval is P5. Preserve the frontend-first priority and proportional checks. |

P4 handoffs and detailed limitations live under `.worktrees/p4-content/resource/work/P4/` from the main checkout, or [work/P4/](work/P4/) from the P4 copy. P3's full review and cleanup archive are retained in Git at `5244310:resource/work/P3/README.md` and `f79d9f7:resource/work/P3/worktree-cleanup/P1/`; removed checkout paths are historical, not live links. P2 evidence is retained in its committed phase handoff.

**Preview clarification:** the P4.4 live-preview correction records that port 5173 was switched to the P4 worktree and smoke-tested. Older P4.4 paragraphs saying it still serves main, or recommending 5194 instead, describe an earlier checkpoint. No running-server availability was rechecked for this documentation update. Restart from the P4 worktree when reviewing it. Main application files are unchanged.

**Next action:** JD reviews the whole uncommitted Phase 4. Preserve the worktree and commit only after approval. P7 academic, accessibility, content/print equivalence and release gates remain unchecked until their integrated review. No backend, artwork, prose revision, dependency change, commit, merge, push or deployment is part of this plan update.
