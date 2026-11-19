# ISI reikna

Lern-App zum Rechnen üben (Malrechnen und Plusrechnen) für Volksschulkinder, optimiert für das iPad im Querformat.
Reines HTML, CSS und JavaScript, ohne Installation, ohne Server und ohne Internetverbindung nutzbar.

## Starten

**Windows 11 (zum Testen):** Ordner entpacken und `index.html` doppelklicken. Die App öffnet sich in Edge oder Chrome.
Für die iPad-Ansicht: `F12` → `Strg+Umschalt+M` → oben „iPad“ wählen und auf Querformat drehen.

**iPad:** Die App über eine Webadresse öffnen (GitHub Pages oder eigener Webserver), dann in Safari
„Teilen“ → „Zum Home-Bildschirm“. Danach startet sie wie eine App im Vollbild.

**Eigener Webserver:** Den ganzen Ordner unverändert hochladen. Es wird keine Server-Software benötigt.

## Funktionen (Version 0.2)

- Name eingeben (der zuletzt verwendete Name ist vorausgefüllt), dann Rechenart und Schwierigkeit wählen
  (die letzte Auswahl ist vorausgewählt), danach Countdown 3 – 2 – 1
- 10 Aufgaben pro Runde, Eingabe über großes Ziffernfeld (oder Tastatur)

| Rechenart | Einfach | Standard | Schwierig |
|-----------|---------|----------|-----------|
| Mal       | eine gewählte Reihe (0er bis 10er) | alle Reihen 0 bis 10 | Reihen 5 bis 10, jedes Ergebnis über 25 |
| Plus      | Ergebnis bis 20 | Ergebnis bis 100 | Höchstwert wählbar: 20 / 50 / 100 / 200 / 500 / 1000 |

- **Gleichverteilung:** Pro Kind **und pro Übungsart** (z. B. „Mal · Einfach · 7er“ oder „Plus · Schwierig · bis 500“)
  wird eine eigene Statistik über die letzten 100 Rechnungen geführt, damit sich die Stufen nicht gegenseitig verzerren.
  - Mal: Die Reihe bestimmt der **zweite** Faktor (1 × 10 gehört zur 10er-Reihe). Es kommt immer eine der Reihen dran,
    die am seltensten vorkam. Bei „Einfach“ werden stattdessen die Aufgaben der gewählten Reihe gleichmäßig verteilt.
  - Plus: Die Ergebnisse verteilen sich gleichmäßig auf 10 Bereiche (bei bis 100: 2–11, 12–21 … 92–100).
    Etwa die Hälfte der Aufgaben hat einen Zehnerübergang (bei „bis 20“ weniger, weil kleine Ergebnisse keinen haben
    können), „+ 0“ kommt nur selten vor.
  - Es werden nur Gruppen verwendet, in denen es passende Aufgaben gibt. Ist eine erschöpft, kommt die nächstseltene dran.
  - Keine Rechnung kommt in einer Runde doppelt vor, eine falsch gelöste also auch nicht.
- Meldung „Richtig!“ (automatisch weiter nach 2 s) bzw. „Leider falsch.“ mit Lösung (weiter nach 5 s), „Weiter“-Taste jederzeit
- Töne, abschaltbar
- Abbrechen mit Rückfrage; abgebrochene Runden werden mit den bisherigen Antworten gespeichert
- Ergebnis mit Belohnungsbild, Sternen, Übungsart, Gesamtdauer, schnellster und langsamster Antwort (gleiche Figuren für alle Übungsarten)

| Richtig | Figur    | Sterne |
|---------|----------|--------|
| 10      | Kaffi    | 5      |
| 8–9     | Flauschi | 4      |
| 5–7     | Buh      | 3      |
| 1–4     | Pingu    | 2      |
| 0       | Rexi     | 1      |

- **Elternbereich** (PIN, Start-PIN `1234`): alle Übungen mit Rechenart, Stufe, Ergebnis, Dauer, Ø Antwortzeit, schnellster und
  langsamster Antwort; Detailansicht mit jeder Rechnung; PIN ändern; „PIN vergessen?“ (Rechenfrage für Erwachsene
  setzt die PIN auf `1234` zurück); Export als Sicherung (.json) oder für Excel (.csv); Import einer Sicherung.

## Wo liegen die Daten?

Im Browser-Speicher (localStorage) des jeweiligen Geräts und der jeweiligen Adresse. Ergebnisse vom iPad sind
also nicht automatisch am PC sichtbar, und bei einem Umzug auf eine andere Webadresse (z. B. von GitHub Pages auf
den eigenen Webserver) bitte vorher im Elternbereich **Sicherung exportieren** und danach **importieren**.
Achtung: Wird in Safari „Verlauf und Websitedaten löschen“ ausgeführt, sind die Daten weg. Regelmäßig exportieren.

## Ordnerstruktur

```
index.html      Bildschirme
app.css         Gestaltung (Farben als Variablen am Anfang, heller und dunkler Modus)
app.js          Logik; ganz oben CONFIG mit allen Einstellungen (Zeiten, Stufen, Bilder, Start-PIN)
bilder/         Belohnungsbilder (SVG), Stern und App-Icon
schriften/      Schriften Fredoka und Nunito (SIL Open Font License)
mockup/         Das klickbare Mockup aus der Planungsphase (nur zur Dokumentation)
```

**Bilder austauschen:** Datei in `bilder/` durch eine andere mit gleichem Namen ersetzen (SVG, oder PNG/JPG und
den Dateinamen in `CONFIG.stufen` in `app.js` anpassen). Die Bilder werden rund zugeschnitten.

## Geplante Erweiterungen

1. Eltern-Dashboard: beste und schlechteste Zahlenreihen über die letzten 30 Übungen
2. Mehrere Kinder getrennt im Dashboard (Übungen werden bereits pro Kind gespeichert)
3. Weitere Rechenarten: Minus und Division
4. Bilderauswahl für Eltern

## Offene Verbesserungen

- (Prio 2) Fortschrittskreis schon während der Rückmeldung grün/rot ausfüllen
- (Prio 2) Hosting mit eigener Domain
- (Prio 3) Export: einzelne oder alle Übungen auswählen
