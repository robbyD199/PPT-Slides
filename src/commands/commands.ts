import { detectCapabilities, loadLibrary, SlideLibraryService } from "../shared/service";
import { openSearchDialog } from "../shared/dialogHost";

/**
 * Ribbon command "Folie suchen": opens the large search window directly (without the task pane).
 * The insert is executed here (function-file runtime) when the dialog sends a message.
 */
let service: Promise<SlideLibraryService> | null = null;

function getService(): Promise<SlideLibraryService> {
  if (!service) {
    service = loadLibrary().then((lib) => new SlideLibraryService(lib, detectCapabilities()));
    service.catch(() => (service = null));
  }
  return service;
}

function openSearch(event: Office.AddinCommands.Event): void {
  let done = false;
  const complete = () => {
    if (!done) {
      done = true;
      event.completed();
    }
  };
  void getService().catch(() => undefined);
  openSearchDialog({
    getService,
    onClosed: complete,
  });
}

Office.onReady(() => {
  Office.actions.associate("openSearch", openSearch);
});
