/* eslint-disable no-undef */
/**
 * CLI for the theme lint. Usage:
 *   node scripts/lint-cli.js [--source templates/Library.pptx] [--json out.json] [--quiet]
 */
const fs = require("fs");
const path = require("path");
const { readPresentation } = require("./lib/pptx");
const { lintPresentation } = require("./lib/lint");

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : def;
}

(async () => {
  const source = arg("--source", path.join(__dirname, "..", "templates", "Library.pptx"));
  const jsonOut = arg("--json", null);
  const quiet = process.argv.includes("--quiet");
  const pres = await readPresentation(source);
  const lint = await lintPresentation(pres);
  let warnSlides = 0;
  const rows = [];
  for (const s of pres.slides) {
    if (s.hidden) continue;
    const l = lint[s.key];
    if (l.warnings.length) warnSlides++;
    rows.push({ pos: s.position, key: s.key, title: s.title, warnings: l.warnings });
  }
  if (!quiet) {
    console.log(`Theme-Lint: ${path.basename(source)} – ${rows.length} Folien geprüft, ${warnSlides} mit Warnungen`);
    for (const r of rows) {
      if (!r.warnings.length) continue;
      console.log(`  #${String(r.pos).padStart(2)} ${r.title.slice(0, 60)}`);
      for (const w of r.warnings) console.log(`        - ${w}`);
    }
  }
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ source: path.basename(source), slides: rows, details: lint }, null, 2));
})().catch((e) => {
  console.error("Lint fehlgeschlagen:", e.message || e);
  process.exit(1);
});
