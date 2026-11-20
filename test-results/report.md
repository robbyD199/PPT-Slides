# Selbsttest-Bericht – Folienbibliothek

- Zeitpunkt: 20.11.2026, 03:40:27
- Bibliothek: Build `3b629875e1`, Stand 2026-11-20, 58 Einträge (54 Folien + 4 Grundlayouts)
- Ablauf: `scripts/selftest.ps1` (Dev-Build, automatisch geöffneter Seitenbereich, Einfügen jeder Vorlage hinter Folie 1, Prüfung per COM)

## Zielpräsentation `custom` – Design „Selbsttest Eigenes Theme“

| Prüfung | Ergebnis |
|---|---|
| Eingefügt und geprüft | 58/58 bestanden |
| Position direkt hinter der ausgewählten Folie (Folie 2) | ✅ |
| Neue Folie danach ausgewählt | ✅ |
| Dauer pro Folie < 2 s | ✅ (Ø 112 ms, max 173 ms; mit Download aus dem Cache-losen Zustand) |
| Warm (Datei bereits geladen) | 168 / 67 / 140 / 100 / 136 ms |
| Master/Design der eingefügten Folien = Ziel-Design | ✅ |
| Keine zusätzlichen Master | ✅ (Designs vorher 1, nachher 1) |
| Theme-Farben = Ziel-Farben | ✅ |
| Theme-Schriften übernommen | ✅ – 35 Folien vollständig, 23 Folien mit fester Schrift (alle vom Theme-Lint markiert) |
| Doppelklick fügt nur einmal ein (Service / Oberfläche) | ✅ / ✅ |
| Layout-Zuordnung | gleichnamige Layouts werden verwendet; 3 Layout(s) importiert: Title and Subtitle |
| Alternative „ganze Bibliothek + sourceSlideIds“ | ✅ 6 Stichproben, Ø 312 ms |

<details><summary>Alle Folien</summary>

| # | Folie | ms | Layout im Ziel | Farben | Schriften | Lint | Ergebnis |
|---|---|---|---|---|---|---|---|
| 1 | Deckblatt | 153 | Title Slide | ✅ | Georgia, Verdana | ok | ✅ |
| 2 | Vorstellung mit Foto | 62 | Title and Content | ✅ | Georgia, Verdana | ok | ✅ |
| 3 | Executive Summary – Fließtext | 163 | Title Only | ✅ | Georgia, Verdana | info | ✅ |
| 4 | Executive Summary – Kernaussagen mit Belegen | 94 | Title Only | ✅ | Georgia, Verdana | info | ✅ |
| 5 | Aufzählung mit Einleitungssatz | 128 | Title and Content | ✅ | Georgia, Verdana | ok | ✅ |
| 6 | Fließtext mit nummerierter Liste | 134 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 7 | Framework-Beschreibung mit 7 Elementen | 95 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 8 | Drei Bereiche mit Icons | 150 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 9 | Drei Trends – Tabelle mit Beispielen | 100 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 10 | Drei Trends – nummerierte Karten | 84 | Title and Subtitle | ✅ | Georgia, Verdana, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 11 | Fünf Kernbereiche mit Beschreibung | 115 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 12 | Icon-Liste mit Zahlen | 98 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 13 | 3×3 Nutzen-Karten mit Icons | 95 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 14 | Phasenübersicht – 5 Phasen | 142 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 15 | Phase 1 im Detail mit Bildraster | 78 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 16 | Phase 2 im Detail mit Bildraster | 84 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 17 | Phase 3 im Detail mit Bildraster | 91 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 18 | Phase 4 im Detail mit Bildraster | 91 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 19 | Phase 5 im Detail mit Bildraster | 90 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 20 | Phasenübersicht – Zusammenfassung | 130 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 21 | Schritt-für-Schritt-Anleitung (5 Schritte) | 118 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 22 | Treppe – 7 Stufen | 103 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 23 | Treppe – 7 Stufen mit Praxisbeispiel | 91 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 24 | Treppe – 7 Stufen, Ausfüllvorlage | 115 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 25 | Kaskade – 7 Schritte diagonal | 78 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 26 | Hub & Spoke mit Seitenbereichen | 122 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 27 | 2×2-Matrix mit Beschreibungen | 147 | Title Only | ✅ | Georgia, Verdana | info | ✅ |
| 28 | 2×2-Portfolio – manuell mit Labels | 125 | Title Only | ✅ | Georgia, Verdana | info | ✅ |
| 29 | BCG-Matrix (Growth-Share) | 144 | Title Only | ✅ | Arial, Georgia, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 30 | Priorisierungsmatrix (3×3) | 101 | Title Only | ✅ | Arial, Georgia, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 31 | Issue Tree (Treiberbaum) | 92 | Title and Subtitle | ✅ | Georgia, Verdana | info | ✅ |
| 32 | Bereichsübersicht A–G (Säulenmodell) | 123 | Title and Subtitle | ✅ | Georgia, Arial , Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 33 | Vier Liniendiagramme (Small Multiples) | 98 | Title Only | ✅ | Georgia, Verdana | warn | ✅ |
| 34 | Säulendiagramm – Vergleich mit Takeaways | 134 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 35 | Säulendiagramm mit Wachstumspfeil (CAGR) | 108 | Title and Subtitle | ✅ | Georgia, Verdana, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 36 | Säulendiagramm mit geteiltem Wachstum (2× CAGR) | 112 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 37 | Säulendiagramm – Ist vs. Prognose | 171 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 38 | Zwei Wasserfalldiagramme (Brücke) | 94 | Title Only | ✅ | Georgia, Verdana | warn | ✅ |
| 39 | 2×2-Portfolio – Blasendiagramm (automatisch) | 94 | Title Only | ✅ | Georgia, Verdana | warn | ✅ |
| 40 | Blasendiagramm | 118 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 41 | Blasendiagramm mit Takeaways | 109 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 42 | Key Facts – Kennzahlen-Kacheln mit Logos | 126 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 43 | Status- & KPI-Tabelle mit Ampeln | 146 | Title Only | ✅ | Georgia, Verdana, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 44 | Organigramm | 100 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 45 | Projektteam mit Rollen und Icons | 127 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 46 | Teamstruktur nach Funktionen | 142 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 47 | Projektplan nach Wochen mit Deliverables | 127 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 48 | Gantt-Zeitplan mit Stage-Gates | 173 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 49 | Drei Phasen mit Deliverables und Team | 118 | Title Only | ✅ | Georgia, Verdana, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 50 | Vier Phasen mit Key Meetings (SteerCo) | 149 | Title and Subtitle | ✅ | Georgia, Verdana, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 51 | Vier Wellen (Umsetzungs-Roadmap) | 110 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 52 | Vier Phasen auf Zeitstrahl | 114 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 53 | Leitfrage mit Bildraster und Call-to-Action | 136 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 54 | Literaturverzeichnis (APA 7) | 77 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 55 | Titelfolie (leer) | 65 | Title Slide | ✅ |  | ok | ✅ |
| 56 | Titel und Inhalt (leer) | 74 | Title and Content | ✅ |  | ok | ✅ |
| 57 | Nur Titel (leer) | 73 | Title Only | ✅ |  | ok | ✅ |
| 58 | Titel und Untertitel (leer) | 71 | Title and Subtitle | ✅ |  | ok | ✅ |

</details>

## Leere Präsentation (`empty`)

| Prüfung | Ergebnis |
|---|---|
| Einfügen in Präsentation ohne Folien landet auf Folie 1 | ✅ (Position 1) |
| Zweites Einfügen landet hinter der neuen (ausgewählten) Folie | ✅ (Position 2) |
| Zielfolien verwenden das Ziel-Design „Office Theme“ | ✅ |
| Option „Format der Vorlage beibehalten“ importiert den Bibliotheks-Master | ✅ (Designs: Office Theme, Office Theme [1795136486273]) |

## Zielpräsentation `ion` – Design „Ion“

| Prüfung | Ergebnis |
|---|---|
| Eingefügt und geprüft | 58/58 bestanden |
| Position direkt hinter der ausgewählten Folie (Folie 2) | ✅ |
| Neue Folie danach ausgewählt | ✅ |
| Dauer pro Folie < 2 s | ✅ (Ø 106 ms, max 197 ms; mit Download aus dem Cache-losen Zustand) |
| Warm (Datei bereits geladen) | 131 / 57 / 121 / 68 / 94 ms |
| Master/Design der eingefügten Folien = Ziel-Design | ✅ |
| Keine zusätzlichen Master | ✅ (Designs vorher 1, nachher 1) |
| Theme-Farben = Ziel-Farben | ✅ |
| Theme-Schriften übernommen | ✅ – 35 Folien vollständig, 23 Folien mit fester Schrift (alle vom Theme-Lint markiert) |
| Doppelklick fügt nur einmal ein (Service / Oberfläche) | ✅ / ✅ |
| Layout-Zuordnung | gleichnamige Layouts werden verwendet; 3 Layout(s) importiert: Title and Subtitle |
| Alternative „ganze Bibliothek + sourceSlideIds“ | ✅ 6 Stichproben, Ø 299 ms |

<details><summary>Alle Folien</summary>

| # | Folie | ms | Layout im Ziel | Farben | Schriften | Lint | Ergebnis |
|---|---|---|---|---|---|---|---|
| 1 | Deckblatt | 185 | Title Slide | ✅ | Century Gothic | ok | ✅ |
| 2 | Vorstellung mit Foto | 71 | Title and Content | ✅ | Century Gothic | ok | ✅ |
| 3 | Executive Summary – Fließtext | 93 | Title Only | ✅ | Century Gothic | info | ✅ |
| 4 | Executive Summary – Kernaussagen mit Belegen | 118 | Title Only | ✅ | Century Gothic | info | ✅ |
| 5 | Aufzählung mit Einleitungssatz | 98 | Title and Content | ✅ | Century Gothic | ok | ✅ |
| 6 | Fließtext mit nummerierter Liste | 108 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 7 | Framework-Beschreibung mit 7 Elementen | 86 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 8 | Drei Bereiche mit Icons | 173 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 9 | Drei Trends – Tabelle mit Beispielen | 98 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 10 | Drei Trends – nummerierte Karten | 81 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 11 | Fünf Kernbereiche mit Beschreibung | 98 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 12 | Icon-Liste mit Zahlen | 79 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 13 | 3×3 Nutzen-Karten mit Icons | 90 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 14 | Phasenübersicht – 5 Phasen | 102 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 15 | Phase 1 im Detail mit Bildraster | 100 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 16 | Phase 2 im Detail mit Bildraster | 84 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 17 | Phase 3 im Detail mit Bildraster | 80 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 18 | Phase 4 im Detail mit Bildraster | 77 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 19 | Phase 5 im Detail mit Bildraster | 65 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 20 | Phasenübersicht – Zusammenfassung | 127 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 21 | Schritt-für-Schritt-Anleitung (5 Schritte) | 81 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 22 | Treppe – 7 Stufen | 94 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 23 | Treppe – 7 Stufen mit Praxisbeispiel | 99 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 24 | Treppe – 7 Stufen, Ausfüllvorlage | 89 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 25 | Kaskade – 7 Schritte diagonal | 83 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 26 | Hub & Spoke mit Seitenbereichen | 82 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 27 | 2×2-Matrix mit Beschreibungen | 82 | Title Only | ✅ | Century Gothic | info | ✅ |
| 28 | 2×2-Portfolio – manuell mit Labels | 104 | Title Only | ✅ | Century Gothic | info | ✅ |
| 29 | BCG-Matrix (Growth-Share) | 129 | Title Only | ✅ | Arial, Century Gothic | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 30 | Priorisierungsmatrix (3×3) | 197 | Title Only | ✅ | Arial, Century Gothic | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 31 | Issue Tree (Treiberbaum) | 88 | Title and Subtitle | ✅ | Century Gothic | info | ✅ |
| 32 | Bereichsübersicht A–G (Säulenmodell) | 109 | Title and Subtitle | ✅ | Century Gothic, Arial , Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 33 | Vier Liniendiagramme (Small Multiples) | 95 | Title Only | ✅ | Century Gothic | warn | ✅ |
| 34 | Säulendiagramm – Vergleich mit Takeaways | 137 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 35 | Säulendiagramm mit Wachstumspfeil (CAGR) | 114 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 36 | Säulendiagramm mit geteiltem Wachstum (2× CAGR) | 114 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 37 | Säulendiagramm – Ist vs. Prognose | 104 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 38 | Zwei Wasserfalldiagramme (Brücke) | 87 | Title Only | ✅ | Century Gothic | warn | ✅ |
| 39 | 2×2-Portfolio – Blasendiagramm (automatisch) | 86 | Title Only | ✅ | Century Gothic | warn | ✅ |
| 40 | Blasendiagramm | 123 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 41 | Blasendiagramm mit Takeaways | 142 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 42 | Key Facts – Kennzahlen-Kacheln mit Logos | 100 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 43 | Status- & KPI-Tabelle mit Ampeln | 147 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 44 | Organigramm | 136 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 45 | Projektteam mit Rollen und Icons | 118 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 46 | Teamstruktur nach Funktionen | 167 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 47 | Projektplan nach Wochen mit Deliverables | 108 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 48 | Gantt-Zeitplan mit Stage-Gates | 142 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 49 | Drei Phasen mit Deliverables und Team | 154 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 50 | Vier Phasen mit Key Meetings (SteerCo) | 127 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 51 | Vier Wellen (Umsetzungs-Roadmap) | 142 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 52 | Vier Phasen auf Zeitstrahl | 103 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 53 | Leitfrage mit Bildraster und Call-to-Action | 91 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 54 | Literaturverzeichnis (APA 7) | 84 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 55 | Titelfolie (leer) | 65 | Title Slide | ✅ |  | ok | ✅ |
| 56 | Titel und Inhalt (leer) | 47 | Title and Content | ✅ |  | ok | ✅ |
| 57 | Nur Titel (leer) | 73 | Title Only | ✅ |  | ok | ✅ |
| 58 | Titel und Untertitel (leer) | 106 | Title and Subtitle | ✅ |  | ok | ✅ |

</details>

## Screenshot-Vergleich

Je Folie: links die Vorlage aus der Bibliothek, daneben die eingefügte Folie in jeder Zielpräsentation (Export per COM).

- [compare-01.jpg](screens/compare-01.jpg)
- [compare-02.jpg](screens/compare-02.jpg)
- [compare-03.jpg](screens/compare-03.jpg)
- [compare-04.jpg](screens/compare-04.jpg)
- [compare-05.jpg](screens/compare-05.jpg)
- [compare-06.jpg](screens/compare-06.jpg)
- [compare-07.jpg](screens/compare-07.jpg)
- [compare-08.jpg](screens/compare-08.jpg)

## Zusammenfassung

| Kriterium | Ergebnis |
|---|---|
| custom: Master, Farben, Schriften des Ziels (Ausnahmen nur Lint) | ✅ |
| custom: Einfügen < 2 s, Position, Auswahl, Doppelklick | ✅ |
| Leere Präsentation → Einfügen am Ende/Anfang | ✅ |
| ion: Master, Farben, Schriften des Ziels (Ausnahmen nur Lint) | ✅ |
| ion: Einfügen < 2 s, Position, Auswahl, Doppelklick | ✅ |

Hinweise:
- „Keine Auswahl → am Ende einfügen“: PowerPoint lässt sich per API nicht in einen Zustand ohne ausgewählte Folie versetzen (`setSelectedSlides([])` ändert nichts). Die Logik ist per Unit-Test abgedeckt; der Fall „leere Präsentation“ ist oben getestet.
- Fremde Schriften stammen ausschließlich aus Folien, die `scripts/lint-templates.ps1` markiert (fest gesetzte Schrift „Arial“ u. a. in der Vorlage).
