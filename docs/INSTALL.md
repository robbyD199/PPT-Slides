# Installation – Folienbibliothek (PowerPoint-Add-in)

Das Add-in läuft von **GitHub Pages**: <https://robbyd199.github.io/PPT-Slides/> – im Alltag ist kein lokaler Server nötig.
Alle Wege gelten **pro Windows-Benutzer und Office-Installation**, nicht pro Microsoft-365-Konto.

---

## A) Privates Konto (empfohlen): Sideloading per Registry

**Installieren** (einmalig, keine Administratorrechte):

1. PowerPoint schließen.
2. PowerShell im Projektordner öffnen und ausführen:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/install-sideload.ps1
   ```
   Das Skript lädt `manifest.xml` von GitHub Pages nach `%LOCALAPPDATA%\Folienbibliothek\` und trägt es unter
   `HKCU\Software\Microsoft\Office\16.0\WEF\Developer` ein.
3. PowerPoint starten → Registerkarte **Start** → Gruppe **Folienbibliothek** → **Bibliothek** (Seitenbereich)
   oder **Folie suchen** (großes Suchfenster).

**Alternative ohne Skript:** PowerPoint → Start → **Add-ins** → **Weitere Add-ins** → **Meine Add-ins** →
**Mein Add-in hochladen** → `manifest.xml` auswählen (Datei von <https://robbyd199.github.io/PPT-Slides/manifest.xml> speichern).
Diese Variante muss nach Office-Updates manchmal wiederholt werden; die Registry-Variante bleibt bestehen.

**Bedienung**
- Klick auf eine Vorschau fügt die Folie **direkt hinter der ausgewählten Folie** ein (ohne Folien: als erste Folie) und wählt sie aus.
- Suchfeld oben: deutsch/englisch, z. B. „bar chart“, „Säulendiagramm“, „company overview“, „Wasserfall“, „Gantt“.
- `⤢` oder Menüband **Folie suchen**: großes Suchfenster mit Vorschau. `↑↓←→` auswählen, `Enter` einfügen, `Esc` schließen.
- Menü `⋯`:
  - *Design der Zielpräsentation* (Standard): Folie übernimmt Master, Farben und Schriften der geöffneten Präsentation.
  - *Platzhalter-Layout der Vorlage schützen* (Standard an): Bei fremden Mastern bleiben Titel/Text an der Position und in der Größe der Vorlage.
  - *Format der Vorlage beibehalten*: importiert stattdessen den Master der Bibliothek.
  - *Neue Präsentation aus Vorlage*: öffnet eine neue Präsentation mit dem Master der Vorlage in einem der 5 Farbsets.
- Gelbes Dreieck auf einer Vorschau: Die Folie enthält feste Farben/Schriften (Theme-Lint) und passt sich nicht vollständig an.

**Deinstallieren**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/install-sideload.ps1 -Uninstall
powershell -ExecutionPolicy Bypass -File scripts/clear-cache.ps1   # optional, PowerPoint vorher schließen
```

---

## B) Uni-Konto (HSG): Netzwerkordner als Add-in-Katalog

Nur nötig, falls Plan A unter dem Uni-Konto blockiert ist. **Braucht einmal Administratorrechte** (Freigabe anlegen).

1. Richtlinien prüfen (ohne Änderungen):
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/install-catalog.ps1 -CheckOnly
   ```
2. PowerShell **als Administrator** starten und ausführen:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/install-catalog.ps1 -CreateShare
   ```
   Legt `C:\Folienbibliothek-Katalog` an, gibt ihn als `\\<Computername>\Folienbibliothek` frei (nur Lesen, nur dein Benutzer),
   kopiert `manifest.xml` hinein und trägt den Ordner als vertrauenswürdigen Katalog ein
   (`HKCU\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\{GUID}`: `Id`, `Url`, `Flags = 1`).
   Alternativ manuell: Datei → Optionen → Trust Center → Einstellungen für das Trust Center →
   **Kataloge vertrauenswürdiger Add-Ins** → Katalog-URL `\\<Computername>\Folienbibliothek` → *Im Menü anzeigen*.
3. PowerPoint neu starten → Start → **Add-ins** → **Weitere Add-ins** → **FREIGEGEBENER ORDNER** → *Folienbibliothek* → **Hinzufügen**.

Stand der Prüfung (20.11.2026, dieser PC): Es sind **keine lokalen Office-Add-in-Richtlinien** gesetzt
(`HKCU/HKLM\Software\Policies\Microsoft\Office\16.0\WEF` und `...\Common` leer). In Office ist derzeit nur das
private Konto angemeldet; Cloud-Richtlinien der HSG (z. B. „Benutzer dürfen keine Add-ins installieren“)
wirken erst nach Anmeldung mit dem HSG-Konto und sind lokal nicht prüfbar. Plan B ist **nicht getestet**, weil das
Anlegen der Freigabe Administratorrechte braucht. Sind Add-ins per Richtlinie blockiert, werden sie nicht umgangen.

Entfernen: `scripts/install-catalog.ps1 -Uninstall` (Freigabe zusätzlich mit `-CreateShare -Uninstall` als Administrator).

---

## Vorlagen aktualisieren

1. `templates/Library.pptx` bearbeiten (Folien hinzufügen, ändern, löschen; ausgeblendete Folien werden ignoriert).
2. `powershell -ExecutionPolicy Bypass -File scripts/update-templates.ps1` – erzeugt Vorschaubilder, Einzel-PPTX und
   `assets/library/library.json`; bekannte Folien behalten ihre Kategorie, neue Folien bekommen `"category": null`.
3. Neue Folien kategorisieren (Claude Code: „Vorlagen aktualisieren“), `npm test`, committen und pushen –
   GitHub Actions baut und veröffentlicht automatisch (ca. 1–2 Minuten).
4. In PowerPoint den Seitenbereich schließen und wieder öffnen (oder Menü → *Bibliothek neu laden*).

---

## Entwicklung

```powershell
npm install
npm start            # Dev-Server https://localhost:3000 + PowerPoint mit Dev-Add-in (installiert einmalig ein Entwicklerzertifikat – Windows fragt nach)
npm stop
npm run build        # Produktions-Build nach dist/ (inkl. manifest.xml für GitHub Pages)
npm run lint; npm test; npm run validate
powershell -File scripts/selftest.ps1     # End-to-End-Test in PowerPoint (PowerPoint vorher schließen)
powershell -File scripts/lint-templates.ps1
```

---

## Fehlerbehebung

| Problem | Lösung |
|---|---|
| **Add-in erscheint nicht im Menüband** | PowerPoint komplett schließen (auch im Task-Manager) und neu starten. Prüfen: `Get-ItemProperty HKCU:\Software\Microsoft\Office\16.0\WEF\Developer` zeigt die Add-in-ID. Sonst Plan A erneut ausführen oder „Mein Add-in hochladen“. |
| **Leerer Seitenbereich** | Internetverbindung prüfen; <https://robbyd199.github.io/PPT-Slides/taskpane.html> im Browser öffnen. Dann `scripts/clear-cache.ps1` (PowerPoint geschlossen) und neu starten. |
| **„Diese PowerPoint-Version kann keine Folien … einfügen“** | Office aktualisieren: Datei → Konto → Updateoptionen → Jetzt aktualisieren (benötigt PowerPointApi 1.2, Auswahl 1.5, Layout-Schutz 1.4). |
| **Zertifikatsfehler beim Dev-Server** | `npx office-addin-dev-certs install` ausführen und die Windows-Abfrage bestätigen; danach `npm start`. |
| **Alte Version / Änderungen nicht sichtbar** | GitHub-Actions-Lauf abwarten (Repo → Actions), dann Menü → *Bibliothek neu laden*. Hilft das nicht: PowerPoint schließen, `scripts/clear-cache.ps1`, neu starten. Bilder/Folien werden mit `?v=<Build>` geladen, die Bibliotheksdatei ohne Cache. |
| **Eingefügte Folie sieht anders aus als die Vorschau** | Bei fremden Designs übernimmt die Folie absichtlich Farben/Schriften des Ziels. Folien mit gelbem Dreieck enthalten feste Farben/Schriften. Für das Original-Aussehen: Menü → *Format der Vorlage beibehalten*. |
