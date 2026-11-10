# P5.3 access, contents and opening interaction

9 November 2026, `work/p5-navigation`, `.worktrees/p5-navigation`, **uncommitted**, base `e985264`. P5.1–P5.3 are implemented within their recorded verification scope. Stop for JD's whole-phase review and commit only after explicit approval. Preserve the resulting commit before removing the worktree. Nothing is merged into main or published.

## Agreed presentation

JD confirmed a separate smaller Contents bookmark, a seven-title flyout from Literary Analyses, and full-width paper rules with tighter spacing and text following the rules. The five required academic section bookmarks remain intact. The top close/reading/print/handwriting toolbar and bottom work/answer selector panel are removed. The corner arrows remain for keyboard page turning. The separate Open my notebook button is removed; the centered cover is the opening control.

Contents is a derived navigation document built from the existing section/work metadata. It precedes the profile, with section links on the left and work links, author attributions and main lenses on the right. Phone continuation pages preserve the same links. No original portfolio writing was replaced. Internal links cross the iframe through a navigation message and use the existing controller instead of reloading the app.

The analysis flyout supports hover, focus, phone taps, Escape and focus leaving. Its overview button retains direct section access. The Contents tab is distinct from the five section labels. Full-reading URLs, print CSS and automatic complete-text recovery remain available despite removing toolbar buttons.

## Access and input

ArrowLeft/Right and PageUp/Down turn engine pages without hijacking form/editable shortcuts. Explicit navigation focuses the requested question heading or work/section title after the final page is painted. Ordinary turns do not force a destination-heading focus. Hidden originals and temporary engine copies remain inert and aria-hidden, checked against registered original leaves.

Mouse click/hold, touch edge dragging, short touch taps, body-text selection and vertical scrolling retain their distinct behaviors. A live Chromium touch probe scrolled the parent by 249 px without changing the reading page. Reduced motion bypasses the cover animation and uses immediate turns/jumps with stationary bookmarks. Production annotations are not mounted yet; P6's annotation implementation must preserve that preference.

The cover slides right, then opens, as one 800 ms animation before entering the reader. A timeout fallback ensures navigation if animation events are unavailable; timers clean up on unmount. Reduced motion opens immediately. The reader avoids a second cover-opening turn after that transition. The cover stylesheet is loaded on initial entry, fixing a defect found by the normal-motion test. Horizontal clipping keeps the moving cover within the viewport.

Body text, question headings and paragraph/list spacing use a shared 24 px line grid with thin full-width rules. Fitting uses these styles during measurement, preserving canonical text and semantic locations across resizing/text scaling.

## Verification

- Production build/strict TypeScript, zero-warning ESLint, focused formatting and Git whitespace passed.
- Eight route/composition unit cases passed, including every canonical navigation block round trip and original writing conservation. New Contents changes the composition from 13 to 14 opening groups.
- Initial `access.spec.ts` run: 10 desktop/mobile Chromium cases passed for contents links, removed controls, flyout focus/Escape/taps, heading focus, keyboard turns, hidden-page exclusion, reduced-motion cover entry and complete reading/print.
- The focused click/press/touch/selection/access run passed 12 cases and exposed two normal-motion cover cases. Loading the cover CSS on initial entry fixed them; both passed in the focused rerun.
- Four updated reader cover/reflow/root-text-scale cases passed. Contents and complete-reading cases were rerun after deliberately separating its two leaves.
- Live 320/768/1024/1440 px smoke found no horizontal overflow or page runtime errors. The vertical touch-scroll probe passed. Review screenshots: [contents spread](contents.png), [analysis flyout](flyout.png).
- Historical reader/routing/foundation tests were adapted to the intentionally removed controls. Not all browser/prototype files were rerun. Windows test previews required scoped process shutdown for final reports.

P7 retains the complete academic/source-text audit, physical-phone checks, screen-reader audit, cross-browser review and release gates. These focused checks do not establish blanket accessibility certification. P6's artwork, distinctive work arrangements and annotations remain pending.

Review: `http://127.0.0.1:5193/` or `/contents`. Root `npm.cmd run dev` selects this worktree. Old 5173 review URLs redirect to 5193. No commit, worktree cleanup, main merge, push or deployment occurred.
