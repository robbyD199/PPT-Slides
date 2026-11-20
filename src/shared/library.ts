import type { Category, Group, Library, SlideEntry, SubGroup } from "./types";

export class LibraryError extends Error {}

const FALLBACK_CATEGORY: Category = {
  id: "_uncategorized",
  name: "Ohne Kategorie",
  subcategories: [],
};

/** Validates the parsed library.json and returns a typed Library. Throws LibraryError (German text). */
export function parseLibrary(data: unknown): Library {
  if (!data || typeof data !== "object") {
    throw new LibraryError("Die Bibliotheksdatei ist leer oder kein gültiges JSON.");
  }
  const lib = data as Partial<Library>;
  if (!Array.isArray(lib.slides)) {
    throw new LibraryError("Die Bibliotheksdatei enthält keine Folienliste.");
  }
  if (!Array.isArray(lib.categories)) {
    throw new LibraryError("Die Bibliotheksdatei enthält keine Kategorien.");
  }
  const slides: SlideEntry[] = lib.slides.map((raw, i) => {
    const s = raw as Partial<SlideEntry>;
    if (!s || typeof s.key !== "string" || typeof s.file !== "string") {
      throw new LibraryError(`Folie Nr. ${i + 1} in der Bibliotheksdatei ist unvollständig.`);
    }
    return {
      key: s.key,
      kind: s.kind === "layout" ? "layout" : "slide",
      slideId: s.slideId,
      creationId: s.creationId ?? null,
      position: Number(s.position ?? i + 1),
      title: String(s.title ?? s.key),
      category: s.category ?? null,
      subcategory: s.subcategory ?? null,
      keywords: Array.isArray(s.keywords) ? s.keywords.map(String) : [],
      description: String(s.description ?? ""),
      order: Number(s.order ?? s.position ?? i + 1),
      sourceTitle: s.sourceTitle,
      layout: s.layout ?? null,
      text: String(s.text ?? ""),
      thumb: String(s.thumb ?? ""),
      preview: String(s.preview ?? s.thumb ?? ""),
      file: s.file,
      hash: String(s.hash ?? ""),
      lint: s.lint && typeof s.lint === "object" ? s.lint : { level: "ok", warnings: [] },
    };
  });
  return {
    schema: Number(lib.schema ?? 1),
    name: String(lib.name ?? "Folienbibliothek"),
    updated: String(lib.updated ?? ""),
    built: String(lib.built ?? ""),
    build: String(lib.build ?? ""),
    insertMode: lib.insertMode === "library" ? "library" : "perSlide",
    libraryFile: String(lib.libraryFile ?? "Library.pptx"),
    categories: lib.categories,
    templates: Array.isArray(lib.templates) ? lib.templates : [],
    slides,
  };
}

/** Office.js slide id format used for sourceSlideIds: "<id>#<creationId>". */
export function sourceSlideId(entry: SlideEntry): string | undefined {
  if (entry.kind !== "slide" || !entry.slideId) return undefined;
  return entry.creationId ? `${entry.slideId}#${entry.creationId}` : `${entry.slideId}#`;
}

/** True when the id looks like an Office.js slide id ("123#456" or "123#"). */
export function isValidSlideIdFormat(id: string): boolean {
  return /^\d+#\d*$/.test(id);
}

/**
 * Groups slides by category and subcategory, in the order defined in library.json.
 * If `only` is given, only those keys are included and empty groups are dropped.
 */
export function groupLibrary(lib: Library, only?: Set<string>): Group[] {
  const byCat = new Map<string, SlideEntry[]>();
  for (const s of lib.slides) {
    if (only && !only.has(s.key)) continue;
    const cat =
      s.category && lib.categories.some((c) => c.id === s.category)
        ? s.category
        : FALLBACK_CATEGORY.id;
    const list = byCat.get(cat) ?? [];
    list.push(s);
    byCat.set(cat, list);
  }
  const groups: Group[] = [];
  const cats = [...lib.categories, FALLBACK_CATEGORY];
  for (const category of cats) {
    const slides = (byCat.get(category.id) ?? []).slice().sort((a, b) => a.order - b.order);
    if (!slides.length) continue;
    const subgroups: SubGroup[] = [];
    for (const sub of category.subcategories) {
      const inSub = slides.filter((s) => s.subcategory === sub.id);
      if (inSub.length) subgroups.push({ subcategory: sub, slides: inSub });
    }
    const rest = slides.filter(
      (s) => !category.subcategories.some((sub) => sub.id === s.subcategory)
    );
    if (rest.length) subgroups.push({ subcategory: null, slides: rest });
    groups.push({ category, subgroups, count: slides.length });
  }
  return groups;
}

export function categoryName(lib: Library, id: string | null): string {
  return lib.categories.find((c) => c.id === id)?.name ?? FALLBACK_CATEGORY.name;
}

export function subcategoryName(lib: Library, catId: string | null, subId: string | null): string {
  const cat = lib.categories.find((c) => c.id === catId);
  return cat?.subcategories.find((s) => s.id === subId)?.name ?? "";
}

/** Formats an ISO date as German date, e.g. "20.11.2026". */
export function formatGermanDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "unbekannt";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

/** Builds an asset URL relative to the add-in page, with cache-busting version query. */
export function assetUrl(path: string, version: string, base?: string): string {
  const rel = `assets/library/${path}`;
  const url = base ? new URL(rel, base).toString() : rel;
  return version ? `${url}?v=${encodeURIComponent(version)}` : url;
}
