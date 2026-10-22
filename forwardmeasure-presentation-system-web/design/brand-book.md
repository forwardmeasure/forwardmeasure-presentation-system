Kriyagentic is ForwardMeasure's agentic evidence-intelligence platform, built on forwardmeasure-openworkflow and forwardmeasure-entity-intelligence. It turns unstructured evidence into accountable knowledge about people, organisations, assets and activity. It serves anti-human-trafficking investigation, banks (KYC, AML, sanctions, perpetual KYC), wealth and private banking, asset managers (fund intelligence), insurers, corporates, legal teams and journalism. This system is its visual and verbal language. The colours come from Sanzō Wada's *A Dictionary of Color Combinations* (配色総鑑, *Haishoku Soukan*, 1933–34), built on his **combination 243**: Slate Color, Ivory Buff, Raw Sienna and Olive Green.

> Our findings show their working. A model can produce a score; only an evidence chain makes it defensible to a prosecutor, a regulator or an investment committee.

## Principles

1. **Show the working.** Every finding opens to the preserved source and the exact page, span or cell behind it. Never display a conclusion without a route to its evidence.
2. **Keep kinds of knowing apart.** What a source states, what it alleges, what the platform derived, what a model predicted and what a person decided each have their own colour band, line style and word (see Evidence status). Nothing moves between bands without a recorded decision.
3. **The model proposes; a person decides.** Agent proposals and model outputs never look like approved findings. Approvals always name the approver and the policy version.
4. **Uncertainty is a state, not a gap.** Unresolved candidates, conflicting assertions and insufficient evidence are shown explicitly, never hidden or averaged away.
5. **Protect people first.** Sensitivity labels, quarantine and redaction placeholders are part of the interface, not an afterthought. Nothing invites re-identification.

## Voice and content

- Write plainly and exactly, in British English (organisation, analyse, categorise, colour). Define a specialist term the first time it appears ("Tracking error shows how far a fund's returns stray from its index").
- Say what kind of statement something is, every time: "The registry states…", "The filing alleges…", "Selfsame resolved…", "The model predicts (0.81)…", "Approved by A. Analyst under policy KYC-7 v3". Never upgrade an allegation to a fact in copy, a heading or a summary.
- Describe findings as warranting review, never as conclusions about people: "Relationships that warrant specialist attention", not "Trafficking detected". Use "indicators" (for example ILO forced-labour indicators), "possibly affected person" and "subject". Never use "victim", "trafficker", "criminal" or "suspect" in interface copy; those are legal determinations.
- Show both clocks where time matters: "Effective 3 Mar 2025 · recorded 12 Apr 2026" (valid time, then record time).
- Probabilities appear as two-decimal values next to the word that says they are model output: "Predicted · 0.81". Keep confidence measures separate and named (extraction, resolution, relationship, model probability); never combine them into one score.
- Write agent names (Custodex, Indexical, Selfsame, Chronoscope, Nexograph, Emergraph, Populens, Exposcope, Veristate, Shockpath, Deconflux, Narratrace, Statebound, Safegress) as plain proper nouns, with no special colour or icon. They are working names and have not yet been trademark-screened.
- Use Title Case for interface labels: page and card titles, headings, buttons, tabs, menu items, form labels, table headers, section names, status words, tooltips and tags ("Create Reference Population", "Screening Threshold", "Rows per Page", "Pending Review"). Capitalise every word except articles, coordinating conjunctions and prepositions of three letters or fewer (a, an, the, and, but, or, nor, for, of, to, in, on, at, by, per, via), which stay lower case unless they come first or last. Capitalise both parts of a hyphenated word ("Case-Derived"). Identifiers, keys, codes and units keep their own form (`worldcheck-premium`, CSV, gs://).
- Sentences stay sentences: body text, help text, descriptions, loading and empty-state explanations, errors and toast details are written in sentence case with a full stop.
- No emoji, no exclamation marks, no "AI magic" language.

## Colour

**The interface palette (combination 243)**

| Role | Token | Light | Dark | Wada source |
|---|---|---|---|---|
| Paper | `surface` | `#fbf7e9` | `#111110` | White + Ivory Buff (No. 42); warm charcoal in dark |
| Ink | `ink` | `#1b3644` | `#fbf7e9` | Slate Color (No. 156) |
| Accent | `accent` | `#b85e00` | `#c8803a` | Raw Sienna (No. 14) |
| Second hue | `secondary` | `#58771e` | `#b3c07a` | Olive Green (No. 79) |

- Set text in `ink` on `surface`, `surface-raised` or `surface-sunken`. Use `ink-muted` for secondary text on the same grounds. Both hold 4.5:1 in both themes.
- `accent` is for action, not meaning: one primary button per view, the selected tab or row, the current step of a workflow run. Put `on-accent` on it. Never use `accent` to mark a finding's status.
- Use `accent-text` for links. `secondary` is the second chart series and supporting illustration; pair it with `on-secondary`.
- Separate regions with `line` hairlines, not shadows. Controls use `line-strong`, which meets 3:1.
- A hovered or keyboard-highlighted row, option, menu item or quiet button takes `surface-hover`; a selected row takes `accent-soft`. A primary button on hover takes `accent-hover`, still under `on-accent`.
- `scrim` veils the page behind a modal Dialog and is used nowhere else.

**Evidence status.** These bands are the platform's most important visual distinction. Each status always shows three things together: its colour, its line style (on graph edges and in the status badge) and its word. Colour alone never carries the meaning. The band colours are deepened and softened steps of the brand palettes: terracotta from Etruscan Red, glaucous grey-teal from its cool end, khaki from Deep Grayish Olive and green from Oil Green.

| Band | Token | Statuses | Line style | Example copy |
|---|---|---|---|---|
| Evidence (slate) | `evidence` | OBSERVED, ASSERTED, reported | solid | "Registry states" |
| Allegation (terracotta) | `allegation` | ALLEGED, DENIED | long dash | "Filing alleges" / "Subject denies" |
| Platform-derived (glaucous) | `derived` | RESOLVED, DERIVED, screening hit | short dash | "Resolved by Selfsame" |
| Model (khaki) | `model` | INFERRED, PREDICTED, agent proposal | dotted | "Predicted · 0.81" |
| Human decision (oil green) | `verified` | HUMAN_VERIFIED, approved | double | "Verified by A. Analyst" |
| Rejected | `rejected` | REJECTED, superseded | solid, struck through | "Rejected" |

- Text in each band colour holds 4.5:1 on `surface`, `surface-raised` and its own `-soft` tint in both themes. Use the `-soft` tint as the chip background.
- The bands are muted on purpose and close in lightness, so they are told apart by hue, line style and word together. Never drop the word.
- Rejected findings stay visible, struck through. Never delete or hide them.
- Contradictions are a signal, not an error: show a conflict as a group of the competing assertions, each in its own band, under a `warning` "Conflicting" label. Show unresolved or insufficient evidence with a dashed `line-strong` outline and the words "Unresolved" or "Insufficient evidence".

**Sensitivity and safety.** `sensitive` marks victim data, data about minors and special-category data. It is an inverse slate banner or chip (paper on slate, slate on paper in dark), told apart by its solid form, the lock icon and the label text rather than an alarm colour. `quarantine` draws the hatched panel that stands in for content Safegress has withheld, with a solid label in the middle; never render a thumbnail, excerpt or file name inside it. `redaction` draws redacted spans as solid bars with their placeholder label ("redacted person 17"). Untrusted content (possible prompt injection) is an outlined chip in `line-strong` with the words "Untrusted content".

**Operational status.** `danger` (Carmine Red / Vinaceous Cinnamon), `success` (Dusky Green / Rainette Green), `warning` (Orange Citrine / Yellow Ocher) and `info` (neutral slate) are for system and workflow states: failures, completed runs, budgets nearing limits, notices. They are never evidence statuses. Each is readable as text on surfaces and as a fill under `on-status`, and always carries a word or icon.

**Data visualisation.**
- Categorical series: `chart-1` to `chart-5` in order (Raw Sienna, Slate, Olive Green, Antwarp Blue, Vistoris Lake). Label series directly. Beyond five series, group the rest into "Other".
- Magnitudes such as exposure, concentration and thematic purity use the sequential scale `seq-1` to `seq-5` (sienna). Light grounds run light to dark; the dark theme reverses it so high values stay bright.
- Divergence from a reference, such as Narrative Drift (stated strategy against holdings) or regime stress against a baseline, uses `div-neg-2` … `div-mid` … `div-pos-2`: glaucous below, slate at the midpoint, sienna above.
- Model probability uses `conf-1` to `conf-5` (khaki, the model band's hue), only for model outputs, so a confidence colour always reads as "a model said this". Evidence has no confidence colour.
- Every chart mark links to the claims behind it.

**Focus.** Every interactive element shows a 2px solid `focus` ring at a 2px offset (Helvetia Blue in light, Salvia Blue in dark), at least 3:1 on every surface. `focus` is never used for anything else.

**Ramps.** `slate-*`, `sienna-*` and `olive-*` are perceptually even ramps, interpolated in the OKLab colour space between real Wada colours. `terracotta-*`, `glaucous-*`, `khaki-*` and `oil-*` are built the same way from the three brand palettes and carry the evidence bands. Semantic tokens alias them. Reach for a ramp step only when no semantic token fits.

## Brand palettes

Three palettes carry the brand outside the product: covers, decks, marketing pages, segment-pack collateral and illustration. Each one is Haishoku Soukan's perceptually even interpolation of a Wada combination, kept as seven OKLab steps from its named colour (step 1) to its lightest (step 7).

| Palette | Tokens | Range | Wada source |
|---|---|---|---|
| Deep Grayish Olive | `grayish-olive-1` … `-7` | `#635a3a` → `#ebd3a2` | Combination 343 (Burnt Sienna, Ivory Buff, Deep Grayish Olive) |
| Etruscan Red | `etruscan-1` … `-7` | `#c55347` → `#bce4e5` | Etruscan Red with Light Glaucous Blue (combination 152) |
| Oil Green | `oil-green-1` … `-7` | `#819238` → `#f5ecc2` | Combination 320 (Oil Green with Sulpher Yellow) |

- Compose a piece from ONE palette, with `ink` and `surface` as its neutrals. Two palettes may meet only where one piece is split into clearly separate panels.
- Lead with a large field of the step 1 colour and build depth with its lighter steps. Steps are even, so skipping one gives a clear second tone (1, 3, 5, 7).
- Text sits on these colours only as each token's note allows: white on `grayish-olive-1` and `-2`; `ink` on `grayish-olive-5`–`7`, `etruscan-4`–`7` and `oil-green-3`–`7`; anything else is for 24px+ display type or no text.
- Never use a brand palette token directly to mean an evidence status, a sensitivity label or a UI state (the band tokens are built for that), and never in charts of real data (use `chart-*`, `seq-*`, `div-*` and `conf-*`). Etruscan Red in particular must not stand in for `danger`.
- Inside the product, brand palettes appear only in empty states, onboarding and sign-in illustration.

## Graphs

- Node shape shows entity type, not colour: person = circle, organisation = square, account = rounded rectangle, asset = hexagon, location = diamond, event = small bar, document = page with a folded corner. Nodes are `surface-raised` with a 1.5px `ink` outline. Redacted placeholders use a dashed outline and their placeholder label.
- Edge colour and line style come from the evidence band. Label each edge with its relationship and, for model edges, the probability ("POSSIBLY_CONTROLS · 0.81").
- Selecting a node or edge opens its claims, each with its source span, band and decision history.

## Typography

- Headings and controls use **Roboto**: `display`, `title` and `heading` at 500, `subheading` at 700, and `label` (buttons, tabs, form labels, table headers, status chips) at 500.
- Everything you read uses **Didact Gothic** (`body`, `body-sm`, `caption`). It has a single weight, so never bold it; when text needs emphasis, set it in Roboto `label` or `subheading` instead.
- Use `code` for identifiers, hashes, DIDs and token names, and `data` for aligned figures in tables, both in **IBM Plex Mono**. Show hashes truncated in the middle (`sha256:9f2c…41ab`), with the full value on copy.
- Quoted source text is set in `body` inside a `surface-sunken` well (warm parchment grey) with a 2px `line-strong` rule on the left and its citation underneath in `caption`.
- The fonts are bundled, never loaded from Google at run time, so every app works offline and in closed networks. This system carries Roboto 500/700, Didact Gothic 400 and IBM Plex Mono 400/500 (Latin) in `fonts/`, under the SIL Open Font License 1.1 (texts in `licenses/`). Apps install the same families from `@fontsource/roboto`, `@fontsource/didact-gothic` and `@fontsource/ibm-plex-mono`, which carry every script subset, and reference them only through `--font-display`, `--font-sans` and `--font-mono`.

## Space, shape and depth

- Space comes in steps of 4px: `space-1` (4) through `space-8` (64). Pad cards with `space-4`, separate groups with `space-5` and sections with `space-7`.
- Corners stay nearly square: `radius-sm` for chips, badges and swatches, `radius-md` for buttons, inputs and cards, `radius-lg` only for dialogs and popovers.
- Depth is flat. `shadow-raised` belongs only to things that float (menus, popovers, dialogs). Cards sit on `line` hairlines.

## Interface components

Every app on the platform (Entity Intelligence Studio, OpenWorkflow Studio, the Operations dashboard and Agent OS Studio) builds its screens from these components, so the apps look and behave as one product. They were added beyond the evidence components because all four apps draw the same frame and controls: the app shell (TopBar, ThemeToggle), actions (Button, IconButton, OutputActions), forms (Field, TextField, TextArea, Select, SearchableSelect, Checkbox, Radio, Switch), data (Table, Pagination, Card, KeyValueList, IdentifierValue, Tabs, Tag), feedback (OperationalStatus, Banner, Toast, Loading, EmptyState, ErrorState) and overlays (Dialog, Menu, Tooltip, Drawer).

- Each component is plain HTML with `kg-` classes from this system's stylesheet, so React, MUI-based and plain pages all use the same markup. Behaviour (keyboard handling, focus, opening and closing) belongs to the app and follows the ARIA pattern each component's guidelines name.
- Every app has one TopBar, offers both themes through ThemeToggle ("Match System" by default), and signs out from the account menu.
- Controls are 32px high by default (`kg-btn--sm` and `kg-iconbtn--sm` in tables and toolbars, `kg-btn--lg` only on sign-in and empty states), labels are Roboto `label`, and what people type or read is Didact Gothic at `body-sm` (14px).
- States look the same everywhere: hover `surface-hover`; selected tab or section a 2px `accent` underline; selected row `accent-soft`; chosen checkbox, radio or switch `accent`; invalid a `danger` border with the message below; disabled `surface-sunken` with `ink-muted` text; focus the `focus` ring.
- Roles, categories, keywords and source kinds use Tag: one neutral look, never a state or an evidence status.
- System and workflow states use OperationalStatus (pending, running and cancelled are info; succeeded is success; failed is danger; degraded is warning) in every app. How a claim is known is a StatusBadge; the two never stand in for each other.
- Errors from an API show its problem in plain words with the correlation ID, never a stack trace (ErrorState, Banner).
- Every read-only output (JSON, logs, error details, a Problem's detail, raw task or extraction data) carries OutputActions: Copy and Download, in the same place and the same words in every app.

**Ready for more than one brand.** Brands other than Kriyagentic will come later; build so that adding one changes tokens and names, not components.

- Components and app screens use role tokens only (`surface*`, `ink*`, `line*`, `accent*`, `secondary*`, `focus`, the status, band and safety tokens, `chart-*`, `seq-*`, `div-*`, `conf-*`). Never reference a ramp step (`slate-*`, `sienna-*`), a brand palette or a `wada-*` colour in a component or screen.
- Never write the platform name, product name, logo or a brand colour into a component. Pass names and the logo in (the TopBar takes them as content); each brand keeps its logo files in its own Logos group.
- Set type only through `--font-display`, `--font-sans` and `--font-mono` and the type styles, never a family name.

## Iconography and marks

The Kriyagentic logo is a planet inside a ring, in the colours of combination 243: an Ivory Buff planet (paper in the dark theme), a Raw Sienna ring and the name in Slate Color. The name is set in Roboto 500 and converted to outlines, so the files need no font. The ring is one continuous ellipse: it passes behind the planet at the top and in front of it at the bottom. In the mark, its near side runs behind the name, crossing the lower half of the letters, and a hairline in the planet's colour keeps each letter whole where it crosses. In the symbol and the lockup, the ring stays clear of the lettering so it holds at small sizes. The files are in the Logos group, each in a light and a dark version:

- **Mark** (`kriyagentic-mark-*`): the name across the planet. Use it on covers, the sign-in page, splash screens and documents, at 96px or larger.
- **Symbol** (`kriyagentic-symbol-*`): the planet, the ring and a single "k". Use it for favicons, app icons and avatars, and in the TopBar's logo slot, down to 16px.
- **Lockup** (`kriyagentic-lockup-*`): the symbol followed by the name. Use it in page headers, decks and documents, at 24px high or more. It already contains the name, so never place it next to the name set as text.

Use the light files on light grounds (`surface`, paper) and the dark files on dark grounds (the dark theme's `surface`, charcoal). Keep clear space of at least half the planet's diameter around every form. Never recolour, outline, stretch, rotate or re-set the logo, and never add a tagline to it. The name is lowercase inside the logo; in copy it is always "Kriyagentic".

Icons come from **Lucide** (lucide.dev, ISC licence; text in `licenses/`), the one icon set for every app: simple outlines at a 1.5px stroke in `ink` or `ink-muted`, 16px beside text and in controls, 20px in larger controls, 32px in empty and error states. React apps use `lucide-react` with `strokeWidth={1.5}`; anything else inlines the SVG with the `kg-icon` class. A lock marks sensitivity, a check marks human verification and chosen options, `circle-alert` an error, `triangle-alert` a warning, `circle-check` success, `info` a notice and `loader-circle` work in progress; the Icons card shows the core set by name. Icons are decorative (`aria-hidden`): a word or an `aria-label` always carries the meaning. No emoji and no second icon set.

## The Wada reference palette

`wada-NNN-name` holds all 157 dictionary colours at their printed values (for example `wada-014-raw-sienna`). Each token's usage note lists the combinations it appears in; the full list is in the Combinations section. Use them for illustration and marketing, taking colours from ONE combination at a time, and keep Wada's own names and spellings ("Cerulian Blue", "Antwarp Blue"). Never use a reference colour to mean an evidence status.
