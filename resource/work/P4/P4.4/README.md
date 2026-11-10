# P4.4 reflow, complete reading and entry

## Phase 4 approved and committed

9 November 2026. Implementation: **`5b42e43a83b3fa4e7229f2aa52bc61eca171850e`**, **Implement Phase 4 notebook reader**, on `work/p4-content`, base `0fd0a87`. JD explicitly authorized the commit. P4.1 through P4.4 and follow-up preview fixes are implemented, verified, approved and committed. This documentation follow-up records the resulting SHA; earlier uncommitted/pending descriptions below are historical checkpoints.

Final production build/types, launcher syntax and Git whitespace checks pass. Preserve this branch and the built frontend snapshot in ignored `.cache/phase4-preview`, serve that snapshot at port 5173 after cleanup, then remove only `.worktrees/p4-content` as JD originally requested. Root launcher changes remain uncommitted in main with its unrelated edits, and root application integration is still pending. No merge, push or deployment occurred. The commit's approved prerequisite copies are P1 metadata/writing/portrait/evidence and the scoped P3 material shell/token generator.

## Whole-phase commit approval, 9 November 2026

JD explicitly requested committing the complete Phase 4. Implementation and final verification are approved for commit on `work/p4-content`, base `0fd0a87`. The implementation is still uncommitted at this documentation checkpoint; the resulting SHA will be recorded immediately after commit. Keep historical subphase records below. Exclude all unrelated main-checkout changes. Main application integration and push remain pending.

Preserve the production build in ignored root `.cache/phase4-preview` so the existing URL remains usable after the requested worktree removal. The preview launcher falls back to this saved frontend build only when neither root nor the review worktree has a live reader. Once main contains the reader it serves main normally. Keep the branch and record the implementation SHA before removing only `.worktrees/p4-content`.

## Durable preview startup repair, 9 November 2026

Restarting from the repository root had recreated the static-cover preview. The root and Phase 4 `dev` commands now use `scripts/start-dev.mjs`. From the root it selects the available Phase 4 reader checkout until main itself contains `NotebookReader.tsx`. It then launches that checkout's Vite on port 5173, regenerating its theme first. It logs the selected directory and fails explicitly if no reader checkout is available, rather than reverting to an inert cover. The root package's unrelated dependency edits are preserved; only its `dev` script was changed. No application code was merged into main.

Verified the old port listener served the cover without an Open action, stopped only that listener with required Windows permission, and launched `npm.cmd run dev` from the repository root. The startup log confirmed `.worktrees/p4-content`. Focused live Chromium verification passed at `http://127.0.0.1:5173/`: Open entered `/notebook`, Next changed Page 2 of 66 to Page 4 of 66, zero runtime errors. Both launcher files pass `node --check`. Refreshed screenshot: [working pages](live-preview-5173.png). Preview is left running for JD; no broad suite was rerun.

This follow-up is **uncommitted**, root base `d2d6b5f`, implementing worktree base `0fd0a87`. Launcher source and the `dev` script are also present in the Phase 4 worktree for the eventual approved commit. No merge, commit, push, publication or worktree deletion occurred. Review directly at `http://127.0.0.1:5173/notebook` or open the cover at `/`.

## Live preview correction, 8 November 2026

JD's screenshot confirmed that port 5173 still served the original main checkout's static cover. Verified that the listener was the old Node/Vite process and its served component had no Open action. Replaced only that identified preview process after Windows required elevated permission to stop it. Started `npm.cmd run dev -- --port 5173` from the Phase 4 worktree and left it running for JD's requested interactive review. Main application files remain unchanged.

**Current review URL: `http://127.0.0.1:5173/`.** Refresh the existing tab. The earlier instructions below about main still serving that port describe the prior checkpoint and are superseded by this correction. If the development server is later restarted, start it from `.worktrees/p4-content` to retain this implementation.

Focused live smoke check at this exact URL passed: Open reached `/notebook`; Next changed **Page 2 of 66** to **Page 4 of 66** in spread mode; zero page runtime errors. Screenshot inspected: [live notebook](live-preview-5173.png). No code changes, commit, merge, push, deployment or worktree deletion were needed for this preview correction.

8 November 2026. Branch `work/p4-content`, worktree `.worktrees/p4-content`, implementation **uncommitted**, base `0fd0a87`, with local P4.1 through P4.3. JD authorized P4.4 and specifically requested a functional notebook opening. Keep frontend delivery first and checks proportional. Commit only after the entire phase is implemented and JD approves. Keep the worktree until that approved commit.

Own the live reader route, cover action, reflow/readiness hooks, semantic restoration, complete reading/print component, reader controls/styles and a focused browser smoke file. Preserve prior prototypes and canonical writing. Full route/history/bounded-jump integration remains P5. No backend, new artwork, dependency or token changes.

Opening must enter the real composed engine, with reduced motion respected. Rebuild only for meaningful measured geometry, root text size, font readiness or image state changes. Abort replaced layouts. Keep navigation disabled until new maps and engine are ready. Restore a semantic block/offset rather than old physical indexes. Use the original canonical blocks for full reading and printing, even if fonts, measurement or engine fail. Record results before handoff.

## Implemented result

- Both the native cover overlay and existing Open button enter `/notebook`. The former button led only to the readable sample at `/prototype`, which did not open the composed notebook. Pointer and keyboard entry now reach the real hard-cover/soft-page engine. Reduced motion starts at the reading destination immediately. Close returns to `/`.
- `src/app/NotebookReader.tsx` composes the approved material shell, engine, page arrows, five exact section labels, work/answer selectors, reading toggle, print action and larger-handwriting preference. User-facing flows contain reading controls rather than prototype diagnostics.
- `usePortfolioLayout` aborts replaced measurements, atomically publishes new composition/maps, and restores the saved block/range or answer/work/section fallback. It reuses the reviewed semantic capture/turn hook, without forking engine implementation. Navigation is disabled during layout, engine startup and turns. Physical page indexes are never retained as the semantic reading location.
- `useReadingInputs` observes meaningful geometry through the existing width hook, root text scale through a 1rem probe, font loading events, and changed image source/natural-size signatures. Unchanged effective geometry does not rebuild. Observers, probes, asset listeners, pending frame work and measurement/engine documents are removed on cleanup.
- `FullReadingView` renders all thirteen canonical groups in order with unique block IDs, every original answer, source notes/citations and edition disclaimers. It includes confirmed student/class facts, JD's supplied portrait and credit, original-note credit and font notice. Answer headings are nested under document headings. Reading mode requires neither measurement nor the page engine.
- Reading mode follows semantic destinations and captures the currently visible block on scroll. Returning to the engine restores that block. Print media exposes the complete text even when the interactive reader normally hides it, with natural document pagination and no clipped page-size containers.
- Font, measurement or engine failures show a readable message and all original writing. The engine has a render-error boundary as well as its adapter failure callback. No raw internal errors are presented as website copy.

## Focused verification

- `npm.cmd run build`: strict application/test types and production build pass, also repeated by the browser runner's normal startup.
- `npm.cmd run lint`: zero warnings/errors after fixing ref reads during render.
- Port 4199, scoped Playwright invocation of `reader.spec.ts` and the updated opening case in `foundation.spec.ts`: **10 passed**, desktop and mobile Chromium, exit code 0. Assertions cover native cover click, keyboard Open, actual arrows, close, all five section controls, semantic Odyssey reflection restoration after desktop-to-phone resize, larger writing and root font change, reading/return, all canonical groups without duplicate block IDs, print media, failed fonts, failed engine and cleaned measurement roots. The owned completed preview was explicitly stopped to finalize Windows runner teardown.
- Formatting is scoped to changed files. Git whitespace is checked before handoff. No full suite or extra unit tests were added, following JD's delivery priority. Earlier 67-unit/74-browser runs remain P4.3's historical evidence.

## Review the working checkout

JD is currently viewing `http://127.0.0.1:5173/`, the older main checkout. Phase 4 remains isolated and uncommitted. Run the following in PowerShell to see the new opening and reader:

```powershell
cd C:\Users\LENOVO\Projects\GB-Website\.worktrees\p4-content
npm.cmd run dev -- --port 5194
```

Open `http://127.0.0.1:5194/`, select **Open my notebook** or the cover surface. Direct reader: `/notebook`. Complete text: `/notebook?view=reading`. A direct semantic destination such as `/notebook?at=odyssey-reflection` skips the closed cover. No user preview at 5173 was stopped or changed, and no server is claimed to remain running after handoff.

P4.1 through P4.4 are now implemented and verified locally. **Whole-phase approval, commit and main integration are pending.** Keep the worktree. Complete section/work route/history and bounded-jump behavior remain P5, final illustrated/content arrangements P6, and comprehensive academic/access/release checks P7. This is a frontend-only application. No dependency, backend or artwork was added. No commit, merge, push, deployment or worktree deletion occurred.
