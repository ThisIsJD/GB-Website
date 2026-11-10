# Repository Guidelines

## Current priority: ship the frontend

JD's direction on 8 November 2026: build the web platform as soon as possible. This is a frontend-only React/TypeScript application. Do not add a backend, database, authentication service, CMS, or server API.

Prioritize working notebook layout, pagination/composition, navigation, responsive behavior, readable fallback and print. Reuse approved content and existing assets. Defer new artwork, decorative refinements, prose revisions and unrelated tooling until the platform works.

Keep verification proportional: use a build/type check and focused smoke checks for changed behavior, content conservation, clipping and runtime failures. Add tests only for material risks or actual regressions. Do not repeatedly run broad suites or pursue coverage targets. Keep the P7 academic/accessibility/release gates, and report unverified checks honestly.

Continue in the Phase 4 worktree, stop at each subphase for a summary, and commit only after the entire phase is implemented and JD approves. Preserve unrelated edits and other branches. P1, P2 and P3 are committed on their own branches; P4.1 through P4.3 are local Phase 4 work. Their presence does not establish main integration.

## Current State & Sources

Phase 4 commit/cleanup, 9 November 2026: JD approved committing P4.1 through P4.4. Implementation `5b42e43a83b3fa4e7229f2aa52bc61eca171850e`, `Implement Phase 4 notebook reader`, with actual-SHA documentation follow-up `e985264c0cd7cbd6c9047d00a54a890504a6e134`, is preserved on `work/p4-content`. Its clean worktree was removed as requested. Main source integration/push remain pending. Port 5173 serves the verified saved frontend build in ignored `.cache/phase4-preview`; the root launcher can use it after cleanup. P2/P5 worktrees and unrelated main edits remain untouched. Older checkout/preview descriptions below are historical.

**My Literary Journey** has a React/TypeScript/Vite scaffold. Phase 1 content, sources, and JD's portrait are committed as `e4f79eb` on `work/p1-content`, awaiting integration. P2.1 dependencies/build/preview and P2.2 physical engine checks are verified in the separate `work/p2-prototypes` worktree, with its implementation still uncommitted. Check the implementation plan and the current checkout before assuming dependencies or another branch's files are available.

`resource/Great_Books_Website_Concept_and_Implementation_Plan.md` controls phases and acceptance, `Great_Books_Website_Content.md` controls copy, and `Great_Books_Design_System.md` controls visuals. All three are in `resource/`. Record integration decisions in `resource/decisions.md`.

## Structure & Commands

Use `src/app/` for composition/routes, `src/components/{notebook,content,ui}/` for UI, `src/content/` for writing/metadata, `src/lib/{content,pagination,navigation}/` for logic, `src/hooks/` for hooks, and `public/` for assets. Directory markers indicate unimplemented areas.

Use Node 24.16.0. On restricted Windows PowerShell, use `npm.cmd`/`npx.cmd`.

- `npm install`: install dependencies and generate the lockfile. Subsequently use `npm ci`.
- `npm run dev`: generate theme and start Vite.
- `npm run check`: check theme, lint, unit tests, types, and production build.
- `npx playwright install chromium`, then `npm run test:e2e`: browser checks.
- `npm run format:check`: check Prettier formatting.
- `npm run theme`: regenerate CSS after editing `src/styles/tokens.json`. Do not hand-edit `theme.css`.

## Installed Skills

Read applicable `.agents/skills/<name>/SKILL.md` before using it:

- `frontend-design`: visual direction within the established notebook design.
- `frontend-ui-engineering`: responsive components, accessibility, and interaction quality.
- `shadcn`: only for explicitly requested shadcn work. The selected UI library is Sketchbook UI.
- `web-artifacts-builder`: standalone artifacts when requested. Its initializer must not replace this application.

Installed skills do not authorize changing the selected stack.

## Coding & Testing

Use two-space indentation, PascalCase component filenames, camelCase functions, and kebab-case work slugs. Keep Markdown, metadata, and tokens separate. Website copy uses B1 to B2 English without em dashes or semicolons. Preserve five section labels and six answers per analysis.

Use Vitest `tests/unit/*.test.{ts,tsx}` and Playwright `tests/browser/*.spec.ts`. Prioritize text conservation, reflow, deep links, keyboard access, and reduced motion. Report blocked checks honestly. No numerical coverage threshold is specified.

## Implementation Progress Records

After every implementation, update `resource/Great_Books_Website_Concept_and_Implementation_Plan.md` in the implementing worktree before handing off or reporting completion. This applies to subphases, fixes, and follow-up changes.

- Update the relevant task checkboxes. Check only implemented tasks with evidence, and leave incomplete or blocked acceptance gates unchecked.
- Record the phase/subphase, date, branch/worktree, concrete changes, checks run and their results, remaining limitations, and next action. Link detailed handoffs where useful.
- Record the implementation commit ID and subject once a commit exists. Until then, write `uncommitted`, with the base revision. Never invent a SHA or treat the base revision as the implementation commit. Add the resulting SHA in the next plan update after committing, since a commit cannot contain its own hash.
- Distinguish implemented, verified, approved, committed, and integrated states. Passing checks in one worktree do not prove that `main` contains the change or that combined checks pass.
- Preserve existing plan entries and unrelated user edits. During parallel work, each agent updates its own plan copy and includes that update in its handoff. The coordinator reconciles the shared plan during integration. A handoff alone does not replace the plan update.
- Updating the plan does not authorize committing, merging, publishing, or changing another agent's files. Follow the user's approval requirements.

## Parallel Work & Reviews

When parallel implementation is requested, follow [the dependency and ownership workflow](resource/parallel-implementation.md). Assign bounded subphases and exclusive file ownership. Separate coding sessions should use separate branches/worktrees. Same-checkout subagents must avoid overlapping edits and Git mutations.

One coordinator owns shared configuration, dependency changes, integration, and plan updates unless ownership is explicitly transferred. Workers return scoped results and check evidence. Use short imperative commits such as `Add notebook navigation`. PRs identify the subphase, relevant issues, checks, limitations, and screenshots for visual changes.
