# Phase 3 — Visual Guidance

Status: IMPLEMENTED — pending CI/browser acceptance.

## Goal
Show a clear, accessible 2D illustration of the assembled product and guide a beginner through cutting, scoring and folding, without changing the physical dieline or occupying permanent Canvas space.

## Delivered
- Dedicated 2D assembled illustration for envelope, box, tray, bag, pillow box and gift tag.
- Template-specific instructions for all eight built-in templates.
- Interactive step-by-step guide with Previous, Next and numbered step controls.
- Accessible SVG label and current-step markers; responsive layout within existing dialog.
- Honest illustration disclaimer: not a dimensional 3D simulation or a substitute for a physical paper prototype.
- Node regression coverage of all templates, immutability and script order.
- Chromium desktop/mobile smoke checks for opening the preview and stepping forward/backward.

## Release gates
- [x] All template kinds supported.
- [x] Step-specific SVG preview and text.
- [x] No design-state mutations.
- [x] Compact, optional modal that does not shrink Canvas.
- [ ] CI Node and Chromium checks pass on final commit.
- [ ] Confirm the illustrated folds with real paper prototypes during Phase 4/6.

This guide is intentionally schematic, not an exact folded geometry renderer. Geometry-accurate 3D/assembly simulation would be a separate capability.
