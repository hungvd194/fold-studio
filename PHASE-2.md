# Phase 2 — Easy Mode

Status: IMPLEMENTED — Chromium desktop/mobile smoke test included; release pending final CI.

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
- [x] Automated Chromium desktop/mobile smoke test checks step navigation, uncaught exceptions, and desktop Canvas height.
- [ ] Manual physical print, image persistence and paper overflow verification (tracked under Phase 4 Print Confidence and Phase 6 user validation).
- [ ] Test with novice users before claiming unassisted success (Phase 6).

Phase 2 focuses on the beginner editor flow; physical print accuracy and formal novice usability acceptance remain later-phase gates.
