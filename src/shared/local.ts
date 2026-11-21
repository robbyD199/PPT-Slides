/**
 * Local libraries: slide folders the user imports from his own disk ("Lokalen Ordner hinzufügen").
 * Files are stored only in the browser storage of this PC (IndexedDB, see localStore.ts) and are never
 * uploaded. This module is pure (no DOM/IndexedDB) so it can be unit tested.
 */
import type { Category, Library, LocalLibraryInfo, SlideEntry, Subcategory } from "./types";

export const LOCAL_PREFIX = "local:";

export interface LocalItem {
  /** .pptx/.potx path relative to the imported folder, "/" separators */
  file: string;
  /** thumbnail path relative to the imported folder, "" if none */
  thumb: string;
  title: string;
  category: string;
  subcategory: string;
  keywords: string[];
  text: string;
  /** id of a library category (shared taxonomy, from catalog "TaxCategory"); the slide then appears in that
   * category's folder instead of the folder of its local library */
  categoryId?: string;
  /** id of a subcategory of categoryId (catalog "TaxSubcategory") */
  subcategoryId?: string;
}

export interface LocalLibraryMeta {
  id: string;
  /** shown on chips and section headers, e.g. "think-cell (eigenes Design)" */
  label: string;
  /** category name prefix that is redundant with the label, e.g. "think-cell" */
  prefix: string;
  folder: string;
  imported: string;
  items: LocalItem[];
  /** set when the library was downloaded from a key-protected server (kept only on this PC, for updates) */
  remote?: { url: string; lib: string; key: string };
}

/** "https://x.workers.dev/" → "https://x.workers.dev" (https added when missing). */
export function normalizeBaseUrl(url: string): string {
  let u = url.trim().replace(/\/+$/, "");
  if (u && !/^https?:\/\//i.test(u)) u = `https://${u}`;
  return u;
}

/** URL path for a catalog path: each segment encoded ("a b/2×2.pptx" → "a%20b/2%C3%972.pptx"). */
export function encodeAssetPath(p: string): string {
  return normalizePath(p).split("/").map(encodeURIComponent).join("/");
}

/**
 * Download paths on the server: catalog "Href"/"ThumbHref" (URL-safe copies made by the Worker build) by
 * original path. Paths without an entry are downloaded under their own name.
 */
export function catalogHrefs(catalog: unknown): Map<string, string> {
  const out = new Map<string, string>();
  const items =
    catalog && typeof catalog === "object" && Array.isArray((catalog as { items?: unknown }).items)
      ? (catalog as { items: Record<string, unknown>[] }).items
      : [];
  for (const it of items) {
    if (typeof it?.File === "string" && typeof it.Href === "string")
      out.set(normalizePath(it.File), normalizePath(it.Href));
    if (typeof it?.Thumb === "string" && typeof it.ThumbHref === "string")
      out.set(normalizePath(it.Thumb), normalizePath(it.ThumbHref));
  }
  return out;
}

/** All files a catalog references (slides and thumbnails), normalized. */
export function catalogPaths(catalog: unknown): string[] {
  const items =
    catalog && typeof catalog === "object" && Array.isArray((catalog as { items?: unknown }).items)
      ? (catalog as { items: { File?: unknown; Thumb?: unknown }[] }).items
      : [];
  const out: string[] = [];
  for (const it of items) {
    if (typeof it?.File === "string") out.push(normalizePath(it.File));
    if (typeof it?.Thumb === "string" && it.Thumb) out.push(normalizePath(it.Thumb));
  }
  return out;
}

export interface ImportPlan {
  label: string;
  prefix: string;
  items: LocalItem[];
  /** catalog entries whose file was not part of the selection */
  missing: number;
}

export function normalizePath(p: string): string {
  return p.replace(/\\/g, "/").replace(/^\.?\/+/, "");
}

/** "03 - Agenda I" → "Agenda I" */
export function stripIndex(name: string): string {
  return name.replace(/^\d{1,3}\s*-\s*/, "").trim() || name;
}

function baseName(path: string): string {
  const file = path.split("/").pop() ?? path;
  return file.replace(/\.(pptx|potx)$/i, "");
}

/** Title for slides without title placeholder: "07 - Currencies" → "Currencies 7" (variants stay distinguishable). */
export function untitledName(path: string): string {
  const base = baseName(path);
  const m = /^(\d{1,3})\s*-\s*(.+)$/.exec(base);
  return m ? `${m[2].trim()} ${Number(m[1])}` : base;
}

const SLIDE_FILE = /\.(pptx|potx)$/i;

/** Keywords from a catalog field ("a, b, c") or from a "Keywords: a, b, c" line in the slide text. */
export function parseKeywords(field: string | undefined, text = ""): string[] {
  let list = field ?? "";
  if (!list) {
    const m = /Keywords?:\s*((?:[\w&/+\- ]+?,\s*)*[\w&/+-]+)/i.exec(text);
    list = m ? m[1] : "";
  }
  const out: string[] = [];
  for (const k of list.split(/\s*[,;]\s*/)) {
    const v = k.trim();
    if (v && v.length < 40 && !out.includes(v)) out.push(v);
  }
  return out;
}

interface CatalogRow {
  File?: string;
  Thumb?: string;
  Title?: string;
  Category?: string;
  Subcategory?: string;
  Keywords?: string;
  Text?: string;
  Source?: string;
  Design?: string;
  TaxCategory?: string;
  TaxSubcategory?: string;
}

/**
 * Plans an import from the relative paths of the picked folder (root folder already removed).
 * With a catalog.json (written by TC-Library/scripts/tc-split.ps1) titles and categories come from it;
 * otherwise folder = category, subfolders = subcategory, file name = title, `_thumbs/<path>.png` = thumbnail.
 */
export function planImport(paths: string[], folderName: string, catalog?: unknown): ImportPlan {
  const set = new Set(paths.map(normalizePath));
  const rows =
    catalog && typeof catalog === "object" && Array.isArray((catalog as { items?: unknown }).items)
      ? ((catalog as { items: CatalogRow[] }).items ?? [])
      : null;
  const items: LocalItem[] = [];
  let missing = 0;
  if (rows) {
    for (const r of rows) {
      if (!r || typeof r.File !== "string") continue;
      const file = normalizePath(r.File);
      if (!set.has(file)) {
        missing++;
        continue;
      }
      const thumb = r.Thumb ? normalizePath(r.Thumb) : "";
      const parts = file.split("/");
      items.push({
        file,
        thumb: thumb && set.has(thumb) ? thumb : "",
        title: (r.Title ?? "").trim() || untitledName(file),
        category: (r.Category ?? "").trim() || parts[parts.length > 2 ? 1 : 0] || folderName,
        subcategory: String(r.Subcategory ?? "")
          .split(/\s*\/\s*/)
          .filter(Boolean)
          .join(" › "),
        keywords: parseKeywords(r.Keywords, String(r.Text ?? "")),
        // template body text is placeholder copy (lorem ipsum) – searching it only adds noise
        text: "",
        ...(r.TaxCategory
          ? { categoryId: r.TaxCategory, subcategoryId: r.TaxSubcategory || undefined }
          : {}),
      });
    }
    const source = rows.find((r) => r?.Source)?.Source?.trim() ?? "";
    const design = rows.find((r) => r?.Design)?.Design ?? "source";
    const prefix = source || folderName;
    const label = design && design !== "source" ? `${prefix} (eigenes Design)` : prefix;
    return { label, prefix, items, missing };
  }
  for (const path of [...set].sort((a, b) => a.localeCompare(b))) {
    if (!SLIDE_FILE.test(path) || path.startsWith("_thumbs/")) continue;
    const name = path.split("/").pop() ?? "";
    if (name.startsWith("~$")) continue;
    const folders = path.split("/").slice(0, -1);
    const thumb = `_thumbs/${path.replace(SLIDE_FILE, "")}.png`;
    items.push({
      file: path,
      thumb: set.has(thumb) ? thumb : "",
      title: stripIndex(baseName(path)),
      category: folders[0] ?? folderName,
      subcategory: folders.slice(1).join(" › "),
      keywords: [],
      text: "",
    });
  }
  return { label: folderName, prefix: folderName, items, missing };
}

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "x"
  );
}

/** Category label without a prefix that repeats the library label ("think-cell Charts" → "Charts"). */
export function displayCategory(category: string, prefix: string): string {
  if (prefix && category.toLowerCase().startsWith(prefix.toLowerCase() + " ")) {
    const rest = category.slice(prefix.length).trim();
    if (rest) return rest.charAt(0).toUpperCase() + rest.slice(1);
  }
  return category;
}

export function localKey(libId: string, path: string): string {
  return `${LOCAL_PREFIX}${libId}/${path}`;
}

export function isLocalPath(p: string): boolean {
  return p.startsWith(LOCAL_PREFIX);
}

export function parseLocalPath(p: string): { libId: string; path: string } | null {
  if (!isLocalPath(p)) return null;
  const rest = p.slice(LOCAL_PREFIX.length);
  const i = rest.indexOf("/");
  return i > 0 ? { libId: rest.slice(0, i), path: rest.slice(i + 1) } : null;
}

/**
 * Converts a stored local library into categories and slide entries of the common Library model.
 * Items mapped to a category of the shared taxonomy (`known`) go into that category; all others get
 * categories of their own (one folder per local library).
 */
export function toLibraryParts(
  meta: LocalLibraryMeta,
  known: Category[] = []
): {
  categories: Category[];
  slides: SlideEntry[];
} {
  const cats = new Map<string, Category>();
  const slides: SlideEntry[] = [];
  const base = {
    kind: "slide" as const,
    description: `Aus „${meta.label}“ – lokal auf diesem PC gespeichert`,
    layout: null,
    placeholders: [],
    hash: "",
    lint: { level: "ok" as const, warnings: [] },
  };
  meta.items.forEach((it, i) => {
    const target = it.categoryId ? known.find((c) => c.id === it.categoryId) : undefined;
    if (target) {
      const sub = target.subcategories.find((s) => s.id === it.subcategoryId);
      slides.push({
        ...base,
        key: localKey(meta.id, it.file),
        position: i + 1,
        title: it.title,
        category: target.id,
        subcategory: sub ? sub.id : null,
        keywords: it.keywords,
        order: 10000 + i + 1, // after own slides of the same subcategory
        text: it.text,
        thumb: it.thumb ? localKey(meta.id, it.thumb) : "",
        preview: it.thumb ? localKey(meta.id, it.thumb) : "",
        file: localKey(meta.id, it.file),
      });
      return;
    }
    const catId = `${LOCAL_PREFIX}${meta.id}:${slug(it.category)}`;
    let cat = cats.get(catId);
    if (!cat) {
      const short = displayCategory(it.category, meta.prefix);
      cat = {
        id: catId,
        name: `${meta.label} · ${short}`,
        short,
        description: `Lokal importiert aus „${meta.folder}“ – nur auf diesem PC gespeichert.`,
        subcategories: [],
      };
      cats.set(catId, cat);
    }
    let subId: string | null = null;
    if (it.subcategory) {
      subId = `${catId}:${slug(it.subcategory)}`;
      if (!cat.subcategories.some((s) => s.id === subId)) {
        cat.subcategories.push({ id: subId, name: it.subcategory } as Subcategory);
      }
    }
    slides.push({
      ...base,
      key: localKey(meta.id, it.file),
      position: i + 1,
      title: it.title,
      category: catId,
      subcategory: subId,
      keywords: it.keywords,
      order: 10000 + i + 1,
      text: it.text,
      thumb: it.thumb ? localKey(meta.id, it.thumb) : "",
      preview: it.thumb ? localKey(meta.id, it.thumb) : "",
      file: localKey(meta.id, it.file),
    });
  });
  return { categories: [...cats.values()], slides };
}

/** Appends local libraries to the library (own categories first). */
export function mergeLocal(lib: Library, metas: LocalLibraryMeta[]): Library {
  if (!metas.length) return lib;
  const categories = [...lib.categories];
  const slides = [...lib.slides];
  const localLibs: LocalLibraryInfo[] = [];
  for (const m of metas) {
    const parts = toLibraryParts(m, lib.categories);
    categories.push(...parts.categories);
    slides.push(...parts.slides);
    localLibs.push({
      id: m.id,
      label: m.label,
      count: parts.slides.length,
      imported: m.imported,
      ...(m.remote ? { remote: true } : {}),
    });
  }
  return { ...lib, categories, slides, localLibs };
}

/** Chip filter: "all", a category id, or "lib:<id>" for all categories of one local library. */
export function matchesChip(categoryId: string | null, chip: string): boolean {
  if (chip === "all") return true;
  if (chip.startsWith("lib:")) return !!categoryId?.startsWith(`${LOCAL_PREFIX}${chip.slice(4)}:`);
  return categoryId === chip;
}

export interface ChipInfo {
  id: string;
  label: string;
  title: string;
}

/** Chips: one per own category, one per local library (instead of one per local category). */
export function chipList(lib: Library): ChipInfo[] {
  const counts = new Map<string, number>();
  for (const s of lib.slides) counts.set(s.category ?? "", (counts.get(s.category ?? "") ?? 0) + 1);
  const out: ChipInfo[] = [];
  for (const c of lib.categories) {
    if (c.id.startsWith(LOCAL_PREFIX) || !counts.get(c.id)) continue;
    out.push({ id: c.id, label: c.short ?? c.name, title: `${c.name} (${counts.get(c.id)})` });
  }
  for (const l of lib.localLibs ?? []) {
    out.push({
      id: `lib:${l.id}`,
      label: l.label,
      title: `${l.label} – ${l.count} Folien (lokal)`,
    });
  }
  return out;
}

/* Object URLs of local thumbnails, filled by localStore.loadLocalLibraries() in the browser. */
const urlRegistry = new Map<string, string>();

export function registerLocalUrl(key: string, url: string): void {
  urlRegistry.set(key, url);
}

export function localUrl(key: string): string {
  return urlRegistry.get(key) ?? "";
}
