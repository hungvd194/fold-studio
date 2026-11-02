# fold. — UI review

Date: 2026-11-02. Scope: current working copy, including changes not yet pushed to GitHub.

## Implementation follow-up

The findings below record the pre-change review. The subsequent implementation increases labels to 12px and secondary text to at least 11px, darkens text and primary actions, consolidates view controls, moves Export into the shared header, adds explicit auto-fit results, keeps a live phone preview, and gives tablet a two-pane layout. Flap and body controls use distinct names; drawing dimension labels remain upright. Main UI icons now share one SVG set. Mobile toolbar height measured approximately 67px after the change, compared with 134px before. Browser checks covered tablet, phone, short desktop, auto-fit/undo, flap changes, matching preview colors and unique SVG IDs. The 43 model tests passed; actual SVG/DXF/JSON exports of ten colored 55 × 90mm gift tags on A4 matched. Source lint has no FAIL findings; the remaining shadow warning applies only to floating View/Export popovers, an allowed overlay treatment. This is not a full accessibility certification.

## Original verdict

**6/10 — a recognizable paper-design tool, with substantial readability and workflow work remaining.** This is a qualitative review score, not an automated test score.

The warm paper canvas, terracotta cut lines, sage fold lines, actual template thumbnails and restrained Fold mark give the product an identity. The live dieline is the largest object and directly answers the editor's main question: “What will this paper design look like, and will it fit the selected sheet?” Desktop keeps the drawing, parameters and export action together. Shape dropdowns clearly identify the affected flap.

The current interface prioritizes fitting controls into a fixed viewport over making the most frequent tasks legible and immediate. Several recent fixes improve clipping but increase navigation depth. A viewport-contained interface still needs readable text, visible feedback and a short editing loop.

## Method

- Applied `design-taste-frontend` / `references/app-screens.md`, especially the screen question, fields, typography, contrast, phone and builder rules.
- Ran the skill's source linter: `node .../design-taste-frontend/scripts/lint.mjs --app dist`.
- Used the supported CUA browser to inspect screenshots, accessibility state and read-only DOM measurements at desktop, 768px tablet and 390px mobile widths. Desktop measurements include 1440×900; tablet/mobile interaction checks used 768×700 and 390×700. Also reviewed the native 1280×720 layout.
- Exercised width editing with automatic fitting, flap shape selection, and switching between Canvas and Settings.
- Did not run `inspect.mjs`: it launches a separate CDP-controlled browser; browser automation in this environment uses CUA. The measurements below are direct browser observations, not an `inspect.mjs` pass result.
- This is an evaluation, not a redesign. No new style draw, seed or source changes were made. `framed-sheet` is the closest reference direction; the existing palette and type should be retained and refined.

## Findings, in priority order

### P1 — Small, low-contrast text makes the tool harder to use

At 1440×900, 43 rendered HTML elements in the inspected state used text below 11px. This count includes nested labels and badges; it is not a count of unique controls. Template subtitles are 8px, sheet-fit status is 9px, several hints and summary captions are 10px. The skill specifies a minimum 11px for metadata and roughly 12–14px for labels.

Sample computed contrast ratios against the effective ancestor surface:

| Element | Size | Contrast |
| --- | --- | --- |
| Width label | 11px | 4.12:1 |
| Fits printable area | 9px | 3.82:1 |
| Dimension limit hint | 10px | 2.89:1 |
| Template subtitle | 8px | 3.10:1 |
| Body / panel size caption | 10px | 3.05:1 |
| White download text on terracotta | small button text | 4.23:1 |

These samples fall below the skill's 4.5:1 floor for ordinary text. Values use computed colors and background surfaces; disabled-state opacity is not part of this sample.

**Change:** use a controlled 12/14/18/24 type scale, make field labels and inputs readable first, darken secondary text, and darken the primary button slightly. Preserve the paper palette. Do not compensate by making the entire UI smaller.

### P1 — Auto-fit changes actual dimensions without explaining the result

Reproduction: open the default portrait envelope, enter Width = 800 and leave the field. The visible width becomes **274.122mm**, and height becomes **52.032mm**. The toast is empty. The existing `Auto-fit on` label remains unchanged.

Automatic fitting is explicitly requested and should remain. The problem is missing feedback about the scale and actual resulting dimensions. The visible `Auto-fit on` control is also a button that performs a fit action, rather than a toggle or a clear status indicator.

**Change:** show a persistent compact result such as “Auto-fit applied · 34.3% · body 274.122 × 52.032mm,” with an explanation that these are export dimensions. Keep one undo step for the edit and its automatic fit. Display auto-fit as a status or give its button a clear action name.

Source: `dist/app.js`, `keepDesignOnPaper()` and `renderDrawing()`.

### P1 — Mobile separates the edit from its result and hides the primary action

At 390×700, Settings replaces the canvas completely. Changing a flap or a dimension provides no visible preview until the user returns to Canvas. In Canvas, Download/Print are absent because they belong to the hidden settings pane. Tablet uses the same full-pane switch at 768px, despite having more width available.

**Change:** keep a compact export action in the shared shell. On mobile, use a settings sheet over a still-visible preview or provide a persistent small preview. Give tablet its own layout instead of treating it identically to a phone. Preserve a clear return to the full canvas.

Source: `dist/workspace.js`, workspace navigation; `dist/workspace.css`, the 850px breakpoint.

### P2 — Canvas chrome consumes too much vertical space

At 1440×900, the canvas tools alone occupy **106px**, in addition to the 2D/folded bar and title. At 390×700 they occupy **134px**, while the actual canvas is **279px** tall. `Sheet layout` gets a separate full-width row even when it is the only action on it.

**Change:** group paper size/orientation into one short row, move Grid/Snap/Handles/Dimensions into a labeled View menu, and integrate Sheet layout into the editing-mode selector. Keep fit status visible. Free height for the drawing rather than shrinking controls further.

### P2 — Navigation depth and repeated labels slow common tasks

The inspector has five main tabs, secondary segmented controls, and some remaining collapsible summaries. `Size → Dimensions` and `Shape → Dimensions` name different jobs with the same word. The header's Template library also duplicates the mobile Templates switch.

**Change:** use direct terms such as Body size, Flap outline, Flap dimensions, Background, and Paper & copies. Remove disclosure wrappers where a section is already isolated by tabs. Keep presets adjacent to body size through a compact selector. Eliminate duplicate navigation on small screens.

### P2 — Dimension annotations do not adapt to constrained drawings

After the wide-envelope auto-fit case, the rotated mobile drawing has very little space for dimension labels; annotations crowd the same narrow body. Labels remain tied to the design's orientation.

**Change:** move labels outside small panels, keep text upright where practical, and show selected dimensions only when labels cannot fit. The bottom summary can retain the complete measurements.

### P3 — Icon and surface consistency need a final pass

The skill source lint returned **7 FAIL occurrences** for character-based UI icons and **1 WARN** for a resting subtab shadow. The occurrences include heart, fit and check glyphs. These are consistency findings, not seven broken interactions. Character glyphs vary by platform and mix styles with the existing SVG brand mark.

**Change:** use one small SVG outline icon set and replace the subtab shadow with a neutral border or fill distinction.

## What to retain

- Fold mark and the warm paper / terracotta / sage identity.
- Real dieline thumbnails, live geometry and direct manipulation.
- Side-by-side desktop canvas and inspector.
- Shared actual-size measurements, recognizable cut/fold line semantics, and a strong export action.
- The newly separated setting sections where they reduce overflow; refine their naming and hierarchy.

## Rule exceptions and limits

- Dashed crease lines and margin guides are essential drawing semantics and should remain.
- Stock and artwork colors are document content, not excessive UI accent colors.
- Quiet borders and a fixed work surface are appropriate for an editor; unused inspector space should not be filled with decorative content.
- No animation floor applies to this app screen.
- No participant usability study was performed. This review combines the skill's heuristics with observed interactions and measured styles. It does not constitute a complete accessibility audit.

## Recommended implementation order

1. Establish readable type, contrast and consistent control sizing.
2. Reduce toolbar height and keep export accessible across views.
3. Add explicit auto-fit results and simplify control naming.
4. Improve mobile/tablet editing with visible preview feedback.
5. Normalize SVG icons and adaptive dimension annotations.

Acceptance checks: repeat desktop/tablet/mobile screenshots; retain viewport-contained controls at 560px height; verify preview/edit/export without searching through panes; verify auto-fit feedback against actual dimensions; rerun geometry, canvas, artwork and layout tests after implementation.
