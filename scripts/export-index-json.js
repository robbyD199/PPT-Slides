/* eslint-disable no-undef */
/**
 * Exports the curated taxonomy from assets/library/library.json in the format of the hidden
 * "Slide library index (JSON)" slide of the template (categories, slides, theme, layouts).
 * The result can be pasted into that slide so template and add-in stay in sync.
 *   node scripts/export-index-json.js [out.json]
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const lib = JSON.parse(fs.readFileSync(path.join(root, "assets", "library", "library.json"), "utf8"));
const idxFile = path.join(root, "assets", "library", "index-from-template.json");
const old = fs.existsSync(idxFile) ? JSON.parse(fs.readFileSync(idxFile, "utf8")) : {};
const out = process.argv[2] || path.join(root, "docs", "slide-index.proposed.json");

const subName = (c, id) => (c.subcategories.find((s) => s.id === id) || {}).name || id;
const oldByPos = new Map((old.slides || []).map((s) => [s.pos, s]));

const index = {
  library: old.library || "Consulting slide template",
  version: "2.0",
  note: "MECE-Taxonomie der Folienbibliothek. Regel: Kategorie = wichtigstes Darstellungsmittel bzw. Funktion im Deck (siehe docs/TAXONOMIE.md).",
  slide: old.slide,
  categories: lib.categories.map((c) => ({
    id: c.id,
    name: c.name,
    rule: c.description,
    subcategories: c.subcategories.map((s) => s.name),
  })),
  slides: lib.slides
    .filter((s) => s.kind === "slide")
    .sort((a, b) => a.position - b.position)
    .map((s) => {
      const cat = lib.categories.find((c) => c.id === s.category);
      const prev = oldByPos.get(s.position) || {};
      return {
        key: prev.key || s.key,
        pos: s.position,
        name: s.title,
        category: s.category,
        sub: cat ? subName(cat, s.subcategory) : s.subcategory,
        layout: s.layout,
        elements: prev.elements || [],
        keywords: s.keywords,
      };
    }),
  basicLayouts: lib.slides
    .filter((s) => s.kind === "layout")
    .map((s) => ({ name: s.title, layout: s.layout, category: "layouts" })),
  theme: old.theme,
  layouts: old.layouts,
};
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(index, null, 2) + "\n", "utf8");
console.log(`geschrieben: ${out} (${index.slides.length} Folien, ${index.categories.length} Kategorien)`);
