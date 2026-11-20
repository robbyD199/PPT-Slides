import { el, icon } from "./dom";
import { MSG } from "./messages";
import type { SlideEntry } from "./types";

export interface CardOptions {
  url: (path: string) => string;
  caption?: string;
  large?: boolean;
  onActivate: (entry: SlideEntry, card: HTMLElement) => void;
  onHover?: (entry: SlideEntry, card: HTMLElement) => void;
  onLeave?: (entry: SlideEntry, card: HTMLElement) => void;
}

/** One slide tile: 16:9 thumbnail, title below, optional caption and theme-lint marker. */
export function slideCard(entry: SlideEntry, o: CardOptions): HTMLButtonElement {
  const lintWarn = entry.lint && entry.lint.level === "warn";
  const button = el("button", {
    class: `card${o.large ? " card-large" : ""}${entry.kind === "layout" ? " card-layout" : ""}`,
    type: "button",
    "data-key": entry.key,
    "aria-label": `${entry.title} einfügen`,
  });
  const img = el("img", {
    src: o.url(entry.thumb),
    alt: "",
    loading: "lazy",
    decoding: "async",
    draggable: "false",
  });
  img.addEventListener("load", () => button.classList.add("is-loaded"));
  const thumb = el(
    "span",
    { class: "card-thumb" },
    img,
    el("span", { class: "card-status", "aria-hidden": "true" })
  );
  if (lintWarn) {
    const tip = `${MSG.lintHint}\n• ${entry.lint.warnings.join("\n• ")}`;
    thumb.append(el("span", { class: "lint-dot", title: tip }, icon("warn", "icon icon-xs")));
  }
  button.append(thumb, el("span", { class: "card-title" }, entry.title));
  if (o.caption) button.append(el("span", { class: "card-caption" }, o.caption));
  button.addEventListener("click", () => o.onActivate(entry, button));
  if (o.onHover) {
    button.addEventListener("pointerenter", () => o.onHover?.(entry, button));
    button.addEventListener("focus", () => o.onHover?.(entry, button));
  }
  if (o.onLeave) {
    button.addEventListener("pointerleave", () => o.onLeave?.(entry, button));
    button.addEventListener("blur", () => o.onLeave?.(entry, button));
  }
  return button;
}

/** Marks a card as inserting / done / failed. */
export function setCardState(
  card: HTMLElement,
  state: "idle" | "inserting" | "done" | "error"
): void {
  card.classList.remove("is-inserting", "is-done", "is-error");
  const status = card.querySelector(".card-status");
  if (status) status.innerHTML = "";
  if (state === "inserting") {
    card.classList.add("is-inserting");
    status?.append(el("span", { class: "spinner" }));
  } else if (state === "done") {
    card.classList.add("is-done");
    status?.append(icon("check", "icon icon-lg"));
    window.setTimeout(() => setCardState(card, "idle"), 1400);
  } else if (state === "error") {
    card.classList.add("is-error");
    status?.append(icon("error", "icon icon-lg"));
    window.setTimeout(() => setCardState(card, "idle"), 2200);
  }
}
