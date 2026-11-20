import "./taskpane.css";
import { categoryName, formatGermanDate, groupLibrary, subcategoryName } from "../shared/library";
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
import type { Formatting, Library, SlideEntry } from "../shared/types";

declare const __SELFTEST__: boolean;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

interface State {
  svc: SlideLibraryService | null;
  index: SearchIndex | null;
  query: string;
  chip: string; // "all" or category id
  collapsed: Set<string>;
}

const state: State = {
  svc: null,
  index: null,
  query: "",
  chip: "all",
  collapsed: new Set(prefs.collapsed()),
};
let servicePromise: Promise<SlideLibraryService> | null = null;

/* ------------------------------------------------------------------ toasts & banners */

function toast(kind: "success" | "error" | "info", message: string, detail = "", ms = 3200): void {
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

function onInserted(out: InsertOutcome): void {
  prefs.addRecent(out.entry.key);
  toast("success", MSG.inserted(out.entry.title, out.position, out.atEnd));
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
    const out = await svc.insert(entry, prefs.formatting());
    if (!out) return;
    setCardState(card, "done");
    onInserted(out);
    if (state.chip === "all" && !state.query) renderRecent();
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

function renderBrowse(lib: Library): void {
  const content = $("content");
  content.innerHTML = "";
  if (state.chip === "all") renderRecent();
  for (const g of groupLibrary(lib)) {
    if (state.chip !== "all" && g.category.id !== state.chip) continue;
    const body = el("div", { class: "section-body" });
    for (const sg of g.subgroups) {
      if (sg.subcategory && (g.subgroups.length > 1 || sg.subcategory.name !== g.category.name)) {
        body.append(el("div", { class: "subhead" }, sg.subcategory.name));
      }
      body.append(el("div", { class: "grid" }, ...sg.slides.map((s) => cardFor(s))));
    }
    content.append(
      section(g.category.id, g.category.name, g.count, body, {
        description: g.category.description,
      })
    );
  }
}

function renderSearch(lib: Library, index: SearchIndex): void {
  const content = $("content");
  content.innerHTML = "";
  const res = search(index, state.query);
  let hits = res.hits;
  if (state.chip !== "all") hits = hits.filter((h) => h.entry.category === state.chip);
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
  else renderBrowse(svc.lib);
  $("content").scrollTop = 0;
}

function renderChips(lib: Library): void {
  const chips = $("chips");
  chips.innerHTML = "";
  const counts = new Map<string, number>();
  for (const s of lib.slides) counts.set(s.category ?? "", (counts.get(s.category ?? "") ?? 0) + 1);
  const make = (id: string, label: string, title: string) => {
    const b = el(
      "button",
      {
        class: `chip${state.chip === id ? " is-active" : ""}`,
        type: "button",
        role: "tab",
        "aria-selected": String(state.chip === id),
        title,
      },
      label
    );
    b.addEventListener("click", () => {
      state.chip = id;
      renderChips(lib);
      render();
    });
    return b;
  };
  chips.append(make("all", "Alle", "Alle Kategorien"));
  for (const c of lib.categories)
    if (counts.get(c.id))
      chips.append(make(c.id, c.short ?? c.name, `${c.name} (${counts.get(c.id)})`));
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
  const radio = (value: Formatting, label: string, hint: string) =>
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
              ? "Einfügen übernimmt das Design der Zielpräsentation."
              : "Einfügen behält das Format der Vorlage bei (Master wird importiert).",
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
      "UseDestinationTheme",
      "Design der Zielpräsentation",
      "Master, Farben und Schriften des Ziels (empfohlen)"
    ),
    radio(
      "KeepSourceFormatting",
      "Format der Vorlage beibehalten",
      "Importiert den Bibliotheks-Master in die Präsentation"
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

function openDialog(): void {
  openSearchDialog({
    getService: () => servicePromise ?? Promise.reject(new UserError(MSG.libLoadFailed)),
    onInserted: (out) => toast("success", MSG.inserted(out.entry.title, out.position, out.atEnd)),
    onError: (message, detail) => toast("error", message, detail),
    onClosed: () => {
      if (state.chip === "all" && !state.query) renderRecent();
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
    renderChips(svc.lib);
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
        void import(/* webpackChunkName: "selftest" */ "./selftest").then((m) =>
          m.runSelftest(String(runId), state.svc!, { activate, toast })
        );
      }
    }
  });
});
