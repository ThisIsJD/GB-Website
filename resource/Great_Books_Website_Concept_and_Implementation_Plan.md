# My Literary Journey: Concept and Implementation Plan

Prepared for John Daniel P. Labing. Updated 8 November 2026.

Build a personal Great Books portfolio that feels like opening JD's own bound notebook. A burgundy cover opens into ruled paper, neat handwriting, short reading pages, illustrations, physical-photo-style images, and personal notes. Five side bookmarks lead to the required sections. Page turns bend and curl with moving shadows.

This plan replaces the earlier generic website and book-card concept. It records the agreed decisions and gives the implementation order. The website and its integrations have not been built or tested under this plan.

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
| Current state                                   | Application scaffold prepared. Dependency installation and P2.1 verification await registry access |
| Remaining personal asset                        | JD's actual photograph, to be added in the codespace                              |
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

### P1. Prepare content and inputs

**P1.1 Import decisions and writing**

- Put both documents in `resource/`.
- Populate the seven works, favorite, class information, and lens choices.
- Preserve the six-answer structure and slightly longer personal reflections.

**Done when:** the inventory has all five sections and seven complete analyses matching the companion file.

**P1.2 Prepare sources and assets**

- Convert the source list into linked per-work metadata.
- Keep edition distinctions, including Job's KJV, the Genji excerpt, and Butler's character names.
- Add JD's photo when supplied and record credits for actual selected illustrations.
- Keep the development portrait placeholder identifiable until replaced.

**Done when:** citations and asset records are present, with the missing photo recorded as a release task.

**P1.3 Check personal and academic accuracy**

- Check the six points per analysis and all five overall reflection topics.
- Confirm The Odyssey as favorite and Reader-Response as most influential.
- Apply requested writing changes without rewriting unrelated sections.

**Done when:** the content checklist passes and personal claims match JD's answers.

### P2. Prove difficult interactions before decoration

**P2.1 Establish compatible dependencies**

Initialization outcome: the application scaffold, dependency manifest, folder structure, and development/check configurations are prepared. Registry access is blocked, so installation, the lockfile, build, and preview remain pending. See [implementation decisions](decisions.md) for evidence and the next action. This subphase is not yet complete.

- Create a minimal React TypeScript Vite project.
- Verify Sketchbook UI's maintained installation, styles/theme, license, and selected controls.
- Install compatible core packages and Tailwind's supported Vite integration.
- Record the Node version/lockfile and evaluate handwriting with real text.

**Done when:** production build and preview show one readable page and usable hand-drawn control without runtime errors.

**P2.2 Test the physical engine**

- Wrap react-pageflip behind an adapter using the documented page-reference pattern.
- Test hard cover, soft curl, shadows, portrait/spread, and programmatic jumps.
- Test mount/cleanup and content replacement with both changed and unchanged page counts.
- Verify links, writing selection, gestures, and normal phone scrolling.

**Done when:** a browser demonstrates stable turns and rebuilds without stale pages or duplicate engine instances.

**P2.3 Test bookmark reveal and jump bursts together**

- Use representative leaves and five targets.
- Prove bounded near/middle/far jumps with accurate landing and newest-target handling.
- Try transparency inside the transformed paper/shadow layers.
- Use the accepted slide-out fallback if transparency fails.
- Test focus, no-hover phone use, and reduced motion.

**Done when:** the actual reveal and jump methods work together and their implementation is recorded in decisions.

**P2.4 Prove measured continuation pages**

- Use a real analysis, longest title, long source URL, and oversized paragraph.
- Create multiple readable leaves without shrinking handwriting.
- Change width and restore the same answer after reflow.

**Done when:** single-page and spread layouts lose or clip no text. This gate comes before full decoration.

### P3. Build shell and shared controls

**P3.1 Establish the visual foundation**

- Define colors, handwriting, rules, margins, shadows, and tab tokens.
- Build the quiet surface, cover, spine, crease, and paper-edge stack.
- Check contrast and long-paragraph reading before adding art.

**Done when:** the undecorated notebook is recognizable and readable.

**P3.2 Build personalized entry**

- Add the exact title/subtitle and three personal cover details.
- Implement open/close and inside title/menu.
- Support keyboard opening and direct destinations that skip the closed cover.

**Done when:** the homepage exposes all five sections through clear actions.

**P3.3 Finish navigation controls**

- Add tested bookmarks, active state, page arrows, and labels.
- Add restrained button hover/press feedback.
- Reserve room for tabs and focus indicators.

**Done when:** pointer, keyboard, and phone readers can identify and use every control.

### P4. Implement content and pagination

**P4.1 Build canonical content blocks**

- Define typed sections, works, blocks, sources, images, and layout metadata.
- Parse supported Markdown into stable ordered blocks.
- Disable raw HTML and validate unique slugs, missing references/assets, and six-answer completeness.

**Done when:** notebook and full-reading views derive from the same ordered writing.

**P4.2 Implement fitting and splitting**

- Match measurement geometry/styles to real leaves.
- Wait for fonts/images with controlled failure handling.
- Implement fitting, heading grouping, list handling, long-link wrapping, and safe oversized-block splitting.
- Test conservation of text/order and progress when a block is too tall.

**Done when:** each block appears once in order, with no endless pagination loop or clipping.

**P4.3 Join decorated openings and continuations**

- Give each opening a layout key and consumed-block record.
- Paginate unused content afterward.
- Map sections, works, answers, leaves, and spreads, including covers/balancing leaves.

**Done when:** every answer is reachable without duplicate opening paragraphs.

**P4.4 Add reflow and readable fallback**

- Rebuild for meaningful size/font/image/text-scale changes.
- Restore the semantic block and refresh maps before navigation resumes.
- Provide full-reading and print views.
- Recover to complete text if the engine fails.

**Done when:** resizing preserves the current work/answer and all text is available without animation.

### P5. Connect routing and interaction

**P5.1 Implement one navigation controller**

- Connect routes to section/work blocks and current page maps.
- Add deep-link recovery, previous/next work, and return-to-contents.
- Coordinate history and engine events without route loops.

**Done when:** pasted URLs, refresh, Back, and Forward reach the correct content.

**P5.2 Integrate bounded jumps**

- Calculate direction/distance and apply the P2 mechanism.
- Keep the newest target, settle safely before reflow/unmount, and restore normal turns.
- Update active tab/page count and announce the final destination once.

**Done when:** repeated clicks and reverse jumps finish at the requested location without long queues.

**P5.3 Finish access and input behavior**

- Test deliberate swipes, short taps, scrolling, text selection, and keyboard controls.
- Keep hidden leaves and engine clones out of focus/accessibility order.
- Focus the destination heading after explicit navigation without disrupting ordinary reading.
- Respect reduced motion across cover, turns, bursts, and annotations.

**Done when:** readers can use the full portfolio without mouse or animation.

### P6. Arrange the portfolio

**P6.1 Complete profile and contents**

- Add exact personal/class details, introduction, interests, and experience.
- Place the actual portrait when available.
- Build handwritten contents with all titles, authors, main lenses, and direct links.

**Done when:** profile requirements are covered and all seven works are easy to find.

**P6.2 Arrange seven distinct openings**

- Follow the companion file's visual directions.
- Vary art placement, notes, spacing, and emphasis while retaining all numbered answers.
- Credit selected pictures and never label generated fiction as an archival photograph.
- Allow as many readable continuation pages as needed.

**Done when:** openings are distinct and every analysis is complete at phone and desktop sizes.

**P6.3 Complete personal sections**

- Give the Odyssey favorite its own personal treatment.
- Use organized notes for learning and quiet paragraphs for reflection.
- Keep Reader-Response prominent in the overall reflection.
- Add margin notes without duplicating body copy.

**Done when:** all five required sections contain the actual reviewed drafts.

**P6.4 Finish annotations and credits**

- Add a few Rough Notation marks after font/layout readiness.
- Reposition or clean up marks during reflow/unmount.
- Include only used SVG assets.
- Add local media/font credits and per-work sources.

**Done when:** highlights align after turns/resizing and all external material is acknowledged.

### P7. Review the completed notebook

**P7.1 Check the assignment**

- Verify five sections, exactly seven works, six answers per work.
- Check attributions, source locations, favorite discussion, learning, and five reflection topics.
- Check simple English, respectful culture/religion wording, and confirmed personal facts.
- Compare rendered text with the content source.

**Done when:** no required content has been omitted or changed by layout.

**P7.2 Run focused engineering checks**

- Run TypeScript, lint, content validation, relevant unit tests, and production build.
- Run browser checks for deep links, accurate landing, repeated jumps, and resize restoration.
- Avoid tests that merely mirror decorative implementation.

**Done when:** the relevant checks pass without unresolved reading/navigation defects.

**P7.3 Review real reading and access**

- Inspect about 360 px, 390 px, tablet, desktop, short viewports, and increased text size.
- Check long titles/URLs, crease space, page edges, continuations, photo replacement, and loading failures.
- Use keyboard-only navigation, reduced motion, and screen-reader labels/order.

**Done when:** no clipped text, sideways overflow, unreadable labels, or focus on hidden pages remains.

**P7.4 Check motion and loading cost**

- Keep measurements separate from animation.
- Start with the modest real page set and optimize only demonstrated problems.
- Size/compress images, preload only needed fonts, and avoid blocking text on optional art.
- Confirm bounded transitions and no growing engine/annotation instances.

**Done when:** the notebook stays responsive and loading cannot hide required writing indefinitely.

### P8. Deploy to Vercel and prepare submission

**P8.1 Connect source and hosting**

- Commit source, writing, lockfile, and asset credits.
- Connect GitHub to Vercel using the Vite setup.
- Use the build script, `dist` output, and documented SPA rewrite.
- Review a preview deployment.

**Done when:** hosted section/work URLs open and refresh correctly.

**P8.2 Verify the production link**

- Publish the reviewed revision on the stable production domain.
- Check signed-out instructor access and all five sections, seven works, media, and source links.
- Replace the development portrait with JD's real photograph.

**Done when:** the shared production URL exposes the complete reviewed portfolio without an account prompt.

**P8.3 Record release and submission status**

- Record production URL, commit, final checks, and any minor limitation.
- Confirm the deadline in Google Classroom.
- Mark the chosen seven works on the score sheet if required.
- JD submits the published link through the designated assignment.

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

