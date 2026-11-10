# P1.1: Import decisions and writing

Base revision: `d2d6b5ff229e243e49f8638c12fd2ce6a7ea6f84`.
Branch: `work/p1-content`. Checkout: `.worktrees/p1-content` beneath the main workspace.

Implement all of Phase 1 in this checkout, beginning with P1.1. Leave changes uncommitted until JD approves the entire phase. The separate Phase 2 session owns dependencies, configuration, app composition, styles, and engine prototypes.

## Ownership

Own `src/content/**`, `public/images/**`, `public/doodles/**`, and `resource/work/P1/**`. Do not edit shared application files, dependency inputs, the main plan, or implementation decisions. Phase status and proposed integration notes belong in the Phase 1 handoff for the coordinator to apply.

The main checkout's uncommitted `AGENTS.md`, implementation plan, and new parallel-work document were copied into this checkout as instruction snapshots. They are inherited user changes, not Phase 1 deliverables. The two authoritative planning/content documents already exist in `resource/`.

## Acceptance

- Five exact required section labels and seven ordered works.
- Six complete answers per analysis, with the longer reflection preserved.
- Exact class details, The Odyssey as favorite, and Reader-Response as the most influential lens.
- Exact writing conserved against `resource/Great_Books_Website_Content.md`.
- One complete real analysis available to the Phase 2 agent early.

## Provisional content contract

`src/content/works.ts` exports ordered metadata with stable `id`/`slug`, title, attribution kind/name, main/supporting lens, and `contentPath`. Paths are relative to `src/content/`. A missing supporting lens is `null`, never visible “None selected” copy. `src/content/sections.ts` exports the five section IDs and exact labels in required order. `src/content/profile.ts` and `notebook.ts` hold confirmed facts and UI copy.

Markdown holds reading prose and original margin/closing notes. Analysis headings retain the six numbered question labels. Metadata does not duplicate answer text. P1.2 will link source IDs to edition and URL records without putting implementation instructions into the writing.

This is an input contract for P2 prototypes. It does not define canonical block IDs, engine indexes, pagination maps, or final opening layouts. Those require the later shared checkpoint.
