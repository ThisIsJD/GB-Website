# P2.3 Bookmark and Bounded-Jump Verification

Date: 8 November 2026. Status: **implemented and verified**.
Implementation commit: `c3bfbed`, `Implement Phase 2 notebook interaction prototypes`. Base: `d2d6b5f`.
Branch: `work/p2-prototypes`.
Worktree: `C:/Users/LENOVO/.codex/worktrees/8a5a/GB-Website`.

Phase 2, including P2.4, was approved by JD and committed on 8 November 2026. Integration and publication remain pending. Verification details below record the P2.3 checkpoint. See [the combined handoff](../README.md) for current whole-phase evidence.

## Implemented behavior

Five native bookmark controls use the exact section labels and the supplied bookmark colors. Their destinations are derived from the representative page map. Current state uses both a dot and an underline.

Wide layouts reserve space for the rail. The selected bookmark's covering region becomes partially transparent on hover or focus. The mask is restricted to the right paper face's outer 32 px and the selected control's vertical bounds, including a 6 px focus margin. The corresponding paper margin contains no writing. Other covering regions remain opaque, and the mask clears on exit or blur. This was inspected during real curls and shadows, not just on a static page.

The preferred transparency path passes, so it remains the default. The accepted 20 px slide fallback is also implemented and verified at `/prototype/book?reveal=slide`. No new approval is needed to select that fallback later if integration exposes a problem. Phones show all five labels above the book, without hover or overlapping writing.

Section jumps sample one turn for nearby destinations, two for middle distances, and three for far destinations. They use the engine's public flip and turn methods. The public configuration object's flipping time is 280 ms during bursts, restoring the ordinary 520 ms after each turn. No undocumented engine internals or external animation framework are patched.

Only one pending destination is retained. A new selection replaces it, and the controller re-evaluates at each safe completion boundary. A burst never exceeds three animated steps, including retargeting. It verifies the final visible destination and focuses its heading. Engine commands are serialized so bookmarks requested during ordinary turns wait safely.

Intermediate turns do not repeatedly update the live page announcement. Reduced motion performs one immediate final landing with zero physical turns. Focus waits until the new destination has been painted, which is necessary for an instant jump from previously hidden content.

## Measured evidence

The latest complete run measured:

| Distance                     | Physical turns | Desktop | Mobile |
| ---------------------------- | -------------- | ------- | ------ |
| Near, Student Profile        | 1              | 251 ms  | 221 ms |
| Middle, Favorite Masterpiece | 2              | 513 ms  | 428 ms |
| Far, Personal Reflection     | 3              | 741 ms  | 617 ms |

All are below the 1,400 ms ceiling. Raw metrics are in `.cache/evidence/p2.3-*.json`.

- **9 unit tests passed**, including replacement of 100 pending requests, retargeting at every completion boundary, cancellation, and reduced motion.
- **46 Chromium browser checks passed** across desktop/mobile, including all prior P2.1/P2.2 checks, five labels, reveal/restore, curl coexistence, newest-target landing, ordinary-turn handoff, heading focus, no-hover layouts, reduced motion, and the slide fallback.
- Theme, ESLint, strict TypeScript, and the production build pass.
- Hover, focus, and mid-turn screenshots were inspected under `.cache/screenshots/p2.3-*.png`.

## Issues found and resolved

The corner-only click guard in StPageFlip also blocks its programmatic backward flip in portrait mode. The adapter now leaves that guard off while keeping native mouse turns and corner hover off. Custom edge guards still protect selection and links. Added regression checks prove reverse turns to both a prior page and the cover in portrait/spread modes.

An instant turn updates the engine's page model before the destination becomes paint-visible. Deferring focus by one animation frame fixes focus for reduced-motion landings.

A controller stress test found reentrant startup could run before its active task was reserved. Startup is now scheduled after reservation, preserving the single active task and bounded pending state.

## Scope and next action

This prototype uses representative section leaves. Full portfolio content arrangement and route/history integration remain later phases. No claim is made that all five final portfolio sections are implemented here.

Next: P2.4, measure the complete Odyssey analysis with a longest-title case, long source URL, and oversized paragraph. Prove that text is conserved without clipping or font shrinking and that reflow restores the same semantic answer.
