# PROGRESS – Folienbibliothek (PowerPoint-Add-in)

_Stand: 20.11.2026, ~04:30 Uhr_ · Live: <https://robbyd199.github.io/PPT-Slides/> · Repo: <https://github.com/robbyD199/PPT-Slides>

## Erledigt
- **Projekt**: `yo office` (Task Pane, TypeScript, PowerPoint, XML-Manifest). `manifest.dev.xml` (localhost) ist die Quelle,
  `manifest.xml` (GitHub Pages, eigene ID „Folienbibliothek“) wird per `scripts/gen-manifest.js` erzeugt. Beide validiert.
- **Vorlagen-Pipeline** `scripts/update-templates.ps1` (COM, unsichtbar, schreibgeschützt): Vorschaubilder 480×270 + 1280×720,
  **eine Mini-PPTX je Folie** (Ø 64 KB), 4 Grundlayouts, Vorlage „Neue Präsentation“ in 5 Farbsets, Platzhalter-Geometrie und
  -Schriftgrößen je Folie, Merge von `library.json` (neu/geändert/gelöscht, Kategorien bleiben erhalten), Zusammenfassung.
  Getestet mit manipulierter Kopie: 1 neu / 1 geändert / 1 gelöscht korrekt erkannt.
- **Theme-Lint** `scripts/lint-templates.ps1`: feste Farben, feste Schriften (latin / ea+cs getrennt), Diagramme, SmartArt;
  Signalfarben aus der JSON-Indexfolie werden als „bewusst fest“ (info) gewertet. Ergebnis: 26 Folien mit Warnungen.
- **Taxonomie** (MECE-Überarbeitung der JSON-Indexfolie, siehe `docs/TAXONOMIE.md`): 9 Kategorien, 28 Unterkategorien,
  deutsche Titel, Beschreibungen und EN/DE-Stichwörter für alle 54 Folien + 4 Grundlayouts. Einfügbare JSON:
  `docs/slide-index.proposed.json`.
- **Seitenbereich**: Live-Suche, Kategorie-Chips, einklappbare Gruppen, kompaktes Raster, Hover-Vorschau groß, „Zuletzt
  verwendet“, Lint-Markierung, Toasts, Menü (Einfügemodus, Platzhalter-Layout schützen, neue Präsentation aus Farbset,
  Suchfenster, neu laden), Fußzeile mit Stand/Build, Dark-Mode-Unterstützung.
- **Großes Suchfenster** (Dialog, aus dem Seitenbereich ⤢ und per Menüband „Folie suchen“): Raster + Detailvorschau,
  Tastatur (Pfeile/Enter/Esc), Option „offen lassen“.
- **Suche**: Normalisierung (Umlaute, ß, ×), Synonym-Wörterbuch Banking/Consulting EN↔DE, Phrasen („bar chart“),
  Präfix während des Tippens, Tippfehlertoleranz, „Beste Treffer“ + „Weitere Treffer“.
- **Einfügen**: `insertSlidesFromBase64` mit `UseDestinationTheme`, Ziel = ausgewählte Folie (bei Mehrfachauswahl die letzte),
  ohne Auswahl am Ende, leere Präsentation → Folie 1; neue Folie wird ausgewählt; Doppelklick-Sperre; Requirement-Set-Prüfung.
  **Layout-Schutz**: Bei fremden Mastern stellt das Add-in Position/Größe/Schriftgröße der Platzhalter aus der Vorlage
  wieder her (Schriftart und Farben bleiben die des Ziels).
- **Tests**: 43 Jest-Tests (Parsing, Gruppierung, Suche inkl. echter Bibliothek, Slide-ID-Format, Einfügeziel ohne
  Auswahl, Platzhalter-Zuordnung, library.json-Konsistenz, Manifeste, Vorlagen). `npm run lint`, `build`, `validate` fehlerfrei.
- **End-to-End-Selbsttest** `scripts/selftest.ps1` (Dev-Build, Ion + eigenes Theme Georgia/Verdana + leere Präsentation):
  58/58 Folien je Deck bestanden, Ø ~100 ms, max < 300 ms pro Folie, Master/Farben/Schriften des Ziels, keine
  zusätzlichen Master, Doppelklick fügt einmal ein. Screenshot-Vergleich Vorlage ↔ Ziel: `test-results/screens/compare-*.jpg`,
  Bericht: `test-results/report.md`.
- **Deploy**: GitHub Actions (`.github/workflows/pages.yml`: Tests, Build, Prüfung „kein Selbsttest-Code in Prod“, Deploy).
  **Produktiv-Check in PowerPoint** (ohne lokalen Server): Seitenbereich lädt von GitHub Pages (58 Karten, keine Fehler),
  Klick fügt als Folie 2 ein und wählt sie aus, Suchfenster öffnet, „Enter“ fügt ein, „Neue Präsentation aus Vorlage“ öffnet
  neue Präsentation mit Master + Farbset. Screenshots: `test-results/screens/prod-*.png`.
- **Installation**: `install-sideload.ps1` (Plan A, inkl. `-Uninstall`) – auf diesem PC ausgeführt; `install-catalog.ps1`
  (Plan B, Richtlinien-Check); `clear-cache.ps1`; Anleitung `docs/INSTALL.md`.

## Ergebnis „useDestinationTheme“ und Layouts (CLAUDE.md-Prüfauftrag)
- Gleichnamige Layouts werden **per Namen** auf das Ziel-Layout abgebildet (Title Slide, Title and Content, Title Only).
- Fehlt der Name im Ziel (z. B. „Title and Subtitle“ in Ion), wird das **Quell-Layout in den Ziel-Master importiert**
  (im Ziel-Design umgefärbt). Bei vielen Einfügungen entstanden bis zu 3 Kopien (Quelle: unterschiedliche Quelldateien).
- Platzhalter übernehmen Position/Größe/Schriftgröße des Ziel-Layouts → bei fremden Mastern liefen Action Titles in den
  Inhalt. Behoben durch den Layout-Schutz (siehe oben). Eine Umbenennung der Vorlagen-Layouts ist **nicht nötig**.
- In Präsentationen, die auf der Vorlage basieren, ändert sich nichts (gleiche Layouts, gleiche Geometrie).

## Offen / manuell zu prüfen (Checkliste, max. 5 Schritte)
1. PowerPoint starten → Start: Gruppe **Folienbibliothek** sichtbar? **Bibliothek** öffnet den Seitenbereich.
2. Folie 3 auswählen, eine Vorlage anklicken → erscheint als Folie 4 und ist ausgewählt.
3. Menüband **Folie suchen** → Fenster öffnet; „waterfall“ tippen, Enter → Folie eingefügt, Fenster schließt.
4. In der Folienübersicht zwischen zwei Folien klicken (keine Folie markiert) und einfügen → landet am Ende?
5. Mit dem **HSG-Konto** in Office anmelden → Gruppe weiterhin sichtbar? Sonst Plan B (`docs/INSTALL.md`, Admin nötig).

## Bekannte Einschränkungen
- Der Menüband-Button **„Folie suchen“** (Funktionsbefehl) konnte nicht automatisiert geklickt werden (Windows-Sitzung
  gesperrt; UI Automation sieht nichts). Das Suchfenster selbst ist getestet (aus dem Seitenbereich geöffnet).
- „Keine Folie ausgewählt → am Ende“ ist per Unit-Test abgedeckt; PowerPoint lässt sich per API nicht in einen
  Zustand ohne Auswahl versetzen (`setSelectedSlides([])` wirkt nicht).
- 26 Folien enthalten feste Schriften/Farben (v. a. „Arial“ direkt formatiert, Wasserfall-Diagramm in festem Blau, Signalfarben).
  Diese Folien übernehmen die Zielschrift nicht vollständig (im Add-in mit gelbem Dreieck markiert). Vorlage nur mit Zustimmung ändern.
- Dunkle Ziel-Themes (z. B. Ion) färben Flächen mit „Hintergrund 1“ dunkel (z. B. Bildplatzhalter) – gewolltes Theme-Verhalten.
- Bei 4:3-Zielpräsentationen werden Platzhalter auf die 16:9-Geometrie der Vorlage gesetzt (nicht skaliert).
- Plan B (Netzwerkkatalog) ist **nicht getestet**: Freigabe anlegen braucht Administratorrechte. Keine lokalen
  Office-Add-in-Richtlinien gefunden; HSG-Cloud-Richtlinien sind ohne Anmeldung nicht prüfbar.
- `npm start` (Dev) installiert beim ersten Mal ein Entwicklerzertifikat – Windows fragt nach (nicht automatisch bestätigt).
  Der Selbsttest umgeht das mit einem selbstsignierten Zertifikat nur für die Testinstanz.
- GitHub Pages ist **öffentlich**: Vorlage, Vorschaubilder und Einzel-PPTX sind für jeden mit der URL abrufbar
  (Inhalt: Platzhaltertexte, HSG-/RobbyD-Logos, Autorname in den Dateimetadaten). `claude.md` ist nicht im Repo.

## Nächste Schritte (Vorschläge)
- Checkliste oben durchgehen und Ergebnis melden.
- Optional die Indexfolie durch `docs/slide-index.proposed.json` ersetzen und fehlende Klassiker ergänzen
  (Agenda, Kapiteltrenner, Kontakt/Danke, Football Field, TAM/SAM/SOM) – siehe `docs/TAXONOMIE.md`.
- Optional feste „Arial“-Formatierungen in der Vorlage entfernen (Liste: `scripts/lint-templates.ps1`).
