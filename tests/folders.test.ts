import {
  AREA_LABELS,
  buildFolderTree,
  foldersByArea,
  findFolder,
  folderMeta,
  folderOf,
  folderPathLabel,
  folderSlides,
  folderTrail,
  ROOT_ID,
} from "../src/shared/folders";
import { mergeLocal, planImport, type LocalLibraryMeta } from "../src/shared/local";
import type { Library, SlideEntry } from "../src/shared/types";

function slide(
  key: string,
  category: string,
  subcategory: string | null,
  order: number
): SlideEntry {
  return {
    key,
    kind: "slide",
    position: order,
    title: key,
    category,
    subcategory,
    keywords: [],
    description: "",
    order,
    text: "",
    thumb: `thumbs/${key}.png`,
    preview: "",
    file: `slides/${key}.pptx`,
    hash: "",
    lint: { level: "ok", warnings: [] },
  };
}

const own: Library = {
  schema: 1,
  name: "Folienbibliothek",
  updated: "",
  built: "",
  build: "b",
  insertMode: "perSlide",
  libraryFile: "Library.pptx",
  categories: [
    {
      id: "struct",
      name: "Struktur & Storyline",
      subcategories: [
        { id: "cover", name: "Deckblatt" },
        { id: "exec", name: "Executive Summary" },
      ],
    },
    { id: "charts", name: "Diagramme", subcategories: [{ id: "bar", name: "Diagramme" }] },
  ],
  templates: [],
  slides: [
    slide("s1", "struct", "cover", 1),
    slide("s2", "struct", "exec", 2),
    slide("s3", "struct", "exec", 3),
    slide("c1", "charts", "bar", 4),
  ],
};

const paths = [
  "think-cell/think-cell Charts/Waterfall/01 - Build-down.pptx",
  "think-cell/think-cell Charts/Waterfall/02 - Build-up.pptx",
  "think-cell/think-cell Charts/Mekko/01 - Mekko.pptx",
  "think-cell/Useful Elements/Diagrams/Cubes/01 - Cubes.pptx",
  "think-cell/Useful Elements/Ratings/Star Rating/01 - Star.pptx",
  "think-cell/Maps/01 - World.pptx",
];
const catalog = {
  items: [
    {
      File: paths[0],
      Category: "think-cell Charts",
      Subcategory: "Waterfall",
      Source: "think-cell",
    },
    {
      File: paths[1],
      Category: "think-cell Charts",
      Subcategory: "Waterfall",
      Source: "think-cell",
    },
    { File: paths[2], Category: "think-cell Charts", Subcategory: "Mekko 1", Source: "think-cell" },
    {
      File: paths[3],
      Category: "Useful Elements",
      Subcategory: "Diagrams / Cubes",
      Source: "think-cell",
    },
    { File: paths[4], Category: "Useful Elements", Subcategory: "Ratings", Source: "think-cell" },
    { File: paths[5], Category: "Maps", Subcategory: "", Source: "think-cell" },
  ],
};
const meta: LocalLibraryMeta = {
  id: "l1",
  label: "think-cell",
  prefix: "think-cell",
  folder: "library",
  imported: "2026-11-21T10:00:00Z",
  items: planImport(paths, "library", catalog).items,
};

describe("folder tree", () => {
  const lib = mergeLocal(own, [meta]);
  const root = buildFolderTree(lib);

  test("top level: own categories first, then one folder per local library", () => {
    expect(root.id).toBe(ROOT_ID);
    expect(root.children.map((c) => c.name)).toEqual([
      "Struktur & Storyline",
      "Diagramme",
      "think-cell",
    ]);
    expect(root.count).toBe(10);
    expect(root.children[2].local).toBe(true);
  });

  test("own categories keep subcategories as subheadings, not subfolders", () => {
    const struct = root.children[0];
    expect(struct.children).toEqual([]);
    expect(struct.groups.map((g) => [g.name, g.slides.length])).toEqual([
      ["Deckblatt", 1],
      ["Executive Summary", 2],
    ]);
    // single subcategory named like the category: no extra heading
    expect(root.children[1].groups.map((g) => g.name)).toEqual([null]);
  });

  test("local library mirrors the think-cell folder structure", () => {
    const tc = root.children[2];
    // imported folders are sorted by visible name ("think-cell Charts" → "Charts")
    expect(tc.children.map((c) => c.name)).toEqual(["Charts", "Maps", "Useful Elements"]);
    const charts = tc.children[0];
    expect(charts.children.map((c) => c.name)).toEqual(["Mekko 1", "Waterfall"]);
    expect(charts.children[1].groups[0].slides.map((s) => s.title)).toEqual([
      "Build-down 1",
      "Build-up 2",
    ]);
    const useful = tc.children[2];
    expect(useful.children.map((c) => c.name)).toEqual(["Diagrams", "Ratings"]);
    expect(useful.children[0].children.map((c) => c.name)).toEqual(["Cubes"]);
    expect(useful.count).toBe(2);
    // slides without subcategory sit directly in the category folder
    expect(tc.children[1].groups[0].slides).toHaveLength(1);
  });

  test("navigation helpers", () => {
    const cubes = root.children[2].children[2].children[0].children[0];
    expect(findFolder(root, cubes.id)).toBe(cubes);
    expect(findFolder(root, "nope")).toBeNull();
    expect(folderTrail(cubes).map((n) => n.name)).toEqual([
      "Library",
      "think-cell",
      "Useful Elements",
      "Diagrams",
      "Cubes",
    ]);
    expect(folderPathLabel(cubes)).toBe("think-cell › Useful Elements › Diagrams › Cubes");
    expect(folderMeta(root.children[2])).toBe("6 slides · 3 folders");
    expect(folderMeta(cubes)).toBe("1 slide");
    expect(folderSlides(root.children[2], 3).map((s) => s.title)).toEqual([
      "Mekko 1",
      "Build-down 1",
      "Build-up 2",
    ]);
    const key = lib.slides.find((s) => s.title === "Star 1")!.key;
    expect(folderOf(root, key)?.name).toBe("Ratings");
  });

  test("library without local folders", () => {
    const r = buildFolderTree(own);
    expect(r.children.map((c) => c.id)).toEqual(["c:struct", "c:charts"]);
  });
});

describe("shared taxonomy (slides / elements)", () => {
  const taxLib: Library = {
    ...own,
    categories: [
      {
        ...own.categories[1],
        area: "slides",
        subcategories: [...own.categories[1].subcategories, { id: "line", name: "Line" }],
      }, // charts
      {
        id: "el-diagrams",
        name: "Diagram Elements",
        area: "elements",
        subcategories: [
          { id: "cubes", name: "Cubes" },
          { id: "pyramids", name: "Pyramids & Core Elements" },
        ],
      },
      { ...own.categories[0], area: "slides" }, // struct (listed after an element category on purpose)
    ],
  };
  // 14 mapped chart slides (> SUBFOLDER_THRESHOLD with own c1) + 2 elements + 1 unmapped
  const files = [
    ...Array.from(
      { length: 13 },
      (_, i) => `tc/Charts/${String(i + 1).padStart(2, "0")} - Column ${i + 1}.pptx`
    ),
    "tc/Useful Elements/Cubes/01 - Cubes.pptx",
    "tc/Diagrams/Pyramids/03 - Pyramid with four layers.pptx",
    "tc/Other/01 - Unmapped.pptx",
  ];
  const tcCatalog = {
    items: files.map((f, i) => ({
      File: f,
      Title: i === 13 ? "" : f.split(" - ")[1].replace(".pptx", ""),
      Category: "x",
      Source: "think-cell",
      ...(i < 13 ? { TaxCategory: "charts", TaxSubcategory: i < 7 ? "bar" : "line" } : {}),
      ...(i === 13 ? { TaxCategory: "el-diagrams", TaxSubcategory: "cubes" } : {}),
      ...(i === 14 ? { TaxCategory: "el-diagrams", TaxSubcategory: "pyramids" } : {}),
    })),
  };
  const tcMeta: LocalLibraryMeta = {
    id: "l2",
    label: "think-cell",
    prefix: "think-cell",
    folder: "library",
    imported: "",
    items: planImport(files, "library", tcCatalog).items,
  };
  const lib = mergeLocal(taxLib, [tcMeta]);
  const root = buildFolderTree(lib);

  test("mapped imports join the library categories; areas ordered slides, elements, local", () => {
    expect(foldersByArea(root).map((a) => [a.area, a.folders.map((f) => f.name)])).toEqual([
      ["slides", ["Diagramme", "Struktur & Storyline"]],
      ["elements", ["Diagram Elements"]],
      ["local", ["think-cell"]],
    ]);
    expect(AREA_LABELS.elements).toBe("Elements");
  });

  test("large categories get subfolders, own slides first; untitled elements get a variant number", () => {
    const charts = root.children[0];
    expect(charts.count).toBe(14);
    expect(charts.children.map((c) => c.name)).toEqual(["Diagramme", "Line"]);
    // own slide c1 sorts before the imported ones of the same subcategory
    expect(charts.children[0].groups[0].slides[0].key).toBe("c1");
    const el = root.children.find((c) => c.area === "elements")!;
    expect(el.count).toBe(2); // small category: subheadings, no subfolders
    expect(el.children).toEqual([]);
    expect(el.groups.map((g) => [g.name, g.slides.map((s) => s.title)])).toEqual([
      ["Cubes", ["Cubes 1"]],
      ["Pyramids & Core Elements", ["Pyramid with four layers"]],
    ]);
    expect(findFolder(root, "c:charts/line")?.area).toBe("slides");
  });
});
