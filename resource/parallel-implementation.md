# Parallel Implementation Workflow

## Starting point

The existing P1–P8 plan defines acceptance gates. This document defines how to assign that work concurrently. Phase numbers alone do not establish independence.

The scaffold is committed on `main`, with `origin` configured for `ThisIsJD/GB-Website`. There is no dependency lockfile or `node_modules/` directory at this review. The earlier installation failed on registry access. Recheck that access during P2.1 rather than assuming the previous restriction still applies everywhere.

Start with two implementation agents and one coordinator role, which the lead session or maintainer can fill. The coordinator assigns ownership, reviews contracts, integrates results, and updates the main plan. Additional agents are useful only when another independent task exists.

## Work that can overlap

| Wave | Agent 1 | Agent 2 | Prerequisites and integration gate |
| --- | --- | --- | --- |
| A | P1.1–P1.3: import content, metadata, sources, and available assets | P2.1: install compatible dependencies, commit lockfile, verify build and a selected control | Can start now. Content import does not require a working flip engine. Hand off one complete analysis early. Keep P2.1 incomplete until its build and preview pass. |
| B | P2.4: prototype measured continuation pages from that analysis | P2.2, then P2.3: prove the engine, bookmark reveal, and bounded jumps | Requires verified P2.1, a real sample, and agreed page geometry/font metrics. Measure outside the transformed engine surface. Engine and bookmark checks remain sequential within Agent 2's lane. Combine both prototypes before accepting P2. |
| C | P3.1–P3.3: shell, cover, and shared controls | P4.1, then P4.2: canonical blocks, validation, fitting, and splitting | Requires P1 and all P2 gates, plus committed component/data contracts. Keep agreed typography and page geometry stable. Integrate the two lanes before P4.3. |
| Integration | Coordinator integrates P4.3, then P4.4 | Other agents review or prepare bounded checks | Compose openings and continuations, then prove reflow and fallback using the actual shell and engine. These are shared integration tasks. |
| D | P5.1–P5.3: navigation, history, jumps, focus, and input | P6.1–P6.3: profile, reading contents, work openings, and personal sections | Requires integrated P4 and agreed page-map/events. Agent 2 consumes navigation interfaces without changing them. Complete P6.4 annotations/credits after integrating both lanes and verifying layout-settled events. |
| E | P7.1: academic/content audit | P7.2–P7.4: engineering, accessibility, motion, and loading checks | Review the same integrated revision. Route fixes to their file owner and rerun affected checks. |
| Release | Coordinator handles P8.1–P8.3 in order | Independent review as needed | Requires P7 acceptance. Publish and record submission status only within the user's authorized scope. |

P1 and P2 are a useful initial split. Assigning every successive phase to a different agent at the same time would force later agents to guess unfinished interfaces. In particular, P4.3 needs both shell and pagination results, and P5 needs the resulting semantic page maps.

## Ownership and shared contracts

Before each wave, record the base commit, allowed files, acceptance criteria, and required handoff in a task brief under `resource/work/<phase>/<subphase>/`. Create only the brief needed for the current work.

| Area | Default owner |
| --- | --- |
| `package.json`, lockfile, Node files, root tool configs, `scripts/` | Coordinator or the exclusively assigned P2.1 agent |
| `src/app/`, `src/main.tsx`, shared tokens/global CSS | Coordinator unless exclusively transferred for a wave |
| `src/content/`, portraits, work images, doodles, source records | Content agent |
| Engine adapter, page leaf, bookmark/jump prototype | Engine agent during P2; transfer explicitly for P3/P5 |
| `src/lib/content/`, `src/lib/pagination/`, measurement helpers | Content-processing/pagination agent |
| `src/lib/navigation/`, navigation-specific hooks | Navigation agent |
| `tests/` | Each implementer owns named feature test files; coordinator owns shared test config |
| Main plan, `decisions.md`, `AGENTS.md` | Coordinator; workers write their own subphase handoff |

Directory ownership is a default. List exact exceptions before assigning tasks: two agents must not independently edit the same component, hook, stylesheet, or test file. Transfer ownership between waves instead of keeping broad permanent phase ownership.

Agree on the following interfaces before consumers work independently:

- Work IDs/slugs, Markdown paths, source references, and the six-answer schema.
- Stable semantic block IDs and ordered content, including consumed opening blocks.
- Page geometry, font readiness, and measurement inputs.
- Adapter commands/events, including turn completion, cleanup, and portrait/spread indexes.
- Semantic location to leaf/spread maps, reflow restoration, reduced motion, and layout-settled events.

Keep P2 contracts provisional until the prototypes provide evidence. Commit the accepted contracts before Wave C. Extend them only through a coordinator-reviewed change. No worker should invent a parallel content model or page-number convention.

## Branches, worktrees, and integration

Use a separate branch and worktree for each independent coding session, for example `work/p1-content` and `work/p2-foundation`. Start both from the same reviewed base. After a prerequisite merges, bring that accepted change into the dependent worktree before starting the next task.

Spawning a subagent does not by itself establish filesystem isolation. If agents share a checkout, give them disjoint file sets and let only the coordinator stage, commit, switch branches, or merge. Do not run competing dependency installs or repository-wide formatting in a shared checkout.

Each worktree needs its own dependency installation and build outputs. Once the lockfile exists, use `npm ci`. Do not copy `node_modules/` between worktrees. Assign distinct development ports, for example `npm run dev -- --port 5174`. Browser checks currently use fixed port 4173 and may reuse an existing server, so serialize them across worktrees until the coordinator configures separate matching server/baseURL ports. Otherwise a test could inspect another agent's build.

Before integration, each worker supplies:

1. Subphase, base revision, owned files, and resulting commit or scoped patch.
2. Accepted interfaces and a short account of changed behavior.
3. Commands run, pass/fail evidence, browser screenshots when applicable, and blocked checks.
4. Unresolved issues, out-of-scope findings, and the next dependent task.

The coordinator reviews scope, integrates one result at a time, runs checks against the combined application, and updates the phase record. A worker's passing isolated checks do not establish that the merged phase passes. Retain the main plan's P2 engine gate and P7 reading/accessibility requirements.

## Initial task briefs

### Agent 1: content preparation

> Implement P1.1–P1.3 from the main plan. Own `src/content/**`, `public/images/**`, `public/doodles/**`, and your handoff under `resource/work/P1/`. Read the master content and design directions. Preserve all five sections, seven works, six answers per analysis, and confirmed personal facts. Coordinate metadata shape before creating the registry. Hand off one complete analysis early for P2.4. Do not edit dependencies, application entry, routing, global styles, or shared plan files. Record missing assets honestly. Return your scoped changes, checks, and unresolved issues.

### Agent 2: foundation verification

> Complete P2.1 only. You have exclusive ownership of dependency manifests/lockfile, root tool configs, Node files, `scripts/`, `src/main.tsx`, `src/app/**`, and `src/styles/**` for this wave. Recheck registry access, resolve actual compatibility issues, install dependencies, retain the lockfile, and verify the selected font and a Sketchbook UI control. Preserve the notebook design and existing content documents. Run relevant checks and production preview. Record your handoff under `resource/work/P2/P2.1/`. Report blocked checks without marking the subphase complete. Wait for the shared contract/integration checkpoint before starting P2.2.

## Workflow references

OpenAI's [worktree guidance](https://learn.chatgpt.com/docs/environments/git-worktrees) describes isolated parallel coding sessions. Its [subagent guidance](https://learn.chatgpt.com/docs/agent-configuration/subagents) distinguishes focused delegation from coordination. The wave assignments and file ownership above are specific decisions for this repository.
