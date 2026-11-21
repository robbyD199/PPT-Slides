/**
 * Folder navigation (like the think-cell library): own categories are folders at the top level,
 * every imported local library is one folder whose subfolders mirror its directory structure.
 * Pure module (no DOM) – unit tested in tests/folders.test.ts.
 */
import { groupLibrary } from "./library";
import { LOCAL_PREFIX } from "./local";
import type { Library, SlideEntry } from "./types";

export interface SlideGroup {
  /** subheading inside a folder (own categories), null = no heading */
  name: string | null;
  slides: SlideEntry[];
}

/** Top-level areas: whole slides, building blocks to copy, unmapped imported folders. */
export type FolderArea = "slides" | "elements" | "local";

export const AREA_LABELS: Record<FolderArea, string> = {
  slides: "Slides",
  elements: "Elements",
  local: "Local Folders",
};

/** A category with more slides than this shows its subcategories as subfolders instead of subheadings. */
export const SUBFOLDER_THRESHOLD = 12;

export interface FolderNode {
  id: string;
  name: string;
  description?: string;
  area: FolderArea;
  local: boolean;
  parent: FolderNode | null;
  children: FolderNode[];
  /** slides directly in this folder */
  groups: SlideGroup[];
  /** all slides in this folder and below */
  count: number;
}

export const ROOT_ID = "";

function node(
  id: string,
  name: string,
  parent: FolderNode | null,
  local: boolean,
  description?: string
): FolderNode {
  const n: FolderNode = {
    id,
    name,
    description,
    area: parent && parent.id !== ROOT_ID ? parent.area : local ? "local" : "slides",
    local,
    parent,
    children: [],
    groups: [],
    count: 0,
  };
  parent?.children.push(n);
  return n;
}

function childFolder(parent: FolderNode, id: string, name: string, local: boolean): FolderNode {
  return parent.children.find((c) => c.id === id) ?? node(id, name, parent, local);
}

function computeCount(n: FolderNode): number {
  n.count =
    n.groups.reduce((s, g) => s + g.slides.length, 0) +
    n.children.reduce((s, c) => s + computeCount(c), 0);
  return n.count;
}

/**
 * Builds the folder tree. Library categories are top-level folders (area slides/elements); large ones get
 * one subfolder per subcategory, small ones show subcategories as subheadings. Imported slides that are not
 * mapped to a library category stay in one folder per local library (area "local").
 */
export function buildFolderTree(lib: Library): FolderNode {
  const root = node(ROOT_ID, "Library", null, false);
  const localRoots = new Map<string, FolderNode>();
  const labels = new Map((lib.localLibs ?? []).map((l) => [l.id, l.label]));
  for (const g of groupLibrary(lib)) {
    const cid = g.category.id;
    if (cid.startsWith(LOCAL_PREFIX)) {
      const libId = cid.slice(LOCAL_PREFIX.length).split(":")[0];
      let libNode = localRoots.get(libId);
      if (!libNode) {
        libNode = node(
          `l:${libId}`,
          labels.get(libId) ?? "Lokaler Ordner",
          root,
          true,
          "Lokal importiert – nur auf diesem PC gespeichert"
        );
        localRoots.set(libId, libNode);
      }
      const catNode = childFolder(libNode, cid, g.category.short ?? g.category.name, true);
      for (const sg of g.subgroups) {
        let target = catNode;
        const segs = sg.subcategory ? sg.subcategory.name.split(/\s*›\s*/).filter(Boolean) : [];
        for (const seg of segs) target = childFolder(target, `${target.id}/${seg}`, seg, true);
        const last = target.groups[target.groups.length - 1];
        if (last) last.slides.push(...sg.slides);
        else target.groups.push({ name: null, slides: [...sg.slides] });
      }
    } else {
      const catNode = node(`c:${cid}`, g.category.name, root, false, g.category.description);
      catNode.area = g.category.area === "elements" ? "elements" : "slides";
      const named = g.subgroups.filter((sg) => sg.subcategory);
      if (g.count > SUBFOLDER_THRESHOLD && named.length > 1) {
        for (const sg of g.subgroups) {
          if (!sg.subcategory) {
            catNode.groups.push({ name: null, slides: sg.slides });
            continue;
          }
          const sub = node(`c:${cid}/${sg.subcategory.id}`, sg.subcategory.name, catNode, false);
          sub.groups.push({ name: null, slides: sg.slides });
        }
      } else {
        const single = g.subgroups.length === 1;
        for (const sg of g.subgroups) {
          const name =
            sg.subcategory && !(single && sg.subcategory.name === g.category.name)
              ? sg.subcategory.name
              : null;
          catNode.groups.push({ name, slides: sg.slides });
        }
      }
    }
  }
  // order at the top level: slides, elements, local folders (stable within each area)
  const rank: Record<FolderArea, number> = { slides: 0, elements: 1, local: 2 };
  root.children = root.children
    .map((c, i) => ({ c, i }))
    .sort((a, b) => rank[a.c.area] - rank[b.c.area] || a.i - b.i)
    .map((x) => x.c);
  for (const l of localRoots.values()) sortLocal(l);
  computeCount(root);
  return root;
}

/** Imported folders are sorted by their visible name (e.g. "Charts" from "think-cell Charts"). */
function sortLocal(n: FolderNode): void {
  n.children.sort((a, b) => a.name.localeCompare(b.name, "de", { numeric: true }));
  n.children.forEach(sortLocal);
}

export function findFolder(root: FolderNode, id: string): FolderNode | null {
  if (root.id === id) return root;
  for (const c of root.children) {
    const hit = findFolder(c, id);
    if (hit) return hit;
  }
  return null;
}

/** Path from the root to the folder (inclusive), for the breadcrumb. */
export function folderTrail(n: FolderNode): FolderNode[] {
  const out: FolderNode[] = [];
  for (let x: FolderNode | null = n; x; x = x.parent) out.unshift(x);
  return out;
}

/** First slides in the folder (depth-first) – used as folder preview. */
export function folderSlides(n: FolderNode, max: number): SlideEntry[] {
  const out: SlideEntry[] = [];
  const walk = (x: FolderNode) => {
    for (const g of x.groups) for (const s of g.slides) if (out.length < max) out.push(s);
    for (const c of x.children) if (out.length < max) walk(c);
  };
  walk(n);
  return out;
}

/** Folder that directly contains the slide (for "show in folder" and captions). */
export function folderOf(root: FolderNode, key: string): FolderNode | null {
  for (const g of root.groups) if (g.slides.some((s) => s.key === key)) return root;
  for (const c of root.children) {
    const hit = folderOf(c, key);
    if (hit) return hit;
  }
  return null;
}

/** "think-cell (eigenes Design) › Charts › Waterfall" – path below the root. */
export function folderPathLabel(n: FolderNode | null): string {
  if (!n) return "";
  return folderTrail(n)
    .slice(1)
    .map((x) => x.name)
    .join(" › ");
}

/** "12 slides · 3 folders" */
export function folderMeta(n: FolderNode): string {
  const parts = [`${n.count} ${n.count === 1 ? "slide" : "slides"}`];
  if (n.children.length)
    parts.push(`${n.children.length} ${n.children.length === 1 ? "folder" : "folders"}`);
  return parts.join(" · ");
}

/** Top-level folders grouped by area, in display order (empty areas left out). */
export function foldersByArea(root: FolderNode): { area: FolderArea; folders: FolderNode[] }[] {
  return (["slides", "elements", "local"] as FolderArea[])
    .map((area) => ({ area, folders: root.children.filter((c) => c.area === area) }))
    .filter((x) => x.folders.length);
}
