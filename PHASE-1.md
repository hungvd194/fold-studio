# Phase 1 — Safety & Trust

Status: IN PROGRESS. Work is isolated on `phase-1-safety-trust`; do not merge without verification.

## Implemented
- Removed implicit proportional geometry shrink from the canvas render path. Physical dimensions must remain as entered.
- Updated fit labels to communicate actual-size preservation. Existing export guards reject sheets that do not fit.

## Acceptance and regression tests (pending execution)
1. Select A4; enter a width that cannot fit. Confirm entered width/height remain unchanged, paper status warns, SVG/DXF/print are blocked.
2. Select A3 or Auto paper. Confirm unchanged physical dimensions and valid export at 1:1 millimeter scale.
3. Change flap sizes, stock, paper orientation, margins, template, and layout; confirm no implicit size changes.
4. Confirm undo/redo restores user edits correctly; verify saved designs, JSON import/export and presets.
5. Run `npm test` and `node tests/verify-export.cjs` with real exported SVG/DXF/JSON.
6. Test desktop, tablet, mobile; check all warning states and inaccessible controls.

## Additional implementation (CI checks running)
- User-invoked fit-to-paper now confirms the old and new physical dimensions before applying.
- Debounced local draft snapshot and opt-in recovery on reload; saved designs are excluded from draft prompts.
- Sheet overflow panel with one-click Auto paper option, preserving physical dimensions.
- Browser-only storage disclosure and portable backup/restore labels.
- GitHub Actions workflow runs the Node test suite on branch updates; safety regression tests included.

## Remaining Phase 1 work
- Explicit consent added before user-invoked Fit-to-paper scaling. Dedicated sheet-overflow resolution choices remain pending.
- Verify image assets, quota failures, and cross-device backup restoration. Browser-local storage disclosure is implemented.
- Backup/restore UI and recovery tests (including storage quota failures).
- Safety regression tests added for no-silent-resize and explicit scaling confirmation; browser export/print blocking remains to be tested.
- Manual browser smoke tests and CI status before merge.

## Safety policy
Never silently change a user's requested physical product dimensions. Never claim that a browser print dialog or printer guarantees 1:1 output. Never claim manufacturing certification.
