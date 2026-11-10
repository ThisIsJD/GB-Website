# P5.1 navigation controller

Implemented 9 November 2026 on `work/p5-navigation` in `.worktrees/p5-navigation`. Implementation is **uncommitted**, based on `e985264`. Phase 4 implementation is `5b42e43`. Main integration is pending.

The route helpers map the five section URLs, seven work slugs, canonical block IDs and character offsets to the current composition. `/notebook?at=` remains compatible. Full-reading mode uses the same routes with `?view=reading`. Unknown slugs/routes show recovery links; invalid or incompatible anchors recover within the requested section.

`useNotebookNavigation` owns URL requests, semantic position, page commands and final engine events. Explicit navigation pushes history. Ordinary turns replace the current block/offset. Engine-driven URL updates are recognized as echoes and never replayed as route requests. Revision guards reject obsolete engine results. A browser-history revision ensures Back restores a destination even if the intervening React navigation had not committed. Programmatic reading scrolls do not overwrite the requested heading with a neighboring paragraph.

The reader adds previous work, next work and return-to-contents controls. Work and answer selectors follow the route. First/last work boundaries disable the corresponding control.

Checks passed:

- Strict TypeScript and Vite production build through the browser-run web server, zero-warning ESLint, and Git whitespace checks.
- Three route unit tests, including round trips for every canonical block and continuation offset, all seven work slugs, legacy links and invalid targets.
- Ten desktop/mobile Chromium cases: `playwright test tests/browser/routing.spec.ts tests/browser/reader.spec.ts --grep 'full reading|unknown slugs|Back during|cover|complete reading'`.
- Six desktop/mobile Chromium cases: `playwright test tests/browser/routing.spec.ts --grep 'pasted work|share the controller|ordinary turns'`.
- Live dev smoke: work selector matches the direct URL, no page runtime errors, and no sideways overflow at 320 px. Desktop/phone screenshots inspected.

Review images: [desktop](desktop.png) and [320 px phone](phone.png). A follow-up probe observed a stable ready state and unchanged page-map revision for three seconds. Full-page desktop screenshot capture temporarily changed layout dimensions, so the saved desktop image uses the normal viewport.

Two early runs exposed a full-reading Back race and a test that assumed the wrong profile anchor. Both were corrected before the successful focused runs. The Windows Playwright web-server cleanup stalled after tests completed; only the matching test preview processes were stopped, after which successful runs finalized with exit code 0. The interactive Phase 5 preview uses port 5197. No broad suite or P7 audit was run.

During worktree creation, a failed Git command was followed by a copy with an unset destination, creating flat files in the root checkout and overwriting root-name matches. The accidental flat files were removed, six previously clean tracked files were restored, the root manifest's original dependency set/version edits/launcher were preserved using its lockfile, and root `AGENTS.md` was restored from JD's supplied instructions. The root status again matches the original set of edited/untracked paths. Ignored recovery copies remain under root `.cache/root-copy-recovery`. The corrected copy populated only the Phase 5 worktree. No Phase 5 application changes were made in main.

Stop after this subphase for JD's review. P5.2 bounded jumps/latest-target behavior and P5.3 complete access/input behavior remain pending. Commit only after the entire Phase 5 is implemented and JD approves it. Keep the worktree until then and remove it only after preserving the approved commit.
