# Selbsttest-Bericht – Folienbibliothek

- Zeitpunkt: 20.11.2026, 06:18:00
- Bibliothek: Build `06c3818d00`, Stand 2026-11-20, 58 Einträge (54 Folien + 4 Grundlayouts)
- Ablauf: `scripts/selftest.ps1` (Dev-Build, automatisch geöffneter Seitenbereich, Einfügen jeder Vorlage hinter Folie 1, Prüfung per COM)

## Zielpräsentation `vorlage-rothschild` – Design „Office Theme [1795136486273]“

| Prüfung | Ergebnis |
|---|---|
| Eingefügt und geprüft | 58/58 bestanden |
| Position direkt hinter der ausgewählten Folie (Folie 2) | ✅ |
| Neue Folie danach ausgewählt | ✅ |
| Dauer pro Folie < 2 s | ✅ (Ø 127 ms, max 196 ms; mit Download aus dem Cache-losen Zustand) |
| Warm (Datei bereits geladen) | 113 / 81 / 108 / 77 / 112 ms |
| Master/Design der eingefügten Folien = Ziel-Design | ✅ |
| Keine zusätzlichen Master | ✅ (Designs vorher 1, nachher 1) |
| Theme-Farben = Ziel-Farben | ✅ |
| Theme-Schriften übernommen | ✅ – 57 Folien vollständig, 1 Folien mit fester Schrift (alle vom Theme-Lint markiert) |
| Doppelklick fügt nur einmal ein (Service / Oberfläche) | ✅ / ✅ |
| Layout-Zuordnung | gleichnamige Layouts werden verwendet; 0 Layout(s) importiert: – |
| Alternative „ganze Bibliothek + sourceSlideIds“ | ✅ 6 Stichproben, Ø 313 ms |

<details><summary>Alle Folien</summary>

| # | Folie | ms | Layout im Ziel | Farben | Schriften | Lint | Ergebnis |
|---|---|---|---|---|---|---|---|
| 1 | Deckblatt | 126 | Title Slide | ✅ | Arial | ok | ✅ |
| 2 | Vorstellung mit Foto | 66 | Title and Content | ✅ | Arial | ok | ✅ |
| 3 | Executive Summary – Fließtext | 120 | Title Only | ✅ | Arial | info | ✅ |
| 4 | Executive Summary – Kernaussagen mit Belegen | 114 | Title Only | ✅ | Arial | info | ✅ |
| 5 | Aufzählung mit Einleitungssatz | 111 | Title and Content | ✅ | Arial | ok | ✅ |
| 6 | Fließtext mit nummerierter Liste | 94 | Title Only | ✅ | Arial | ok | ✅ |
| 7 | Framework-Beschreibung mit 7 Elementen | 114 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 8 | Drei Bereiche mit Icons | 141 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 9 | Drei Trends – Tabelle mit Beispielen | 149 | Title Only | ✅ | Arial | warn | ✅ |
| 10 | Drei Trends – nummerierte Karten | 114 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 11 | Fünf Kernbereiche mit Beschreibung | 133 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 12 | Icon-Liste mit Zahlen | 107 | Title Only | ✅ | Arial | ok | ✅ |
| 13 | 3×3 Nutzen-Karten mit Icons | 142 | Title Only | ✅ | Arial | ok | ✅ |
| 14 | Phasenübersicht – 5 Phasen | 119 | Title Only | ✅ | Arial | ok | ✅ |
| 15 | Phase 1 im Detail mit Bildraster | 147 | Title Only | ✅ | Arial | ok | ✅ |
| 16 | Phase 2 im Detail mit Bildraster | 114 | Title Only | ✅ | Arial | ok | ✅ |
| 17 | Phase 3 im Detail mit Bildraster | 92 | Title Only | ✅ | Arial | ok | ✅ |
| 18 | Phase 4 im Detail mit Bildraster | 108 | Title Only | ✅ | Arial | ok | ✅ |
| 19 | Phase 5 im Detail mit Bildraster | 101 | Title Only | ✅ | Arial | ok | ✅ |
| 20 | Phasenübersicht – Zusammenfassung | 130 | Title Only | ✅ | Arial | ok | ✅ |
| 21 | Schritt-für-Schritt-Anleitung (5 Schritte) | 102 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 22 | Treppe – 7 Stufen | 109 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 23 | Treppe – 7 Stufen mit Praxisbeispiel | 134 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 24 | Treppe – 7 Stufen, Ausfüllvorlage | 109 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 25 | Kaskade – 7 Schritte diagonal | 110 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 26 | Hub & Spoke mit Seitenbereichen | 108 | Title Only | ✅ | Arial | ok | ✅ |
| 27 | 2×2-Matrix mit Beschreibungen | 110 | Title Only | ✅ | Arial | info | ✅ |
| 28 | 2×2-Portfolio – manuell mit Labels | 163 | Title Only | ✅ | Arial | info | ✅ |
| 29 | BCG-Matrix (Growth-Share) | 139 | Title Only | ✅ | Arial | warn | ✅ |
| 30 | Priorisierungsmatrix (3×3) | 136 | Title Only | ✅ | Arial | warn | ✅ |
| 31 | Issue Tree (Treiberbaum) | 122 | Title and Subtitle | ✅ | Arial | info | ✅ |
| 32 | Bereichsübersicht A–G (Säulenmodell) | 160 | Title and Subtitle | ✅ | Arial, Arial  | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 33 | Vier Liniendiagramme (Small Multiples) | 179 | Title Only | ✅ | Arial | warn | ✅ |
| 34 | Säulendiagramm – Vergleich mit Takeaways | 117 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 35 | Säulendiagramm mit Wachstumspfeil (CAGR) | 120 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 36 | Säulendiagramm mit geteiltem Wachstum (2× CAGR) | 149 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 37 | Säulendiagramm – Ist vs. Prognose | 134 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 38 | Zwei Wasserfalldiagramme (Brücke) | 124 | Title Only | ✅ | Arial | warn | ✅ |
| 39 | 2×2-Portfolio – Blasendiagramm (automatisch) | 109 | Title Only | ✅ | Arial | warn | ✅ |
| 40 | Blasendiagramm | 130 | Title Only | ✅ | Arial | warn | ✅ |
| 41 | Blasendiagramm mit Takeaways | 149 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 42 | Key Facts – Kennzahlen-Kacheln mit Logos | 117 | Title Only | ✅ | Arial | ok | ✅ |
| 43 | Status- & KPI-Tabelle mit Ampeln | 141 | Title Only | ✅ | Arial | warn | ✅ |
| 44 | Organigramm | 149 | Title Only | ✅ | Arial | warn | ✅ |
| 45 | Projektteam mit Rollen und Icons | 137 | Title Only | ✅ | Arial | warn | ✅ |
| 46 | Teamstruktur nach Funktionen | 141 | Title Only | ✅ | Arial | warn | ✅ |
| 47 | Projektplan nach Wochen mit Deliverables | 138 | Title Only | ✅ | Arial | warn | ✅ |
| 48 | Gantt-Zeitplan mit Stage-Gates | 173 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 49 | Drei Phasen mit Deliverables und Team | 158 | Title Only | ✅ | Arial | warn | ✅ |
| 50 | Vier Phasen mit Key Meetings (SteerCo) | 196 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 51 | Vier Wellen (Umsetzungs-Roadmap) | 185 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 52 | Vier Phasen auf Zeitstrahl | 129 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 53 | Leitfrage mit Bildraster und Call-to-Action | 115 | Title Only | ✅ | Arial | ok | ✅ |
| 54 | Literaturverzeichnis (APA 7) | 109 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 55 | Titelfolie (leer) | 94 | Title Slide | ✅ |  | ok | ✅ |
| 56 | Titel und Inhalt (leer) | 92 | Title and Content | ✅ |  | ok | ✅ |
| 57 | Nur Titel (leer) | 132 | Title Only | ✅ |  | ok | ✅ |
| 58 | Titel und Untertitel (leer) | 123 | Title and Subtitle | ✅ |  | ok | ✅ |

</details>

## Zielpräsentation `vorlage-ubs` – Design „Office Theme [1795136486273]“

| Prüfung | Ergebnis |
|---|---|
| Eingefügt und geprüft | 58/58 bestanden |
| Position direkt hinter der ausgewählten Folie (Folie 2) | ✅ |
| Neue Folie danach ausgewählt | ✅ |
| Dauer pro Folie < 2 s | ✅ (Ø 122 ms, max 178 ms; mit Download aus dem Cache-losen Zustand) |
| Warm (Datei bereits geladen) | 96 / 116 / 84 / 75 / 115 ms |
| Master/Design der eingefügten Folien = Ziel-Design | ✅ |
| Keine zusätzlichen Master | ✅ (Designs vorher 1, nachher 1) |
| Theme-Farben = Ziel-Farben | ✅ |
| Theme-Schriften übernommen | ✅ – 57 Folien vollständig, 1 Folien mit fester Schrift (alle vom Theme-Lint markiert) |
| Doppelklick fügt nur einmal ein (Service / Oberfläche) | ✅ / ✅ |
| Layout-Zuordnung | gleichnamige Layouts werden verwendet; 0 Layout(s) importiert: – |
| Alternative „ganze Bibliothek + sourceSlideIds“ | ✅ 6 Stichproben, Ø 322 ms |

<details><summary>Alle Folien</summary>

| # | Folie | ms | Layout im Ziel | Farben | Schriften | Lint | Ergebnis |
|---|---|---|---|---|---|---|---|
| 1 | Deckblatt | 178 | Title Slide | ✅ | Arial | ok | ✅ |
| 2 | Vorstellung mit Foto | 93 | Title and Content | ✅ | Arial | ok | ✅ |
| 3 | Executive Summary – Fließtext | 145 | Title Only | ✅ | Arial | info | ✅ |
| 4 | Executive Summary – Kernaussagen mit Belegen | 95 | Title Only | ✅ | Arial | info | ✅ |
| 5 | Aufzählung mit Einleitungssatz | 107 | Title and Content | ✅ | Arial | ok | ✅ |
| 6 | Fließtext mit nummerierter Liste | 99 | Title Only | ✅ | Arial | ok | ✅ |
| 7 | Framework-Beschreibung mit 7 Elementen | 114 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 8 | Drei Bereiche mit Icons | 121 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 9 | Drei Trends – Tabelle mit Beispielen | 117 | Title Only | ✅ | Arial | warn | ✅ |
| 10 | Drei Trends – nummerierte Karten | 108 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 11 | Fünf Kernbereiche mit Beschreibung | 112 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 12 | Icon-Liste mit Zahlen | 94 | Title Only | ✅ | Arial | ok | ✅ |
| 13 | 3×3 Nutzen-Karten mit Icons | 114 | Title Only | ✅ | Arial | ok | ✅ |
| 14 | Phasenübersicht – 5 Phasen | 128 | Title Only | ✅ | Arial | ok | ✅ |
| 15 | Phase 1 im Detail mit Bildraster | 108 | Title Only | ✅ | Arial | ok | ✅ |
| 16 | Phase 2 im Detail mit Bildraster | 118 | Title Only | ✅ | Arial | ok | ✅ |
| 17 | Phase 3 im Detail mit Bildraster | 106 | Title Only | ✅ | Arial | ok | ✅ |
| 18 | Phase 4 im Detail mit Bildraster | 101 | Title Only | ✅ | Arial | ok | ✅ |
| 19 | Phase 5 im Detail mit Bildraster | 102 | Title Only | ✅ | Arial | ok | ✅ |
| 20 | Phasenübersicht – Zusammenfassung | 122 | Title Only | ✅ | Arial | ok | ✅ |
| 21 | Schritt-für-Schritt-Anleitung (5 Schritte) | 105 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 22 | Treppe – 7 Stufen | 115 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 23 | Treppe – 7 Stufen mit Praxisbeispiel | 110 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 24 | Treppe – 7 Stufen, Ausfüllvorlage | 109 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 25 | Kaskade – 7 Schritte diagonal | 104 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 26 | Hub & Spoke mit Seitenbereichen | 110 | Title Only | ✅ | Arial | ok | ✅ |
| 27 | 2×2-Matrix mit Beschreibungen | 109 | Title Only | ✅ | Arial | info | ✅ |
| 28 | 2×2-Portfolio – manuell mit Labels | 138 | Title Only | ✅ | Arial | info | ✅ |
| 29 | BCG-Matrix (Growth-Share) | 145 | Title Only | ✅ | Arial | warn | ✅ |
| 30 | Priorisierungsmatrix (3×3) | 114 | Title Only | ✅ | Arial | warn | ✅ |
| 31 | Issue Tree (Treiberbaum) | 140 | Title and Subtitle | ✅ | Arial | info | ✅ |
| 32 | Bereichsübersicht A–G (Säulenmodell) | 157 | Title and Subtitle | ✅ | Arial, Arial  | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 33 | Vier Liniendiagramme (Small Multiples) | 119 | Title Only | ✅ | Arial | warn | ✅ |
| 34 | Säulendiagramm – Vergleich mit Takeaways | 104 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 35 | Säulendiagramm mit Wachstumspfeil (CAGR) | 155 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 36 | Säulendiagramm mit geteiltem Wachstum (2× CAGR) | 127 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 37 | Säulendiagramm – Ist vs. Prognose | 132 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 38 | Zwei Wasserfalldiagramme (Brücke) | 128 | Title Only | ✅ | Arial | warn | ✅ |
| 39 | 2×2-Portfolio – Blasendiagramm (automatisch) | 91 | Title Only | ✅ | Arial | warn | ✅ |
| 40 | Blasendiagramm | 123 | Title Only | ✅ | Arial | warn | ✅ |
| 41 | Blasendiagramm mit Takeaways | 160 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 42 | Key Facts – Kennzahlen-Kacheln mit Logos | 112 | Title Only | ✅ | Arial | ok | ✅ |
| 43 | Status- & KPI-Tabelle mit Ampeln | 142 | Title Only | ✅ | Arial | warn | ✅ |
| 44 | Organigramm | 146 | Title Only | ✅ | Arial | warn | ✅ |
| 45 | Projektteam mit Rollen und Icons | 136 | Title Only | ✅ | Arial | warn | ✅ |
| 46 | Teamstruktur nach Funktionen | 127 | Title Only | ✅ | Arial | warn | ✅ |
| 47 | Projektplan nach Wochen mit Deliverables | 149 | Title Only | ✅ | Arial | warn | ✅ |
| 48 | Gantt-Zeitplan mit Stage-Gates | 176 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 49 | Drei Phasen mit Deliverables und Team | 130 | Title Only | ✅ | Arial | warn | ✅ |
| 50 | Vier Phasen mit Key Meetings (SteerCo) | 141 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 51 | Vier Wellen (Umsetzungs-Roadmap) | 129 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 52 | Vier Phasen auf Zeitstrahl | 150 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 53 | Leitfrage mit Bildraster und Call-to-Action | 105 | Title Only | ✅ | Arial | ok | ✅ |
| 54 | Literaturverzeichnis (APA 7) | 104 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 55 | Titelfolie (leer) | 68 | Title Slide | ✅ |  | ok | ✅ |
| 56 | Titel und Inhalt (leer) | 98 | Title and Content | ✅ |  | ok | ✅ |
| 57 | Nur Titel (leer) | 97 | Title Only | ✅ |  | ok | ✅ |
| 58 | Titel und Untertitel (leer) | 165 | Title and Subtitle | ✅ |  | ok | ✅ |

</details>

## Zielpräsentation `ion` – Design „Ion“

| Prüfung | Ergebnis |
|---|---|
| Eingefügt und geprüft | 58/58 bestanden |
| Position direkt hinter der ausgewählten Folie (Folie 2) | ✅ |
| Neue Folie danach ausgewählt | ✅ |
| Dauer pro Folie < 2 s | ✅ (Ø 109 ms, max 172 ms; mit Download aus dem Cache-losen Zustand) |
| Warm (Datei bereits geladen) | 104 / 59 / 123 / 96 / 121 ms |
| Master/Design der eingefügten Folien = Ziel-Design | ✅ |
| Keine zusätzlichen Master | ✅ (Designs vorher 1, nachher 1) |
| Theme-Farben = Ziel-Farben | ✅ |
| Theme-Schriften übernommen | ✅ – 35 Folien vollständig, 23 Folien mit fester Schrift (alle vom Theme-Lint markiert) |
| Doppelklick fügt nur einmal ein (Service / Oberfläche) | ✅ / ✅ |
| Layout-Zuordnung | gleichnamige Layouts werden verwendet; 3 Layout(s) importiert: Title and Subtitle |
| Alternative „ganze Bibliothek + sourceSlideIds“ | ✅ 6 Stichproben, Ø 326 ms |

<details><summary>Alle Folien</summary>

| # | Folie | ms | Layout im Ziel | Farben | Schriften | Lint | Ergebnis |
|---|---|---|---|---|---|---|---|
| 1 | Deckblatt | 131 | Title Slide | ✅ | Century Gothic | ok | ✅ |
| 2 | Vorstellung mit Foto | 70 | Title and Content | ✅ | Century Gothic | ok | ✅ |
| 3 | Executive Summary – Fließtext | 111 | Title Only | ✅ | Century Gothic | info | ✅ |
| 4 | Executive Summary – Kernaussagen mit Belegen | 140 | Title Only | ✅ | Century Gothic | info | ✅ |
| 5 | Aufzählung mit Einleitungssatz | 172 | Title and Content | ✅ | Century Gothic | ok | ✅ |
| 6 | Fließtext mit nummerierter Liste | 84 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 7 | Framework-Beschreibung mit 7 Elementen | 94 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 8 | Drei Bereiche mit Icons | 110 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 9 | Drei Trends – Tabelle mit Beispielen | 95 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 10 | Drei Trends – nummerierte Karten | 80 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 11 | Fünf Kernbereiche mit Beschreibung | 115 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 12 | Icon-Liste mit Zahlen | 86 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 13 | 3×3 Nutzen-Karten mit Icons | 80 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 14 | Phasenübersicht – 5 Phasen | 117 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 15 | Phase 1 im Detail mit Bildraster | 82 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 16 | Phase 2 im Detail mit Bildraster | 83 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 17 | Phase 3 im Detail mit Bildraster | 89 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 18 | Phase 4 im Detail mit Bildraster | 110 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 19 | Phase 5 im Detail mit Bildraster | 88 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 20 | Phasenübersicht – Zusammenfassung | 103 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 21 | Schritt-für-Schritt-Anleitung (5 Schritte) | 93 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 22 | Treppe – 7 Stufen | 77 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 23 | Treppe – 7 Stufen mit Praxisbeispiel | 125 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 24 | Treppe – 7 Stufen, Ausfüllvorlage | 118 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 25 | Kaskade – 7 Schritte diagonal | 99 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 26 | Hub & Spoke mit Seitenbereichen | 97 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 27 | 2×2-Matrix mit Beschreibungen | 95 | Title Only | ✅ | Century Gothic | info | ✅ |
| 28 | 2×2-Portfolio – manuell mit Labels | 119 | Title Only | ✅ | Century Gothic | info | ✅ |
| 29 | BCG-Matrix (Growth-Share) | 151 | Title Only | ✅ | Arial, Century Gothic | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 30 | Priorisierungsmatrix (3×3) | 100 | Title Only | ✅ | Arial, Century Gothic | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 31 | Issue Tree (Treiberbaum) | 105 | Title and Subtitle | ✅ | Century Gothic | info | ✅ |
| 32 | Bereichsübersicht A–G (Säulenmodell) | 119 | Title and Subtitle | ✅ | Century Gothic, Arial , Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 33 | Vier Liniendiagramme (Small Multiples) | 102 | Title Only | ✅ | Century Gothic | warn | ✅ |
| 34 | Säulendiagramm – Vergleich mit Takeaways | 102 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 35 | Säulendiagramm mit Wachstumspfeil (CAGR) | 115 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 36 | Säulendiagramm mit geteiltem Wachstum (2× CAGR) | 151 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 37 | Säulendiagramm – Ist vs. Prognose | 114 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 38 | Zwei Wasserfalldiagramme (Brücke) | 95 | Title Only | ✅ | Century Gothic | warn | ✅ |
| 39 | 2×2-Portfolio – Blasendiagramm (automatisch) | 86 | Title Only | ✅ | Century Gothic | warn | ✅ |
| 40 | Blasendiagramm | 121 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 41 | Blasendiagramm mit Takeaways | 142 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 42 | Key Facts – Kennzahlen-Kacheln mit Logos | 82 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 43 | Status- & KPI-Tabelle mit Ampeln | 150 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 44 | Organigramm | 101 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 45 | Projektteam mit Rollen und Icons | 125 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 46 | Teamstruktur nach Funktionen | 157 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 47 | Projektplan nach Wochen mit Deliverables | 132 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 48 | Gantt-Zeitplan mit Stage-Gates | 157 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 49 | Drei Phasen mit Deliverables und Team | 140 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 50 | Vier Phasen mit Key Meetings (SteerCo) | 156 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 51 | Vier Wellen (Umsetzungs-Roadmap) | 110 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 52 | Vier Phasen auf Zeitstrahl | 111 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 53 | Leitfrage mit Bildraster und Call-to-Action | 95 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 54 | Literaturverzeichnis (APA 7) | 91 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 55 | Titelfolie (leer) | 67 | Title Slide | ✅ |  | ok | ✅ |
| 56 | Titel und Inhalt (leer) | 86 | Title and Content | ✅ |  | ok | ✅ |
| 57 | Nur Titel (leer) | 70 | Title Only | ✅ |  | ok | ✅ |
| 58 | Titel und Untertitel (leer) | 136 | Title and Subtitle | ✅ |  | ok | ✅ |

</details>

## Zielpräsentation `custom` – Design „Selbsttest Eigenes Theme“

| Prüfung | Ergebnis |
|---|---|
| Eingefügt und geprüft | 58/58 bestanden |
| Position direkt hinter der ausgewählten Folie (Folie 2) | ✅ |
| Neue Folie danach ausgewählt | ✅ |
| Dauer pro Folie < 2 s | ✅ (Ø 116 ms, max 220 ms; mit Download aus dem Cache-losen Zustand) |
| Warm (Datei bereits geladen) | 99 / 85 / 121 / 142 / 119 ms |
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
| 1 | Deckblatt | 126 | Title Slide | ✅ | Georgia, Verdana | ok | ✅ |
| 2 | Vorstellung mit Foto | 68 | Title and Content | ✅ | Georgia, Verdana | ok | ✅ |
| 3 | Executive Summary – Fließtext | 220 | Title Only | ✅ | Georgia, Verdana | info | ✅ |
| 4 | Executive Summary – Kernaussagen mit Belegen | 113 | Title Only | ✅ | Georgia, Verdana | info | ✅ |
| 5 | Aufzählung mit Einleitungssatz | 122 | Title and Content | ✅ | Georgia, Verdana | ok | ✅ |
| 6 | Fließtext mit nummerierter Liste | 127 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 7 | Framework-Beschreibung mit 7 Elementen | 99 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 8 | Drei Bereiche mit Icons | 129 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 9 | Drei Trends – Tabelle mit Beispielen | 121 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 10 | Drei Trends – nummerierte Karten | 88 | Title and Subtitle | ✅ | Georgia, Verdana, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 11 | Fünf Kernbereiche mit Beschreibung | 98 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 12 | Icon-Liste mit Zahlen | 94 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 13 | 3×3 Nutzen-Karten mit Icons | 106 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 14 | Phasenübersicht – 5 Phasen | 113 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 15 | Phase 1 im Detail mit Bildraster | 105 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 16 | Phase 2 im Detail mit Bildraster | 96 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 17 | Phase 3 im Detail mit Bildraster | 92 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 18 | Phase 4 im Detail mit Bildraster | 91 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 19 | Phase 5 im Detail mit Bildraster | 99 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 20 | Phasenübersicht – Zusammenfassung | 124 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 21 | Schritt-für-Schritt-Anleitung (5 Schritte) | 87 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 22 | Treppe – 7 Stufen | 116 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 23 | Treppe – 7 Stufen mit Praxisbeispiel | 88 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 24 | Treppe – 7 Stufen, Ausfüllvorlage | 108 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 25 | Kaskade – 7 Schritte diagonal | 97 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 26 | Hub & Spoke mit Seitenbereichen | 124 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 27 | 2×2-Matrix mit Beschreibungen | 128 | Title Only | ✅ | Georgia, Verdana | info | ✅ |
| 28 | 2×2-Portfolio – manuell mit Labels | 107 | Title Only | ✅ | Georgia, Verdana | info | ✅ |
| 29 | BCG-Matrix (Growth-Share) | 122 | Title Only | ✅ | Arial, Georgia, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 30 | Priorisierungsmatrix (3×3) | 109 | Title Only | ✅ | Arial, Georgia, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 31 | Issue Tree (Treiberbaum) | 98 | Title and Subtitle | ✅ | Georgia, Verdana | info | ✅ |
| 32 | Bereichsübersicht A–G (Säulenmodell) | 166 | Title and Subtitle | ✅ | Georgia, Arial , Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 33 | Vier Liniendiagramme (Small Multiples) | 109 | Title Only | ✅ | Georgia, Verdana | warn | ✅ |
| 34 | Säulendiagramm – Vergleich mit Takeaways | 126 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 35 | Säulendiagramm mit Wachstumspfeil (CAGR) | 145 | Title and Subtitle | ✅ | Georgia, Verdana, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 36 | Säulendiagramm mit geteiltem Wachstum (2× CAGR) | 129 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 37 | Säulendiagramm – Ist vs. Prognose | 125 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 38 | Zwei Wasserfalldiagramme (Brücke) | 150 | Title Only | ✅ | Georgia, Verdana | warn | ✅ |
| 39 | 2×2-Portfolio – Blasendiagramm (automatisch) | 121 | Title Only | ✅ | Georgia, Verdana | warn | ✅ |
| 40 | Blasendiagramm | 125 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 41 | Blasendiagramm mit Takeaways | 144 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 42 | Key Facts – Kennzahlen-Kacheln mit Logos | 82 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 43 | Status- & KPI-Tabelle mit Ampeln | 151 | Title Only | ✅ | Georgia, Verdana, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 44 | Organigramm | 116 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 45 | Projektteam mit Rollen und Icons | 138 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 46 | Teamstruktur nach Funktionen | 171 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 47 | Projektplan nach Wochen mit Deliverables | 133 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 48 | Gantt-Zeitplan mit Stage-Gates | 171 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 49 | Drei Phasen mit Deliverables und Team | 120 | Title Only | ✅ | Georgia, Verdana, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 50 | Vier Phasen mit Key Meetings (SteerCo) | 138 | Title and Subtitle | ✅ | Georgia, Verdana, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 51 | Vier Wellen (Umsetzungs-Roadmap) | 149 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 52 | Vier Phasen auf Zeitstrahl | 108 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 53 | Leitfrage mit Bildraster und Call-to-Action | 128 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 54 | Literaturverzeichnis (APA 7) | 81 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 55 | Titelfolie (leer) | 70 | Title Slide | ✅ |  | ok | ✅ |
| 56 | Titel und Inhalt (leer) | 51 | Title and Content | ✅ |  | ok | ✅ |
| 57 | Nur Titel (leer) | 77 | Title Only | ✅ |  | ok | ✅ |
| 58 | Titel und Untertitel (leer) | 117 | Title and Subtitle | ✅ |  | ok | ✅ |

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

- [compare-fremd-01.jpg](screens/compare-fremd-01.jpg)
- [compare-fremd-02.jpg](screens/compare-fremd-02.jpg)
- [compare-fremd-03.jpg](screens/compare-fremd-03.jpg)
- [compare-fremd-04.jpg](screens/compare-fremd-04.jpg)
- [compare-fremd-05.jpg](screens/compare-fremd-05.jpg)
- [compare-fremd-06.jpg](screens/compare-fremd-06.jpg)
- [compare-fremd-07.jpg](screens/compare-fremd-07.jpg)
- [compare-fremd-08.jpg](screens/compare-fremd-08.jpg)
- [compare-vorlage-01.jpg](screens/compare-vorlage-01.jpg)
- [compare-vorlage-02.jpg](screens/compare-vorlage-02.jpg)
- [compare-vorlage-03.jpg](screens/compare-vorlage-03.jpg)
- [compare-vorlage-04.jpg](screens/compare-vorlage-04.jpg)
- [compare-vorlage-05.jpg](screens/compare-vorlage-05.jpg)
- [compare-vorlage-06.jpg](screens/compare-vorlage-06.jpg)
- [compare-vorlage-07.jpg](screens/compare-vorlage-07.jpg)
- [compare-vorlage-08.jpg](screens/compare-vorlage-08.jpg)

## Zusammenfassung

| Kriterium | Ergebnis |
|---|---|
| vorlage-rothschild: Master, Farben, Schriften des Ziels (Ausnahmen nur Lint) | ✅ |
| vorlage-rothschild: Einfügen < 2 s, Position, Auswahl, Doppelklick | ✅ |
| vorlage-ubs: Master, Farben, Schriften des Ziels (Ausnahmen nur Lint) | ✅ |
| vorlage-ubs: Einfügen < 2 s, Position, Auswahl, Doppelklick | ✅ |
| ion: Master, Farben, Schriften des Ziels (Ausnahmen nur Lint) | ✅ |
| ion: Einfügen < 2 s, Position, Auswahl, Doppelklick | ✅ |
| custom: Master, Farben, Schriften des Ziels (Ausnahmen nur Lint) | ✅ |
| custom: Einfügen < 2 s, Position, Auswahl, Doppelklick | ✅ |
| Leere Präsentation → Einfügen am Ende/Anfang | ✅ |

Hinweise:
- „Keine Auswahl → am Ende einfügen“: PowerPoint lässt sich per API nicht in einen Zustand ohne ausgewählte Folie versetzen (`setSelectedSlides([])` ändert nichts). Die Logik ist per Unit-Test abgedeckt; der Fall „leere Präsentation“ ist oben getestet.
- Fremde Schriften stammen ausschließlich aus Folien, die `scripts/lint-templates.ps1` markiert (fest gesetzte Schrift „Arial“ u. a. in der Vorlage).
