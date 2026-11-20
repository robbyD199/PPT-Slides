import { type SlideLibraryService, UserError, type InsertOutcome } from "./service";
import { describeError, MSG } from "./messages";
import { prefs } from "./prefs";
import { isSetSupported } from "./insert";

/** Messages from the search dialog to its parent (task pane or ribbon command). */
export type DialogToParent = { type: "insert"; key: string; keepOpen: boolean } | { type: "close" };

/** Messages from the parent to the dialog (needs DialogApi 1.2). */
export type ParentToDialog = {
  type: "result";
  ok: boolean;
  message: string;
  detail?: string;
  key?: string;
};

export interface DialogHostOptions {
  getService: () => Promise<SlideLibraryService>;
  onInserted?: (o: InsertOutcome) => void;
  onError?: (message: string, detail: string) => void;
  onClosed?: () => void;
}

let open = false;

/** Opens the large search window ("Folie suchen"). The parent performs the actual insert. */
export function openSearchDialog(opts: DialogHostOptions): void {
  if (open) return;
  const url = new URL("search.html", window.location.href).toString();
  Office.context.ui.displayDialogAsync(
    url,
    { height: 86, width: 64, displayInIframe: true },
    (res) => {
      if (res.status === Office.AsyncResultStatus.Failed) {
        opts.onError?.(
          MSG.dialogFailed,
          res.error ? `${res.error.code}: ${res.error.message}` : ""
        );
        opts.onClosed?.();
        return;
      }
      open = true;
      const dialog = res.value;
      let closed = false;
      const finish = () => {
        if (closed) return;
        closed = true;
        open = false;
        opts.onClosed?.();
      };
      const reply = (msg: ParentToDialog) => {
        if (isSetSupported("DialogApi", "1.2")) {
          try {
            dialog.messageChild(JSON.stringify(msg));
          } catch {
            /* dialog gone */
          }
        }
      };
      dialog.addEventHandler(Office.EventType.DialogEventReceived, () => finish());
      dialog.addEventHandler(
        Office.EventType.DialogMessageReceived,
        async (arg: { message: string; origin: string | undefined } | { error: number }) => {
          if (!("message" in arg)) return;
          let msg: DialogToParent;
          try {
            msg = JSON.parse(arg.message || "{}");
          } catch {
            return;
          }
          if (msg.type === "close") {
            dialog.close();
            finish();
            return;
          }
          if (msg.type === "insert") {
            try {
              const svc = await opts.getService();
              const entry = svc.lib.slides.find((s) => s.key === msg.key);
              if (!entry)
                throw new UserError(MSG.insertFailed, "Folie nicht in der Bibliothek gefunden.");
              const out = await svc.insert(entry, prefs.formatting(), prefs.keepLayout());
              if (!out) {
                reply({ type: "result", ok: false, message: MSG.busy, key: msg.key });
                return;
              }
              prefs.addRecent(entry.key);
              opts.onInserted?.(out);
              if (!msg.keepOpen) {
                dialog.close();
                finish();
              } else {
                reply({
                  type: "result",
                  ok: true,
                  message: MSG.inserted(entry.title, out.position, out.atEnd),
                  key: msg.key,
                });
              }
            } catch (e) {
              const message = e instanceof UserError ? e.message : MSG.insertFailed;
              const detail = e instanceof UserError ? e.detail : describeError(e);
              reply({ type: "result", ok: false, message, detail, key: msg.key });
              opts.onError?.(message, detail);
            }
          }
        }
      );
    }
  );
}
