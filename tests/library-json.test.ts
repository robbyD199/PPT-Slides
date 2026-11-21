import * as fs from "fs";
import * as path from "path";
import { isValidSlideIdFormat, parseLibrary, sourceSlideId } from "../src/shared/library";

/** Checks the generated assets/library/library.json against the acceptance criteria. */
const root = path.join(__dirname, "..");
const dir = path.join(root, "assets", "library");
const lib = parseLibrary(JSON.parse(fs.readFileSync(path.join(dir, "library.json"), "utf8")));

describe("library.json", () => {
  // The taxonomy is shared with locally imported folders (e.g. think-cell): categories without own slides
  // (Maps, the element categories) are allowed and hidden in the add-in until something is imported.
  it("has 5-10 categories with own slides", () => {
    const used = lib.categories.filter((c) => lib.slides.some((s) => s.category === c.id));
    expect(used.length).toBeGreaterThanOrEqual(5);
    expect(used.length).toBeLessThanOrEqual(10);
  });

  it("assigns every category to the area slides or elements, with unique ids", () => {
    for (const c of lib.categories) expect(["slides", "elements"]).toContain(c.area);
    expect(new Set(lib.categories.map((c) => c.id)).size).toBe(lib.categories.length);
    for (const c of lib.categories)
      expect(new Set(c.subcategories.map((s) => s.id)).size).toBe(c.subcategories.length);
  });

  it("puts every slide in exactly one existing category and subcategory", () => {
    for (const s of lib.slides) {
      const cat = lib.categories.find((c) => c.id === s.category);
      expect(cat).toBeDefined();
      expect(cat!.subcategories.some((sub) => sub.id === s.subcategory)).toBe(true);
    }
  });

  it("has no category with only one own slide", () => {
    for (const c of lib.categories) {
      const n = lib.slides.filter((s) => s.category === c.id).length;
      expect(n === 0 || n > 1).toBe(true);
    }
  });

  it("has unique keys and valid slide id formats", () => {
    const keys = lib.slides.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const s of lib.slides.filter((x) => x.kind === "slide")) {
      expect(isValidSlideIdFormat(sourceSlideId(s)!)).toBe(true);
      expect(s.key).toBe(sourceSlideId(s));
    }
  });

  it("references existing thumbnails, previews and slide files", () => {
    for (const s of lib.slides) {
      for (const f of [s.thumb, s.preview, s.file]) {
        expect(fs.existsSync(path.join(dir, f))).toBe(true);
      }
    }
    for (const t of lib.templates) expect(fs.existsSync(path.join(dir, t.file))).toBe(true);
  });

  it("has German titles and search keywords for every slide", () => {
    for (const s of lib.slides) {
      expect(s.title.length).toBeGreaterThan(3);
      expect(s.keywords.length).toBeGreaterThan(2);
    }
  });
});

describe("manifests", () => {
  it("prod manifest has GitHub Pages URLs, dev manifest localhost, different IDs", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { toProd } = require("../scripts/gen-manifest.js");
    const dev = fs.readFileSync(path.join(root, "manifest.dev.xml"), "utf8");
    const prod: string = toProd(dev);
    expect(dev).toContain("https://localhost:3000/taskpane.html");
    expect(prod).not.toContain("localhost");
    expect(prod).toContain("https://robbyd199.github.io/PPT-Slides/taskpane.html");
    expect(prod).toContain("<AppDomain>https://robbyd199.github.io</AppDomain>");
    const id = (x: string) => /<Id>([^<]+)<\/Id>/.exec(x)![1];
    expect(id(prod)).not.toBe(id(dev));
    expect(prod).toContain('DefaultValue="Folienbibliothek"/>');
  });
});

describe("new-presentation templates", () => {
  it("contain the master with all layouts of the library", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const JSZip = require("jszip");
    const layoutsInLibrary = lib.slides.filter((s) => s.kind === "layout").length;
    for (const t of lib.templates) {
      const zip = await JSZip.loadAsync(fs.readFileSync(path.join(dir, t.file)));
      const layouts = Object.keys(zip.files).filter((n) =>
        /^ppt\/slideLayouts\/slideLayout\d+\.xml$/.test(n)
      );
      expect(layouts.length).toBe(layoutsInLibrary);
      expect(Object.keys(zip.files).some((n) => n.startsWith("ppt/webextensions/"))).toBe(false);
    }
  });
});
