import {
  catalogPaths,
  chipList,
  encodeAssetPath,
  normalizeBaseUrl,
  displayCategory,
  matchesChip,
  mergeLocal,
  parseKeywords,
  parseLocalPath,
  planImport,
  stripIndex,
  toLibraryParts,
  type LocalLibraryMeta,
} from "../src/shared/local";
import { assetUrl, groupLibrary } from "../src/shared/library";
import type { Library } from "../src/shared/types";

const baseLib: Library = {
  schema: 1,
  name: "Folienbibliothek",
  updated: "2026-11-20",
  built: "",
  build: "b1",
  insertMode: "perSlide",
  libraryFile: "Library.pptx",
  categories: [{ id: "exec", name: "Executive Summary", subcategories: [] }],
  templates: [],
  slides: [
    {
      key: "1#2",
      kind: "slide",
      position: 1,
      title: "Summary",
      category: "exec",
      subcategory: null,
      keywords: [],
      description: "",
      order: 1,
      text: "",
      thumb: "thumbs/1.png",
      preview: "previews/1.png",
      file: "slides/1.pptx",
      hash: "",
      lint: { level: "ok", warnings: [] },
    },
  ],
};

const catalog = {
  items: [
    {
      File: "think-cell\\think-cell Charts\\Waterfall\\02 - Build-up waterfall.pptx",
      Thumb: "_thumbs\\think-cell\\think-cell Charts\\Waterfall\\02 - Build-up waterfall.png",
      Title: "Contribution to change: Build-up waterfall",
      Category: "think-cell Charts",
      Subcategory: "Waterfall",
      Keywords: "waterfall, think-cell, chart",
      Text: "Lorem ipsum",
      Source: "think-cell",
      Design: "Library.pptx",
    },
    {
      File: "think-cell\\Useful Elements\\Useful Shapes\\Devices\\01 - Devices.pptx",
      Thumb: "_thumbs\\think-cell\\Useful Elements\\Useful Shapes\\Devices\\01 - Devices.png",
      Title: "",
      Category: "Useful Elements",
      Subcategory: "Useful Shapes",
      Source: "think-cell",
      Design: "Library.pptx",
    },
    { File: "think-cell\\Maps\\01 - World.pptx", Category: "Maps", Source: "think-cell" },
  ],
};

const pickedWithCatalog = [
  "catalog.json",
  "think-cell/think-cell Charts/Waterfall/02 - Build-up waterfall.pptx",
  "_thumbs/think-cell/think-cell Charts/Waterfall/02 - Build-up waterfall.png",
  "think-cell/Useful Elements/Useful Shapes/Devices/01 - Devices.pptx",
];

describe("local libraries: import plan", () => {
  test("uses catalog.json: titles, categories, keywords, thumbs, label with design", () => {
    const plan = planImport(pickedWithCatalog, "library-own", catalog);
    expect(plan.label).toBe("think-cell (eigenes Design)");
    expect(plan.prefix).toBe("think-cell");
    expect(plan.missing).toBe(1); // Maps file was not picked
    expect(plan.items).toHaveLength(2);
    const [wf, dev] = plan.items;
    expect(wf.file).toBe("think-cell/think-cell Charts/Waterfall/02 - Build-up waterfall.pptx");
    expect(wf.thumb).toBe(
      "_thumbs/think-cell/think-cell Charts/Waterfall/02 - Build-up waterfall.png"
    );
    expect(wf.title).toBe("Contribution to change: Build-up waterfall");
    expect(wf.keywords).toEqual(["waterfall", "think-cell", "chart"]);
    expect(wf.text).toBe(""); // placeholder copy is not indexed
    expect(dev.title).toBe("Devices 1"); // untitled → file name + variant number
    expect(dev.thumb).toBe(""); // thumbnail not part of the selection
  });

  test("without catalog: folders become category/subcategory, _thumbs are matched", () => {
    const plan = planImport(
      [
        "Charts/Bar/01 - Stacked.pptx",
        "_thumbs/Charts/Bar/01 - Stacked.png",
        "Charts/Bar/~$lock.pptx",
        "notes.txt",
      ],
      "Meine Folien"
    );
    expect(plan.label).toBe("Meine Folien");
    expect(plan.items).toEqual([
      {
        file: "Charts/Bar/01 - Stacked.pptx",
        thumb: "_thumbs/Charts/Bar/01 - Stacked.png",
        title: "Stacked",
        category: "Charts",
        subcategory: "Bar",
        keywords: [],
        text: "",
      },
    ]);
  });

  test("online library helpers", () => {
    expect(normalizeBaseUrl(" slidelib.example.workers.dev/ ")).toBe(
      "https://slidelib.example.workers.dev"
    );
    expect(normalizeBaseUrl("http://127.0.0.1:8787//")).toBe("http://127.0.0.1:8787");
    expect(encodeAssetPath("think-cell\\Text Boxes\\11 - Matrix 2×2.pptx")).toBe(
      "think-cell/Text%20Boxes/11%20-%20Matrix%202%C3%972.pptx"
    );
    expect(catalogPaths(catalog)).toEqual([
      "think-cell/think-cell Charts/Waterfall/02 - Build-up waterfall.pptx",
      "_thumbs/think-cell/think-cell Charts/Waterfall/02 - Build-up waterfall.png",
      "think-cell/Useful Elements/Useful Shapes/Devices/01 - Devices.pptx",
      "_thumbs/think-cell/Useful Elements/Useful Shapes/Devices/01 - Devices.png",
      "think-cell/Maps/01 - World.pptx",
    ]);
    expect(catalogPaths(null)).toEqual([]);
  });

  test("helpers", () => {
    expect(stripIndex("03 - Agenda I")).toBe("Agenda I");
    expect(stripIndex("Agenda")).toBe("Agenda");
    expect(displayCategory("think-cell Charts", "think-cell")).toBe("Charts");
    expect(displayCategory("Maps", "think-cell")).toBe("Maps");
    expect(
      parseKeywords(undefined, "Title Keywords: bar chart, columns, graph Lorem ipsum")
    ).toEqual(["bar chart", "columns", "graph"]);
    expect(parseLocalPath("local:l1/a/b.pptx")).toEqual({ libId: "l1", path: "a/b.pptx" });
    expect(parseLocalPath("slides/1.pptx")).toBeNull();
  });
});

describe("local libraries: merge into the library", () => {
  const meta: LocalLibraryMeta = {
    id: "l1",
    label: "think-cell (eigenes Design)",
    prefix: "think-cell",
    folder: "library-own",
    imported: "2026-11-21T10:00:00Z",
    items: planImport(pickedWithCatalog, "library-own", catalog).items,
  };

  test("categories per top folder, subcategories, local keys", () => {
    const parts = toLibraryParts(meta);
    expect(parts.categories.map((c) => c.name)).toEqual([
      "think-cell (eigenes Design) · Charts",
      "think-cell (eigenes Design) · Useful Elements",
    ]);
    expect(parts.categories[0].subcategories.map((s) => s.name)).toEqual(["Waterfall"]);
    const s = parts.slides[0];
    expect(s.key.startsWith("local:l1/")).toBe(true);
    expect(s.file).toBe(
      "local:l1/think-cell/think-cell Charts/Waterfall/02 - Build-up waterfall.pptx"
    );
    expect(s.placeholders).toEqual([]);
  });

  test("mergeLocal appends after own content and groups correctly", () => {
    const lib = mergeLocal(baseLib, [meta]);
    expect(lib.slides).toHaveLength(3);
    expect(lib.localLibs).toEqual([
      { id: "l1", label: "think-cell (eigenes Design)", count: 2, imported: meta.imported },
    ]);
    const groups = groupLibrary(lib);
    expect(groups.map((g) => g.category.id)).toEqual([
      "exec",
      "local:l1:think-cell-charts",
      "local:l1:useful-elements",
    ]);
    expect(mergeLocal(baseLib, [])).toBe(baseLib);
  });

  test("one chip per local library; chip filter matches all its categories", () => {
    const lib = mergeLocal(baseLib, [meta]);
    expect(chipList(lib).map((c) => c.id)).toEqual(["exec", "lib:l1"]);
    expect(matchesChip("local:l1:think-cell-charts", "lib:l1")).toBe(true);
    expect(matchesChip("exec", "lib:l1")).toBe(false);
    expect(matchesChip("exec", "exec")).toBe(true);
    expect(matchesChip("local:l1:maps", "all")).toBe(true);
  });

  test("items mapped to the shared taxonomy join existing categories (unknown ids fall back)", () => {
    const mapped: LocalLibraryMeta = {
      ...meta,
      items: [
        { ...meta.items[0], categoryId: "exec", subcategoryId: "nope" },
        { ...meta.items[1], categoryId: "unknown-cat" },
      ],
    };
    const lib = mergeLocal(baseLib, [mapped]);
    expect(lib.categories.map((c) => c.id)).toEqual(["exec", "local:l1:useful-elements"]);
    const [a, b] = lib.slides.slice(1);
    expect([a.category, a.subcategory]).toEqual(["exec", null]);
    expect(a.order).toBeGreaterThan(10000);
    expect(b.category).toBe("local:l1:useful-elements");
  });

  test("assetUrl never builds a web URL for local files", () => {
    expect(assetUrl("local:l1/x.png", "b1")).toMatch(/^data:image\/gif/);
    expect(assetUrl("thumbs/1.png", "b1")).toBe("assets/library/thumbs/1.png?v=b1");
  });
});
