# Taxonomie der Folienbibliothek (MECE-Prüfung)

Grundlage war die JSON-Indexfolie in der Vorlage (`Slide library index (JSON)`, Version 1.3, 11 Kategorien).
Die Vorlagen-PPTX selbst wurde **nicht** verändert. Die überarbeitete Struktur steht in
`assets/library/library.json` (Quelle der Wahrheit für das Add-in) und als einfügbare JSON in
[`docs/slide-index.proposed.json`](slide-index.proposed.json) (gleiches Schema wie die Indexfolie, plus `keywords`).
Neu erzeugen: `node scripts/export-index-json.js`.

## Befund zur ursprünglichen JSON

| Problem | Beispiel | Warum es stört |
|---|---|---|
| **Nicht MECE: zwei Dimensionen gemischt** | „Charts“ (Darstellungsform) neben „Team“ (Thema) und „References“ (Funktion) | Eine Folie kann mehrere Fächer treffen; Nutzer wissen nicht, wo sie suchen sollen. |
| **Widerspruch innerhalb eines Folienpaars** | „2×2-Portfolio, Version 2 (manuell)“ unter *Frameworks*, „Version 1 (automatisch, Blasendiagramm)“ unter *Charts* | Zwei Varianten derselben Folie liegen in verschiedenen Kategorien. |
| **Einzelfolien-Kategorien** | KPIs & figures (1), Tables (1), Images & call to action (1), References (1) | 4 von 11 Kategorien enthalten nur eine Folie – viel Navigation für wenig Inhalt. |
| **Grundformen fehlen** | Die 4 Master-Layouts sind nur unter `layouts` beschrieben | Leere Layoutfolien (am häufigsten benutzt) sind nicht einfügbar. |
| **„Images & call to action“ ist keine Kategorie** | Bildraster + Button | Funktion ist der Abschluss eines Pitch-Decks, nicht „Bilder“. |

## Regel (eine Dimension)

> **Kategorie = wichtigstes Darstellungsmittel der Folie; Ausnahme „Struktur & Storyline“ für Folien,
> die das Deck rahmen (Anfang, Zusammenfassung, Abschluss, Quellen).**

Abgrenzungsregeln, damit jede Folie genau ein Fach hat:

- **Diagramme** = echte, datengetriebene Diagrammobjekte (editierbare Daten) für Zeitreihen, Vergleiche, Brücken.
- **Frameworks & Matrizen** = konzeptionelle Anordnungen. **Matrizen und Portfolios gehören immer hierher**, auch
  wenn sie technisch ein Blasendiagramm sind (BCG-Matrix, automatisches 2×2-Portfolio).
- **Prozesse & Phasen** = Abfolgen **ohne** Zeitachse. **Zeitpläne & Roadmaps** = alles **mit** Zeitachse/Zeiträumen.
- **Kennzahlen & Tabellen** = Zahlen ohne Diagramm (Key Facts, Status-/KPI-Tabelle) – bündelt zwei frühere Einzelfolien-Kategorien.
- **Text & Kernaussagen** = Folien, deren Hauptmittel Text ist (Aufzählung, Fließtext, Spalten, Karten mit Icons).

## Neue Struktur (9 Kategorien, 28 Unterkategorien, keine Kategorie mit nur einer Folie)

| Kategorie | Unterkategorien | Folien |
|---|---|---|
| Grundlayouts | Leere Layouts | 4 |
| Struktur & Storyline | Deckblatt · Einleitung & Vorstellung · Executive Summary · Abschluss & Call-to-Action · Quellen & Anhang | 6 |
| Text & Kernaussagen | Aufzählung · Fließtext · Spalten & Bereiche · Karten & Icons | 9 |
| Diagramme | Linien · Säulen · Wasserfall · Blasen | 8 |
| Kennzahlen & Tabellen | Key Facts · Tabellen | 2 |
| Frameworks & Matrizen | Matrix & Portfolio · Hub & Spoke · Issue Tree · Säulen & Bausteine | 8 |
| Prozesse & Phasen | Phasenübersicht · Phase im Detail · Schrittfolge · Treppe & Kaskade | 12 |
| Zeitpläne & Roadmaps | Projektplan & Gantt · Phasen-Roadmap | 6 |
| Team & Organisation | Organigramm · Team & Rollen | 3 |

Reihenfolge im Seitenbereich: von den meistgenutzten Bausteinen (Layouts, Struktur, Text, Diagramme) zu den spezielleren.

## Änderungen gegenüber der JSON (Zuordnung alt → neu)

| Alt | Neu | Folien (Position) |
|---|---|---|
| charts / Bubble (Portfolio auf Quadranten) | Frameworks & Matrizen / Matrix & Portfolio | 39 |
| frameworks / Prioritization matrix | Frameworks & Matrizen / Matrix & Portfolio | 30 |
| frameworks / Area overview | Frameworks & Matrizen / Säulen & Bausteine | 32 |
| process / Cascade | Prozesse & Phasen / Treppe & Kaskade | 25 |
| kpis / KPI tiles | Kennzahlen & Tabellen / Key Facts | 42 |
| tables / Status table | Kennzahlen & Tabellen / Tabellen | 43 |
| images / Image with call to action | Struktur & Storyline / Abschluss & Call-to-Action | 53 |
| references / Reference list | Struktur & Storyline / Quellen & Anhang | 54 |
| *(neu)* | Grundlayouts / Leere Layouts | 4 Master-Layouts |

Alle übrigen Folien behalten ihre Zuordnung (Unterkategorien wurden ins Deutsche übertragen).

## Suche

Jede Folie hat deutsche und englische Stichwörter (`keywords`), dazu ein Synonym-Wörterbuch mit
Banking-/Consulting-Begriffen (`src/shared/synonyms.ts`), z. B. *bar chart ↔ Säulendiagramm*,
*bridge ↔ Wasserfall*, *company overview ↔ Key Facts*, *financial overview ↔ Diagramme/KPIs*,
*Gantt ↔ Zeitplan*. Die Suche verzeiht Tippfehler und findet schon beim Tippen (Präfixe).
Hinweis: Eine eigene **Agenda-Folie** fehlt in der Vorlage; „Agenda“ findet geeignete Ersatzfolien
(Fünf Kernbereiche, Schritt-für-Schritt, Bereichsübersicht, Titel und Inhalt).

## Vorschläge für die Vorlage (nicht umgesetzt – Vorlage nur mit deiner Zustimmung ändern)

1. Indexfolie durch `docs/slide-index.proposed.json` ersetzen (gleiches Schema, Version 2.0).
2. Fehlende Klassiker ergänzen: Agenda/Inhaltsverzeichnis, Kapiteltrenner (Section Divider), „Vielen Dank / Kontakt“,
   Football-Field (Bewertung), Marktgrößen-Trichter (TAM/SAM/SOM), Pro/Contra-Vergleich.
3. Fest gesetzte Schrift „Arial“ (und „Graphik Regular“, „Verdana“, „Helvetica Neue“, „Georgia“) in 23 Folien durch die
   Theme-Schrift ersetzen, sonst übernehmen diese Folien die Schrift fremder Präsentationen nicht (Liste: `scripts/lint-templates.ps1`).
4. Wasserfall (#38): Diagrammfarben auf Designfarben umstellen.
