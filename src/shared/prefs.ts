import type { FormattingPref } from "./types";

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
  /**
   * Default "Auto": own master in decks based on the template, library master + colors elsewhere.
   * Stored under a new key (v2) so an older explicit choice does not override the new default.
   */
  formatting(): FormattingPref {
    const v = read<FormattingPref>("slidelib.formatting.v2", "Auto");
    return v === "UseDestinationTheme" || v === "KeepSourceFormatting" ? v : "Auto";
  },
  setFormatting(f: FormattingPref) {
    write("slidelib.formatting.v2", f);
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
  /** last opened folder ("" = top level), separately for task pane and search dialog */
  folder(where: "pane" | "dialog"): string {
    const v = read<string>(`slidelib.folder.${where}`, "");
    return typeof v === "string" ? v : "";
  },
  setFolder(where: "pane" | "dialog", id: string) {
    write(`slidelib.folder.${where}`, id);
  },
  /** address of the key-protected online library (the key itself is stored with the downloaded library) */
  remoteUrl(): string {
    const v = read<string>("slidelib.remoteUrl", "");
    return typeof v === "string" ? v : "";
  },
  setRemoteUrl(url: string) {
    write("slidelib.remoteUrl", url);
  },
  keepDialogOpen(): boolean {
    return read<boolean>("slidelib.keepDialogOpen", false) === true;
  },
  setKeepDialogOpen(v: boolean) {
    write("slidelib.keepDialogOpen", v);
  },
};
