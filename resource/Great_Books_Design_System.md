# My Literary Journey: Design System

Version 1.0. Prepared for John Daniel P. Labing on 8 November 2026.

This is the visual and interaction reference for JD's Great Books notebook. It turns the agreed concept into reusable colors, type sizes, spacing, component rules, and motion settings. It supports the existing implementation plan and website writing.

**Design direction:** a personal school notebook, carefully arranged and easy to read.

Companion files:

- [Reusable design tokens](Great_Books_Design_Tokens.json).
- [Visual reference sheet](Great_Books_Design_Reference.png).
- [Implementation plan](https://chatgpt.com/library?file_id=libfile_a1d5b66696a08191929fd26d24e1fa6b&account_id=personal).
- [Website content](https://chatgpt.com/library?file_id=libfile_aabf58a9bf5081918b9b039212592127&account_id=personal).

## 1. Design principles and boundaries

| Principle | How to apply it |
| --- | --- |
| Personal | Use the burgundy cover, small JD label, hand-drawn book, and code-bracket sticker |
| Tidy handwriting | Keep body writing straight, readable, and consistent |
| Physical notebook | Use warm ruled paper, a visible spine, crease, page edges, and soft shadows |
| Quiet surroundings | Let the notebook stand out against a plain warm-gray surface |
| Meaningful decoration | Tie art and margin notes to the work being discussed |
| Clear navigation | Keep five section bookmarks and a seven-work contents page |
| Comfortable reading | Add pages rather than shrinking text or omitting an answer |
| Restrained motion | Use paper turns and small control responses, with an immediate reduced-motion option |

The cover and behavior are already agreed. Values such as precise color shades, font sizes, and spacing below are the design system's implementation defaults. Adjust a value only for a demonstrated reading or technical problem, then update the tokens and this document together.

The content document controls wording. The implementation plan controls scope, phases, and navigation. This document controls visual treatment and component states. If a visual rule would hide required writing, preserve the writing and add pages.

## 2. Color system

### Main colors

| Token | Value | Use |
| --- | --- | --- |
| `color.cover.main` | `#762B3B` | Burgundy cover, primary action, selected emphasis |
| `color.cover.spine` | `#54202C` | Darker bound edge |
| `color.cover.stitch` | `#B77482` | Small decorative stitch or cover detail |
| `color.surface.canvas` | `#E8E4DE` | Quiet background |
| `color.surface.paper` | `#FBF5E8` | Reading leaves and light text on burgundy |
| `color.surface.paperEdge` | `#E9DFCD` | Layered paper edges |
| `color.surface.note` | `#F5E8BD` | Occasional paper note or tape |
| `color.surface.photo` | `#FFFDF7` | Physical photo border |
| `color.text.main` | `#2F2926` | Body writing, titles, bookmark labels |
| `color.text.secondary` | `#655B55` | Metadata, captions, sources |
| `color.line.rule` | `#CBD4D9` | Faint decorative rules at 55% opacity |
| `color.line.functional` | `#87796E` | Functional control edges |
| `color.focus` | `#304F6A` | Keyboard focus outline |
| `color.annotation.highlight` | `#E8CE72` | Restrained marker stroke behind ink |

Main text never uses the faint rule color. Burgundy links keep a visible underline. Cover text uses warm ivory. Texture must not weaken these pairings.

### Five bookmark colors

| Section | Fill | Accent stroke | Label |
| --- | --- | --- | --- |
| Student Profile | `#DBC0C6` | `#762B3B` | Main ink |
| Literary Analyses | `#D0D4BE` | `#5D6549` | Main ink |
| Favorite Masterpiece | `#E7D6AD` | `#7B5B27` | Main ink |
| Summary of Learning | `#C9D6DC` | `#48616F` | Main ink |
| Personal Reflection | `#DBCCDE` | `#715777` | Main ink |

The colors identify sections, not success/error meanings. Mark the current section with an ink dot and a short drawn underline as well as its color.

### Feedback

Use `#923F43` on `#F5E3DF` for a failed reading destination or asset notice. Use `#466444` on `#EDF1E4` only when a successful action actually needs a message. Pair feedback with words. The portfolio does not need decorative success badges.

### Computed contrast

The following are computed sRGB contrast ratios for the specified opaque colors:

| Pair | Ratio |
| --- | --- |
| Main ink on paper | 13.18:1 |
| Secondary ink on paper | 6.08:1 |
| Burgundy on paper, or paper on burgundy | 8.87:1 |
| Focus blue on paper | 7.88:1 |
| Main ink on the five bookmark fills | 8.44:1 to 9.97:1 |
| Functional edge on paper | 3.87:1 |

WCAG's minimum for ordinary text is 4.5:1. These chosen text pairs exceed that value. Faint rules and texture are decoration. This calculation is not a full accessibility audit. Check the rendered states again after overlays, opacity, or backgrounds change.

## 3. Typography

### Family and style

Use **Patrick Hand**, regular weight 400, as the first implementation choice. It keeps the selected neat-handwriting direction without introducing a different font for every type of note.

Self-host the font, retain its SIL Open Font License, and load it before final pagination measurements. Use a readable cursive fallback while loading. If loading fails, remeasure with the actual fallback font and keep the full-reading view available.

Use one handwriting family for the cover, body, controls, notes, and source text. Change size and spacing to show hierarchy. Do not depend on synthetic bold or italic to create hierarchy. A real bold element in Markdown can use size, burgundy ink, or an underline while preserving its semantic meaning.

### Type scale

| Role | Desktop | Phone | Line height |
| --- | --- | --- | --- |
| Cover title | 48 px | 36 px | 1.1 |
| Section heading | 36 px | 30 px | 1.2 |
| Work title | 32 px | 28 px | 1.2 |
| Numbered answer heading | 24 px | 22 px | 1.35 |
| Body | 20 px | 19 px | 34 px desktop, 32 px phone |
| Margin note | 22 px | 20 px | 1.5 |
| Controls | 20 px | 19 px | 1.25 |
| Sources and captions | 18 px | 18 px | 1.6 |
| Page numbers | 18 px | 18 px | 1.25 |

These are default CSS sizes at the normal text setting. Increasing browser text size must trigger more pages or a simpler layout, not clipping.

### Writing rules

- Left-align body text and allow a natural right edge.
- Wrap long work titles. Do not force them onto one line.
- Keep paragraphs level, with a body measure near 30 to 50 characters on notebook leaves.
- Use clear gaps between answers, with a heading kept beside its first paragraph where possible.
- Use dark readable text for sources. Long links wrap within the leaf.
- Keep short notes visually distinct through placement, not a tiny font.
- Use simple B1 to B2 English in website copy, with no em dashes or semicolons.
- Explain a literary term when it is introduced.
- Label original margin notes as notes, not quotations from a literary work.

Test “Les Misérables,” “Ma’am Raquel,” “pagtinarabangan,” and the complete title “Voice Out of the Whirlwind” before approving the font/layout pairing.

## 4. Space, shape, and materials

### Spacing scale

Use these values in pixels: **4, 8, 12, 16, 24, 32, 40, 48, 64**.

| Use | Default |
| --- | --- |
| Icon to label | 8 px |
| Related control gap | 8 to 12 px |
| Label to writing | 12 px |
| Related blocks | 16 to 24 px |
| Major groups | 32 to 40 px |
| Desktop canvas padding | 24 px minimum |
| Phone canvas padding | 16 px |
| Desktop inner leaf margin | 44 px, protecting the crease |
| Desktop outer leaf margin | 32 px |
| Desktop leaf top/bottom | 40 px / 48 px |
| Phone leaf sides | 20 px |
| Phone leaf top/bottom | 28 px / 48 px |

The bottom reserve includes page number/control clearance. Decorative elements do not borrow the reading margins.

### Edges and strokes

| Element | Value |
| --- | --- |
| Cover corner radius | 10 px |
| Reading-paper corner radius | 2 px |
| Control corner radius | About 6 px with a small hand-drawn variation |
| Photo corner radius | 1 px |
| Doodle/control stroke | About 1.5 px |
| Keyboard focus | 3 px solid outline, 3 px offset |
| Decorative rule | 1 px at 55% opacity |

Use one slight irregularity per control edge. Avoid heavy doubled outlines around every block. A decorative rough line must not change hit areas or text measurement.

### Material recipes

**Cover:** burgundy matte surface, darker spine, a restrained inset seam, and a small edge highlight. Texture opacity starts near 2.5%. The label and two stickers are separate details with breathing room.

**Paper:** warm ivory, faint horizontal rules matched to the current body line height, and very light texture. Position the first body baseline to suit the rule rhythm. Headings and photos can interrupt the rules naturally.

**Binding:** a narrow central crease with a soft gradient extending about 24 px into each leaf. Keep text outside it. On phones, show a slim bound edge without creating a false second page.

**Notebook shadow:** `0 24px 56px rgba(47, 41, 38, 0.16), 0 5px 14px rgba(47, 41, 38, 0.10)`.

**Photo:** warm off-white frame, wider bottom border, short caption, and `0 4px 10px rgba(47, 41, 38, 0.14)` shadow. Rotation is optional and limited to 3 degrees.

**Note:** muted paper fill, short ink sentence, subtle `0 2px 5px rgba(47, 41, 38, 0.10)` shadow. Rotation is limited to 2 degrees. A reflection paragraph itself stays level.

## 5. Layout rules

### Notebook size

| Setting | Default |
| --- | --- |
| Preferred reading leaf | 440 by 620 px |
| Minimum leaf width in a spread | 340 px |
| Maximum leaf width | 480 px |
| Desktop bookmark rail | 176 px |
| Full-reading content width | Up to 680 px |

Leaf dimensions are starting geometry. The layout can adjust within the readable limits. A short viewport may scroll around the notebook. Do not apply a global scale transform to force the whole book into view.

### When to use a spread

Start spread evaluation at a usable region of **904 px**. This allows two 340 px leaves, a 176 px rail, and two 24 px outside margins. Use the measured container and actual font to decide. If text cannot fit comfortably, switch to a single leaf.

### Phone layout

- Use one leaf, 16 px canvas padding, and 20 px reading inset.
- Put a clear “Sections” control beneath the leaf beside page navigation.
- It opens an in-flow paper panel containing the five full section names.
- Use the same bookmark colors and order.
- Each item is at least 44 px tall.
- Opening the panel moves focus to its first link. Escape or selecting a link closes it and restores focus appropriately.
- The panel is not a modal and does not trap focus.
- The inside title/menu also lists every section.
- A phone does not need to imitate a cramped desktop rail.

Phone and desktop may have different page counts. A semantic answer ID preserves the current place.

### Layers

Keep one isolated notebook root. Separate the surface/shadow, paper stack, bookmark rail, decorative paper strip that covers the tab, current flip surface, annotations, and focused controls.

The reveal effect fades the **decorative covering paper strip**, not the paragraph ink or the whole notebook. It suggests that the upper pages become transparent while avoiding a confusing stack of readable text. Validate this with the engine in P2. If it fails, use the approved outward-sliding bookmark.

Annotations belong to the visible leaf and must travel with it. Focus outlines and labels must not be clipped by the cover, rail, or crease.

## 6. Component specifications

### NotebookCover

Content: “My Literary Journey,” subtitle “A Great Books Digital Portfolio,” small JD label, hand-drawn book, and small code-bracket sticker.

The opening action is one keyboard-operable button. Keep section links outside that button so interactive elements are not nested. Opening leads to the inside title/menu. Direct work links bypass this state.

### SectionBookmark

| Property | Rule |
| --- | --- |
| Label | Full required section name |
| Width | 176 px total |
| Height | At least 52 px, allowing two-line labels |
| Under-paper portion | About 32 px |
| Gap | 8 px between targets |
| Slide fallback | Up to 20 px outward |
| Meaning | A real section link with an accessible name |
| Current state | Ink dot, underline, and appropriate current-location semantics |

Show an exposed tab edge at rest. Hover or keyboard focus reveals the full name. The inside menu provides a fully written alternative at all times. Never make an unknown icon the only way to identify a section.

### PageControls

Use labeled “Previous page” and “Next page” controls with hand-drawn arrows. Target size is at least 44 by 44 px with an 8 px gap. Put the page count between or beside them.

On the first/last leaf, show a clearly unavailable control and prevent activation. Preserve its place so controls do not jump around. Page counts follow the current pagination result.

### DrawnButton and TextLink

Use Sketchbook UI where it fits the selected appearance. Override through a small wrapper rather than restyling each instance separately.

| State | Button | Text link |
| --- | --- | --- |
| Rest | Paper fill, ink label, one rough functional edge | Burgundy ink and underline |
| Hover | Lift up to 2 px, slightly firmer shadow | Drawn underline becomes clearer |
| Pressed | Return to baseline, reduce shadow | Maintain underline |
| Keyboard focus | Solid focus outline, no dependence on hover | Solid focus outline |
| Disabled | Muted, stationary, not activatable | Render unavailable text rather than a misleading link |

The main cover action may use burgundy fill and ivory text. Supporting actions stay paper-and-ink. No glowing effects, large bounce, or animated tilt on writing.

### ReadingContents

Use an ordered handwritten list of the seven works, not seven generic cards. Each entry shows title, author/attribution, and main lens. Optional page numbers must be generated from the current page map, never hard-coded.

Keep all seven entries reachable. Add a contents continuation leaf if necessary.

### AnalysisHeading and AnswerBlock

The opening carries the work title, author or traditional attribution, and lens label. Number the six answers consistently. The layout may vary, but the reading order remains 1 through 6.

A heading belongs with its first lines. Longer answers continue naturally. Never turn an entire answer into a screenshot to simplify pagination.

### PhysicalPhoto and Illustration

Use JD's actual portrait for the profile. During development, a photo placeholder must be labeled as a placeholder. Do not invent a portrait.

Photos can have a paper frame or tape. Illustrations use one or two ink/accent colors. Use culturally appropriate images with source records. If an illustration is generated, describe it honestly in credits.

Decorative images receive empty alternative text. Meaningful images receive a short description. Credits remain readable text.

### MarginNote and AnnotatedText

A margin note is usually one short sentence, around 6 to 16 words. Use the actual notes in the content file. On a narrow leaf, move it below the relevant answer rather than squeezing it into a tiny side column.

Limit Rough Notation to one or two marked phrases per visible leaf. Use underline for a key idea, circle for a short word, bracket for a short group, and highlight for a brief phrase. Keep ink legible. Marks animate once after layout settles, then remain still.

### Recovery and loading states

| State | Presentation |
| --- | --- |
| Fonts/pages preparing | Paper surface, “Arranging the pages…” and immediate full-reading access |
| Missing work | “This page is not in my notebook.” plus “Open the reading list” |
| Optional image failure | Keep the reserved frame and a short unavailable-image caption |
| Page engine failure | Show the complete writing in full-reading mode |
| Reflow | Preserve the current work/answer and avoid a false page number until the new map is ready |

## 7. Page compositions

Each work has a decorated opening, followed by simpler continuation pages. A spread is a layout choice, not a promise that all writing fits in two leaves.

| Work or section | Composition | Main visual or note |
| --- | --- | --- |
| Profile | Portrait and introduction | Real photo, interests note |
| Job 38 | Quiet question-led opening | Small whirlwind/stars, humility mark |
| Panchatantra | Illustration with linked notes | Doves, mouse, problem/choice/result |
| Mahabharata | Facing duties | Separate duty/family notes, chariot detail |
| Iliad | Scene and response | Priam and Achilles, compassion note |
| Odyssey | Journey map | Ship, route toward Ithaca, goal note |
| Tale of Genji | Letter and note | Poetry slip, fan or seasonal branch |
| Les Misérables | Object and reflection | Two candlesticks, second-chance note |
| Favorite | Personal journey spread | Odyssey reference plus career preparation |
| Learning | Organized observations | Small lens doodle, connected notes |
| Reflection | Quiet reading | Reader-Response emphasis and closing note |

The source text is consumed once across openings and continuations. Do not repeat a paragraph just because it appears in both layout templates.

## 8. Motion system

| Motion | Default | Rule |
| --- | --- | --- |
| Button/link feedback | 140 ms | Small change, no bounce |
| Paper-strip transparency | 180 ms | Only the relevant decorative covering region |
| Bookmark slide fallback | 200 ms, up to 20 px | Reveal the same full label |
| Cover opening | 650 ms | One clear opening movement |
| Ordinary page turn | 520 ms | Engine-driven curl with shadow |
| Annotation | 420 ms | Once per settled visible leaf |
| Section burst | Aim near 1,000 ms, maximum 1,400 ms | Up to three suggested turns |
| Reduced motion | 0 ms | Immediate destination and static marks |

Use `cubic-bezier(0.22, 1, 0.36, 1)` for simple CSS responses. Let the engine control the physical turn path instead of adding a second competing rotation.

Burst count suggests distance. It does not represent every intervening page. The controller keeps the newest request and lands accurately. Do not add another animation library just to reproduce these small effects.

Page geometry and font measurements settle before annotation or turning. A resize cancels/settles a transition at a safe point, rebuilds the map, and restores the semantic position.

These are motion targets. The engine integration still needs the implementation plan's P2 checks.

## 9. Access and readability rules

- Use real HTML text with a logical heading order.
- Keep all five sections and seven works available without hover or gestures.
- Use at least 44 by 44 px targets for project controls. This is a project choice, not a claim that every WCAG criterion requires 44 px.
- Keep focus visible through cover, paper, and bookmark layers.
- Do not communicate current state only through color.
- Keep hidden engine clones out of the focus order and accessibility tree.
- Allow text selection and normal document scrolling.
- At larger text settings, reflow and add pages. Never cut text off at a leaf boundary.
- Keep full-reading mode on the same content and routes.
- Provide a complete source-order print view.
- Respect reduced motion for every decorative effect.
- Recheck text contrast after texture, shadows, and annotations are applied.

## 10. Libraries and implementation handoff

| Part | Tool or approach |
| --- | --- |
| Hand-drawn controls | Selected Sketchbook UI components behind local wrappers |
| Cover, paper, spine, crease, tabs, photo treatment | Custom CSS and simple local SVG shapes |
| Highlights | Rough Notation |
| Small doodles | Selected permitted Oreo Doodle SVGs or original simple vectors |
| Paper movement | StPageFlip/react-pageflip, still conditional on P2 |
| Automatic pages | The project's measured content/pagination system |
| Font | Self-hosted Patrick Hand with its license |
| Shared values | Companion JSON tokens |

Import the JSON into a small theme mapping or generate CSS custom properties from it. For example, `color.cover.main` maps to `--color-cover-main`. Keep the mapping mechanical. This JSON is a project-owned token file, not a claimed Figma or third-party interchange format.

Keep user content, layout metadata, and design tokens separate. Sketchbook UI does not become the content or pagination system. PlopUI remains a reference for subtle button behavior. No extra CMS or backend is introduced.

Suggested additions to the planned repository:

| Path | Purpose |
| --- | --- |
| `resource/design-system.md` | This reference |
| `src/styles/tokens.json` | Companion design tokens |
| `src/styles/theme.css` | Generated or mapped custom properties |
| `src/components/ui/` | Small wrappers applying shared component rules |
| `public/fonts/patrick-hand/` | Selected font and SIL license |
| `resource/design-reference.png` | Visual direction sheet |

## 11. Acceptance checklist

- [ ] Cover is burgundy with exactly the three selected personal details.
- [ ] Body, controls, headings, and notes use neat handwriting.
- [ ] Ink remains clear over ruled paper and highlights.
- [ ] Tab labels match the five exact section names.
- [ ] Desktop reveal works with focus as well as hover.
- [ ] Phones have a labeled section menu without hover.
- [ ] The book has a spine, center crease on desktop, and restrained shadow.
- [ ] All six answers stay complete and readable in each analysis.
- [ ] Openings vary, while continuation pages stay calm.
- [ ] Real portrait and image/font credits are present.
- [ ] No decoration overlaps the reading or focus areas.
- [ ] Font/image changes trigger correct pagination.
- [ ] Bounded turns, deep links, reflow, and reduced motion pass actual browser checks.
- [ ] Full-reading and print views contain the same complete writing.
- [ ] Tokens, reference sheet, and implementation use the same values.

## 12. References and validation limits

- [Patrick Hand on Google Fonts](https://fonts.google.com/specimen/Patrick+Hand).
- [Patrick Hand SIL Open Font License](https://github.com/google/fonts/blob/main/ofl/patrickhand/OFL.txt).
- [W3C: Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
- [W3C: Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- [Sketchbook UI](https://github.com/SarthakRawat-1/sketchbook-ui).
- [Rough Notation](https://roughnotation.com/).
- [StPageFlip](https://nodlik.github.io/StPageFlip/).
- [Oreo Doodle Icons](https://doodle.oreoui.com/).

The reference sheet is a static visual specification, not a working website or a screenshot of tested engine behavior. The palette ratios are computed. The actual font was used to render the sheet. Responsive, motion, and accessibility behavior must still be verified during implementation.

