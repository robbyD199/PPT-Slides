import type { Formatting } from "./types";

/** Small per-user preferences in localStorage (shared by task pane, dialog host and ribbon command). */
function read<T>(key: string, fallback: T): T {
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable - ignore */
  }
}

export const prefs = {
  formatting(): Formatting {
    return read<Formatting>("slidelib.formatting", "UseDestinationTheme") === "KeepSourceFormatting"
      ? "KeepSourceFormatting"
      : "UseDestinationTheme";
  },
  setFormatting(f: Formatting) {
    write("slidelib.formatting", f);
  },
  /** restore the template placeholder layout after inserting with the destination theme */
  keepLayout(): boolean {
    return read<boolean>("slidelib.keepLayout", true) !== false;
  },
  setKeepLayout(v: boolean) {
    write("slidelib.keepLayout", v);
  },
  recent(): string[] {
    const r = read<string[]>("slidelib.recent", []);
    return Array.isArray(r) ? r.filter((x) => typeof x === "string") : [];
  },
  addRecent(key: string, max = 8) {
    const r = prefs.recent().filter((k) => k !== key);
    r.unshift(key);
    write("slidelib.recent", r.slice(0, max));
  },
  collapsed(): string[] {
    const c = read<string[]>("slidelib.collapsed", []);
    return Array.isArray(c) ? c : [];
  },
  setCollapsed(ids: string[]) {
    write("slidelib.collapsed", ids);
  },
  keepDialogOpen(): boolean {
    return read<boolean>("slidelib.keepDialogOpen", false) === true;
  },
  setKeepDialogOpen(v: boolean) {
    write("slidelib.keepDialogOpen", v);
  },
};
