# fold.

A visual dieline editor for custom packaging, envelopes, and print-ready layouts. Built as a static web app for Vercel. Designs and uploaded artwork stay in your browser; there is no backend or account system.

## Run locally

Run `npm start` (or `node serve.cjs`) and open http://127.0.0.1:4381. No build or package installation is required.

## Deploy to Vercel

Import this GitHub repository in Vercel. The included `vercel.json` serves `dist` directly, with no build command. Browser storage is specific to each domain; export a JSON backup to transfer existing local designs to the hosted app.

## Workspace

The editor fits the browser viewport. The 3D preview and mode-switch bar have been removed to enlarge the canvas; Undo, Redo and Fit view sit beside the design title. Arrange tools live in their own inspector tab. Desktop keeps the template library, live canvas, and inspector side by side. Body, Flaps, Artwork, Paper, Arrange, and More tabs group the settings. Export in the shared header provides SVG, DXF, and Print / Save PDF from every view. Long settings scroll inside the inspector without moving the canvas. Tablet shows the canvas and inspector side by side, with Templates as a separate view. Phone screens switch between Templates, Canvas, and Settings; a live miniature preview stays visible above the phone inspector. View groups the grid, snapping, handles, and dimension overlays. Main controls use 12–14 px text with darker secondary labels and SVG icons.

## Custom flap shapes

Open **Flaps** to choose **Trapezoid** or **Rectangle** independently for the top, bottom, left and right flaps of envelopes and trays. Boxes and bags expose top closure flaps, bottom closure flaps and the glue tab; each closure choice applies to its matching pair of main flaps and side dust flaps. Rectangle keeps the full outer edge with square corners; Trapezoid uses the existing chamfer. Changing a shape preserves body dimensions, flap lengths and fold edges. Artwork remains clipped to the updated outline. Choices are included in undo/redo, saved designs, presets, JSON, SVG, DXF and printing. Older designs retain their original trapezoid outlines. Pillow closures and tag shapes keep their existing numeric controls.

## Custom dimensions

### Multiple copies on one A4 sheet

Open the **Arrange** tab in the right inspector to place multiple copies of the current design on a fixed paper size. Auto paper switches to A4 on entering this mode. The **Arrange** tab explains its tools and exposes **Duplicate**, **Rotate 90°**, **Remove**, and **Fill sheet**, plus copy selection, position, angle, gap and reset. Selecting Body, Flaps or Artwork returns to design editing; returning to Arrange preserves the stored sheet arrangement. **Duplicate** adds the selected copy in a free position; **90°** rotates the selection; the **Copies on sheet** panel also accepts arbitrary rotation angles and precise X/Y positions. Drag a copy or use arrow keys to move it (Shift = 10 mm, Alt = 0.1 mm). Ctrl+D duplicates, R rotates, and Delete removes a copy. Each completed operation can be undone.

**Fill sheet** fills the printable area with a grid at the existing physical dimensions, using the configured gap and optional 90° rotation. It compares row orientations, including mixed row bands, and caps output at 200 copies. It is a conservative bounding-box layout, not irregular-shape nesting. For example, ten 55 × 90 mm gift tags fit on portrait A4 with 5 mm margins and 3 mm gaps when rotated.

Copies share one template, dimensions, background colors, and image artwork. **Edit design** returns to the single-design editing view while retaining the stored sheet arrangement; entering Sheet layout again restores it. Changes to dimensions affect all copies and may require refilling the sheet. Red bounding boxes flag overlap, insufficient gaps, or outside margins. SVG/DXF export and printing are blocked until the arrangement is valid.

SVG and Print / Save as PDF include every placed copy at actual size, with a shared embedded master for images/colors. DXF includes transformed cut/crease lines and holes for every copy. JSON, presets, and saved designs retain all copy positions and rotations; older settings migrate to a single design. Sheet orientation, margins, and custom paper sizes continue to apply.

### Interactive canvas and A4 frame

New templates start on an A4 sheet (210 × 297 mm). The canvas shows the actual selected paper, a dashed margin, optional 10 mm grid, and a live printable-area fit indicator. Paper size and portrait/landscape controls are available directly above the canvas. Automatic fitting scales the active geometry down when necessary and displays the applied percentage and resulting body size; **Center paper** changes only the viewport. Designs automatically shrink proportionally when they exceed the printable area of fixed paper. This applies to template selection, dimension/shape edits, imported settings, margins and paper changes. Actual dimension fields update to match the exported size; smaller designs are never enlarged. Auto paper instead grows to the design. In sheet layout, rotated copies are sized to fit the paper and positions are clamped inside margins; overlap warnings still require rearranging copies. Extremely small sheets may be unable to accommodate minimum valid geometry and remain blocked from output.

Drag the circular handles to resize the body or individual flaps. The parameter panel updates live. Snap is 1 mm by default; disable Snap for continuous dragging or hold Alt for 0.1 mm. Drag an empty area to pan, scroll to zoom around the pointer, and double-click the background to center. Each completed resize is one undo step; Escape cancels a drag.

Select a handle to reveal a small number editor on the canvas. Double-click a handle or press Enter to focus it. Tab can focus handles; arrow keys adjust the selected parameter (Shift = 10 mm, Alt = 0.1 mm). Aspect lock and geometry validation also apply to direct manipulation. View controls, handles, margins and the grid are excluded from vector exports and printing.

- Body width/height: 1–5,000 mm, with decimal input. Depth/wall height for boxes, bags and trays: 1–2,000 mm.
- Millimeters and inches use the same internal millimeter values; switching units does not round the saved geometry.
- Lock the width/height ratio, swap width and height, reset a template, or scale all active geometry parameters together. Paper size and stock thickness stay fixed when scaling.
- Envelope: independent top/bottom/left/right flaps and corner chamfer.
- Box/bag: independent top/base flaps, glue tab, and tab chamfer. Bag gusset folds are included.
- Tray: wall height and chamfer. The open tray has no glue tabs; tape corners for a prototype.
- Pillow box: closure curve rise and glue tab. Curves are sampled into line segments for consistent SVG and DXF output.
- Tag: shoulder chamfer, hole diameter, and hole offset. Set diameter to 0 for no hole.
- Clearance is added to each side of the body/panel. The summary shows the resulting panel size, flat dieline bounds, and export sheet size separately.
- Undo/redo tracks committed edits and design operations. Keyboard: Ctrl+Z / Ctrl+Shift+Z outside text fields.

## Keeping designs

### Image backgrounds

Each target also has **Image / Solid color** options. Solid color works for the whole dieline or independently for each component, so colors and images can be mixed across parts. Choose a native color picker, a quick swatch, or a HEX code (`#RRGGBB` or `#RGB`), and adjust opacity. Image fit/position controls are hidden for color fills. Switching back to Image retains an existing image reference and its placement; no upload is required for color-only designs. Colors persist in saved designs and JSON and are rendered as clipped vector fills in SVG/PDF printing. DXF continues to contain cut/crease geometry only. The toolbar now labels the shared selection tool **Background**.

Open **Background image**, or click **Image tool** above the canvas. Upload or drop a PNG, JPG, or WebP (up to 20 MB). Images are processed entirely in the browser, resized to a maximum 1,600 px edge, and stored in this browser's IndexedDB. Nothing is uploaded to a server.

- **Whole dieline:** one continuous image clipped to the entire cut outline, including flaps.
- **By component:** an independent image for each main panel, flap, side panel, or glue tab. Click a component on the canvas or choose it from the Component menu. Unassigned parts retain the stock color.
- Cover, Contain and Stretch control the fit. Scale, opacity, rotation and horizontal/vertical offsets are independent for each target. The two modes retain their own settings when switching.
- In Image tool mode, drag to reposition and scroll over a part to scale its image around the pointer. Ctrl+scroll zooms the canvas instead. Arrow keys nudge a selected part's image. Turn Image tool off to use the geometry resize handles again.
- **Use whole-dieline image for every component** assigns the same source with an independent fit in each part. **Remove image** unassigns the current target; undo can restore it. Resetting body dimensions retains artwork.

Saved designs and size presets keep image references locally. JSON exports embed all referenced images, including the inactive mode, so the backup is portable. Import accepts older settings without images. SVG embeds each used source once and clips its instances to the correct components; Print / Save as PDF includes artwork. DXF remains a cut/crease geometry export and does not embed raster images. The editor uses a 2D dieline view; the phone inspector includes a live miniature of that same drawing.

If browser storage is unavailable or full, the app reports it and keeps the image for the current session; export a JSON backup before leaving.

Named custom sizes and saved designs use browser localStorage. Export/import a versioned JSON settings file for an editable backup or transfer between browsers. Previously saved designs are migrated on opening. No settings are sent to a backend.

## Export and printing

Choose Auto, A4, A3, Letter, or a custom sheet with margins. Fit checks account for a 90° rotation. Oversized pages are blocked from export/printing until a fitting sheet is selected. Invalid dimensions preserve the last valid preview and block output.

SVG uses physical `mm` width/height and millimeter coordinates. DXF declares millimeter units and uses CUT/CREASE layers. Both apply the selected sheet margins and rotation. Print / Save as PDF uses the browser print dialog: use **100% / actual size**, no browser-added margins, and a matching paper size. Printers and browser dialogs can override the CSS paper request; check a measured edge first.

These are starter dielines for paper prototypes, not certified manufacturing files. Stock thickness is recorded but does not automatically compensate the geometry. The 3D preview has been removed. Test fit and assembly with the actual material before production.

The UI requests DM Sans from Google Fonts and falls back to sans-serif without a connection. The editor, saved designs and exports run locally.

## Validation

Run `npm test`. Tests cover independent flap sizes, exact bounding boxes, cut-line crossings, large decimal sizes, invalid inputs, hole placement, pillow curves, sheet fit/rotation, snapping, aspect locks, rotated drag coordinates, valid drag boundaries, complete component coverage, image fitting, clipping, transforms, deduplicated backups, and supported image sources. `node tests/create-artwork-fixtures.cjs` creates small synthetic PNGs for upload QA.

Original references: https://www.diecuttemplates.com/ and https://diecutmaker.com/design/portrait-envelope.
