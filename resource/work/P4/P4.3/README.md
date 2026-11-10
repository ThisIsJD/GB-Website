# P4.3 openings and continuations

8 November 2026. Branch `work/p4-content`, worktree `.worktrees/p4-content`, implementation **uncommitted**, base `0fd0a87`. JD corrected the request for P4.4 to P4.3 first. Stop after this subphase. Do not commit until all Phase 4 work is implemented and approved.

Own canonical composition/maps, measured opening metadata, a composition review route, named tests, and this worktree's plan/decisions. Integrate only the approved P3 material shell, stylesheet and token generator from `5244310` (implementation `f79d9f7`). Preserve P2 engine/prototypes and P4.1/P4.2. Reconcile measured leaf padding and ruled materials with P3 without copying its natural-height reading layout onto the engine. P5 owns final route/history/bookmark commands; P6 owns final illustrated opening arrangements. P4.4 owns production reflow and recovery.

Opening consumption records include complete block IDs plus exact ranges for partially consumed paragraphs. Continuations retain the remaining ranges without repeating opening text. Build maps only after covers and balancing leaves have their final indexes. Keep semantic IDs, physical indexes, spread indexes and displayed page numbers distinct.

## Implementation and evidence

P4.3 is implemented and verified, awaiting review. Phase 4 remains incomplete, unapproved, uncommitted and unintegrated. No commit, merge, push or publication occurred.

`src/lib/pagination/composePortfolio.ts` orders profile, analyses introduction, seven works, favorite, learning, reflection and deduplicated citations into thirteen groups. Work source notes stay with their work. Each opening records its layout key, physical index, consumed complete blocks and exact source ranges for partial paragraphs. Continuations carry the remainder without repeating writing. Runtime validation checks the complete original block order and every contiguous range.

The composer inserts separately identified hard covers and intentional balancing leaves before assigning semantic maps. `maps.sections`, `maps.works`, `maps.answers` and `maps.blocks` return physical leaf indexes. `maps.spreads` maps those indexes to engine spreads. Page numbers remain one-based display labels. Openings start on the first engine leaf of a spread. Source entries occur once even when multiple works cite them.

Approved P3 `NotebookShell`, its material CSS and its token generator are locally incorporated. No P3 worktree exists now, and its preserved branch is unchanged. The P3 shell wraps the real disposable-document engine. Natural-height `PaperLeaf` markup is not imposed on measured pages. Shared measurement/rendering use P3-derived padding, readable 19/20 px handwriting, ruled writing areas and metadata reservations. The fitting cache distinguishes decorated and continuation states. All theme changes are generated, with no token or dependency edits.

`/prototype/composition` provides physical opening selection and inspection of every composed leaf. It is a platform review route. Final route/history/bookmark commands belong to P5; final illustrated arrangements belong to P6. P4.4 will replace the review harness's basic rebuild behavior with semantic restoration, reading/print views and engine recovery.

- `npm.cmd run check`: passed theme, lint, **67 unit tests**, TypeScript and production build.
- `npm.cmd run format:check` and `git diff --check`: passed.
- Dedicated port 4198, `npm.cmd run test:e2e`: **74 passed**, exit code 0. The completed preview process needed explicit shutdown before the Windows runner finalized.
- New unit cases cover two fitting capacities, consumption/continuation conservation, covers/balancing/spreads, all 42 answer maps, section order, citation deduplication, invalid composition and P3 geometry.
- New desktop/mobile browser cases reach the Odyssey's `journey-map` opening through the real engine, inspect every physical leaf for clipping, verify all answer maps and thirteen consumption records, and confirm measurement cleanup.
- Inspected [desktop](desktop-chromium.png) and [phone](mobile-chromium.png) screenshots. The phone composition has 66 physical leaves including covers/balancing leaves. Counts vary with geometry.

JD subsequently prioritized rapid frontend delivery and proportional testing. Recorded in root and Phase 4 `AGENTS.md` and plans. Future checks should target changed behavior and material risks; the completed broad suite is historical evidence, not a requirement to rerun it after every edit.

Remaining gates: P4.4 semantic reflow, full reading/print and engine failure recovery; P5 final navigation/history/control wiring; P6 final artwork/content arrangements; P7 final audit. Main still does not contain this implementation. Keep the worktree and stop at the P4.3 checkpoint.
