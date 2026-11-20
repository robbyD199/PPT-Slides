import { assetUrl, parseLibrary, sourceSlideId, LibraryError } from "./library";
import {
  insertSlide,
  type InsertResult,
  isSetSupported,
  createPresentation,
  destinationLayouts,
  resolveFormatting,
} from "./insert";
import { arrayBufferToBase64 } from "./base64";
import { describeError, MSG } from "./messages";
import type { Formatting, FormattingPref, Library, SlideEntry, TemplateInfo } from "./types";

export class UserError extends Error {
  constructor(
    message: string,
    public detail = ""
  ) {
    super(message);
  }
}

export interface Capabilities {
  canInsert: boolean;
  canSelect: boolean;
  canCreate: boolean;
  /** PowerPointApi 1.4: move/resize shapes (restore template placeholder layout) */
  canShapes: boolean;
}

export function detectCapabilities(): Capabilities {
  return {
    canInsert: isSetSupported("PowerPointApi", "1.2"),
    canSelect: isSetSupported("PowerPointApi", "1.5"),
    canCreate: isSetSupported("PowerPointApi", "1.1"),
    canShapes: isSetSupported("PowerPointApi", "1.4"),
  };
}

export async function loadLibrary(base?: string): Promise<Library> {
  const url = new URL(
    `assets/library/library.json?t=${Date.now()}`,
    base ?? window.location.href
  ).toString();
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch (e) {
    throw new UserError(MSG.libLoadFailed, describeError(e));
  }
  if (!res.ok)
    throw new UserError(MSG.libLoadFailed, `HTTP ${res.status} beim Laden von library.json`);
  try {
    return parseLibrary(await res.json());
  } catch (e) {
    throw new UserError(
      MSG.libLoadFailed,
      e instanceof LibraryError ? e.message : describeError(e)
    );
  }
}

export interface InsertOutcome extends InsertResult {
  entry: SlideEntry;
  /** formatting actually used (after resolving "Auto") */
  formatting: Formatting;
  ms: number;
  fetchMs: number;
}

/** Holds the library, caches downloaded files as base64 and serializes inserts. */
export class SlideLibraryService {
  private cache = new Map<string, Promise<string>>();
  private busy = false;

  constructor(
    public lib: Library,
    public caps: Capabilities
  ) {}

  get isBusy(): boolean {
    return this.busy;
  }

  url(path: string): string {
    return assetUrl(path, this.lib.build);
  }

  private fileFor(entry: SlideEntry): { path: string; source?: string } {
    if (this.lib.insertMode === "library" && entry.kind === "slide") {
      return { path: this.lib.libraryFile, source: sourceSlideId(entry) };
    }
    return { path: entry.file };
  }

  base64(path: string): Promise<string> {
    let p = this.cache.get(path);
    if (!p) {
      p = (async () => {
        let res: Response;
        try {
          res = await fetch(this.url(path));
        } catch (e) {
          throw new UserError(MSG.downloadFailed, describeError(e));
        }
        if (!res.ok) throw new UserError(MSG.downloadFailed, `HTTP ${res.status}: ${path}`);
        return arrayBufferToBase64(await res.arrayBuffer());
      })();
      this.cache.set(path, p);
      p.catch(() => this.cache.delete(path));
    }
    return p;
  }

  /** Layout names of the library master (the "Grundlayouts"). */
  libraryLayoutNames(): string[] {
    return this.lib.slides
      .filter((s) => s.kind === "layout")
      .map((s) => s.layout ?? "")
      .filter(Boolean);
  }

  /** Starts downloading a slide in the background (e.g. on hover). */
  prefetch(entry: SlideEntry): void {
    this.base64(this.fileFor(entry).path).catch(() => undefined);
  }

  /** Inserts one slide. Returns null if another insert is still running (double click guard). */
  async insert(
    entry: SlideEntry,
    pref: FormattingPref,
    keepTemplateLayout = true
  ): Promise<InsertOutcome | null> {
    if (this.busy) return null;
    if (!this.caps.canInsert) throw new UserError(MSG.reqInsertMissing);
    this.busy = true;
    const t0 = performance.now();
    try {
      const formatting: Formatting =
        pref === "Auto"
          ? resolveFormatting(pref, await destinationLayouts(), this.libraryLayoutNames())
          : pref;
      const { path, source } = this.fileFor(entry);
      const b64 = await this.base64(path);
      const t1 = performance.now();
      let result: InsertResult;
      try {
        result = await insertSlide(b64, {
          formatting,
          sourceSlideId: source,
          canSelect: this.caps.canSelect,
          placeholders:
            keepTemplateLayout &&
            this.caps.canShapes &&
            formatting === "UseDestinationTheme" &&
            entry.kind === "slide"
              ? entry.placeholders
              : undefined,
        });
      } catch (e) {
        throw new UserError(MSG.insertFailed, describeError(e));
      }
      if (!result.newSlideIds.length)
        throw new UserError(MSG.insertFailed, "PowerPoint hat keine neue Folie gemeldet.");
      return {
        ...result,
        entry,
        formatting,
        ms: Math.round(performance.now() - t0),
        fetchMs: Math.round(t1 - t0),
      };
    } finally {
      this.busy = false;
    }
  }

  async createFromTemplate(tpl: TemplateInfo): Promise<void> {
    if (!this.caps.canCreate) throw new UserError(MSG.reqCreateMissing);
    const b64 = await this.base64(tpl.file);
    try {
      await createPresentation(b64);
    } catch (e) {
      throw new UserError(MSG.createFailed, describeError(e));
    }
  }
}
