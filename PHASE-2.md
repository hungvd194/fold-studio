# Phase 2 — Easy Mode

Status: IMPLEMENTED — awaiting browser acceptance on `phase-2-easy-mode`.

## Objective
Help a first-time user choose a template, enter final body dimensions, optionally decorate, and export/print while keeping the existing Canvas large and preserving all Advanced Mode settings.

## Implemented
- One compact 38px navigation row; no additional stacked header.
- Easy/Advanced switch with browser-local preference; design state is shared.
- Four-step beginner workflow with contextual explanations and a Next action.
- Steps target the existing template library, Body, Artwork, and Paper/Export controls.
- Mobile steps switch to the correct workspace view.
- Hide advanced-only inspector tabs in Easy Mode; switching back from Advanced selects a visible tab.
- Preserve physical dimensions and Phase 1 safety checks.
- Automated safety/geometry/artwork/layout/step-navigation tests in CI.

## Acceptance
- [x] Beginner steps are implemented and linked to real controls.
- [x] Easy/Advanced uses one design state; no geometry mutation in mode script.
- [x] Compact shell layout and keyboard-operable native buttons.
- [x] Node regression tests added and CI enabled for Phase 2.
- [ ] Verify on actual desktop and mobile browsers: no clipping, readable inspector, full canvas.
- [ ] Verify template → size → artwork → export manually, including backup and paper overflow.
- [ ] Test with novice users before claiming unassisted success.

Do not merge until browser acceptance is complete.
