/** All user-facing texts (German). */
export const MSG = {
  notInOffice: "Dieses Add-in läuft nur in PowerPoint. Bitte über Start → Folienbibliothek öffnen.",
  reqInsertMissing:
    "Diese PowerPoint-Version kann keine Folien aus der Bibliothek einfügen (Schnittstelle „PowerPointApi 1.2“ fehlt). Bitte Microsoft 365 aktualisieren: Datei → Konto → Updateoptionen → Jetzt aktualisieren.",
  reqSelectMissing:
    "Hinweis: Ihre PowerPoint-Version kann die aktuelle Folie nicht an Add-ins melden (PowerPointApi 1.5 fehlt). Folien werden deshalb am Ende eingefügt.",
  reqCreateMissing:
    "Neue Präsentationen kann diese PowerPoint-Version nicht per Add-in anlegen (PowerPointApi 1.1 fehlt).",
  libLoadFailed:
    "Die Folienbibliothek konnte nicht geladen werden. Bitte Internetverbindung prüfen und den Bereich neu öffnen.",
  libEmpty: "Die Bibliothek enthält keine Folien.",
  inserting: "Folie wird eingefügt …",
  inserted: (title: string, pos: number, atEnd: boolean) =>
    atEnd ? `„${title}“ am Ende eingefügt (Folie ${pos})` : `„${title}“ eingefügt als Folie ${pos}`,
  insertedShort: "Folie eingefügt",
  insertFailed: "Die Folie konnte nicht eingefügt werden.",
  downloadFailed: "Die Vorlagendatei konnte nicht geladen werden. Bitte Internetverbindung prüfen.",
  busy: "Bitte warten – es wird gerade eine Folie eingefügt.",
  noResults: (q: string) => `Keine Treffer für „${q}“.`,
  partialResults: "Keine Folie passt zu allen Begriffen – das sind die besten Teiltreffer.",
  createdPresentation: (name: string) => `Neue Präsentation mit Farbset „${name}“ geöffnet.`,
  createFailed: "Die neue Präsentation konnte nicht erstellt werden.",
  dialogFailed: "Das Suchfenster konnte nicht geöffnet werden.",
  foreignDesign: "Diese Präsentation nutzt ein fremdes Design.",
  foreignDesignHint:
    "Eingefügte Folien übernehmen dessen Farben und Schriften. Für das Aussehen der Vorlage: Menü ⋯ → „Format der Vorlage beibehalten“ oder „Neue Präsentation aus Vorlage“.",
  localMissing:
    "Die lokale Datei ist nicht mehr gespeichert (z. B. nach dem Leeren des Office-Caches). Bitte den Ordner über Menü ⋯ erneut hinzufügen.",
  localImporting: (done: number, total: number) =>
    `Lokaler Ordner wird gespeichert … ${done}/${total}`,
  localImported: (label: string, count: number) =>
    `„${label}“ hinzugefügt: ${count} Folien (nur auf diesem PC gespeichert).`,
  localImportFailed: "Der Ordner konnte nicht hinzugefügt werden.",
  localRemoved: (label: string) => `„${label}“ wurde aus der Bibliothek entfernt.`,
  localRemoveFailed: "Der lokale Ordner konnte nicht entfernt werden.",
  lintHint:
    "Enthält feste Farben oder Schriften – passt sich evtl. nicht vollständig an das Design der Zielpräsentation an.",
};

/** Turns an Office.js / fetch error into a short German detail text. */
export function describeError(err: unknown): string {
  const e = err as { code?: string; message?: string; debugInfo?: { message?: string } };
  const code = e && e.code ? String(e.code) : "";
  switch (code) {
    case "InvalidArgument":
      return "Ungültige Angabe beim Einfügen (z. B. Folien-ID nicht gefunden).";
    case "AccessDenied":
      return "Die Präsentation ist schreibgeschützt oder wird gerade bearbeitet.";
    case "InvalidOperation":
    case "InvalidOperationInCellEditMode":
      return "Aktion gerade nicht möglich – bitte Textbearbeitung beenden (Esc) und erneut versuchen.";
    case "GeneralException":
      return "PowerPoint hat das Einfügen abgelehnt (allgemeiner Fehler).";
    case "ItemNotFound":
      return "Die Zielfolie wurde nicht gefunden.";
    default:
      break;
  }
  const msg = (e && (e.message || (e.debugInfo && e.debugInfo.message))) || String(err);
  return msg.length > 220 ? msg.slice(0, 220) + "…" : msg;
}
