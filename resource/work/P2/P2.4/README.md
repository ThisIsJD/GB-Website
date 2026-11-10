# P2.4 Measured Continuation Pages

Date: 8 November 2026. Status: **implemented and verified**.
Implementation commit: `c3bfbed`, `Implement Phase 2 notebook interaction prototypes`. Base: `d2d6b5f`.
Branch: `work/p2-prototypes`.
Worktree: `C:/Users/LENOVO/.codex/worktrees/8a5a/GB-Website`.

P2.1 through P2.4 are implemented and verified in this worktree. JD approved and committed Phase 2 on 8 November 2026 as recorded above. It has not been integrated into main, pushed, or deployed. Stop before Phase 3.

## Review locally

Run `npm.cmd run dev` in this worktree, then open:

- `http://127.0.0.1:5174/`: cover and selected Sketchbook UI control.
- `/prototype`: readable handwriting sample.
- `/prototype/book`: physical engine, five bookmarks, reveal and bounded jumps.
- `/prototype/analysis`: complete measured analysis and reflow controls.

The analysis route starts with the longest work title, **Voice Out of the Whirlwind, Job 38**. The Odyssey is also available. Both Markdown fixtures match their source blobs in approved Phase 1 commit `e4f79eb` exactly. This copies only prototype fixtures, without merging Phase 1 or changing its canonical content.

Enable **Include a long reading exercise** to append an explicitly identified synthetic exercise with an oversized paragraph and an unbroken example source address. The six original answers remain untouched. **Larger handwriting** uses 24 px text and 40 px line height.

## Implementation

Supported Markdown headings and paragraphs become ordered blocks with answer anchors and Unicode code-point ranges. Inline emphasis and complete link destinations survive safe splitting. Whole paragraphs stay together when they fit a fresh leaf. Oversized paragraphs use a bounded search for fitting prefixes, preferring word boundaries. Answer headings stay with the beginning of their writing. Unsupported structures fail explicitly rather than silently disappearing.

Measurement waits for the locally bundled handwriting font, then renders the actual `PageLeaf` in an inert, hidden, offscreen React root. Measurement and engine share `src/styles/leaf.css`, geometry, headers, padding, and footers. It measures DOM space rather than estimating from character count. Exact final footer sizes are checked again. The measurement root is removed on completion, failure, and cancellation.

Leaf composition runs outside engine animation. Debounced container changes abort stale measurements and rebuild the disposable engine document. The current answer, block ID, and offset map to the new leaves instead of reusing an obsolete page number. Covers and an optional balancing leaf preserve the engine's spread model. Explicit navigation focuses the visible page heading. Reduced motion uses instant positioning.

Font failure, measurement timeout, or engine failure exposes the full original writing as normal selectable HTML. Readers can also select that view immediately.

## Verification

`npm.cmd run check` passes theme consistency, ESLint, **14 unit tests**, strict TypeScript, and the production build. `npm.cmd run test:e2e` passes **54 Chromium checks** across desktop and mobile, including all P2.1 through P2.3 regressions.

P2.4 checks compare actual rendered characters and order against full-reading output, allowing only Markdown whitespace normalization. Source ranges are contiguous without gaps or duplication. Every visible writing leaf is checked for vertical clipping, horizontal overflow, header/footer overlap, orphan headings, and unchanged font size.

For Job plus the long reading exercise:

| Viewport | Writing leaves | Body size |
| -------- | -------------- | --------- |
| 320 px   | 15             | 19 px     |
| 390 px   | 15             | 20 px     |
| 768 px   | 14             | 20 px     |
| 1024 px  | 10             | 20 px     |
| 1440 px  | 10             | 20 px     |

Counts exclude covers and balancing leaves. Tests cover short 320 by 568 screens, single/spread layouts, restoration of answer 6 and a split-paragraph offset, 24 px writing, the Odyssey, real curls/shadows, heading focus, and failed font/engine recovery. A 320 px intrinsic select-width defect was found and fixed without hiding overflow.

Metrics: `.cache/evidence/p2.4-pagination-*.json`.
Inspected screenshots: `.cache/screenshots/p2.4-*.png`.
The ignored Playwright HTML report holds the final complete suite. Formatting and Git whitespace checks are recorded in the plan.

## Limits and next action

This is a Phase 2 proof, not the complete portfolio. Canonical seven-work integration, lists/quotations/source-entry pagination, decorated openings, final section routes/history, printing, annotations, and hosting remain later phases. Only desktop/mobile Chromium was exercised, not physical devices or other browser engines. The static engine HTML needs hosting verification in P8.

The approved Phase 2 implementation commit and subject are recorded in the plan. Ready for separately requested integration and combined checks. Do not begin Phase 3, merge Phase 1, push, or publish as part of this handoff.
