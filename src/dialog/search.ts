import "./search.css";
import { assetUrl, categoryName, groupLibrary, subcategoryName } from "../shared/library";
import { chipList, matchesChip } from "../shared/local";
import { buildIndex, search, type SearchIndex, SEARCH_SUGGESTIONS } from "../shared/search";
import { loadLibrary, UserError } from "../shared/service";
import { appendAll, applyOfficeTheme, debounce, el, icon, ICON } from "../shared/dom";
import { setCardState, slideCard } from "../shared/cards";
import { describeError, MSG } from "../shared/messages";
import { prefs } from "../shared/prefs";
import type { DialogToParent, ParentToDialog } from "../shared/dialogHost";
import type { Library, SlideEntry } from "../shared/types";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

let lib: Library | null = null;
let index: SearchIndex | null = null;
let query = "";
let chip = "all";
let cards: HTMLButtonElement[] = [];
let selected = -1;
let pending: string | null = null;

function url(p: string): string {
  return assetUrl(p, lib?.build ?? "");
}

function toast(kind: "success" | "error" | "info", message: string, detail = ""): void {
  const t = el(
    "div",
    { class: `toast toast-${kind}`, role: kind === "error" ? "alert" : "status" },
    icon(kind === "success" ? "check" : kind === "error" ? "error" : "info", "icon toast-icon"),
    el(
      "div",
      { class: "toast-body" },
      el("div", { class: "toast-msg" }, message),
      detail ? el("div", { class: "toast-detail" }, detail) : null
    )
  );
  $("toasts").append(t);
  requestAnimationFrame(() => t.classList.add("is-visible"));
  window.setTimeout(() => t.remove(), kind === "error" ? 9000 : 3000);
}

function send(msg: DialogToParent): boolean {
  try {
    Office.context.ui.messageParent(JSON.stringify(msg));
    return true;
  } catch (e) {
    toast("error", "Keine Verbindung zu PowerPoint.", describeError(e));
    return false;
  }
}

function insert(entry: SlideEntry): void {
  if (pending) {
    toast("info", MSG.busy);
    return;
  }
  const keepOpen = $<HTMLInputElement>("keep-open").checked;
  pending = entry.key;
  const card = cards.find((c) => c.dataset.key === entry.key);
  if (card) setCardState(card, "inserting");
  renderDetail();
  if (!send({ type: "insert", key: entry.key, keepOpen })) {
    pending = null;
    if (card) setCardState(card, "error");
    renderDetail();
    return;
  }
  // Without DialogApi 1.2 there is no answer from the parent: release the lock after a moment.
  if (!Office.context.requirements.isSetSupported("DialogApi", "1.2")) {
    window.setTimeout(() => {
      pending = null;
      if (card) setCardState(card, "idle");
      renderDetail();
    }, 1500);
  }
}

function onParentMessage(arg: { message?: string }): void {
  let msg: ParentToDialog;
  try {
    msg = JSON.parse(arg.message ?? "{}");
  } catch {
    return;
  }
  if (msg.type !== "result") return;
  const card = cards.find((c) => c.dataset.key === (msg.key ?? pending));
  pending = null;
  if (card) setCardState(card, msg.ok ? "done" : "error");
  toast(msg.ok ? "success" : "error", msg.message, msg.detail ?? "");
  if (msg.ok && msg.key) prefs.addRecent(msg.key);
  renderDetail();
}

/* ------------------------------------------------------------------ selection & detail */

function select(i: number, scroll = true): void {
  if (!cards.length) {
    selected = -1;
    renderDetail();
    return;
  }
  selected = Math.max(0, Math.min(i, cards.length - 1));
  cards.forEach((c, k) => c.classList.toggle("is-selected", k === selected));
  if (scroll) cards[selected].scrollIntoView({ block: "nearest" });
  renderDetail();
}

function entryAt(i: number): SlideEntry | undefined {
  const key = cards[i]?.dataset.key;
  return lib?.slides.find((s) => s.key === key);
}

function renderDetail(): void {
  const d = $("detail");
  d.innerHTML = "";
  const entry = entryAt(selected);
  if (!lib || !entry) {
    d.append(
      el("div", { class: "detail-empty" }, "Folie auswählen, um eine große Vorschau zu sehen.")
    );
    return;
  }
  const where = [
    categoryName(lib, entry.category),
    subcategoryName(lib, entry.category, entry.subcategory),
  ]
    .filter(Boolean)
    .join(" · ");
  const btn = el(
    "button",
    { class: "btn btn-lg", type: "button", onclick: () => insert(entry) },
    pending === entry.key ? "Wird eingefügt …" : "Einfügen"
  );
  if (pending) btn.setAttribute("disabled", "");
  appendAll(
    d,
    el("div", { class: "detail-img" }, el("img", { src: url(entry.preview), alt: "" })),
    el("div", { class: "detail-title" }, entry.title),
    el("div", { class: "detail-where" }, where),
    entry.description ? el("p", { class: "detail-desc" }, entry.description) : null,
    entry.lint?.level === "warn"
      ? el("div", { class: "detail-lint" }, `${MSG.lintHint} (${entry.lint.warnings.join("; ")})`)
      : null,
    el("div", { class: "detail-actions" }, btn),
    entry.keywords.length
      ? el(
          "div",
          { class: "detail-tags" },
          ...entry.keywords.slice(0, 14).map((k) => el("span", { class: "tag" }, k))
        )
      : null
  );
}

/* ------------------------------------------------------------------ results */

function makeCard(entry: SlideEntry, caption?: string): HTMLButtonElement {
  const c = slideCard(entry, {
    url,
    caption,
    onActivate: (e) => insert(e),
    onHover: (_e, card) => select(cards.indexOf(card as HTMLButtonElement), false),
  });
  c.addEventListener("dblclick", (ev) => ev.preventDefault());
  return c;
}

function render(): void {
  if (!lib || !index) return;
  const root = $("results");
  root.innerHTML = "";
  const list: HTMLButtonElement[] = [];
  const grid = (entries: SlideEntry[], captions = false, subOnly = false) => {
    const g = el("div", { class: "grid" });
    for (const e of entries) {
      const sub = subcategoryName(lib!, e.category, e.subcategory);
      const c = makeCard(
        e,
        captions ? (subOnly ? sub : `${categoryName(lib!, e.category)} · ${sub}`) : undefined
      );
      list.push(c);
      g.append(c);
    }
    return g;
  };

  if (query.trim()) {
    const res = search(index, query);
    const hits = res.hits.filter((h) => matchesChip(h.entry.category, chip));
    const best = res.complete ? hits.filter((h) => h.matched === res.groups.length) : [];
    const more = res.complete ? hits.filter((h) => h.matched !== res.groups.length) : hits;
    const head = el(
      "div",
      { class: "block-title" },
      hits.length ? `Treffer für „${query.trim()}“` : MSG.noResults(query.trim())
    );
    if (hits.length) head.append(el("span", { class: "count" }, String(hits.length)));
    if (hits.length && !res.complete && res.groups.length > 1)
      head.append(el("span", { class: "hint" }, MSG.partialResults));
    root.append(head);
    if (best.length)
      root.append(
        grid(
          best.map((h) => h.entry),
          true
        )
      );
    if (more.length) {
      if (best.length) root.append(el("div", { class: "block-sub" }, "Weitere Treffer"));
      root.append(
        grid(
          more.map((h) => h.entry),
          true
        )
      );
    }
    if (!hits.length)
      root.append(el("div", { class: "suggest-row" }, ...SEARCH_SUGGESTIONS.map(suggestion)));
  } else {
    if (chip === "all") {
      root.append(
        el("div", { class: "block-title" }, "Schnellsuche"),
        el("div", { class: "suggest-row" }, ...SEARCH_SUGGESTIONS.map(suggestion))
      );
      const recent = prefs
        .recent()
        .map((k) => lib!.slides.find((s) => s.key === k))
        .filter((s): s is SlideEntry => !!s)
        .slice(0, 6);
      if (recent.length)
        root.append(el("div", { class: "block-title" }, "Zuletzt verwendet"), grid(recent));
    }
    for (const g of groupLibrary(lib)) {
      if (!matchesChip(g.category.id, chip)) continue;
      root.append(
        el(
          "div",
          { class: "block-title", title: g.category.description ?? "" },
          g.category.name,
          el("span", { class: "count" }, String(g.count))
        )
      );
      if (g.subgroups.length > 1 && g.count / g.subgroups.length < 2) {
        // sparse category: one grid, subcategory shown as caption on each card
        root.append(
          grid(
            g.subgroups.flatMap((sg) => sg.slides),
            true,
            true
          )
        );
      } else {
        for (const sg of g.subgroups) {
          if (sg.subcategory && g.subgroups.length > 1)
            root.append(el("div", { class: "block-sub" }, sg.subcategory.name));
          root.append(grid(sg.slides));
        }
      }
    }
  }
  cards = list;
  root.scrollTop = 0;
  select(query.trim() ? 0 : -1, false);
  if (!query.trim()) {
    selected = -1;
    cards.forEach((c) => c.classList.remove("is-selected"));
    renderDetail();
  }
}

function suggestion(text: string): HTMLButtonElement {
  return el(
    "button",
    {
      class: "suggestion",
      type: "button",
      onclick: () => {
        const q = $<HTMLInputElement>("q");
        q.value = text;
        setQuery(text);
        q.focus();
      },
    },
    text
  );
}

function renderChips(): void {
  if (!lib) return;
  const c = $("chips");
  c.innerHTML = "";
  const make = (id: string, label: string) => {
    const b = el(
      "button",
      {
        class: `chip${chip === id ? " is-active" : ""}`,
        type: "button",
        role: "tab",
        "aria-selected": String(chip === id),
      },
      label
    );
    b.addEventListener("click", () => {
      chip = id;
      renderChips();
      render();
    });
    return b;
  };
  c.append(make("all", "Alle"));
  for (const ci of chipList(lib)) {
    const b = make(
      ci.id,
      ci.id.startsWith("lib:")
        ? ci.label
        : (lib.categories.find((x) => x.id === ci.id)?.name ?? ci.label)
    );
    b.title = ci.title;
    if (ci.id.startsWith("lib:")) b.classList.add("chip-local");
    c.append(b);
  }
}

const setQuery = debounce((q: string) => {
  query = q;
  $("q-clear").hidden = !q;
  render();
}, 80);

function columns(): number {
  if (cards.length < 2) return 1;
  const top = cards[selected >= 0 ? selected : 0].offsetTop;
  const row = cards.filter((c) => c.offsetTop === top);
  return Math.max(1, row.length);
}

function onKey(ev: KeyboardEvent): void {
  if (ev.key === "Escape") {
    ev.preventDefault();
    if (query) {
      $<HTMLInputElement>("q").value = "";
      setQuery("");
    } else {
      send({ type: "close" });
    }
    return;
  }
  if (!cards.length) return;
  const cur = selected < 0 ? -1 : selected;
  if (ev.key === "ArrowDown") {
    ev.preventDefault();
    select(cur < 0 ? 0 : cur + columns());
  } else if (ev.key === "ArrowUp") {
    ev.preventDefault();
    select(cur - columns());
  } else if (ev.key === "ArrowRight" && document.activeElement !== $("q")) {
    ev.preventDefault();
    select(cur + 1);
  } else if (ev.key === "ArrowLeft" && document.activeElement !== $("q")) {
    ev.preventDefault();
    select(cur - 1);
  } else if (ev.key === "Enter") {
    const e = entryAt(selected < 0 ? 0 : selected);
    if (e) {
      ev.preventDefault();
      insert(e);
    }
  }
}

async function boot(): Promise<void> {
  try {
    lib = await loadLibrary();
    index = buildIndex(lib);
    renderChips();
    render();
  } catch (e) {
    $("results").append(
      el(
        "div",
        { class: "detail-empty" },
        e instanceof UserError ? e.message : MSG.libLoadFailed,
        el("br"),
        e instanceof UserError ? e.detail : describeError(e)
      )
    );
  }
}

Office.onReady(() => {
  applyOfficeTheme();
  $("q-icon").innerHTML = ICON.search;
  $("q-clear").innerHTML = ICON.close;
  const q = $<HTMLInputElement>("q");
  q.addEventListener("input", () => setQuery(q.value));
  $("q-clear").addEventListener("click", () => {
    q.value = "";
    setQuery("");
    q.focus();
  });
  const keep = $<HTMLInputElement>("keep-open");
  keep.checked = prefs.keepDialogOpen();
  keep.addEventListener("change", () => prefs.setKeepDialogOpen(keep.checked));
  document.addEventListener("keydown", onKey);
  try {
    if (Office.context.requirements.isSetSupported("DialogApi", "1.2")) {
      Office.context.ui.addHandlerAsync(
        Office.EventType.DialogParentMessageReceived,
        onParentMessage
      );
    }
  } catch {
    /* outside Office */
  }
  q.focus();
  void boot();
});
