/**
 * DEV-ONLY end-to-end self test. Included only in development builds (__SELFTEST__),
 * triggered when the document carries the setting "slidelib.selftest" (see scripts/selftest.ps1).
 * Inserts every library entry once after slide 1, measures the time, checks position and
 * selection, tests the double-click guard, the "no selection" fallback and the
 * "whole library + sourceSlideIds" mode, then POSTs the results to the dev server.
 */
import { SlideLibraryService, UserError } from "../shared/service";
import { describeError } from "../shared/messages";
import type { SlideEntry } from "../shared/types";

interface UiHooks {
  activate: (entry: SlideEntry, card: HTMLElement) => Promise<void>;
  toast: (
    kind: "success" | "error" | "info",
    message: string,
    detail?: string,
    ms?: number
  ) => void;
}

async function slideIds(): Promise<string[]> {
  return PowerPoint.run(async (ctx) => {
    const s = ctx.presentation.slides;
    s.load("items/id");
    await ctx.sync();
    return s.items.map((x) => x.id);
  });
}

async function selectedIds(): Promise<string[]> {
  return PowerPoint.run(async (ctx) => {
    const s = ctx.presentation.getSelectedSlides();
    s.load("items/id");
    await ctx.sync();
    return s.items.map((x) => x.id);
  });
}

async function selectSlide(id: string): Promise<void> {
  await PowerPoint.run(async (ctx) => {
    ctx.presentation.setSelectedSlides([id]);
    await ctx.sync();
  });
}

async function post(payload: unknown): Promise<void> {
  await fetch("/selftest/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function runSelftest(
  runId: string,
  svc: SlideLibraryService,
  ui: UiHooks
): Promise<void> {
  const started = new Date().toISOString();
  const doc = (Office.context.document && Office.context.document.url) || "";
  const results: Record<string, unknown>[] = [];
  const extra: Record<string, unknown> = {};
  ui.toast("info", `Selbsttest ${runId} läuft …`, "", 4000);
  try {
    const initial = await slideIds();
    extra.initialSlideCount = initial.length;
    const first = initial[0];
    for (const entry of svc.lib.slides) {
      try {
        await selectSlide(first);
        const out = await svc.insert(entry, "UseDestinationTheme");
        if (!out) throw new Error("insert returned null (busy)");
        const sel = await selectedIds();
        results.push({
          key: entry.key,
          kind: entry.kind,
          title: entry.title,
          ok: true,
          ms: out.ms,
          fetchMs: out.fetchMs,
          newSlideIds: out.newSlideIds,
          position: out.position,
          expectedPosition: 2,
          selectedAfter: sel,
          selectedOk: sel.length === 1 && sel[0] === out.newSlideIds[0],
        });
      } catch (e) {
        results.push({
          key: entry.key,
          kind: entry.kind,
          title: entry.title,
          ok: false,
          error: e instanceof UserError ? `${e.message} ${e.detail}` : describeError(e),
        });
      }
      if (results.length % 10 === 0)
        await post({
          runId,
          document: doc,
          progress: results.length,
          total: svc.lib.slides.length,
        });
    }

    // Warm-cache timing (file already downloaded): second insert of a few slides
    const warm: number[] = [];
    for (const entry of svc.lib.slides.slice(0, 5)) {
      await selectSlide(first);
      const out = await svc.insert(entry, "UseDestinationTheme");
      if (out) {
        warm.push(out.ms);
        extra[`warm_${entry.key}`] = out.newSlideIds;
      }
    }
    extra.warmMs = warm;

    // Double click guard (service level): two concurrent inserts -> exactly one slide
    {
      const entry = svc.lib.slides.find((s) => s.kind === "slide")!;
      await selectSlide(first);
      const before = (await slideIds()).length;
      const [a, b] = await Promise.all([
        svc.insert(entry, "UseDestinationTheme"),
        svc.insert(entry, "UseDestinationTheme"),
      ]);
      const after = (await slideIds()).length;
      extra.doubleClickService = {
        before,
        after,
        firstOk: !!a,
        secondBlocked: b === null,
        ok: after - before === 1 && b === null,
      };
    }

    // Double click guard (UI level): two click events on the same card
    {
      const card = document.querySelector<HTMLButtonElement>("#content .card:not(.card-layout)");
      if (card) {
        await selectSlide(first);
        const before = (await slideIds()).length;
        card.click();
        card.click();
        await new Promise((r) => setTimeout(r, 4000));
        const after = (await slideIds()).length;
        extra.doubleClickUi = { before, after, ok: after - before === 1 };
      } else {
        extra.doubleClickUi = { ok: false, error: "no card in DOM" };
      }
    }

    // No selection -> insert at the end
    {
      let cleared = false;
      try {
        await PowerPoint.run(async (ctx) => {
          ctx.presentation.setSelectedSlides([]);
          await ctx.sync();
        });
        cleared = (await selectedIds()).length === 0;
      } catch (e) {
        extra.noSelectionClearError = describeError(e);
      }
      const entry = svc.lib.slides.find((s) => s.kind === "slide")!;
      const out = await svc.insert(entry, "UseDestinationTheme");
      const ids = await slideIds();
      extra.noSelection = {
        cleared,
        position: out?.position,
        total: ids.length,
        atEndFlag: out?.atEnd,
        ok: !cleared || out?.position === ids.length,
      };
    }

    // Library mode: whole Library.pptx + sourceSlideIds
    {
      const libSvc = new SlideLibraryService({ ...svc.lib, insertMode: "library" }, svc.caps);
      const samples = svc.lib.slides
        .filter((s) => s.kind === "slide")
        .filter((_s, i) => i % 9 === 0);
      const runs: Record<string, unknown>[] = [];
      for (const entry of samples) {
        try {
          await selectSlide(first);
          const out = await libSvc.insert(entry, "UseDestinationTheme");
          runs.push({
            key: entry.key,
            ms: out?.ms,
            fetchMs: out?.fetchMs,
            newSlideIds: out?.newSlideIds,
            count: out?.newSlideIds.length,
            ok: out?.newSlideIds.length === 1,
          });
        } catch (e) {
          runs.push({
            key: entry.key,
            ok: false,
            error: e instanceof UserError ? `${e.message} ${e.detail}` : describeError(e),
          });
        }
      }
      extra.libraryMode = runs;
    }
  } catch (e) {
    extra.fatal = describeError(e);
  }
  const finalIds = await slideIds().catch(() => []);
  await post({
    runId,
    document: doc,
    started,
    finished: new Date().toISOString(),
    results,
    extra,
    finalSlideIds: finalIds,
    done: true,
  });
  ui.toast(
    "success",
    `Selbsttest ${runId} abgeschlossen`,
    `${results.filter((r) => r.ok).length}/${results.length} eingefügt`,
    6000
  );
}
