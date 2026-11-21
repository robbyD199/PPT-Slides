/** DOM pieces for folder navigation (task pane and search dialog). */
import { el, ICON } from "./dom";
import { folderMeta, folderSlides, folderTrail, type FolderNode } from "./folders";

export interface FolderViewOptions {
  url: (path: string) => string;
  onOpen: (folder: FolderNode) => void;
}

/** One folder: a small stack of slide thumbnails, name, "n Folien · m Ordner", chevron. */
export function folderRow(n: FolderNode, o: FolderViewOptions): HTMLButtonElement {
  const thumbs = folderSlides(n, 3);
  const stack = el("span", { class: "folder-stack", "aria-hidden": "true" });
  thumbs.forEach((s, i) => {
    if (!s.thumb) return;
    stack.append(
      el("img", {
        class: `fs fs-${i}`,
        src: o.url(s.thumb),
        alt: "",
        loading: "lazy",
        draggable: "false",
      })
    );
  });
  const b = el(
    "button",
    {
      class: `folder${n.local ? " folder-local" : ""}`,
      type: "button",
      title: n.description ? `${n.name} – ${n.description}` : n.name,
      "data-folder": n.id,
    },
    stack,
    el(
      "span",
      { class: "folder-text" },
      el(
        "span",
        { class: "folder-name" },
        el("span", { class: "folder-icon", html: ICON.folder }),
        el("span", { class: "folder-label" }, n.name)
      ),
      el("span", { class: "folder-meta" }, folderMeta(n))
    ),
    el("span", { class: "folder-chev", html: ICON.chevron })
  );
  b.addEventListener("click", () => o.onOpen(n));
  return b;
}

export function folderList(nodes: FolderNode[], o: FolderViewOptions): HTMLElement {
  return el("div", { class: "folders" }, ...nodes.map((n) => folderRow(n, o)));
}

/** Breadcrumb: ‹ Bibliothek › think-cell › Charts (last item = current folder). */
export function breadcrumb(n: FolderNode, onOpen: (folder: FolderNode) => void): HTMLElement[] {
  const trail = folderTrail(n);
  const out: HTMLElement[] = [];
  if (trail.length > 1) {
    const up = trail[trail.length - 2];
    out.push(
      el("button", {
        class: "crumb-back",
        type: "button",
        title: `Zurück zu „${up.name}“ (Rücktaste)`,
        "aria-label": "Eine Ebene zurück",
        html: ICON.chevron,
        onclick: () => onOpen(up),
      })
    );
  }
  trail.forEach((x, i) => {
    if (i > 0) out.push(el("span", { class: "crumb-sep", "aria-hidden": "true" }, "›"));
    out.push(
      i === trail.length - 1
        ? el("span", { class: "crumb is-current", "aria-current": "page" }, x.name)
        : el("button", { class: "crumb", type: "button", onclick: () => onOpen(x) }, x.name)
    );
  });
  return out;
}
