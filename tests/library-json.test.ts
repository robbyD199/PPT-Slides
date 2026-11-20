import * as fs from "fs";
import * as path from "path";
import { isValidSlideIdFormat, parseLibrary, sourceSlideId } from "../src/shared/library";

/** Checks the generated assets/library/library.json against the acceptance criteria. */
const root = path.join(__dirname, "..");
const dir = path.join(root, "assets", "library");
const lib = parseLibrary(JSON.parse(fs.readFileSync(path.join(dir, "library.json"), "utf8")));

describe("library.json", () => {
  it("has 5-10 categories", () => {
    expect(lib.categories.length).toBeGreaterThanOrEqual(5);
    expect(lib.categories.length).toBeLessThanOrEqual(10);
  });

  it("puts every slide in exactly one existing category and subcategory", () => {
    for (const s of lib.slides) {
      const cat = lib.categories.find((c) => c.id === s.category);
      expect(cat).toBeDefined();
      expect(cat!.subcategories.some((sub) => sub.id === s.subcategory)).toBe(true);
    }
  });

  it("has no category with only one slide", () => {
    for (const c of lib.categories) {
      const n = lib.slides.filter((s) => s.category === c.id).length;
      expect(n).toBeGreaterThan(1);
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
