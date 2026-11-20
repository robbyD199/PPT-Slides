import type { Formatting, PlaceholderBox } from "./types";

/**
 * Where to insert: directly after the selected slide (the last one in presentation order if
 * several are selected); without selection after the last slide; empty presentation → undefined.
 */
export function computeTargetSlideId(allIds: string[], selectedIds: string[]): string | undefined {
  if (!allIds.length) return undefined;
  let best = -1;
  for (const id of selectedIds) best = Math.max(best, allIds.indexOf(id));
  return best >= 0 ? allIds[best] : allIds[allIds.length - 1];
}

/** IDs present after the insert but not before, in presentation order. */
export function newIdsAfterInsert(before: string[], after: string[]): string[] {
  const set = new Set(before);
  return after.filter((id) => !set.has(id));
}

export interface InsertOptions {
  formatting: Formatting;
  /** "<id>#<creationId>" when inserting from the full library file */
  sourceSlideId?: string;
  /** PowerPointApi 1.5 available (read/set selection) */
  canSelect: boolean;
  /**
   * Template placeholder geometry to restore after the insert (PowerPointApi 1.4). With
   * "use destination theme" PowerPoint moves placeholders to the destination layout's position and
   * size; restoring the template geometry (+ shrink text on overflow) keeps the slide's composition
   * while fonts and colors still come from the destination theme.
   */
  placeholders?: PlaceholderBox[];
}

const TEXT_PLACEHOLDERS = ["title", "ctrTitle", "subTitle", "body"];

/** Pairs shapes with template placeholder boxes by name (n-th occurrence of a name ↔ n-th box). */
export function matchPlaceholders(
  shapeNames: string[],
  boxes: PlaceholderBox[]
): Array<[number, PlaceholderBox]> {
  const used = new Map<string, number>();
  const pairs: Array<[number, PlaceholderBox]> = [];
  shapeNames.forEach((name, i) => {
    const candidates = boxes.filter((b) => b.name === name);
    if (!candidates.length) return;
    const n = used.get(name) ?? 0;
    used.set(name, n + 1);
    if (candidates[n]) pairs.push([i, candidates[n]]);
  });
  return pairs;
}

/** True if a shape's geometry differs noticeably from the template box (points). */
export function geometryDiffers(
  shape: { left: number; top: number; width: number; height: number },
  box: number[]
): boolean {
  const [l, t, w, h] = box;
  return (
    Math.abs(shape.left - l) > 0.75 ||
    Math.abs(shape.top - t) > 0.75 ||
    Math.abs(shape.width - w) > 0.75 ||
    Math.abs(shape.height - h) > 0.75
  );
}

export interface InsertResult {
  newSlideIds: string[];
  /** 1-based position of the first inserted slide */
  position: number;
  /** slide after which the new slide was inserted (undefined = empty presentation) */
  targetSlideId?: string;
  /** true if the new slide is selected afterwards */
  selected: boolean;
  /** true if inserted at the end because nothing was selected */
  atEnd: boolean;
  /** number of placeholders moved back to the template geometry */
  placeholdersFixed: number;
  /** error text if restoring the placeholder layout failed (diagnostics) */
  placeholdersError?: string;
}

export async function insertSlide(base64: string, opts: InsertOptions): Promise<InsertResult> {
  return PowerPoint.run(async (context) => {
    const slides = context.presentation.slides;
    slides.load("items/id");
    let selection: PowerPoint.SlideScopedCollection | null = null;
    if (opts.canSelect) {
      selection = context.presentation.getSelectedSlides();
      selection.load("items/id");
    }
    await context.sync();
    const before = slides.items.map((s) => s.id);
    const selectedIds = selection ? selection.items.map((s) => s.id) : [];
    const targetSlideId = computeTargetSlideId(before, selectedIds);

    const options: PowerPoint.InsertSlideOptions = {
      formatting: opts.formatting as PowerPoint.InsertSlideFormatting,
    };
    if (targetSlideId) options.targetSlideId = targetSlideId;
    if (opts.sourceSlideId) options.sourceSlideIds = [opts.sourceSlideId];
    context.presentation.insertSlidesFromBase64(base64, options);
    await context.sync();

    const afterColl = context.presentation.slides;
    afterColl.load("items/id");
    await context.sync();
    const after = afterColl.items.map((s) => s.id);
    const newSlideIds = newIdsAfterInsert(before, after);

    let placeholdersFixed = 0;
    let placeholdersError: string | undefined;
    if (opts.placeholders && opts.placeholders.length && newSlideIds.length) {
      try {
        const shapes = context.presentation.slides.getItem(newSlideIds[0]).shapes;
        shapes.load("items/name,items/left,items/top,items/width,items/height");
        await context.sync();
        const pairs = matchPlaceholders(
          shapes.items.map((s) => s.name),
          opts.placeholders
        );
        if (!pairs.length) {
          placeholdersError = `keine Platzhalter gefunden (${shapes.items.length} Formen)`;
        }
        const fonts: Array<[PowerPoint.Shape, PlaceholderBox, PowerPoint.ShapeFont]> = [];
        const fixed = new Set<number>();
        for (const [i, ph] of pairs) {
          const sh = shapes.items[i];
          if (geometryDiffers(sh, ph.box)) {
            sh.left = ph.box[0];
            sh.top = ph.box[1];
            sh.width = ph.box[2];
            sh.height = ph.box[3];
            fixed.add(i);
          }
          // the destination master text size (e.g. 36-54 pt titles) breaks the composition:
          // check the size and use the template's; font face and color stay those of the destination
          if (
            TEXT_PLACEHOLDERS.includes(ph.type) &&
            ph.size &&
            (ph.type !== "body" || !ph.multiLevel)
          ) {
            const font = sh.textFrame.textRange.font;
            font.load("size");
            fonts.push([sh, ph, font]);
          }
        }
        await context.sync();
        for (const [sh, ph, font] of fonts) {
          if (
            font.size !== null &&
            font.size !== undefined &&
            Math.abs(font.size - (ph.size as number)) > 0.4
          ) {
            font.size = ph.size as number;
            fixed.add(shapes.items.indexOf(sh));
          }
          if (fixed.has(shapes.items.indexOf(sh))) {
            // long titles/texts shrink instead of running into the content below
            sh.textFrame.autoSizeSetting = "AutoSizeTextToFitShape";
          }
        }
        placeholdersFixed = fixed.size;
        if (placeholdersFixed) await context.sync();
      } catch (e) {
        // geometry restore is best effort - the slide itself is inserted
        placeholdersError = e instanceof Error ? e.message : String(e);
      }
    }

    let selected = false;
    if (opts.canSelect && newSlideIds.length) {
      try {
        context.presentation.setSelectedSlides([newSlideIds[0]]);
        await context.sync();
        selected = true;
      } catch {
        selected = false;
      }
    }
    return {
      newSlideIds,
      position: newSlideIds.length ? after.indexOf(newSlideIds[0]) + 1 : -1,
      targetSlideId,
      selected,
      atEnd: !selectedIds.length,
      placeholdersFixed,
      placeholdersError,
    };
  });
}

/**
 * True if one of the destination's masters contains all layouts of the library master
 * (= the deck is based on the own template; inserted slides then look exactly like the library).
 */
export function hasLibraryMaster(masters: string[][], libraryLayouts: string[]): boolean {
  if (!libraryLayouts.length) return true;
  return masters.some((layouts) => libraryLayouts.every((name) => layouts.includes(name)));
}

/** Layout names per slide master of the open presentation (PowerPointApi 1.3), null if unavailable. */
export async function destinationLayouts(): Promise<string[][] | null> {
  if (!isSetSupported("PowerPointApi", "1.3")) return null;
  try {
    return await PowerPoint.run(async (context) => {
      const masters = context.presentation.slideMasters;
      masters.load("items/layouts/items/name");
      await context.sync();
      return masters.items.map((m) => m.layouts.items.map((l) => l.name));
    });
  } catch {
    return null;
  }
}

/** Opens a new presentation from a base64 .pptx (PowerPointApi 1.1). */
export function createPresentation(base64: string): Promise<void> {
  return PowerPoint.createPresentation(base64);
}

export function isSetSupported(name: string, version: string): boolean {
  try {
    return (
      !!Office.context.requirements && Office.context.requirements.isSetSupported(name, version)
    );
  } catch {
    return false;
  }
}
