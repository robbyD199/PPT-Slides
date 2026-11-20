import * as fs from "fs";
import * as path from "path";
import { buildIndex, editDistance, normalize, parseQuery, search, tokenize } from "../src/shared/search";
import { parseLibrary } from "../src/shared/library";

const lib = parseLibrary(JSON.parse(fs.readFileSync(path.join(__dirname, "..", "assets", "library", "library.json"), "utf8")));
const index = buildIndex(lib);
const top = (q: string, n = 5) => search(index, q).hits.slice(0, n).map((h) => h.entry.title);
const titles = (q: string) => search(index, q).hits.map((h) => h.entry.title);

describe("normalize / tokenize", () => {
  it("folds umlauts, ß and × consistently", () => {
    expect(normalize("Säulendiagramm")).toBe(normalize("Saeulendiagramm"));
    expect(normalize("Fließtext")).toBe("fliesstext");
    expect(normalize("2×2-Matrix")).toBe("2x2 matrix");
  });
  it("drops stop words", () => {
    expect(tokenize("Chart mit der Prognose")).toEqual(["chart", "prognose"]);
  });
  it("keeps known phrases together", () => {
    expect(parseQuery("bar chart").map((g) => g.label)).toEqual(["bar chart"]);
    expect(parseQuery("executive summary financial overview").map((g) => g.label)).toEqual(["executive summary", "financial overview"]);
  });
  it("computes edit distance with transpositions", () => {
    expect(editDistance("chart", "chrat")).toBe(1);
    expect(editDistance("matrix", "matrix")).toBe(0);
    expect(editDistance("abc", "xyzuvw", 2)).toBeGreaterThan(2);
  });
});

describe("search over the real library", () => {
  it("finds column charts for 'bar chart' and 'Säulendiagramm'", () => {
    for (const q of ["bar chart", "Säulendiagramm", "column chart", "Balkendiagramm"]) {
      const t = top(q, 4);
      expect(t.every((x) => /Säulendiagramm/.test(x))).toBe(true);
    }
  });

  it("finds charts for a generic 'chart' query", () => {
    const t = titles("chart");
    expect(t.some((x) => /Liniendiagramm/.test(x))).toBe(true);
    expect(t.some((x) => /Wasserfall/.test(x))).toBe(true);
    expect(t.some((x) => /Blasendiagramm/.test(x))).toBe(true);
  });

  it("finds the executive summary slides first", () => {
    const t = top("executive summary", 2);
    expect(t.every((x) => /Executive Summary/.test(x))).toBe(true);
  });

  it("finds key facts / company overview", () => {
    expect(top("company overview", 3)).toContain("Key Facts – Kennzahlen-Kacheln mit Logos");
    expect(top("Unternehmensüberblick", 3)).toContain("Key Facts – Kennzahlen-Kacheln mit Logos");
  });

  it("finds financial overview slides (charts, KPIs)", () => {
    const t = titles("financial overview");
    expect(t.length).toBeGreaterThan(3);
    expect(t.some((x) => /Wasserfall|Säulendiagramm/.test(x))).toBe(true);
  });

  it("falls back to partial matches for combined queries", () => {
    const res = search(index, "executive summary financial overview");
    expect(res.hits.length).toBeGreaterThan(0);
    const t = res.hits.map((h) => h.entry.title);
    expect(t.some((x) => /Executive Summary/.test(x))).toBe(true);
  });

  it("matches German and English for waterfall / bridge", () => {
    expect(top("Wasserfall", 1)[0]).toMatch(/Wasserfall/);
    expect(top("ebitda bridge", 1)[0]).toMatch(/Wasserfall/);
  });

  it("tolerates typos", () => {
    expect(top("organigram", 1)[0]).toMatch(/Organigramm/);
    expect(top("timline", 3).length).toBeGreaterThan(0);
  });

  it("matches while typing (prefix)", () => {
    expect(top("wasserf", 1)[0]).toMatch(/Wasserfall/);
    expect(top("gant", 2).some((x) => /Gantt/.test(x))).toBe(true);
  });

  it("searches category names and slide text", () => {
    expect(titles("Zeitpläne").length).toBeGreaterThanOrEqual(6);
    expect(top("SteerCo", 3).some((x) => /SteerCo|Phasen|Gantt/.test(x))).toBe(true);
  });

  it("finds the BCG matrix and 2x2 matrices", () => {
    expect(top("bcg", 1)[0]).toMatch(/BCG/);
    expect(top("2x2", 4).every((x) => /2×2|BCG|Priorisierung|Matrix/.test(x))).toBe(true);
  });

  it("finds empty layouts", () => {
    expect(top("leere folie", 4).every((x) => /\(leer\)/.test(x))).toBe(true);
  });

  it("returns nothing for gibberish", () => {
    expect(search(index, "qqqzzzxx").hits).toHaveLength(0);
  });

  it("returns no groups for an empty query", () => {
    expect(search(index, "   ").groups).toHaveLength(0);
  });
});
