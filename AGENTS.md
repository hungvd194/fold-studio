# fold-studio

The user plans to host this static application on Vercel. Source is maintained on GitHub at hungvd194/fold-studio. Do not publish or redeploy through Sites. Local preview: `node serve.cjs` at http://127.0.0.1:4381. Vercel serves `dist` using vercel.json.

The user requested deletion of the previously published Fold Site. The available Sites connector has no delete tool, and the browser management session was signed out. Do not report that remote deletion succeeded without a verified deletion result. Historical project identity is in `.openai/sites-history.json` only for identifying that pending deletion.

Validate geometry, interaction, artwork, and sheet-layout changes with `node --test tests/geometry.test.cjs tests/canvas.test.cjs tests/artwork.test.cjs tests/layout.test.cjs tests/canvas-ui.test.cjs`. Use `tests/verify-export.cjs` against actual downloaded SVG/DXF/JSON when export behavior changes. Preserve SVG/DXF true-size millimeter output and every placed copy. Do not claim manufacturing certification or automatic stock-thickness compensation.
