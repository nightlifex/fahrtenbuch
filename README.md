# Fahrtenbuch – Digital & Einfach

Eine moderne, vollständig clientseitige Fahrtenbuch-Web-App für die private Nutzung. Fahrten lassen sich als Alleinfahrt oder Beifahrer-Fahrt erfassen; Mitfahrkosten, Statistiken und Exporte werden automatisch berechnet.

> **GitHub Pages hostet ausschließlich die Anwendung. Persönliche Fahrten und Einstellungen werden ausschließlich im Browser gespeichert.**

## Funktionen

- Fahrten hinzufügen, bearbeiten und löschen
- Hinfahrt, Rückfahrt oder Hin- und Rückfahrt erfassen
- Kosten für Beifahrer-Fahrten centgenau berechnen
- Dynamische Statistik für Rollen und Mitfahrkosten
- Lokale Persistenz der Fahrten in IndexedDB
- Lokale Einstellungen für Name, Darstellung und Standardpreis
- Vollständiges JSON-Backup herunterladen
- JSON-Backup validieren, ersetzen oder mit vorhandenen Daten zusammenführen
- Duplikate beim Zusammenführen anhand der Fahrt-ID erkennen
- Semikolon-getrennten UTF-8-CSV-Export für deutsche Tabellenprogramme erzeugen
- Alle lokalen Daten über einen eigenen Bestätigungsdialog löschen
- Responsive Desktop-, Tablet- und Mobilansicht
- GitHub-Pages-kompatibler relativer Vite-Base-Pfad

## Installation und lokale Entwicklung

Voraussetzung: Node.js 20.19 oder neuer.

```bash
npm install
npm run dev
```

Vite zeigt anschließend die lokale Adresse im Terminal an.

## Tests und Production Build

```bash
npm test
npm run build
```

Der statische Build wird in `dist/` erzeugt. Die Anwendung benötigt im Produktivbetrieb weder Node.js noch einen Serverprozess.

## GitHub Pages veröffentlichen

Der Workflow `.github/workflows/deploy.yml` baut und veröffentlicht die App bei jedem Push auf `main`.

1. Repository zu GitHub pushen.
2. Unter **Settings → Pages → Build and deployment** als Quelle **GitHub Actions** wählen.
3. Den Workflow im Bereich **Actions** abwarten.

`vite.config.ts` verwendet `base: "./"`. Damit funktionieren JavaScript-, CSS- und Bilddateien sowohl in einer Projekt-Page (`https://name.github.io/fahrtenbuch/`) als auch lokal, ohne dass der Repository-Name im Code fest eingetragen werden muss.

## Datenschutz und lokale Speicherung

Die Anwendung verwendet keine zentrale Datenbank, keine Anmeldung, keine Analytics, kein Tracking und keine externen Speicher-APIs.

- Fahrten werden in IndexedDB im jeweiligen Browser gespeichert.
- Kleine Einstellungen werden in `localStorage` gespeichert.
- GitHub erhält nur den statischen Programmcode im Repository und die daraus erstellten Build-Dateien.
- Es gibt keine automatische Synchronisierung zwischen Browsern oder Geräten.

Werden Browserdaten gelöscht, können die lokal gespeicherten Daten verloren gehen. Daher sollten regelmäßig JSON-Backups erstellt werden.

## JSON-Backup und Import

Unter **Einstellungen → Daten & Backup** erzeugt „Backup herunterladen“ eine lokale JSON-Datei mit:

- Backup-Version `1`
- Exportzeitpunkt
- Einstellungen
- allen Fahrten

Beim Import wird die Datei ausschließlich mit Browser-APIs gelesen. Vor der Übernahme zeigt die App Anzahl, Rollenverteilung und Mitfahrkosten. Danach kann gewählt werden:

- **Bestehende Daten ersetzen**: lokale Fahrten und Einstellungen werden durch das Backup ersetzt.
- **Mit bestehenden Daten zusammenführen**: vorhandene Daten bleiben erhalten; Fahrt-IDs werden nicht doppelt importiert.

Ungültige Strukturen und nicht unterstützte Backup-Versionen werden verständlich abgewiesen.

## CSV-Export

Der CSV-Export dient der Auswertung in Excel, LibreOffice, Numbers oder anderen Tabellenprogrammen. Er nutzt UTF-8 mit BOM, ein Semikolon als Trennzeichen und deutsches Datums- und Zahlenformat. CSV ist kein vollständiger Ersatz für ein JSON-Backup.

## Gerätewechsel

1. Auf dem alten Gerät ein JSON-Backup herunterladen.
2. Die GitHub-Pages-App auf dem neuen Gerät öffnen.
3. Unter **Einstellungen → Daten & Backup** das Backup importieren.

Eine automatische Cloud-Synchronisierung ist bewusst nicht Bestandteil der Anwendung.

## Projektstruktur

```text
src/
  components/       Dashboard, Formular, Tabellen, Dialoge und Einstellungen
  hooks/            Gemeinsamer Anwendungszustand
  storage/          IndexedDB- und localStorage-Abstraktion
  types/            Zentrale TypeScript-Datenmodelle
  utils/            Kosten, Statistik, Backup, Validierung und CSV
tests/               Tests der zentralen Geschäftslogik
.github/workflows/   GitHub-Pages-Deployment
```

## Sicherheit

Im Frontend sind keine Secrets, Tokens oder privaten API-Schlüssel erforderlich. Echte Fahrtdaten gehören niemals in den Quellcode, Beispiel-JSON-Dateien, Issues, Releases oder GitHub Actions.
