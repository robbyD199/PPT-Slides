# PROGRESS – Folienbibliothek (PowerPoint-Add-in)

_Stand: 20.11.2026 (laufend aktualisiert)_

## Erledigt
- Projektgerüst mit `yo office` (Task Pane, TypeScript, PowerPoint, XML-Manifest); Dev-Manifest `manifest.dev.xml` (localhost) ist Quelle, `manifest.xml` (GitHub Pages) wird per `scripts/gen-manifest.js` erzeugt.
- Vorlagen-Pipeline: `scripts/update-templates.ps1` (COM: Vorschaubilder, Mini-PPTX je Folie, Grundlayouts, Vorlagen je Farbset) + `scripts/merge-library.js` (library.json zusammenführen) + `scripts/lint-templates.ps1` (Theme-Lint).
- MECE-Taxonomie mit 9 Kategorien / 30 Unterkategorien, deutsche Titel + EN/DE-Suchbegriffe für alle 54 Folien + 4 Grundlayouts.
- Seitenbereich, großes Suchfenster (Dialog) und Menüband-Befehl „Folie suchen“.
- Unit-Tests (Jest): Bibliothek parsen, Gruppierung, Suche/Synonyme/Tippfehler, Slide-ID-Format, Einfügeziel ohne Auswahl, library.json-Konsistenz, Manifeste.

## Offen
- End-to-End-Selbsttest in PowerPoint (`scripts/selftest.ps1`).
- Installationsskripte, `docs/INSTALL.md`, Deploy auf GitHub Pages.

## Bekannte Probleme
- (wird nach dem Selbsttest ergänzt)
