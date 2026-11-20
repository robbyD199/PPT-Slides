import type { Formatting } from "./types";

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
    };
  });
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
