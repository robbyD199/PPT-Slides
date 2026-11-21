# Übergabe – Stand 20.11.2026 (für die nächste Claude-Sitzung)

> **Entscheidung 21.11.2026:** Die Folienbibliothek wird künftig nur noch im **PPT-Toolkit** (COM-Add-in, lädt bei
> jedem Start automatisch) weiterentwickelt – das Web-Add-in muss nach jedem Start neu aktiviert werden. Dieses Repo
> bleibt Quelle der eigenen Vorlagen und GitHub Pages die Datenquelle für das Toolkit; der Web-Add-in-Code ist
> eingefroren (Rückfallebene). Abmelden des Web-Add-ins erst nach Abnahme im Toolkit und mit Dorians Zustimmung.

## Was existiert (fertig, live)
- **Folienbibliothek** = Office Web Add-in für PowerPoint Desktop (Windows, M365), TypeScript, XML-Manifest.
- Live: https://robbyd199.github.io/PPT-Slides/ · Repo: https://github.com/robbyD199/PPT-Slides (öffentlich, Branch `main`).
  Jeder Push auf `main` → GitHub Actions (`.github/workflows/pages.yml`: Jest, Build, Prüfung „kein Selbsttest-Code“, Deploy).
- Auf Dorians PC registriert (Plan A, `HKCU\...\WEF\Developer`, Prod-ID `5e2eceaf-…`). Dev-Manifest-ID `cdeb7d84-…`.
- Funktionen: Seitenbereich (Kategorien, Live-Suche DE/EN mit Synonymen, Hover-Vorschau, Zuletzt verwendet, Lint-Marker),
  großes Suchfenster (Dialog; Menüband „Folie suchen“ = Funktionsbefehl, **ungetestet** per Klick), Menü ⋯:
  Einfügemodus **Automatisch (Standard)** / Immer Bibliotheks-Master / An Präsentation anpassen, Platzhalter-Layout-Schutz,
  „Neue Präsentation aus Vorlage“ (5 Farbsets), Bibliothek neu laden.

## Wichtige Dateien
| Bereich | Datei |
|---|---|
| Einfügen, Auto-Modus, Platzhalter-Schutz | `src/shared/insert.ts`, `src/shared/service.ts`, `src/shared/prefs.ts` |
| Suche + Synonyme | `src/shared/search.ts`, `src/shared/synonyms.ts` |
| UI | `src/taskpane/*`, `src/dialog/*`, `src/shared/cards.ts`, `src/shared/base.css` |
| Dev-Selbsttest (nur Dev-Build) | `src/taskpane/selftest.ts`, `scripts/selftest.ps1`, `scripts/selftest/*` |
| Vorlagen-Pipeline | `scripts/update-templates.ps1` → `extract-cli.js` → COM-Export → `merge-library.js` |
| Kuratierte Daten | `assets/library/library.json` (Kategorien, Titel, Keywords; Quelle der Wahrheit) |
| Qualität | `scripts/lint-templates.ps1`, `scripts/contrast-check.ps1`, `scripts/fix-contrast.ps1` |
| Vorlage | `templates/Library.pptx` (kontrastkorrigiert, mit Zustimmung), Original: `templates/Library.original.pptx` |
| Doku | `PROGRESS.md`, `docs/INSTALL.md`, `docs/TAXONOMIE.md`, `docs/slide-index.proposed.json`, `test-results/report.md` |

## Arbeitsweise / Befehle
```powershell
npm run lint; npx jest; npm run build; npm run validate     # alles muss grün sein (48 Tests)
powershell -ExecutionPolicy Bypass -File scripts/update-templates.ps1   # nach Änderungen an templates/Library.pptx
powershell -ExecutionPolicy Bypass -File scripts/selftest.ps1           # PowerPoint vorher schließen! ~8 min, 9 Läufe
powershell -ExecutionPolicy Bypass -File scripts/selftest.ps1 -Only 'auto-vorlage,auto-fremd'   # Teilmenge
git push   # = Deploy (gespeicherte Git-Credentials für robbyD199 vorhanden; GCM_INTERACTIVE=never setzen)
```
„Vorlagen aktualisieren“ (Ablauf aus CLAUDE.md): update-templates → neue Folien mit `category: null` in library.json
kategorisieren (Kategorie, subcategory, deutscher Titel, EN/DE-Keywords, description) → `npx jest` → Selbsttest → commit → push.

## Technische Erkenntnisse (nicht offensichtlich)
- PowerShell-Tool läuft in einer Sandbox: `GetActiveObject` scheitert; **PowerPoint per `Start-Process` starten**, dann
  verbindet `New-Object -ComObject PowerPoint.Application` mit dieser Instanz. COM-Skripte mit `powershell.exe` (5.1),
  Dateien mit Umlauten als UTF-8 **mit BOM** speichern.
- Niemals PowerPoint-Präsentationen pauschal schließen – nur eigene Testdateien per Pfad (Auto-Classifier blockt sonst).
- Dev-Server-Zertifikat: Kein Root-Zertifikat installieren (Windows-Sicherheitsabfrage). Selbsttest nutzt
  `SLIDELIB_SELFSIGNED=1` + Testinstanz mit `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--ignore-certificate-errors`.
- Gesperrte Windows-Sitzung: Screenshots/UI-Automation unmöglich → `--remote-debugging-port=9333` + `scripts/selftest/cdp.js`
  (Seitenbereich/Dialog per DevTools steuern, Screenshots via CDP). Slide-Bilder per COM `Slide.Export`.
- Registry nie mit `New-Item -Force` auf vorhandene Schlüssel (löscht Werte).
- `useDestinationTheme`: gleichnamige Layouts werden gemappt, fehlende importiert; Platzhalter nehmen Geometrie/Größe des
  Ziel-Layouts an → Platzhalter-Schutz (PowerPointApi 1.4) stellt Box + Schriftgröße der Vorlage wieder her.
- `KeepSourceFormatting` in Decks mit eigenem Master erzeugt einen zweiten Master → daher Standard „Automatisch“
  (`resolveFormatting`: eigener Master erkannt über die 4 Layoutnamen der Bibliothek).
- PowerPoint verwirft unbenutzte Layouts beim Löschen von Folien → Layouts vorher `Preserved = msoTrue`.
- Office.js PowerPoint: kein Diagramm-API, keine Theme-Farben-API; Einfügen nur über `insertSlidesFromBase64`.

## Offene Punkte
- Menüband „Folie suchen“ einmal manuell testen; Ribbon-Gruppe erschien erst nach Add-ins → Hinzufügen.
- Akzent 3 der Farbsets Credit Suisse/Marlboro/UBS dunkel (JP Morgan/Rothschild hell) → 1 Kontraststelle (#48).
- Plan B (HSG, Netzwerkkatalog) ungetestet (Admin nötig). Farbsets ggf. neutral umbenennen vor dem Teilen.
