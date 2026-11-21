import "./taskpane.css";
import { categoryName, formatGermanDate, subcategoryName } from "../shared/library";
import { buildIndex, search, type SearchIndex, SEARCH_SUGGESTIONS } from "../shared/search";
import {
  detectCapabilities,
  loadLibrary,
  SlideLibraryService,
  UserError,
  type InsertOutcome,
} from "../shared/service";
import { appendAll, applyOfficeTheme, debounce, el, icon, ICON } from "../shared/dom";
import { setCardState, slideCard } from "../shared/cards";
import { describeError, MSG } from "../shared/messages";
import { prefs } from "../shared/prefs";
import { openSearchDialog } from "../shared/dialogHost";
import { buildFolderTree, findFolder, ROOT_ID, type FolderNode } from "../shared/folders";
import { breadcrumb, folderList } from "../shared/folderView";
import { deleteLocalLibrary, importFolder } from "../shared/localStore";
import { destinationLayouts, hasLibraryMaster } from "../shared/insert";
import type { FormattingPref, Library, SlideEntry } from "../shared/types";

declare const __SELFTEST__: boolean;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

interface State {
  svc: SlideLibraryService | null;
  index: SearchIndex | null;
  query: string;
  /** current folder id (ROOT_ID = top level) */
  folder: string;
  tree: FolderNode | null;
  collapsed: Set<string>;
}

const state: State = {
  svc: null,
  index: null,
  query: "",
  folder: prefs.folder("pane"),
  tree: null,
  collapsed: new Set(prefs.collapsed()),
};
let servicePromise: Promise<SlideLibraryService> | null = null;

/* ------------------------------------------------------------------ toasts & banners */

function toast(
  kind: "success" | "error" | "info",
  message: string,
  detail = "",
  ms = 3200
): HTMLElement {
  const area = $("toasts");
  const t = el(
    "div",
    { class: `toast toast-${kind}`, role: kind === "error" ? "alert" : "status" },
    icon(kind === "success" ? "check" : kind === "error" ? "error" : "info", "icon toast-icon"),
    el(
      "div",
      { class: "toast-body" },
      el("div", { class: "toast-msg" }, message),
      detail ? el("div", { class: "toast-detail" }, detail) : null
    ),
    el("button", {
      class: "toast-close",
      type: "button",
      "aria-label": "Schließen",
      html: ICON.close,
      onclick: () => t.remove(),
    })
  );
  area.append(t);
  requestAnimationFrame(() => t.classList.add("is-visible"));
  window.setTimeout(
    () => {
      t.classList.remove("is-visible");
      window.setTimeout(() => t.remove(), 250);
    },
    kind === "error" ? Math.max(ms, 9000) : ms
  );
  return t;
}

function banner(kind: "error" | "info", message: string, dismissible = false): void {
  const b = el(
    "div",
    { class: `banner banner-${kind}` },
    icon(kind === "error" ? "error" : "info", "icon"),
    el("div", { class: "banner-text" }, message)
  );
  if (dismissible)
    b.append(
      el("button", {
        class: "toast-close",
        type: "button",
        "aria-label": "Ausblenden",
        html: ICON.close,
        onclick: () => b.remove(),
      })
    );
  $("banners").append(b);
}

/* ------------------------------------------------------------------ hover preview */

const preview = {
  timer: 0 as number | undefined,
  show(entry: SlideEntry, card: HTMLElement) {
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.render(entry, card), 380);
  },
  hide() {
    window.clearTimeout(this.timer);
    $("preview").hidden = true;
  },
  render(entry: SlideEntry, card: HTMLElement) {
    const svc = state.svc;
    if (!svc || document.body.classList.contains("is-busy")) return;
    const p = $("preview");
    const lib = svc.lib;
    const where = [
      categoryName(lib, entry.category),
      subcategoryName(lib, entry.category, entry.subcategory),
    ]
      .filter(Boolean)
      .join(" · ");
    p.innerHTML = "";
    appendAll(
      p,
      el("div", { class: "preview-img" }, el("img", { src: svc.url(entry.preview), alt: "" })),
      el(
        "div",
        { class: "preview-meta" },
        el("div", { class: "preview-title" }, entry.title),
        el("div", { class: "preview-where" }, where)
      ),
      entry.description ? el("div", { class: "preview-desc" }, entry.description) : null,
      entry.lint?.level === "warn"
        ? el(
            "div",
            { class: "preview-lint" },
            icon("warn", "icon icon-xs"),
            " Feste Farben/Schriften: passt sich evtl. nicht vollständig an."
          )
        : null,
      el("div", { class: "preview-hint" }, "Klicken zum Einfügen hinter der aktuellen Folie")
    );
    const r = card.getBoundingClientRect();
    const width = Math.min(window.innerWidth - 16, 520);
    p.style.width = `${width}px`;
    p.style.left = `${Math.max(8, Math.min(r.left + r.width / 2 - width / 2, window.innerWidth - width - 8))}px`;
    p.hidden = false;
    const h = p.offsetHeight;
    const below = r.bottom + 8;
    p.style.top =
      below + h < window.innerHeight - 8 ? `${below}px` : `${Math.max(8, r.top - h - 8)}px`;
  },
};

/* ------------------------------------------------------------------ insert */

function setBusy(busy: boolean): void {
  document.body.classList.toggle("is-busy", busy);
  $("content").setAttribute("aria-busy", busy ? "true" : "false");
}

let foreignChecked = false;

function onInserted(out: InsertOutcome): void {
  prefs.addRecent(out.entry.key);
  toast("success", MSG.inserted(out.entry.title, out.position, out.atEnd));
  // once per session: tell the user if the deck uses a foreign design (slides adopt its colors/fonts)
  if (!foreignChecked && prefs.formatting() === "UseDestinationTheme" && state.svc) {
    foreignChecked = true;
    const libLayouts = state.svc.lib.slides
      .filter((s) => s.kind === "layout")
      .map((s) => s.layout ?? "");
    void destinationLayouts().then((masters) => {
      if (masters && !hasLibraryMaster(masters, libLayouts)) {
        toast("info", MSG.foreignDesign, MSG.foreignDesignHint, 12000);
      }
    });
  }
}

async function activate(entry: SlideEntry, card: HTMLElement): Promise<void> {
  const svc = state.svc;
  if (!svc) return;
  if (svc.isBusy) {
    toast("info", MSG.busy, "", 1800);
    return;
  }
  preview.hide();
  setBusy(true);
  setCardState(card, "inserting");
  try {
    const out = await svc.insert(entry, prefs.formatting(), prefs.keepLayout());
    if (!out) return;
    setCardState(card, "done");
    onInserted(out);
    if (state.folder === ROOT_ID && !state.query) renderRecent();
  } catch (e) {
    setCardState(card, "error");
    const message = e instanceof UserError ? e.message : MSG.insertFailed;
    const detail = e instanceof UserError ? e.detail : describeError(e);
    toast("error", message, detail);
  } finally {
    setBusy(false);
  }
}

/* ------------------------------------------------------------------ rendering */

function cardFor(entry: SlideEntry, caption?: string): HTMLButtonElement {
  const svc = state.svc!;
  return slideCard(entry, {
    url: (p) => svc.url(p),
    caption,
    onActivate: (e, c) => void activate(e, c),
    onHover: (e, c) => {
      svc.prefetch(e);
      preview.show(e, c);
    },
    onLeave: () => preview.hide(),
  });
}

function section(
  id: string,
  title: string,
  count: number,
  body: HTMLElement,
  opts: { icon?: HTMLElement; description?: string } = {}
): HTMLElement {
  const collapsed = state.collapsed.has(id);
  const header = el(
    "button",
    {
      class: "section-header",
      type: "button",
      "aria-expanded": String(!collapsed),
      title: opts.description ?? "",
    },
    el("span", { class: "chev", html: ICON.chevron }),
    opts.icon ?? null,
    el("span", { class: "section-title" }, title),
    el("span", { class: "count" }, String(count))
  );
  const sec = el(
    "section",
    { class: `section${collapsed ? " is-collapsed" : ""}`, "data-section": id },
    header,
    body
  );
  header.addEventListener("click", () => {
    const now = !sec.classList.contains("is-collapsed");
    sec.classList.toggle("is-collapsed", now);
    header.setAttribute("aria-expanded", String(!now));
    if (now) state.collapsed.add(id);
    else state.collapsed.delete(id);
    prefs.setCollapsed([...state.collapsed]);
  });
  return sec;
}

function renderRecent(): void {
  const old = document.querySelector('[data-section="_recent"]');
  const svc = state.svc;
  if (!svc) return;
  const recent = prefs
    .recent()
    .map((k) => svc.lib.slides.find((s) => s.key === k))
    .filter((s): s is SlideEntry => !!s)
    .slice(0, 4);
  if (!recent.length) {
    old?.remove();
    return;
  }
  const grid = el("div", { class: "grid" }, ...recent.map((s) => cardFor(s)));
  const sec = section(
    "_recent",
    "Zuletzt verwendet",
    recent.length,
    el("div", { class: "section-body" }, grid),
    { icon: icon("clock", "icon icon-muted") }
  );
  if (old) old.replaceWith(sec);
  else $("content").prepend(sec);
}

function currentFolder(): FolderNode | null {
  if (!state.tree) return null;
  return findFolder(state.tree, state.folder) ?? state.tree;
}

function openFolder(id: string): void {
  state.folder = id;
  prefs.setFolder("pane", id);
  if (state.query) {
    state.query = "";
    $<HTMLInputElement>("search-input").value = "";
    $("search-clear").hidden = true;
  }
  renderCrumbs();
  render();
}

function renderCrumbs(): void {
  const nav = $("crumbs");
  nav.innerHTML = "";
  const node = currentFolder();
  nav.hidden = !node || !!state.query.trim();
  if (node) nav.append(...breadcrumb(node, (n) => openFolder(n.id)));
}

/** Folder view like the think-cell library: subfolders first, then the slides of this folder. */
function renderBrowse(): void {
  const content = $("content");
  content.innerHTML = "";
  const node = currentFolder();
  const svc = state.svc;
  if (!node || !svc) return;
  const isRoot = node.id === ROOT_ID;
  if (isRoot) renderRecent();
  if (node.children.length) {
    if (isRoot) content.append(el("div", { class: "folder-heading" }, "Ordner"));
    content.append(
      folderList(node.children, { url: (p) => svc.url(p), onOpen: (n) => openFolder(n.id) })
    );
  }
  const slides = node.groups.reduce((s, g) => s + g.slides.length, 0);
  if (!slides) return;
  if (node.children.length) content.append(el("div", { class: "folder-heading" }, "Folien"));
  const named = node.groups.filter((g) => g.name);
  if (named.length > 1 && slides / node.groups.length < 2) {
    // many small subgroups: one compact grid, subgroup name as caption on each card
    content.append(
      el(
        "div",
        { class: "grid" },
        ...node.groups.flatMap((g) =>
          g.slides.map((s) => cardFor(s, g.name && g.name !== s.title ? g.name : undefined))
        )
      )
    );
    return;
  }
  for (const g of node.groups) {
    if (g.name) content.append(el("div", { class: "subhead" }, g.name));
    content.append(el("div", { class: "grid" }, ...g.slides.map((s) => cardFor(s))));
  }
}

function renderSearch(lib: Library, index: SearchIndex): void {
  const content = $("content");
  content.innerHTML = "";
  const res = search(index, state.query);
  const hits = res.hits; // search always covers the whole library, like the think-cell library
  if (!hits.length) {
    content.append(
      el(
        "div",
        { class: "empty" },
        el("div", { class: "empty-title" }, MSG.noResults(state.query.trim())),
        el("div", { class: "empty-sub" }, "Versuchen Sie zum Beispiel:"),
        el(
          "div",
          { class: "suggestions" },
          ...SEARCH_SUGGESTIONS.slice(0, 6).map((s) => suggestionChip(s))
        )
      )
    );
    return;
  }
  const caption = (e: SlideEntry) =>
    `${categoryName(lib, e.category)} · ${subcategoryName(lib, e.category, e.subcategory)}`;
  const best = res.complete ? hits.filter((h) => h.matched === res.groups.length) : [];
  const more = res.complete ? hits.filter((h) => h.matched !== res.groups.length) : hits;
  content.append(
    el(
      "div",
      { class: "results-head" },
      el("span", {}, `${hits.length} Treffer`),
      !res.complete && res.groups.length > 1
        ? el("span", { class: "results-note" }, MSG.partialResults)
        : null
    )
  );
  if (best.length)
    content.append(
      el("div", { class: "grid" }, ...best.map((h) => cardFor(h.entry, caption(h.entry))))
    );
  if (more.length) {
    if (best.length)
      content.append(el("div", { class: "subhead subhead-more" }, "Weitere Treffer"));
    content.append(
      el("div", { class: "grid" }, ...more.map((h) => cardFor(h.entry, caption(h.entry))))
    );
  }
}

function suggestionChip(text: string): HTMLButtonElement {
  return el(
    "button",
    {
      class: "suggestion",
      type: "button",
      onclick: () => {
        const input = $<HTMLInputElement>("search-input");
        input.value = text;
        setQuery(text);
        input.focus();
      },
    },
    text
  );
}

function render(): void {
  const svc = state.svc;
  if (!svc || !state.index) return;
  preview.hide();
  if (state.query.trim()) renderSearch(svc.lib, state.index);
  else renderBrowse();
  $("content").scrollTop = 0;
}

function renderFooter(lib: Library): void {
  const slides = lib.slides.filter((s) => s.kind === "slide").length;
  const layouts = lib.slides.length - slides;
  $("footer").innerHTML = "";
  $("footer").append(
    el(
      "span",
      { title: `Bibliothek aktualisiert am ${formatGermanDate(lib.updated)}, Build ${lib.build}` },
      `Stand ${formatGermanDate(lib.updated)}`
    ),
    el("span", { class: "footer-sep" }, "·"),
    el("span", {}, `${slides} Folien, ${layouts} Layouts`),
    el("span", { class: "footer-spacer" }),
    el("span", { class: "footer-build", title: "Build-Kennung" }, lib.build)
  );
}

const setQuery = debounce((q: string) => {
  state.query = q;
  $("search-clear").hidden = !q;
  renderCrumbs();
  render();
}, 90);

/* ------------------------------------------------------------------ menu */

function closeMenu(): void {
  $("menu").hidden = true;
  $("btn-menu").setAttribute("aria-expanded", "false");
}

function openMenu(): void {
  const svc = state.svc;
  const m = $("menu");
  m.innerHTML = "";
  const fmt = prefs.formatting();
  const radio = (value: FormattingPref, label: string, hint: string) =>
    el(
      "button",
      {
        class: `menu-item menu-radio${fmt === value ? " is-checked" : ""}`,
        type: "button",
        role: "menuitemradio",
        "aria-checked": String(fmt === value),
        onclick: () => {
          prefs.setFormatting(value);
          closeMenu();
          toast(
            "info",
            value === "UseDestinationTheme"
              ? "Folien passen sich an Master und Farben der Präsentation an."
              : value === "Auto"
                ? "Automatisch: eigener Master im Deck-Farbset, sonst Master & Farben der Bibliothek."
                : "Folien behalten immer Master und Farben der Bibliothek.",
            "",
            2600
          );
        },
      },
      el("span", { class: "radio-dot" }),
      el(
        "span",
        { class: "menu-text" },
        el("span", {}, label),
        el("span", { class: "menu-hint" }, hint)
      )
    );
  m.append(
    el("div", { class: "menu-label" }, "Beim Einfügen"),
    radio(
      "Auto",
      "Automatisch (Standard)",
      "Eigene Decks: dein Master im Farbset des Decks · fremde/leere: Master & Farben der Bibliothek"
    ),
    radio(
      "KeepSourceFormatting",
      "Immer Master & Farben der Bibliothek",
      "Bringt den Bibliotheks-Master mit (in eigenen Decks als zweiter Master)"
    ),
    radio(
      "UseDestinationTheme",
      "An Präsentation anpassen",
      "Übernimmt Master, Farben und Schriften der geöffneten Präsentation"
    )
  );
  const keep = prefs.keepLayout();
  m.append(
    el(
      "button",
      {
        class: `menu-item menu-check${keep ? " is-checked" : ""}`,
        type: "button",
        role: "menuitemcheckbox",
        "aria-checked": String(keep),
        disabled: fmt === "KeepSourceFormatting",
        title:
          "Bei fremden Mastern verschiebt PowerPoint Titel- und Textplatzhalter auf das Ziel-Layout. Diese Option stellt Position und Größe aus der Vorlage wieder her und verkleinert zu langen Text.",
        onclick: () => {
          prefs.setKeepLayout(!keep);
          closeMenu();
          toast(
            "info",
            !keep
              ? "Platzhalter behalten Position und Größe der Vorlage."
              : "Platzhalter folgen dem Layout der Zielpräsentation.",
            "",
            2600
          );
        },
      },
      el("span", { class: "check-box", html: keep ? ICON.check : "" }),
      el(
        "span",
        { class: "menu-text" },
        el("span", {}, "Platzhalter-Layout der Vorlage schützen"),
        el("span", { class: "menu-hint" }, "Titel & Text bleiben an ihrer Position (empfohlen)")
      )
    )
  );
  if (svc && svc.lib.templates.length) {
    m.append(
      el("div", { class: "menu-sep" }),
      el("div", { class: "menu-label" }, "Neue Präsentation aus Vorlage")
    );
    for (const t of svc.lib.templates) {
      const sw = el(
        "span",
        { class: "swatches" },
        ...["accent1", "accent2", "accent3", "accent4", "dk2", "accent6"].map((k) =>
          el("span", { class: "swatch", style: `background:#${t.colors[k] ?? "ccc"}` })
        )
      );
      m.append(
        el(
          "button",
          {
            class: "menu-item",
            type: "button",
            role: "menuitem",
            onclick: async () => {
              closeMenu();
              try {
                await svc.createFromTemplate(t);
                toast("success", MSG.createdPresentation(t.name));
              } catch (e) {
                toast(
                  "error",
                  e instanceof UserError ? e.message : MSG.createFailed,
                  e instanceof UserError ? e.detail : describeError(e)
                );
              }
            },
          },
          sw,
          el("span", { class: "menu-text" }, el("span", {}, `Farbset „${t.name}“`))
        )
      );
    }
  }
  m.append(
    el("div", { class: "menu-sep" }),
    el("div", { class: "menu-label" }, "Lokale Ordner (nur dieser PC)"),
    el(
      "button",
      {
        class: "menu-item",
        type: "button",
        role: "menuitem",
        title:
          "Ordner mit PowerPoint-Dateien wählen (z. B. TC-Library\\library-own). Die Dateien werden nur im Speicher dieses PCs abgelegt, nicht hochgeladen.",
        onclick: () => (closeMenu(), pickLocalFolder()),
      },
      icon("plus", "icon menu-icon"),
      el("span", { class: "menu-text" }, "Lokalen Ordner hinzufügen …")
    ),
    ...(svc?.lib.localLibs ?? []).map((l) =>
      el(
        "button",
        {
          class: "menu-item",
          type: "button",
          role: "menuitem",
          title: `${l.count} Folien, hinzugefügt am ${formatGermanDate(l.imported)}. Entfernt nur die gespeicherte Kopie in PowerPoint, nicht den Ordner auf der Festplatte.`,
          onclick: () => (closeMenu(), void removeLocal(l.id, l.label)),
        },
        icon("close", "icon menu-icon"),
        el("span", { class: "menu-text" }, `„${l.label}“ entfernen`)
      )
    ),
    el("div", { class: "menu-sep" }),
    el(
      "button",
      {
        class: "menu-item",
        type: "button",
        role: "menuitem",
        onclick: () => (closeMenu(), openDialog()),
      },
      icon("expand", "icon menu-icon"),
      el("span", { class: "menu-text" }, "Großes Suchfenster öffnen")
    ),
    el(
      "button",
      {
        class: "menu-item",
        type: "button",
        role: "menuitem",
        onclick: () => (closeMenu(), void reload()),
      },
      icon("refresh", "icon menu-icon"),
      el("span", { class: "menu-text" }, "Bibliothek neu laden")
    )
  );
  if (svc) {
    m.append(
      el(
        "div",
        { class: "menu-foot" },
        `Stand ${formatGermanDate(svc.lib.updated)} · Build ${svc.lib.build}`
      )
    );
  }
  m.hidden = false;
  $("btn-menu").setAttribute("aria-expanded", "true");
  const r = $("btn-menu").getBoundingClientRect();
  m.style.top = `${r.bottom + 4}px`;
  m.style.right = `${Math.max(8, window.innerWidth - r.right)}px`;
}

/* ------------------------------------------------------------------ local folders */

function pickLocalFolder(): void {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  input.setAttribute("webkitdirectory", "");
  input.addEventListener("change", () => {
    const files = Array.from(input.files ?? []);
    if (files.length) void runImport(files);
  });
  input.click();
}

async function runImport(files: File[]): Promise<void> {
  const progress = toast("info", MSG.localImporting(0, files.length), "", 600000);
  const msg = progress.querySelector(".toast-msg");
  try {
    const res = await importFolder(files, (done, total) => {
      if (msg) msg.textContent = MSG.localImporting(done, total);
    });
    progress.remove();
    await reload();
    openFolder(`l:${res.meta.id}`);
    toast(
      "success",
      MSG.localImported(res.meta.label, res.meta.items.length),
      res.missing ? `${res.missing} Einträge des Katalogs fehlten im Ordner.` : "",
      5000
    );
  } catch (e) {
    progress.remove();
    toast("error", MSG.localImportFailed, describeError(e));
  }
}

async function removeLocal(id: string, label: string): Promise<void> {
  try {
    await deleteLocalLibrary(id);
    await reload();
    toast("success", MSG.localRemoved(label), "", 3000);
  } catch (e) {
    toast("error", MSG.localRemoveFailed, describeError(e));
  }
}

function openDialog(): void {
  openSearchDialog({
    getService: () => servicePromise ?? Promise.reject(new UserError(MSG.libLoadFailed)),
    onInserted: (out) => toast("success", MSG.inserted(out.entry.title, out.position, out.atEnd)),
    onError: (message, detail) => toast("error", message, detail),
    onClosed: () => {
      if (state.folder === ROOT_ID && !state.query) renderRecent();
    },
  });
}

/* ------------------------------------------------------------------ boot */

async function reload(): Promise<void> {
  $("content").innerHTML = "";
  $("content").append($("skeleton") ?? el("div", { class: "skeleton" }));
  await boot(true);
}

async function boot(isReload = false): Promise<void> {
  const caps = detectCapabilities();
  if (!isReload) {
    if (!caps.canInsert) banner("error", MSG.reqInsertMissing);
    else if (!caps.canSelect) banner("info", MSG.reqSelectMissing, true);
  }
  servicePromise = loadLibrary().then((lib) => new SlideLibraryService(lib, caps));
  try {
    const svc = await servicePromise;
    state.svc = svc;
    state.index = buildIndex(svc.lib);
    if (!svc.lib.slides.length) throw new UserError(MSG.libEmpty);
    if (!caps.canInsert) document.body.classList.add("cannot-insert");
    state.tree = buildFolderTree(svc.lib);
    if (!findFolder(state.tree, state.folder)) state.folder = ROOT_ID;
    renderCrumbs();
    renderFooter(svc.lib);
    render();
  } catch (e) {
    $("content").innerHTML = "";
    const message = e instanceof UserError ? e.message : MSG.libLoadFailed;
    const detail = e instanceof UserError ? e.detail : describeError(e);
    $("content").append(
      el(
        "div",
        { class: "empty empty-error" },
        icon("error", "icon icon-lg"),
        el("div", { class: "empty-title" }, message),
        detail ? el("div", { class: "empty-sub" }, detail) : null,
        el(
          "button",
          { class: "btn", type: "button", onclick: () => void reload() },
          "Erneut versuchen"
        )
      )
    );
  }
}

function wireUi(): void {
  $("brand-mark").innerHTML = ICON.logo;
  $("search-icon").innerHTML = ICON.search;
  $("search-clear").innerHTML = ICON.close;
  $("btn-dialog").innerHTML = ICON.expand;
  $("btn-menu").innerHTML = ICON.more;
  const input = $<HTMLInputElement>("search-input");
  input.addEventListener("input", () => setQuery(input.value));
  input.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") {
      input.value = "";
      setQuery("");
    } else if (ev.key === "Enter") {
      const first = document.querySelector<HTMLButtonElement>("#content .card");
      first?.focus();
    }
  });
  $("search-clear").addEventListener("click", () => {
    input.value = "";
    setQuery("");
    input.focus();
  });
  $("btn-dialog").addEventListener("click", () => openDialog());
  $("btn-menu").addEventListener("click", (ev) => {
    ev.stopPropagation();
    if ($("menu").hidden) openMenu();
    else closeMenu();
  });
  document.addEventListener("click", (ev) => {
    if (!$("menu").hidden && !$("menu").contains(ev.target as Node)) closeMenu();
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") closeMenu();
    // Backspace outside the search box: one folder up (like Explorer / think-cell library)
    if (ev.key === "Backspace" && document.activeElement !== input && !state.query) {
      const parent = currentFolder()?.parent;
      if (parent) {
        ev.preventDefault();
        openFolder(parent.id);
      }
    }
    if (
      (ev.ctrlKey && ev.key.toLowerCase() === "f") ||
      (ev.key === "/" && document.activeElement !== input)
    ) {
      ev.preventDefault();
      input.focus();
      input.select();
    }
  });
  $("content").addEventListener("scroll", () => preview.hide(), { passive: true });
}

Office.onReady((info) => {
  wireUi();
  if (info.host !== Office.HostType.PowerPoint) {
    banner("error", MSG.notInOffice);
  }
  applyOfficeTheme();
  void boot().then(() => {
    if (__SELFTEST__) {
      let runId: unknown = null;
      try {
        runId = Office.context.document.settings.get("slidelib.selftest");
      } catch {
        runId = null;
      }
      if (runId && state.svc) {
        let mode: unknown = "full";
        try {
          mode = Office.context.document.settings.get("slidelib.selftest.mode") || "full";
        } catch {
          mode = "full";
        }
        void import(/* webpackChunkName: "selftest" */ "./selftest").then((m) =>
          m.runSelftest(String(runId), state.svc!, { activate, toast }, String(mode))
        );
      }
    }
  });
});
