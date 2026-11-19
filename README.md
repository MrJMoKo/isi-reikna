# ISI reikna

Lern-App zum Rechnen üben (Plusrechnen, Minusrechnen, Malrechnen und Dividieren) für Volksschulkinder, optimiert für das iPad im Querformat.
Reines HTML, CSS und JavaScript, ohne Installation, ohne Server und ohne Internetverbindung nutzbar.

## Starten

**Windows 11 (zum Testen):** Ordner entpacken und `index.html` doppelklicken. Die App öffnet sich in Edge oder Chrome.
Für die iPad-Ansicht: `F12` → `Strg+Umschalt+M` → oben „iPad“ wählen und auf Querformat drehen.

**iPad:** Die App über eine Webadresse öffnen (GitHub Pages oder eigener Webserver), dann in Safari
„Teilen“ → „Zum Home-Bildschirm“. Danach startet sie wie eine App im Vollbild.

**Eigener Webserver:** Den ganzen Ordner unverändert hochladen. Es wird keine Server-Software benötigt.

## Funktionen (Version 0.6)

- Name eingeben (der zuletzt verwendete Name ist vorausgefüllt), dann Rechenart und Schwierigkeit wählen
  (die letzte Auswahl ist vorausgewählt), danach Countdown 3 – 2 – 1
- 10 Aufgaben pro Runde, Eingabe über großes Ziffernfeld (oder Tastatur)

Auswahl-Bildschirm: Rechenarten in zwei Zeilen, **Plus | Minus** und **Mal | Dividieren**.
Rechenzeichen werden überall orange dargestellt; das Divisionszeichen ÷ ist dasselbe Minuszeichen mit je einem
Punkt darüber und darunter.

| Rechenart | Stufe 1         | Stufe 2         | Stufe 3 |
|-----------|-----------------|-----------------|---------|
| Plus      | Einfach: Ergebnisse bis 10 | Standard: Ergebnisse bis 100 | Meine Wahl: Höchstwert 20 / 50 / 100 / 200 / 500 / 1000 |
| Minus     | Einfach: Zahlen bis 10 | Standard: Zahlen bis 100 | Meine Wahl: höchste Ausgangszahl 20 / 50 / 100 / 200 / 500 / 1000 |
| Mal       | Einfach: eine gewählte Reihe (0er bis 10er), alle 11 Aufgaben in Reihenfolge 0 × r … 10 × r | Standard: alle Reihen 0 bis 10 | Schwierig: Reihen 5 bis 10, jedes Ergebnis über 25 |
| Dividieren | Einfach: eine gewählte Reihe (1er bis 10er), 10 Aufgaben in Reihenfolge r ÷ r … 10r ÷ r | Standard: alle Reihen 1 bis 10 | Schwierig: Reihen 5 bis 10, erste Zahl über 25 |

- **Gleichverteilung:** Pro Kind **und pro Übungsart** (z. B. „Mal · Einfach · 7er“ oder „Plus · Meine Wahl · bis 500“)
  wird eine eigene Statistik über die letzten 100 Rechnungen geführt, damit sich die Stufen nicht gegenseitig verzerren.
  - Mal: Die Reihe bestimmt der **zweite** Faktor (1 × 10 gehört zur 10er-Reihe). Es kommt immer eine der Reihen dran,
    die am seltensten vorkam. Bei „Einfach“ kommt stattdessen die ganze gewählte Reihe aufsteigend (11 Aufgaben).
  - Plus: Die Ergebnisse verteilen sich gleichmäßig auf bis zu 10 Bereiche (bei bis 100: 2–11, 12–21 … 92–100,
    bei bis 10: jedes Ergebnis 2 … 10 einzeln). Etwa die Hälfte der Aufgaben hat einen Zehnerübergang (bei „bis 10“
    nur die Aufgaben mit Ergebnis 10, bei „bis 20“ weniger), „+ 0“ kommt nur selten vor.
  - Minus: Die Grenze gilt für die Ausgangszahl, das Ergebnis ist nie kleiner als 0. Die Ausgangszahlen verteilen
    sich gleichmäßig auf bis zu 10 Bereiche, die zweite Zahl ist frei zwischen 1 und der Ausgangszahl.
    Etwa die Hälfte hat einen Zehnerübergang (z. B. 43 − 8); „− 0“ und Ergebnis 0 kommen nur selten vor.
  - Dividieren: Umkehrung des Malrechnens. Die Reihe bestimmt die zweite Zahl (der Teiler, nie 0), jede Aufgabe geht
    ohne Rest auf, das Ergebnis ist eine ganze Zahl von 0 bis 10. „0 ÷ r“ kommt bei Standard nur selten vor,
    bei Einfach und Schwierig nie.
  - Es werden nur Gruppen verwendet, in denen es passende Aufgaben gibt. Ist eine erschöpft, kommt die nächstseltene dran.
  - Keine Rechnung kommt in einer Runde doppelt vor, eine falsch gelöste also auch nicht.
- Fortschrittsanzeige: Der Kreis einer Aufgabe wird sofort bei der Rückmeldung grün bzw. rot
- Meldung „Richtig!“ (automatisch weiter nach 2 s) bzw. „Leider falsch.“ mit Lösung (weiter nach 5 s), „Weiter“-Taste jederzeit
- Töne, abschaltbar
- Abbrechen mit Rückfrage; abgebrochene Runden werden mit den bisherigen Antworten gespeichert
- Ergebnis mit Belohnungsbild, Sternen, Übungsart, Gesamtdauer, schnellster und langsamster Antwort (gleiche Figuren für alle Übungsarten)

| Richtig | Figur    | Sterne |
|---------|----------|--------|
| 10 (bzw. 10–11 bei einer ganzen Malreihe) | Kaffi    | 5      |
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
3. Malrechnen: zusätzliche Schwierigkeitsstufe „Individuell“ (genaue Definition noch offen)
4. Bilderauswahl für Eltern

## Offene Verbesserungen

Siehe [Issues](https://github.com/MrJMoKo/isi-reikna/issues):

- (Prio 2) Hosting mit eigener Domain (#2)
- (Prio 3) Export: einzelne oder alle Übungen auswählen (#3)
