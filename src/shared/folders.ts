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

export interface FolderNode {
  id: string;
  name: string;
  description?: string;
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

/** Builds the folder tree. Own categories keep their subcategories as subheadings (they are small). */
export function buildFolderTree(lib: Library): FolderNode {
  const root = node(ROOT_ID, "Bibliothek", null, false);
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

/** "12 Folien · 3 Ordner" */
export function folderMeta(n: FolderNode): string {
  const parts = [`${n.count} ${n.count === 1 ? "Folie" : "Folien"}`];
  if (n.children.length) parts.push(`${n.children.length} Ordner`);
  return parts.join(" · ");
}
