import { assetUrl, formatGermanDate, groupLibrary, isValidSlideIdFormat, parseLibrary, sourceSlideId, LibraryError } from "../src/shared/library";
import { Library } from "../src/shared/types";

const raw = {
  schema: 1,
  name: "Test",
  updated: "2026-11-20T01:27:58Z",
  built: "2026-11-20T02:00:00Z",
  build: "abc123",
  insertMode: "perSlide",
  libraryFile: "Library.pptx",
  categories: [
    { id: "a", name: "Kategorie A", subcategories: [{ id: "a1", name: "A1" }, { id: "a2", name: "A2" }] },
    { id: "b", name: "Kategorie B", subcategories: [] },
  ],
  templates: [],
  slides: [
    { key: "300#11", kind: "slide", slideId: "300", creationId: "11", position: 3, title: "Drei", category: "a", subcategory: "a2", keywords: [], file: "slides/300.pptx", thumb: "t/300.png", order: 3 },
    { key: "100#22", kind: "slide", slideId: "100", creationId: "22", position: 1, title: "Eins", category: "a", subcategory: "a1", keywords: [], file: "slides/100.pptx", thumb: "t/100.png", order: 1 },
    { key: "200#33", kind: "slide", slideId: "200", creationId: "33", position: 2, title: "Zwei", category: "b", subcategory: null, keywords: [], file: "slides/200.pptx", thumb: "t/200.png", order: 2 },
    { key: "layout:Title Only", kind: "layout", position: 1, title: "Nur Titel", category: null, subcategory: null, file: "layouts/layout-1.pptx", thumb: "t/l1.png" },
  ],
};

describe("parseLibrary", () => {
  it("parses a valid library and fills defaults", () => {
    const lib = parseLibrary(raw);
    expect(lib.slides).toHaveLength(4);
    expect(lib.slides[3].kind).toBe("layout");
    expect(lib.slides[0].lint.level).toBe("ok");
    expect(lib.insertMode).toBe("perSlide");
  });

  it("rejects invalid data with a German message", () => {
    expect(() => parseLibrary(null)).toThrow(LibraryError);
    expect(() => parseLibrary({ categories: [] })).toThrow(/Folienliste/);
    expect(() => parseLibrary({ slides: [], categories: null })).toThrow(/Kategorien/);
    expect(() => parseLibrary({ slides: [{ title: "x" }], categories: [] })).toThrow(/unvollständig/);
  });
});

describe("groupLibrary", () => {
  it("groups by category and subcategory in defined order, sorted by order", () => {
    const groups = groupLibrary(parseLibrary(raw) as Library);
    expect(groups.map((g) => g.category.id)).toEqual(["a", "b", "_uncategorized"]);
    expect(groups[0].subgroups.map((s) => s.subcategory?.id)).toEqual(["a1", "a2"]);
    expect(groups[0].count).toBe(2);
    expect(groups[2].subgroups[0].slides[0].key).toBe("layout:Title Only");
  });

  it("restricts to a key set and drops empty groups", () => {
    const groups = groupLibrary(parseLibrary(raw) as Library, new Set(["200#33"]));
    expect(groups).toHaveLength(1);
    expect(groups[0].category.id).toBe("b");
  });
});

describe("slide id format", () => {
  it("builds '<id>#<creationId>' for library slides", () => {
    const lib = parseLibrary(raw);
    expect(sourceSlideId(lib.slides[0])).toBe("300#11");
    expect(isValidSlideIdFormat("300#11")).toBe(true);
  });
  it("returns undefined for layouts and validates the format", () => {
    const lib = parseLibrary(raw);
    expect(sourceSlideId(lib.slides[3])).toBeUndefined();
    expect(isValidSlideIdFormat("300")).toBe(false);
    expect(isValidSlideIdFormat("abc#1")).toBe(false);
    expect(isValidSlideIdFormat("256#")).toBe(true);
  });
});

describe("helpers", () => {
  it("formats German dates", () => {
    expect(formatGermanDate("2026-11-20T10:00:00Z")).toBe("20.11.2026");
    expect(formatGermanDate("kaputt")).toBe("unbekannt");
  });
  it("adds a cache-busting version to asset URLs", () => {
    expect(assetUrl("thumbs/1.png", "abc")).toBe("assets/library/thumbs/1.png?v=abc");
    expect(assetUrl("thumbs/1.png", "abc", "https://x.github.io/PPT-Slides/taskpane.html")).toBe("https://x.github.io/PPT-Slides/assets/library/thumbs/1.png?v=abc");
  });
});
