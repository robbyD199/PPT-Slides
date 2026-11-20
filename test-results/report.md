# Selbsttest-Bericht – Folienbibliothek

- Zeitpunkt: 20.11.2026, 04:00:36
- Bibliothek: Build `3b629875e1`, Stand 2026-11-20, 58 Einträge (54 Folien + 4 Grundlayouts)
- Ablauf: `scripts/selftest.ps1` (Dev-Build, automatisch geöffneter Seitenbereich, Einfügen jeder Vorlage hinter Folie 1, Prüfung per COM)

## Zielpräsentation `ion` – Design „Ion“

| Prüfung | Ergebnis |
|---|---|
| Eingefügt und geprüft | 58/58 bestanden |
| Position direkt hinter der ausgewählten Folie (Folie 2) | ✅ |
| Neue Folie danach ausgewählt | ✅ |
| Dauer pro Folie < 2 s | ✅ (Ø 123 ms, max 239 ms; mit Download aus dem Cache-losen Zustand) |
| Warm (Datei bereits geladen) | 157 / 65 / 108 / 100 / 124 ms |
| Master/Design der eingefügten Folien = Ziel-Design | ✅ |
| Keine zusätzlichen Master | ✅ (Designs vorher 1, nachher 1) |
| Theme-Farben = Ziel-Farben | ✅ |
| Theme-Schriften übernommen | ✅ – 35 Folien vollständig, 23 Folien mit fester Schrift (alle vom Theme-Lint markiert) |
| Doppelklick fügt nur einmal ein (Service / Oberfläche) | ✅ / ✅ |
| Layout-Zuordnung | gleichnamige Layouts werden verwendet; 3 Layout(s) importiert: Title and Subtitle |
| Alternative „ganze Bibliothek + sourceSlideIds“ | ✅ 6 Stichproben, Ø 334 ms |

<details><summary>Alle Folien</summary>

| # | Folie | ms | Layout im Ziel | Farben | Schriften | Lint | Ergebnis |
|---|---|---|---|---|---|---|---|
| 1 | Deckblatt | 122 | Title Slide | ✅ | Century Gothic | ok | ✅ |
| 2 | Vorstellung mit Foto | 68 | Title and Content | ✅ | Century Gothic | ok | ✅ |
| 3 | Executive Summary – Fließtext | 110 | Title Only | ✅ | Century Gothic | info | ✅ |
| 4 | Executive Summary – Kernaussagen mit Belegen | 113 | Title Only | ✅ | Century Gothic | info | ✅ |
| 5 | Aufzählung mit Einleitungssatz | 160 | Title and Content | ✅ | Century Gothic | ok | ✅ |
| 6 | Fließtext mit nummerierter Liste | 113 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 7 | Framework-Beschreibung mit 7 Elementen | 137 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 8 | Drei Bereiche mit Icons | 166 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 9 | Drei Trends – Tabelle mit Beispielen | 121 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 10 | Drei Trends – nummerierte Karten | 104 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 11 | Fünf Kernbereiche mit Beschreibung | 159 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 12 | Icon-Liste mit Zahlen | 92 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 13 | 3×3 Nutzen-Karten mit Icons | 119 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 14 | Phasenübersicht – 5 Phasen | 117 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 15 | Phase 1 im Detail mit Bildraster | 92 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 16 | Phase 2 im Detail mit Bildraster | 101 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 17 | Phase 3 im Detail mit Bildraster | 100 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 18 | Phase 4 im Detail mit Bildraster | 95 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 19 | Phase 5 im Detail mit Bildraster | 86 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 20 | Phasenübersicht – Zusammenfassung | 119 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 21 | Schritt-für-Schritt-Anleitung (5 Schritte) | 79 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 22 | Treppe – 7 Stufen | 92 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 23 | Treppe – 7 Stufen mit Praxisbeispiel | 139 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 24 | Treppe – 7 Stufen, Ausfüllvorlage | 108 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 25 | Kaskade – 7 Schritte diagonal | 115 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 26 | Hub & Spoke mit Seitenbereichen | 100 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 27 | 2×2-Matrix mit Beschreibungen | 128 | Title Only | ✅ | Century Gothic | info | ✅ |
| 28 | 2×2-Portfolio – manuell mit Labels | 104 | Title Only | ✅ | Century Gothic | info | ✅ |
| 29 | BCG-Matrix (Growth-Share) | 125 | Title Only | ✅ | Arial, Century Gothic | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 30 | Priorisierungsmatrix (3×3) | 138 | Title Only | ✅ | Arial, Century Gothic | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 31 | Issue Tree (Treiberbaum) | 94 | Title and Subtitle | ✅ | Century Gothic | info | ✅ |
| 32 | Bereichsübersicht A–G (Säulenmodell) | 161 | Title and Subtitle | ✅ | Century Gothic, Arial , Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 33 | Vier Liniendiagramme (Small Multiples) | 131 | Title Only | ✅ | Century Gothic | warn | ✅ |
| 34 | Säulendiagramm – Vergleich mit Takeaways | 109 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 35 | Säulendiagramm mit Wachstumspfeil (CAGR) | 115 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 36 | Säulendiagramm mit geteiltem Wachstum (2× CAGR) | 141 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 37 | Säulendiagramm – Ist vs. Prognose | 126 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 38 | Zwei Wasserfalldiagramme (Brücke) | 110 | Title Only | ✅ | Century Gothic | warn | ✅ |
| 39 | 2×2-Portfolio – Blasendiagramm (automatisch) | 140 | Title Only | ✅ | Century Gothic | warn | ✅ |
| 40 | Blasendiagramm | 118 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 41 | Blasendiagramm mit Takeaways | 117 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 42 | Key Facts – Kennzahlen-Kacheln mit Logos | 132 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 43 | Status- & KPI-Tabelle mit Ampeln | 137 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 44 | Organigramm | 119 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 45 | Projektteam mit Rollen und Icons | 159 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 46 | Teamstruktur nach Funktionen | 137 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 47 | Projektplan nach Wochen mit Deliverables | 104 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 48 | Gantt-Zeitplan mit Stage-Gates | 169 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 49 | Drei Phasen mit Deliverables und Team | 155 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 50 | Vier Phasen mit Key Meetings (SteerCo) | 143 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 51 | Vier Wellen (Umsetzungs-Roadmap) | 219 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 52 | Vier Phasen auf Zeitstrahl | 174 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 53 | Leitfrage mit Bildraster und Call-to-Action | 239 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 54 | Literaturverzeichnis (APA 7) | 197 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 55 | Titelfolie (leer) | 69 | Title Slide | ✅ |  | ok | ✅ |
| 56 | Titel und Inhalt (leer) | 52 | Title and Content | ✅ |  | ok | ✅ |
| 57 | Nur Titel (leer) | 75 | Title Only | ✅ |  | ok | ✅ |
| 58 | Titel und Untertitel (leer) | 93 | Title and Subtitle | ✅ |  | ok | ✅ |

</details>

## Zielpräsentation `custom` – Design „Selbsttest Eigenes Theme“

| Prüfung | Ergebnis |
|---|---|
| Eingefügt und geprüft | 58/58 bestanden |
| Position direkt hinter der ausgewählten Folie (Folie 2) | ✅ |
| Neue Folie danach ausgewählt | ✅ |
| Dauer pro Folie < 2 s | ✅ (Ø 116 ms, max 174 ms; mit Download aus dem Cache-losen Zustand) |
| Warm (Datei bereits geladen) | 109 / 86 / 122 / 109 / 117 ms |
| Master/Design der eingefügten Folien = Ziel-Design | ✅ |
| Keine zusätzlichen Master | ✅ (Designs vorher 1, nachher 1) |
| Theme-Farben = Ziel-Farben | ✅ |
| Theme-Schriften übernommen | ✅ – 35 Folien vollständig, 23 Folien mit fester Schrift (alle vom Theme-Lint markiert) |
| Doppelklick fügt nur einmal ein (Service / Oberfläche) | ✅ / ✅ |
| Layout-Zuordnung | gleichnamige Layouts werden verwendet; 3 Layout(s) importiert: Title and Subtitle |
| Alternative „ganze Bibliothek + sourceSlideIds“ | ✅ 6 Stichproben, Ø 300 ms |

<details><summary>Alle Folien</summary>

| # | Folie | ms | Layout im Ziel | Farben | Schriften | Lint | Ergebnis |
|---|---|---|---|---|---|---|---|
| 1 | Deckblatt | 146 | Title Slide | ✅ | Georgia, Verdana | ok | ✅ |
| 2 | Vorstellung mit Foto | 69 | Title and Content | ✅ | Georgia, Verdana | ok | ✅ |
| 3 | Executive Summary – Fließtext | 97 | Title Only | ✅ | Georgia, Verdana | info | ✅ |
| 4 | Executive Summary – Kernaussagen mit Belegen | 80 | Title Only | ✅ | Georgia, Verdana | info | ✅ |
| 5 | Aufzählung mit Einleitungssatz | 99 | Title and Content | ✅ | Georgia, Verdana | ok | ✅ |
| 6 | Fließtext mit nummerierter Liste | 89 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 7 | Framework-Beschreibung mit 7 Elementen | 101 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 8 | Drei Bereiche mit Icons | 122 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 9 | Drei Trends – Tabelle mit Beispielen | 114 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 10 | Drei Trends – nummerierte Karten | 78 | Title and Subtitle | ✅ | Georgia, Verdana, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 11 | Fünf Kernbereiche mit Beschreibung | 122 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 12 | Icon-Liste mit Zahlen | 90 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 13 | 3×3 Nutzen-Karten mit Icons | 114 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 14 | Phasenübersicht – 5 Phasen | 102 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 15 | Phase 1 im Detail mit Bildraster | 86 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 16 | Phase 2 im Detail mit Bildraster | 93 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 17 | Phase 3 im Detail mit Bildraster | 112 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 18 | Phase 4 im Detail mit Bildraster | 119 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 19 | Phase 5 im Detail mit Bildraster | 104 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 20 | Phasenübersicht – Zusammenfassung | 138 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 21 | Schritt-für-Schritt-Anleitung (5 Schritte) | 90 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 22 | Treppe – 7 Stufen | 95 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 23 | Treppe – 7 Stufen mit Praxisbeispiel | 123 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 24 | Treppe – 7 Stufen, Ausfüllvorlage | 103 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 25 | Kaskade – 7 Schritte diagonal | 122 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 26 | Hub & Spoke mit Seitenbereichen | 87 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 27 | 2×2-Matrix mit Beschreibungen | 133 | Title Only | ✅ | Georgia, Verdana | info | ✅ |
| 28 | 2×2-Portfolio – manuell mit Labels | 104 | Title Only | ✅ | Georgia, Verdana | info | ✅ |
| 29 | BCG-Matrix (Growth-Share) | 133 | Title Only | ✅ | Arial, Georgia, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 30 | Priorisierungsmatrix (3×3) | 144 | Title Only | ✅ | Arial, Georgia, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 31 | Issue Tree (Treiberbaum) | 127 | Title and Subtitle | ✅ | Georgia, Verdana | info | ✅ |
| 32 | Bereichsübersicht A–G (Säulenmodell) | 174 | Title and Subtitle | ✅ | Georgia, Arial , Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 33 | Vier Liniendiagramme (Small Multiples) | 124 | Title Only | ✅ | Georgia, Verdana | warn | ✅ |
| 34 | Säulendiagramm – Vergleich mit Takeaways | 126 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 35 | Säulendiagramm mit Wachstumspfeil (CAGR) | 164 | Title and Subtitle | ✅ | Georgia, Verdana, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 36 | Säulendiagramm mit geteiltem Wachstum (2× CAGR) | 160 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 37 | Säulendiagramm – Ist vs. Prognose | 136 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 38 | Zwei Wasserfalldiagramme (Brücke) | 120 | Title Only | ✅ | Georgia, Verdana | warn | ✅ |
| 39 | 2×2-Portfolio – Blasendiagramm (automatisch) | 100 | Title Only | ✅ | Georgia, Verdana | warn | ✅ |
| 40 | Blasendiagramm | 142 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 41 | Blasendiagramm mit Takeaways | 167 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 42 | Key Facts – Kennzahlen-Kacheln mit Logos | 96 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 43 | Status- & KPI-Tabelle mit Ampeln | 152 | Title Only | ✅ | Georgia, Verdana, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 44 | Organigramm | 107 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 45 | Projektteam mit Rollen und Icons | 130 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 46 | Teamstruktur nach Funktionen | 171 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 47 | Projektplan nach Wochen mit Deliverables | 105 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 48 | Gantt-Zeitplan mit Stage-Gates | 154 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 49 | Drei Phasen mit Deliverables und Team | 144 | Title Only | ✅ | Georgia, Verdana, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 50 | Vier Phasen mit Key Meetings (SteerCo) | 122 | Title and Subtitle | ✅ | Georgia, Verdana, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 51 | Vier Wellen (Umsetzungs-Roadmap) | 129 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 52 | Vier Phasen auf Zeitstrahl | 117 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 53 | Leitfrage mit Bildraster und Call-to-Action | 102 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 54 | Literaturverzeichnis (APA 7) | 114 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 55 | Titelfolie (leer) | 71 | Title Slide | ✅ |  | ok | ✅ |
| 56 | Titel und Inhalt (leer) | 49 | Title and Content | ✅ |  | ok | ✅ |
| 57 | Nur Titel (leer) | 146 | Title Only | ✅ |  | ok | ✅ |
| 58 | Titel und Untertitel (leer) | 91 | Title and Subtitle | ✅ |  | ok | ✅ |

</details>

## Leere Präsentation (`empty`)

| Prüfung | Ergebnis |
|---|---|
| Einfügen in Präsentation ohne Folien landet auf Folie 1 | ✅ (Position 1) |
| Zweites Einfügen landet hinter der neuen (ausgewählten) Folie | ✅ (Position 2) |
| Zielfolien verwenden das Ziel-Design „Office Theme“ | ✅ |
| Option „Format der Vorlage beibehalten“ importiert den Bibliotheks-Master | ✅ (Designs: Office Theme, Office Theme [1795136486273]) |

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
| ion: Master, Farben, Schriften des Ziels (Ausnahmen nur Lint) | ✅ |
| ion: Einfügen < 2 s, Position, Auswahl, Doppelklick | ✅ |
| custom: Master, Farben, Schriften des Ziels (Ausnahmen nur Lint) | ✅ |
| custom: Einfügen < 2 s, Position, Auswahl, Doppelklick | ✅ |
| Leere Präsentation → Einfügen am Ende/Anfang | ✅ |

Hinweise:
- „Keine Auswahl → am Ende einfügen“: PowerPoint lässt sich per API nicht in einen Zustand ohne ausgewählte Folie versetzen (`setSelectedSlides([])` ändert nichts). Die Logik ist per Unit-Test abgedeckt; der Fall „leere Präsentation“ ist oben getestet.
- Fremde Schriften stammen ausschließlich aus Folien, die `scripts/lint-templates.ps1` markiert (fest gesetzte Schrift „Arial“ u. a. in der Vorlage).
