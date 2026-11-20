/* eslint-disable no-undef */
/**
 * Merges freshly extracted slide data into assets/library/library.json.
 *  - known slides (same "<slideId>#<creationId>") keep their curated fields
 *    (title, category, subcategory, keywords, description, order)
 *  - slides that no longer exist are removed
 *  - new slides get "category": null (to be categorized) plus a suggestion from the JSON index slide
 * Also copies staged thumbnails / mini PPTX files and builds the "new presentation" templates.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const JSZip = require("jszip");
const { readPresentation, text } = require("./lib/pptx");

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : def;
}
const has = (name) => process.argv.includes(name);

const CURATED = ["title", "category", "subcategory", "keywords", "description", "order"];

function cleanTitle(t) {
  return (t || "")
    .replace(/[[\]]/g, "")
    .replace(/\s*\/\s*Insert action title\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slug(s) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
  } catch {
    return fallback;
  }
}

function listFiles(dir) {
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isFile()) : [];
}

/** Lint level: "ok" | "info" (only signal colors / non-latin fonts) | "warn" */
function lintSummary(l, signalHex) {
  if (!l) return { level: "ok", warnings: [] };
  const nonSignal = Object.keys(l.fixedColorValues || {}).filter((k) => !signalHex.has(k));
  const signal = Object.keys(l.fixedColorValues || {}).filter((k) => signalHex.has(k));
  const warnings = [];
  const infos = [];
  if (nonSignal.length) warnings.push(`Feste Farben: ${nonSignal.join(", ")}`);
  if (signal.length) infos.push(`Signalfarben (bewusst fest): ${signal.join(", ")}`);
  const latin = Object.keys(l.fixedFontsLatin || {});
  if (latin.length) warnings.push(`Feste Schrift: ${latin.map((f) => f.trim()).filter((v, i, a) => a.indexOf(v) === i).join(", ")}`);
  const other = Object.keys(l.fixedFontsOther || {});
  if (other.length) infos.push(`Feste ostasiat./komplexe Schrift: ${other.join(", ")}`);
  if (l.chartFixedColors) warnings.push(`Diagramm: ${l.chartFixedColors}× feste Farbe`);
  const cf = Object.keys(l.chartFixedFonts || {});
  if (cf.length) warnings.push(`Diagramm: feste Schrift ${cf.join(", ")}`);
  if (l.smartArtFixedColors) warnings.push(`SmartArt: ${l.smartArtFixedColors}× feste Farbe`);
  return { level: warnings.length ? "warn" : infos.length ? "info" : "ok", warnings, infos };
}

async function stripWebExtensions(zip) {
  for (const name of Object.keys(zip.files)) {
    if (name.startsWith("ppt/webextensions/")) zip.remove(name);
  }
  const ct = await text(zip, "[Content_Types].xml");
  zip.file("[Content_Types].xml", ct.replace(/<Override[^>]*PartName="\/ppt\/webextensions\/[^"]*"[^>]*\/>/g, ""));
  const rels = await text(zip, "_rels/.rels");
  zip.file("_rels/.rels", rels.replace(/<Relationship[^>]*webextensiontaskpanes[^>]*\/>/g, ""));
}

/** Builds one template per color scheme found in the theme (main + extraClrSchemeLst). */
async function buildTemplates(basePptx, outDir) {
  if (!fs.existsSync(basePptx)) return [];
  const pres = await readPresentation(basePptx);
  const themePart = pres.masters[0] && pres.masters[0].theme;
  if (!themePart) return [];
  const themeXml = await text(pres.zip, themePart);
  const main = themeXml.match(/<a:clrScheme\s[^>]*>[\s\S]*?<\/a:clrScheme>/);
  const schemes = [];
  if (main) schemes.push(main[0]);
  const extra = themeXml.match(/<a:extraClrSchemeLst>([\s\S]*?)<\/a:extraClrSchemeLst>/);
  if (extra) {
    const re = /<a:clrScheme\s[^>]*>[\s\S]*?<\/a:clrScheme>/g;
    let m;
    while ((m = re.exec(extra[1]))) schemes.push(m[0]);
  }
  const seen = new Set();
  const result = [];
  const baseBuf = fs.readFileSync(basePptx);
  for (const scheme of schemes) {
    const name = (scheme.match(/name="([^"]*)"/) || [, "Standard"])[1];
    const id = slug(name) || "standard";
    if (seen.has(id)) continue;
    seen.add(id);
    const colors = {};
    const cre = /<a:(dk1|lt1|dk2|lt2|accent\d|hlink|folHlink)>[\s\S]*?(?:val|lastClr)="([0-9A-Fa-f]{6})"[\s\S]*?<\/a:\1>/g;
    let cm;
    while ((cm = cre.exec(scheme))) colors[cm[1]] = cm[2].toUpperCase();
    const zip = await JSZip.loadAsync(baseBuf);
    const t = await text(zip, themePart);
    zip.file(themePart, t.replace(/<a:clrScheme\s[^>]*>[\s\S]*?<\/a:clrScheme>/, scheme));
    await stripWebExtensions(zip);
    const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
    fs.writeFileSync(path.join(outDir, `${id}.pptx`), buf);
    result.push({ id, name, file: `template/${id}.pptx`, colors, active: scheme === schemes[0] });
  }
  return result;
}

(async () => {
  const extract = readJson(arg("--extract"), null);
  const layouts = readJson(arg("--layouts"), []);
  const stage = arg("--stage");
  const out = arg("--out");
  const source = arg("--source");
  const keepSlides = has("--keep-slides");
  if (!extract || !stage || !out) throw new Error("--extract, --stage und --out sind erforderlich.");

  const libFile = path.join(out, "library.json");
  const old = readJson(libFile, { slides: [], categories: [] });
  const oldByKey = new Map((old.slides || []).map((s) => [s.key, s]));
  const idx = extract.jsonIndex || null;
  const signalHex = new Set(((idx && idx.theme && idx.theme.signalColors) || []).map((c) => `#${String(c.hex).toUpperCase()}`));

  const visible = extract.slides.filter((s) => !s.hidden);
  // Lines that appear on most slides (e.g. an off-slide typography legend) are noise for search.
  const freq = new Map();
  for (const s of visible) for (const l of new Set(s.lines)) freq.set(l, (freq.get(l) || 0) + 1);
  const noisy = new Set([...freq].filter(([, n]) => n > visible.length * 0.5).map(([l]) => l));

  const suggestionByPos = new Map(((idx && idx.slides) || []).map((e) => [e.pos, e]));
  const report = { added: [], changed: [], removed: [], uncategorized: [], lintWarn: 0 };
  const slides = [];

  for (const s of visible) {
    const prev = oldByKey.get(s.key);
    const lines = s.lines.filter((l) => !noisy.has(l) && l !== s.title);
    const entry = {
      key: s.key,
      kind: "slide",
      slideId: s.slideId,
      creationId: s.creationId,
      position: s.position,
      title: cleanTitle(s.title) || `Folie ${s.position}`,
      category: null,
      subcategory: null,
      keywords: [],
      description: "",
      order: s.position,
      sourceTitle: s.title,
      layout: s.layout,
      text: lines.join(" · ").slice(0, 1500),
      charts: s.charts,
      images: s.images,
      thumb: `thumbs/${s.slideId}.png`,
      preview: `previews/${s.slideId}.png`,
      file: `slides/${s.slideId}.pptx`,
      placeholders: s.placeholders || [],
      hash: s.hash,
      lint: lintSummary(s.lint, signalHex),
    };
    if (prev) {
      for (const k of CURATED) if (prev[k] !== undefined) entry[k] = prev[k];
      if (prev.hash !== s.hash) report.changed.push(entry);
    } else {
      const sug = suggestionByPos.get(s.position);
      if (sug && (!sug.layout || sug.layout === s.layout)) {
        entry.suggestion = { key: sug.key, name: sug.name, category: sug.category, sub: sug.sub, elements: sug.elements || [] };
      }
      report.added.push(entry);
    }
    if (!entry.category) report.uncategorized.push(entry);
    if (entry.lint.level === "warn") report.lintWarn++;
    slides.push(entry);
  }

  for (const l of layouts) {
    const key = `layout:${l.name}`;
    const prev = oldByKey.get(key);
    const entry = {
      key,
      kind: "layout",
      layoutIndex: l.index,
      position: l.index,
      title: l.name,
      category: "layouts",
      subcategory: null,
      keywords: [],
      description: "",
      order: l.index,
      layout: l.name,
      text: "",
      thumb: l.thumb,
      preview: l.preview,
      file: l.file,
      hash: crypto.createHash("sha1").update(key).digest("hex").slice(0, 16),
      lint: { level: "ok", warnings: [] },
    };
    if (prev) {
      for (const k of CURATED) if (prev[k] !== undefined) entry[k] = prev[k];
    } else {
      report.added.push(entry);
    }
    slides.push(entry);
  }

  const newKeys = new Set(slides.map((s) => s.key));
  for (const s of old.slides || []) if (!newKeys.has(s.key)) report.removed.push(s);

  // --- copy files -------------------------------------------------------------------------
  fs.mkdirSync(out, { recursive: true });
  const dirs = keepSlides ? ["thumbs", "previews", "layouts", "template"] : ["thumbs", "previews", "slides", "layouts", "template"];
  for (const d of dirs) {
    const src = path.join(stage, d);
    const dst = path.join(out, d);
    fs.mkdirSync(dst, { recursive: true });
    if (d === "template") continue; // built below
    const keep = new Set(listFiles(src));
    for (const f of listFiles(dst)) if (!keep.has(f)) fs.unlinkSync(path.join(dst, f));
    for (const f of keep) fs.copyFileSync(path.join(src, f), path.join(dst, f));
  }
  const tplDir = path.join(out, "template");
  for (const f of listFiles(tplDir)) fs.unlinkSync(path.join(tplDir, f));
  const templates = await buildTemplates(path.join(stage, "template", "base.pptx"), tplDir);
  if (source) fs.copyFileSync(source, path.join(out, "Library.pptx"));

  const sourceStat = source ? fs.statSync(source) : null;
  const sourceSha = source ? crypto.createHash("sha1").update(fs.readFileSync(source)).digest("hex") : "";
  const now = new Date();
  const lib = {
    schema: 1,
    name: "Folienbibliothek",
    updated: sourceStat ? sourceStat.mtime.toISOString() : now.toISOString(),
    built: now.toISOString(),
    build: sourceSha.slice(0, 10),
    source: { file: source ? path.basename(source) : null, sha1: sourceSha, slides: extract.slides.length },
    insertMode: old.insertMode || "perSlide",
    libraryFile: "Library.pptx",
    categories: old.categories && old.categories.length ? old.categories : [],
    theme: idx && idx.theme ? { fonts: idx.theme.fonts || null, signalColors: idx.theme.signalColors || [] } : null,
    templates,
    slides,
  };
  fs.writeFileSync(libFile, JSON.stringify(lib, null, 2) + "\n", "utf8");
  if (idx) fs.writeFileSync(path.join(out, "index-from-template.json"), JSON.stringify(idx, null, 2) + "\n", "utf8");
  if (extract.jsonIndexError) console.warn(`WARNUNG: JSON-Indexfolie konnte nicht gelesen werden: ${extract.jsonIndexError}`);

  const fmt = (list) => list.map((s) => `    - ${s.key}  ${s.title}`).join("\n");
  console.log("");
  console.log("Zusammenfassung library.json");
  console.log(`  Folien gesamt:     ${slides.filter((s) => s.kind === "slide").length} (+ ${layouts.length} Grundlayouts)`);
  console.log(`  Neu:               ${report.added.length}${report.added.length ? "\n" + fmt(report.added) : ""}`);
  console.log(`  Geändert:          ${report.changed.length}${report.changed.length ? "\n" + fmt(report.changed) : ""}`);
  console.log(`  Gelöscht:          ${report.removed.length}${report.removed.length ? "\n" + fmt(report.removed) : ""}`);
  console.log(`  Lint-Warnungen:    ${report.lintWarn} Folien (Details: powershell -File scripts/lint-templates.ps1)`);
  console.log(`  Unkategorisiert:   ${report.uncategorized.length}${report.uncategorized.length ? "\n" + fmt(report.uncategorized) : ""}`);
  console.log(`  Vorlagen (Farbsets): ${templates.map((t) => t.name).join(", ") || "-"}`);
})().catch((e) => {
  console.error("Fehler:", e.stack || e.message || e);
  process.exit(1);
});
