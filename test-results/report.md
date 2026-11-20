# Selbsttest-Bericht – Folienbibliothek

- Zeitpunkt: 20.11.2026, 04:17:02
- Bibliothek: Build `3b629875e1`, Stand 2026-11-20, 58 Einträge (54 Folien + 4 Grundlayouts)
- Ablauf: `scripts/selftest.ps1` (Dev-Build, automatisch geöffneter Seitenbereich, Einfügen jeder Vorlage hinter Folie 1, Prüfung per COM)

## Zielpräsentation `vorlage-rothschild` – Design „Office Theme [1795136486273]“

| Prüfung | Ergebnis |
|---|---|
| Eingefügt und geprüft | 58/58 bestanden |
| Position direkt hinter der ausgewählten Folie (Folie 2) | ✅ |
| Neue Folie danach ausgewählt | ✅ |
| Dauer pro Folie < 2 s | ✅ (Ø 131 ms, max 218 ms; mit Download aus dem Cache-losen Zustand) |
| Warm (Datei bereits geladen) | 105 / 80 / 117 / 114 / 112 ms |
| Master/Design der eingefügten Folien = Ziel-Design | ✅ |
| Keine zusätzlichen Master | ✅ (Designs vorher 1, nachher 1) |
| Theme-Farben = Ziel-Farben | ✅ |
| Theme-Schriften übernommen | ✅ – 57 Folien vollständig, 1 Folien mit fester Schrift (alle vom Theme-Lint markiert) |
| Doppelklick fügt nur einmal ein (Service / Oberfläche) | ✅ / ✅ |
| Layout-Zuordnung | gleichnamige Layouts werden verwendet; 0 Layout(s) importiert: – |
| Alternative „ganze Bibliothek + sourceSlideIds“ | ✅ 6 Stichproben, Ø 297 ms |

<details><summary>Alle Folien</summary>

| # | Folie | ms | Layout im Ziel | Farben | Schriften | Lint | Ergebnis |
|---|---|---|---|---|---|---|---|
| 1 | Deckblatt | 113 | Title Slide | ✅ | Arial | ok | ✅ |
| 2 | Vorstellung mit Foto | 66 | Title and Content | ✅ | Arial | ok | ✅ |
| 3 | Executive Summary – Fließtext | 111 | Title Only | ✅ | Arial | info | ✅ |
| 4 | Executive Summary – Kernaussagen mit Belegen | 141 | Title Only | ✅ | Arial | info | ✅ |
| 5 | Aufzählung mit Einleitungssatz | 157 | Title and Content | ✅ | Arial | ok | ✅ |
| 6 | Fließtext mit nummerierter Liste | 98 | Title Only | ✅ | Arial | ok | ✅ |
| 7 | Framework-Beschreibung mit 7 Elementen | 133 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 8 | Drei Bereiche mit Icons | 131 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 9 | Drei Trends – Tabelle mit Beispielen | 117 | Title Only | ✅ | Arial | warn | ✅ |
| 10 | Drei Trends – nummerierte Karten | 101 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 11 | Fünf Kernbereiche mit Beschreibung | 121 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 12 | Icon-Liste mit Zahlen | 94 | Title Only | ✅ | Arial | ok | ✅ |
| 13 | 3×3 Nutzen-Karten mit Icons | 108 | Title Only | ✅ | Arial | ok | ✅ |
| 14 | Phasenübersicht – 5 Phasen | 116 | Title Only | ✅ | Arial | ok | ✅ |
| 15 | Phase 1 im Detail mit Bildraster | 107 | Title Only | ✅ | Arial | ok | ✅ |
| 16 | Phase 2 im Detail mit Bildraster | 102 | Title Only | ✅ | Arial | ok | ✅ |
| 17 | Phase 3 im Detail mit Bildraster | 108 | Title Only | ✅ | Arial | ok | ✅ |
| 18 | Phase 4 im Detail mit Bildraster | 107 | Title Only | ✅ | Arial | ok | ✅ |
| 19 | Phase 5 im Detail mit Bildraster | 110 | Title Only | ✅ | Arial | ok | ✅ |
| 20 | Phasenübersicht – Zusammenfassung | 127 | Title Only | ✅ | Arial | ok | ✅ |
| 21 | Schritt-für-Schritt-Anleitung (5 Schritte) | 103 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 22 | Treppe – 7 Stufen | 121 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 23 | Treppe – 7 Stufen mit Praxisbeispiel | 150 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 24 | Treppe – 7 Stufen, Ausfüllvorlage | 162 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 25 | Kaskade – 7 Schritte diagonal | 123 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 26 | Hub & Spoke mit Seitenbereichen | 110 | Title Only | ✅ | Arial | ok | ✅ |
| 27 | 2×2-Matrix mit Beschreibungen | 144 | Title Only | ✅ | Arial | info | ✅ |
| 28 | 2×2-Portfolio – manuell mit Labels | 129 | Title Only | ✅ | Arial | info | ✅ |
| 29 | BCG-Matrix (Growth-Share) | 131 | Title Only | ✅ | Arial | warn | ✅ |
| 30 | Priorisierungsmatrix (3×3) | 172 | Title Only | ✅ | Arial | warn | ✅ |
| 31 | Issue Tree (Treiberbaum) | 184 | Title and Subtitle | ✅ | Arial | info | ✅ |
| 32 | Bereichsübersicht A–G (Säulenmodell) | 128 | Title and Subtitle | ✅ | Arial, Arial  | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 33 | Vier Liniendiagramme (Small Multiples) | 118 | Title Only | ✅ | Arial | warn | ✅ |
| 34 | Säulendiagramm – Vergleich mit Takeaways | 172 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 35 | Säulendiagramm mit Wachstumspfeil (CAGR) | 122 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 36 | Säulendiagramm mit geteiltem Wachstum (2× CAGR) | 149 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 37 | Säulendiagramm – Ist vs. Prognose | 187 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 38 | Zwei Wasserfalldiagramme (Brücke) | 111 | Title Only | ✅ | Arial | warn | ✅ |
| 39 | 2×2-Portfolio – Blasendiagramm (automatisch) | 105 | Title Only | ✅ | Arial | warn | ✅ |
| 40 | Blasendiagramm | 171 | Title Only | ✅ | Arial | warn | ✅ |
| 41 | Blasendiagramm mit Takeaways | 128 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 42 | Key Facts – Kennzahlen-Kacheln mit Logos | 116 | Title Only | ✅ | Arial | ok | ✅ |
| 43 | Status- & KPI-Tabelle mit Ampeln | 155 | Title Only | ✅ | Arial | warn | ✅ |
| 44 | Organigramm | 157 | Title Only | ✅ | Arial | warn | ✅ |
| 45 | Projektteam mit Rollen und Icons | 199 | Title Only | ✅ | Arial | warn | ✅ |
| 46 | Teamstruktur nach Funktionen | 194 | Title Only | ✅ | Arial | warn | ✅ |
| 47 | Projektplan nach Wochen mit Deliverables | 113 | Title Only | ✅ | Arial | warn | ✅ |
| 48 | Gantt-Zeitplan mit Stage-Gates | 218 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 49 | Drei Phasen mit Deliverables und Team | 154 | Title Only | ✅ | Arial | warn | ✅ |
| 50 | Vier Phasen mit Key Meetings (SteerCo) | 141 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 51 | Vier Wellen (Umsetzungs-Roadmap) | 137 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 52 | Vier Phasen auf Zeitstrahl | 211 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 53 | Leitfrage mit Bildraster und Call-to-Action | 104 | Title Only | ✅ | Arial | ok | ✅ |
| 54 | Literaturverzeichnis (APA 7) | 140 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 55 | Titelfolie (leer) | 69 | Title Slide | ✅ |  | ok | ✅ |
| 56 | Titel und Inhalt (leer) | 75 | Title and Content | ✅ |  | ok | ✅ |
| 57 | Nur Titel (leer) | 89 | Title Only | ✅ |  | ok | ✅ |
| 58 | Titel und Untertitel (leer) | 116 | Title and Subtitle | ✅ |  | ok | ✅ |

</details>

## Zielpräsentation `vorlage-ubs` – Design „Office Theme [1795136486273]“

| Prüfung | Ergebnis |
|---|---|
| Eingefügt und geprüft | 58/58 bestanden |
| Position direkt hinter der ausgewählten Folie (Folie 2) | ✅ |
| Neue Folie danach ausgewählt | ✅ |
| Dauer pro Folie < 2 s | ✅ (Ø 138 ms, max 273 ms; mit Download aus dem Cache-losen Zustand) |
| Warm (Datei bereits geladen) | 96 / 76 / 92 / 116 / 88 ms |
| Master/Design der eingefügten Folien = Ziel-Design | ✅ |
| Keine zusätzlichen Master | ✅ (Designs vorher 1, nachher 1) |
| Theme-Farben = Ziel-Farben | ✅ |
| Theme-Schriften übernommen | ✅ – 57 Folien vollständig, 1 Folien mit fester Schrift (alle vom Theme-Lint markiert) |
| Doppelklick fügt nur einmal ein (Service / Oberfläche) | ✅ / ✅ |
| Layout-Zuordnung | gleichnamige Layouts werden verwendet; 0 Layout(s) importiert: – |
| Alternative „ganze Bibliothek + sourceSlideIds“ | ✅ 6 Stichproben, Ø 324 ms |

<details><summary>Alle Folien</summary>

| # | Folie | ms | Layout im Ziel | Farben | Schriften | Lint | Ergebnis |
|---|---|---|---|---|---|---|---|
| 1 | Deckblatt | 113 | Title Slide | ✅ | Arial | ok | ✅ |
| 2 | Vorstellung mit Foto | 95 | Title and Content | ✅ | Arial | ok | ✅ |
| 3 | Executive Summary – Fließtext | 222 | Title Only | ✅ | Arial | info | ✅ |
| 4 | Executive Summary – Kernaussagen mit Belegen | 141 | Title Only | ✅ | Arial | info | ✅ |
| 5 | Aufzählung mit Einleitungssatz | 127 | Title and Content | ✅ | Arial | ok | ✅ |
| 6 | Fließtext mit nummerierter Liste | 193 | Title Only | ✅ | Arial | ok | ✅ |
| 7 | Framework-Beschreibung mit 7 Elementen | 156 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 8 | Drei Bereiche mit Icons | 149 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 9 | Drei Trends – Tabelle mit Beispielen | 157 | Title Only | ✅ | Arial | warn | ✅ |
| 10 | Drei Trends – nummerierte Karten | 131 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 11 | Fünf Kernbereiche mit Beschreibung | 190 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 12 | Icon-Liste mit Zahlen | 110 | Title Only | ✅ | Arial | ok | ✅ |
| 13 | 3×3 Nutzen-Karten mit Icons | 115 | Title Only | ✅ | Arial | ok | ✅ |
| 14 | Phasenübersicht – 5 Phasen | 157 | Title Only | ✅ | Arial | ok | ✅ |
| 15 | Phase 1 im Detail mit Bildraster | 124 | Title Only | ✅ | Arial | ok | ✅ |
| 16 | Phase 2 im Detail mit Bildraster | 122 | Title Only | ✅ | Arial | ok | ✅ |
| 17 | Phase 3 im Detail mit Bildraster | 153 | Title Only | ✅ | Arial | ok | ✅ |
| 18 | Phase 4 im Detail mit Bildraster | 128 | Title Only | ✅ | Arial | ok | ✅ |
| 19 | Phase 5 im Detail mit Bildraster | 111 | Title Only | ✅ | Arial | ok | ✅ |
| 20 | Phasenübersicht – Zusammenfassung | 131 | Title Only | ✅ | Arial | ok | ✅ |
| 21 | Schritt-für-Schritt-Anleitung (5 Schritte) | 128 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 22 | Treppe – 7 Stufen | 172 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 23 | Treppe – 7 Stufen mit Praxisbeispiel | 146 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 24 | Treppe – 7 Stufen, Ausfüllvorlage | 109 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 25 | Kaskade – 7 Schritte diagonal | 116 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 26 | Hub & Spoke mit Seitenbereichen | 170 | Title Only | ✅ | Arial | ok | ✅ |
| 27 | 2×2-Matrix mit Beschreibungen | 120 | Title Only | ✅ | Arial | info | ✅ |
| 28 | 2×2-Portfolio – manuell mit Labels | 113 | Title Only | ✅ | Arial | info | ✅ |
| 29 | BCG-Matrix (Growth-Share) | 154 | Title Only | ✅ | Arial | warn | ✅ |
| 30 | Priorisierungsmatrix (3×3) | 114 | Title Only | ✅ | Arial | warn | ✅ |
| 31 | Issue Tree (Treiberbaum) | 117 | Title and Subtitle | ✅ | Arial | info | ✅ |
| 32 | Bereichsübersicht A–G (Säulenmodell) | 150 | Title and Subtitle | ✅ | Arial, Arial  | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 33 | Vier Liniendiagramme (Small Multiples) | 116 | Title Only | ✅ | Arial | warn | ✅ |
| 34 | Säulendiagramm – Vergleich mit Takeaways | 166 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 35 | Säulendiagramm mit Wachstumspfeil (CAGR) | 184 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 36 | Säulendiagramm mit geteiltem Wachstum (2× CAGR) | 184 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 37 | Säulendiagramm – Ist vs. Prognose | 119 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 38 | Zwei Wasserfalldiagramme (Brücke) | 106 | Title Only | ✅ | Arial | warn | ✅ |
| 39 | 2×2-Portfolio – Blasendiagramm (automatisch) | 106 | Title Only | ✅ | Arial | warn | ✅ |
| 40 | Blasendiagramm | 126 | Title Only | ✅ | Arial | warn | ✅ |
| 41 | Blasendiagramm mit Takeaways | 129 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 42 | Key Facts – Kennzahlen-Kacheln mit Logos | 143 | Title Only | ✅ | Arial | ok | ✅ |
| 43 | Status- & KPI-Tabelle mit Ampeln | 130 | Title Only | ✅ | Arial | warn | ✅ |
| 44 | Organigramm | 132 | Title Only | ✅ | Arial | warn | ✅ |
| 45 | Projektteam mit Rollen und Icons | 168 | Title Only | ✅ | Arial | warn | ✅ |
| 46 | Teamstruktur nach Funktionen | 161 | Title Only | ✅ | Arial | warn | ✅ |
| 47 | Projektplan nach Wochen mit Deliverables | 157 | Title Only | ✅ | Arial | warn | ✅ |
| 48 | Gantt-Zeitplan mit Stage-Gates | 273 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 49 | Drei Phasen mit Deliverables und Team | 151 | Title Only | ✅ | Arial | warn | ✅ |
| 50 | Vier Phasen mit Key Meetings (SteerCo) | 142 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 51 | Vier Wellen (Umsetzungs-Roadmap) | 168 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 52 | Vier Phasen auf Zeitstrahl | 184 | Title and Subtitle | ✅ | Arial | warn | ✅ |
| 53 | Leitfrage mit Bildraster und Call-to-Action | 105 | Title Only | ✅ | Arial | ok | ✅ |
| 54 | Literaturverzeichnis (APA 7) | 96 | Title and Subtitle | ✅ | Arial | ok | ✅ |
| 55 | Titelfolie (leer) | 65 | Title Slide | ✅ |  | ok | ✅ |
| 56 | Titel und Inhalt (leer) | 76 | Title and Content | ✅ |  | ok | ✅ |
| 57 | Nur Titel (leer) | 95 | Title Only | ✅ |  | ok | ✅ |
| 58 | Titel und Untertitel (leer) | 99 | Title and Subtitle | ✅ |  | ok | ✅ |

</details>

## Zielpräsentation `ion` – Design „Ion“

| Prüfung | Ergebnis |
|---|---|
| Eingefügt und geprüft | 58/58 bestanden |
| Position direkt hinter der ausgewählten Folie (Folie 2) | ✅ |
| Neue Folie danach ausgewählt | ✅ |
| Dauer pro Folie < 2 s | ✅ (Ø 114 ms, max 179 ms; mit Download aus dem Cache-losen Zustand) |
| Warm (Datei bereits geladen) | 140 / 67 / 100 / 115 / 151 ms |
| Master/Design der eingefügten Folien = Ziel-Design | ✅ |
| Keine zusätzlichen Master | ✅ (Designs vorher 1, nachher 1) |
| Theme-Farben = Ziel-Farben | ✅ |
| Theme-Schriften übernommen | ✅ – 35 Folien vollständig, 23 Folien mit fester Schrift (alle vom Theme-Lint markiert) |
| Doppelklick fügt nur einmal ein (Service / Oberfläche) | ✅ / ✅ |
| Layout-Zuordnung | gleichnamige Layouts werden verwendet; 3 Layout(s) importiert: Title and Subtitle |
| Alternative „ganze Bibliothek + sourceSlideIds“ | ✅ 6 Stichproben, Ø 324 ms |

<details><summary>Alle Folien</summary>

| # | Folie | ms | Layout im Ziel | Farben | Schriften | Lint | Ergebnis |
|---|---|---|---|---|---|---|---|
| 1 | Deckblatt | 119 | Title Slide | ✅ | Century Gothic | ok | ✅ |
| 2 | Vorstellung mit Foto | 92 | Title and Content | ✅ | Century Gothic | ok | ✅ |
| 3 | Executive Summary – Fließtext | 105 | Title Only | ✅ | Century Gothic | info | ✅ |
| 4 | Executive Summary – Kernaussagen mit Belegen | 93 | Title Only | ✅ | Century Gothic | info | ✅ |
| 5 | Aufzählung mit Einleitungssatz | 107 | Title and Content | ✅ | Century Gothic | ok | ✅ |
| 6 | Fließtext mit nummerierter Liste | 109 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 7 | Framework-Beschreibung mit 7 Elementen | 136 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 8 | Drei Bereiche mit Icons | 113 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 9 | Drei Trends – Tabelle mit Beispielen | 95 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 10 | Drei Trends – nummerierte Karten | 106 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 11 | Fünf Kernbereiche mit Beschreibung | 110 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 12 | Icon-Liste mit Zahlen | 86 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 13 | 3×3 Nutzen-Karten mit Icons | 93 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 14 | Phasenübersicht – 5 Phasen | 98 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 15 | Phase 1 im Detail mit Bildraster | 82 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 16 | Phase 2 im Detail mit Bildraster | 100 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 17 | Phase 3 im Detail mit Bildraster | 80 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 18 | Phase 4 im Detail mit Bildraster | 92 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 19 | Phase 5 im Detail mit Bildraster | 95 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 20 | Phasenübersicht – Zusammenfassung | 119 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 21 | Schritt-für-Schritt-Anleitung (5 Schritte) | 90 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 22 | Treppe – 7 Stufen | 92 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 23 | Treppe – 7 Stufen mit Praxisbeispiel | 114 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 24 | Treppe – 7 Stufen, Ausfüllvorlage | 89 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 25 | Kaskade – 7 Schritte diagonal | 120 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 26 | Hub & Spoke mit Seitenbereichen | 107 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 27 | 2×2-Matrix mit Beschreibungen | 153 | Title Only | ✅ | Century Gothic | info | ✅ |
| 28 | 2×2-Portfolio – manuell mit Labels | 116 | Title Only | ✅ | Century Gothic | info | ✅ |
| 29 | BCG-Matrix (Growth-Share) | 119 | Title Only | ✅ | Arial, Century Gothic | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 30 | Priorisierungsmatrix (3×3) | 142 | Title Only | ✅ | Arial, Century Gothic | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 31 | Issue Tree (Treiberbaum) | 96 | Title and Subtitle | ✅ | Century Gothic | info | ✅ |
| 32 | Bereichsübersicht A–G (Säulenmodell) | 135 | Title and Subtitle | ✅ | Century Gothic, Arial , Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 33 | Vier Liniendiagramme (Small Multiples) | 98 | Title Only | ✅ | Century Gothic | warn | ✅ |
| 34 | Säulendiagramm – Vergleich mit Takeaways | 120 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 35 | Säulendiagramm mit Wachstumspfeil (CAGR) | 141 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 36 | Säulendiagramm mit geteiltem Wachstum (2× CAGR) | 145 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 37 | Säulendiagramm – Ist vs. Prognose | 141 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 38 | Zwei Wasserfalldiagramme (Brücke) | 140 | Title Only | ✅ | Century Gothic | warn | ✅ |
| 39 | 2×2-Portfolio – Blasendiagramm (automatisch) | 112 | Title Only | ✅ | Century Gothic | warn | ✅ |
| 40 | Blasendiagramm | 127 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 41 | Blasendiagramm mit Takeaways | 143 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 42 | Key Facts – Kennzahlen-Kacheln mit Logos | 99 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 43 | Status- & KPI-Tabelle mit Ampeln | 149 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 44 | Organigramm | 145 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 45 | Projektteam mit Rollen und Icons | 115 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 46 | Teamstruktur nach Funktionen | 153 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 47 | Projektplan nach Wochen mit Deliverables | 103 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 48 | Gantt-Zeitplan mit Stage-Gates | 179 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 49 | Drei Phasen mit Deliverables und Team | 151 | Title Only | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 50 | Vier Phasen mit Key Meetings (SteerCo) | 120 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 51 | Vier Wellen (Umsetzungs-Roadmap) | 136 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 52 | Vier Phasen auf Zeitstrahl | 154 | Title and Subtitle | ✅ | Century Gothic, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 53 | Leitfrage mit Bildraster und Call-to-Action | 99 | Title Only | ✅ | Century Gothic | ok | ✅ |
| 54 | Literaturverzeichnis (APA 7) | 110 | Title and Subtitle | ✅ | Century Gothic | ok | ✅ |
| 55 | Titelfolie (leer) | 81 | Title Slide | ✅ |  | ok | ✅ |
| 56 | Titel und Inhalt (leer) | 61 | Title and Content | ✅ |  | ok | ✅ |
| 57 | Nur Titel (leer) | 78 | Title Only | ✅ |  | ok | ✅ |
| 58 | Titel und Untertitel (leer) | 94 | Title and Subtitle | ✅ |  | ok | ✅ |

</details>

## Zielpräsentation `custom` – Design „Selbsttest Eigenes Theme“

| Prüfung | Ergebnis |
|---|---|
| Eingefügt und geprüft | 58/58 bestanden |
| Position direkt hinter der ausgewählten Folie (Folie 2) | ✅ |
| Neue Folie danach ausgewählt | ✅ |
| Dauer pro Folie < 2 s | ✅ (Ø 119 ms, max 209 ms; mit Download aus dem Cache-losen Zustand) |
| Warm (Datei bereits geladen) | 155 / 68 / 147 / 107 / 154 ms |
| Master/Design der eingefügten Folien = Ziel-Design | ✅ |
| Keine zusätzlichen Master | ✅ (Designs vorher 1, nachher 1) |
| Theme-Farben = Ziel-Farben | ✅ |
| Theme-Schriften übernommen | ✅ – 35 Folien vollständig, 23 Folien mit fester Schrift (alle vom Theme-Lint markiert) |
| Doppelklick fügt nur einmal ein (Service / Oberfläche) | ✅ / ✅ |
| Layout-Zuordnung | gleichnamige Layouts werden verwendet; 3 Layout(s) importiert: Title and Subtitle |
| Alternative „ganze Bibliothek + sourceSlideIds“ | ✅ 6 Stichproben, Ø 304 ms |

<details><summary>Alle Folien</summary>

| # | Folie | ms | Layout im Ziel | Farben | Schriften | Lint | Ergebnis |
|---|---|---|---|---|---|---|---|
| 1 | Deckblatt | 165 | Title Slide | ✅ | Georgia, Verdana | ok | ✅ |
| 2 | Vorstellung mit Foto | 75 | Title and Content | ✅ | Georgia, Verdana | ok | ✅ |
| 3 | Executive Summary – Fließtext | 122 | Title Only | ✅ | Georgia, Verdana | info | ✅ |
| 4 | Executive Summary – Kernaussagen mit Belegen | 87 | Title Only | ✅ | Georgia, Verdana | info | ✅ |
| 5 | Aufzählung mit Einleitungssatz | 125 | Title and Content | ✅ | Georgia, Verdana | ok | ✅ |
| 6 | Fließtext mit nummerierter Liste | 105 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 7 | Framework-Beschreibung mit 7 Elementen | 91 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 8 | Drei Bereiche mit Icons | 123 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 9 | Drei Trends – Tabelle mit Beispielen | 104 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 10 | Drei Trends – nummerierte Karten | 83 | Title and Subtitle | ✅ | Georgia, Verdana, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 11 | Fünf Kernbereiche mit Beschreibung | 118 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 12 | Icon-Liste mit Zahlen | 91 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 13 | 3×3 Nutzen-Karten mit Icons | 104 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 14 | Phasenübersicht – 5 Phasen | 128 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 15 | Phase 1 im Detail mit Bildraster | 102 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 16 | Phase 2 im Detail mit Bildraster | 112 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 17 | Phase 3 im Detail mit Bildraster | 118 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 18 | Phase 4 im Detail mit Bildraster | 132 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 19 | Phase 5 im Detail mit Bildraster | 140 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 20 | Phasenübersicht – Zusammenfassung | 137 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 21 | Schritt-für-Schritt-Anleitung (5 Schritte) | 88 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 22 | Treppe – 7 Stufen | 100 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 23 | Treppe – 7 Stufen mit Praxisbeispiel | 95 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 24 | Treppe – 7 Stufen, Ausfüllvorlage | 107 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 25 | Kaskade – 7 Schritte diagonal | 111 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 26 | Hub & Spoke mit Seitenbereichen | 96 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 27 | 2×2-Matrix mit Beschreibungen | 95 | Title Only | ✅ | Georgia, Verdana | info | ✅ |
| 28 | 2×2-Portfolio – manuell mit Labels | 102 | Title Only | ✅ | Georgia, Verdana | info | ✅ |
| 29 | BCG-Matrix (Growth-Share) | 125 | Title Only | ✅ | Arial, Georgia, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 30 | Priorisierungsmatrix (3×3) | 109 | Title Only | ✅ | Arial, Georgia, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 31 | Issue Tree (Treiberbaum) | 96 | Title and Subtitle | ✅ | Georgia, Verdana | info | ✅ |
| 32 | Bereichsübersicht A–G (Säulenmodell) | 110 | Title and Subtitle | ✅ | Georgia, Arial , Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 33 | Vier Liniendiagramme (Small Multiples) | 106 | Title Only | ✅ | Georgia, Verdana | warn | ✅ |
| 34 | Säulendiagramm – Vergleich mit Takeaways | 113 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 35 | Säulendiagramm mit Wachstumspfeil (CAGR) | 113 | Title and Subtitle | ✅ | Georgia, Verdana, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 36 | Säulendiagramm mit geteiltem Wachstum (2× CAGR) | 146 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 37 | Säulendiagramm – Ist vs. Prognose | 119 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 38 | Zwei Wasserfalldiagramme (Brücke) | 99 | Title Only | ✅ | Georgia, Verdana | warn | ✅ |
| 39 | 2×2-Portfolio – Blasendiagramm (automatisch) | 102 | Title Only | ✅ | Georgia, Verdana | warn | ✅ |
| 40 | Blasendiagramm | 144 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 41 | Blasendiagramm mit Takeaways | 148 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 42 | Key Facts – Kennzahlen-Kacheln mit Logos | 131 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 43 | Status- & KPI-Tabelle mit Ampeln | 141 | Title Only | ✅ | Georgia, Verdana, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 44 | Organigramm | 162 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 45 | Projektteam mit Rollen und Icons | 161 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 46 | Teamstruktur nach Funktionen | 151 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 47 | Projektplan nach Wochen mit Deliverables | 127 | Title Only | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 48 | Gantt-Zeitplan mit Stage-Gates | 209 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 49 | Drei Phasen mit Deliverables und Team | 134 | Title Only | ✅ | Georgia, Verdana, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 50 | Vier Phasen mit Key Meetings (SteerCo) | 157 | Title and Subtitle | ✅ | Georgia, Verdana, Arial | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 51 | Vier Wellen (Umsetzungs-Roadmap) | 172 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 52 | Vier Phasen auf Zeitstrahl | 129 | Title and Subtitle | ✅ | Georgia, Arial, Verdana | warn | ✅ (Ausnahme: feste Schrift laut Lint) |
| 53 | Leitfrage mit Bildraster und Call-to-Action | 187 | Title Only | ✅ | Georgia, Verdana | ok | ✅ |
| 54 | Literaturverzeichnis (APA 7) | 133 | Title and Subtitle | ✅ | Georgia, Verdana | ok | ✅ |
| 55 | Titelfolie (leer) | 74 | Title Slide | ✅ |  | ok | ✅ |
| 56 | Titel und Inhalt (leer) | 60 | Title and Content | ✅ |  | ok | ✅ |
| 57 | Nur Titel (leer) | 79 | Title Only | ✅ |  | ok | ✅ |
| 58 | Titel und Untertitel (leer) | 83 | Title and Subtitle | ✅ |  | ok | ✅ |

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
