/* eslint-disable no-undef */
/**
 * Writes slide metadata of a .pptx as JSON (used by update-templates.ps1).
 *   node scripts/extract-cli.js --source templates/Library.pptx --out tmp/extract.json
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
  const out = arg("--out", null);
  const pres = await readPresentation(source);
  const lint = await lintPresentation(pres);
  const data = {
    file: pres.file,
    slideWidthEmu: pres.slideWidthEmu,
    slideHeightEmu: pres.slideHeightEmu,
    masters: pres.masters,
    jsonIndex: pres.jsonIndex,
    jsonIndexError: pres.jsonIndexError,
    slides: pres.slides.map((s) => ({ ...s, lint: lint[s.key] })),
  };
  const json = JSON.stringify(data, null, 2);
  if (out) fs.writeFileSync(out, json, "utf8");
  else process.stdout.write(json);
})().catch((e) => {
  console.error("Extraktion fehlgeschlagen:", e.message || e);
  process.exit(1);
});
