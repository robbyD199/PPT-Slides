/** Tiny DOM helpers + inline icons (no UI framework). */
type Attrs = Record<string, string | number | boolean | undefined | null | EventListener>;

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: (Node | string | null | undefined | false)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
    } else if (k === "class") {
      node.className = String(v);
    } else if (k === "html") {
      node.innerHTML = String(v);
    } else if (v === true) {
      node.setAttribute(k, "");
    } else {
      node.setAttribute(k, String(v));
    }
  }
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    node.append(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

const svg = (body: string, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const ICON = {
  search: svg('<circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5 14 14"/>'),
  close: svg('<path d="M4 4l8 8M12 4l-8 8"/>'),
  chevron: svg('<path d="M6 4l4 4-4 4"/>', 14),
  expand: svg('<path d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9"/>'),
  more: svg(
    '<circle cx="3.5" cy="8" r=".9" fill="currentColor"/><circle cx="8" cy="8" r=".9" fill="currentColor"/><circle cx="12.5" cy="8" r=".9" fill="currentColor"/>'
  ),
  check: svg('<path d="M3.5 8.5 6.5 11.5 12.5 4.5"/>'),
  warn: svg('<path d="M8 2.5 14 13H2z"/><path d="M8 6.5v3M8 11.2v.1"/>', 12),
  info: svg('<circle cx="8" cy="8" r="6"/><path d="M8 7.2v4M8 4.8v.1"/>'),
  error: svg('<circle cx="8" cy="8" r="6"/><path d="M5.8 5.8l4.4 4.4M10.2 5.8l-4.4 4.4"/>'),
  plus: svg('<path d="M8 3v10M3 8h10"/>'),
  refresh: svg('<path d="M13 8a5 5 0 1 1-1.5-3.5M13 2.5v3h-3"/>'),
  clock: svg('<circle cx="8" cy="8" r="5.8"/><path d="M8 4.8V8l2.2 1.4"/>'),
  logo: `<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><rect x="1" y="4" width="11" height="8" rx="1.2" fill="currentColor" opacity=".35"/><rect x="3.5" y="6.5" width="11" height="8" rx="1.2" fill="currentColor" opacity=".6"/><rect x="6" y="9" width="11" height="8" rx="1.2" fill="currentColor"/></svg>`,
};

export function icon(name: keyof typeof ICON, cls = "icon"): HTMLSpanElement {
  return el("span", { class: cls, html: ICON[name] });
}

/** Appends only the truthy children. */
export function appendAll(
  parent: HTMLElement,
  ...children: (Node | string | null | undefined | false)[]
): void {
  for (const c of children) if (c) parent.append(c);
}

/** Debounce helper for live search. */
export function debounce<A extends unknown[]>(
  fn: (...a: A) => void,
  ms: number
): (...a: A) => void {
  let t: number | undefined;
  return (...a: A) => {
    window.clearTimeout(t);
    t = window.setTimeout(() => fn(...a), ms);
  };
}

/** Applies Office's dark/colorful theme hint to <body>. */
export function applyOfficeTheme(): void {
  try {
    const theme = (Office.context as unknown as { officeTheme?: { bodyBackgroundColor?: string } })
      .officeTheme;
    const bg = theme?.bodyBackgroundColor;
    if (bg && /^#?[0-9a-f]{6}$/i.test(bg)) {
      const hex = bg.replace("#", "");
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if (0.2126 * r + 0.7152 * g + 0.0722 * b < 110) document.body.classList.add("theme-dark");
    }
  } catch {
    /* not in Office */
  }
}
