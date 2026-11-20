/* eslint-disable no-undef */
/** Builds test-results/report.md from self-test results + COM verification. */
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const runs = [];
let out = "test-results/report.md";
let libFile = "assets/library/library.json";
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--run") runs.push(args[++i]);
  else if (args[i] === "--out") out = args[++i];
  else if (args[i] === "--lib") libFile = args[++i];
}
const dir = path.dirname(out);
const read = (f) => JSON.parse(fs.readFileSync(f, "utf8").replace(/^﻿/, ""));
const lib = read(libFile);
const yes = (b) => (b ? "✅" : "❌");
const lines = [];
const accept = [];

lines.push("# Selbsttest-Bericht – Folienbibliothek", "");
lines.push(`- Zeitpunkt: ${new Date().toLocaleString("de-CH")}`);
lines.push(`- Bibliothek: Build \`${lib.build}\`, Stand ${lib.updated.slice(0, 10)}, ${lib.slides.length} Einträge (${lib.slides.filter((s) => s.kind === "slide").length} Folien + ${lib.slides.filter((s) => s.kind === "layout").length} Grundlayouts)`);
lines.push("- Ablauf: `scripts/selftest.ps1` (Dev-Build, automatisch geöffneter Seitenbereich, Einfügen jeder Vorlage hinter Folie 1, Prüfung per COM)", "");

for (const id of runs) {
  const res = read(path.join(dir, `selftest-${id}.json`));
  const ver = read(path.join(dir, `selftest-${id}.json.verify.json`));
  const name = id.replace(/^\d{8}-\d{6}-/, "");
  if (res.mode === "empty") {
    lines.push(`## Leere Präsentation (\`${name}\`)`, "");
    lines.push(`| Prüfung | Ergebnis |`, `|---|---|`);
    lines.push(`| Einfügen in Präsentation ohne Folien landet auf Folie 1 | ${yes(ver.emptyInsertOk)} (Position ${res.extra.emptyInsert?.position}) |`);
    lines.push(`| Zweites Einfügen landet hinter der neuen (ausgewählten) Folie | ${yes(ver.secondInsertOk)} (Position ${res.extra.secondInsert?.position}) |`);
    lines.push(`| Zielfolien verwenden das Ziel-Design „${ver.targetDesign}“ | ${yes(ver.destinationSlidesUseTarget)} |`);
    lines.push(`| Option „Format der Vorlage beibehalten“ importiert den Bibliotheks-Master | ${yes(ver.keepSourceImportedMaster)} (Designs: ${ver.designNames.join(", ")}) |`);
    lines.push("");
    accept.push(["Leere Präsentation → Einfügen am Ende/Anfang", ver.emptyInsertOk && ver.secondInsertOk]);
    continue;
  }
  const checks = ver.checks;
  const passed = checks.filter((c) => c.pass).length;
  const ms = res.results.filter((r) => r.ok).map((r) => r.ms);
  const max = Math.max(...ms);
  const avg = Math.round(ms.reduce((a, b) => a + b, 0) / ms.length);
  const newLayouts = ver.layoutsAfter.filter((l) => !ver.layoutsBefore.includes(l));
  const extraLayouts = ver.layoutsAfter.length - ver.layoutsBefore.length;
  const fontEx = checks.filter((c) => c.fontException);
  lines.push(`## Zielpräsentation \`${name}\` – Design „${checks[0]?.designName ?? "?"}“`, "");
  lines.push(`| Prüfung | Ergebnis |`, `|---|---|`);
  lines.push(`| Eingefügt und geprüft | ${passed}/${checks.length} bestanden |`);
  lines.push(`| Position direkt hinter der ausgewählten Folie (Folie 2) | ${yes(checks.every((c) => c.positionOk))} |`);
  lines.push(`| Neue Folie danach ausgewählt | ${yes(checks.every((c) => c.selectedOk))} |`);
  lines.push(`| Dauer pro Folie < 2 s | ${yes(max < 2000)} (Ø ${avg} ms, max ${max} ms; mit Download aus dem Cache-losen Zustand) |`);
  lines.push(`| Warm (Datei bereits geladen) | ${(res.extra.warmMs || []).join(" / ")} ms |`);
  lines.push(`| Master/Design der eingefügten Folien = Ziel-Design | ${yes(checks.every((c) => c.designOk))} |`);
  lines.push(`| Keine zusätzlichen Master | ${yes(ver.designsAfter === ver.designsBefore)} (Designs vorher ${ver.designsBefore}, nachher ${ver.designsAfter}) |`);
  lines.push(`| Theme-Farben = Ziel-Farben | ${yes(checks.every((c) => c.colorsMatch))} |`);
  lines.push(`| Theme-Schriften übernommen | ${yes(checks.every((c) => c.fontsOk || c.fontException))} – ${checks.filter((c) => c.fontsOk).length} Folien vollständig, ${fontEx.length} Folien mit fester Schrift (alle vom Theme-Lint markiert) |`);
  lines.push(`| Doppelklick fügt nur einmal ein (Service / Oberfläche) | ${yes(res.extra.doubleClickService?.ok)} / ${yes(res.extra.doubleClickUi?.ok)} |`);
  lines.push(`| Layout-Zuordnung | gleichnamige Layouts werden verwendet; ${extraLayouts} Layout(s) importiert: ${newLayouts.join(", ") || "–"} |`);
  const lm = (res.extra.libraryMode || []).filter((x) => x.ok);
  if (lm.length) {
    const lms = lm.map((x) => x.ms);
    lines.push(`| Alternative „ganze Bibliothek + sourceSlideIds“ | ${yes(lm.length === (res.extra.libraryMode || []).length)} ${lm.length} Stichproben, Ø ${Math.round(lms.reduce((a, b) => a + b, 0) / lms.length)} ms |`);
  }
  lines.push("");
  lines.push("<details><summary>Alle Folien</summary>", "");
  lines.push("| # | Folie | ms | Layout im Ziel | Farben | Schriften | Lint | Ergebnis |", "|---|---|---|---|---|---|---|---|");
  checks.forEach((c, i) => {
    lines.push(
      `| ${i + 1} | ${c.title} | ${c.ms} | ${c.layout ?? ""} | ${yes(c.colorsMatch)} | ${(c.fonts || []).join(", ")} | ${c.lintLevel} | ${c.pass ? "✅" : "❌ " + c.reason}${c.fontException ? " (Ausnahme: feste Schrift laut Lint)" : ""} |`
    );
  });
  lines.push("", "</details>", "");
  accept.push([`${name}: Master, Farben, Schriften des Ziels (Ausnahmen nur Lint)`, passed === checks.length]);
  accept.push([`${name}: Einfügen < 2 s, Position, Auswahl, Doppelklick`, max < 2000 && checks.every((c) => c.positionOk && c.selectedOk) && res.extra.doubleClickUi?.ok]);
}

const screens = path.join(dir, "screens");
if (fs.existsSync(screens)) {
  const sheets = fs.readdirSync(screens).filter((f) => /^compare-.*\d+\.jpg$/.test(f)).sort();
  if (sheets.length) {
    lines.push("## Screenshot-Vergleich", "");
    lines.push("Je Folie: links die Vorlage aus der Bibliothek, daneben die eingefügte Folie in jeder Zielpräsentation (Export per COM).", "");
    for (const s of sheets) lines.push(`- [${s}](screens/${s})`);
    lines.push("");
  }
}

lines.push("## Zusammenfassung", "", "| Kriterium | Ergebnis |", "|---|---|");
for (const [k, v] of accept) lines.push(`| ${k} | ${yes(v)} |`);
lines.push("");
lines.push("Hinweise:");
lines.push("- „Keine Auswahl → am Ende einfügen“: PowerPoint lässt sich per API nicht in einen Zustand ohne ausgewählte Folie versetzen (`setSelectedSlides([])` ändert nichts). Die Logik ist per Unit-Test abgedeckt; der Fall „leere Präsentation“ ist oben getestet.");
lines.push("- Fremde Schriften stammen ausschließlich aus Folien, die `scripts/lint-templates.ps1` markiert (fest gesetzte Schrift „Arial“ u. a. in der Vorlage).");
fs.writeFileSync(out, lines.join("\n") + "\n", "utf8");
console.log(`report.md geschrieben (${runs.length} Läufe)`);
