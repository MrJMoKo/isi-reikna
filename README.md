# ISI reikna

Lern-App für das kleine 1×1 (Zahlen 0 bis 10) für Volksschulkinder, optimiert für das iPad im Querformat.
Reines HTML, CSS und JavaScript, ohne Installation, ohne Server und ohne Internetverbindung nutzbar.

## Starten

**Windows 11 (zum Testen):** Ordner entpacken und `index.html` doppelklicken. Die App öffnet sich in Edge oder Chrome.
Für die iPad-Ansicht: `F12` → `Strg+Umschalt+M` → oben „iPad“ wählen und auf Querformat drehen.

**iPad:** Die App über eine Webadresse öffnen (GitHub Pages oder eigener Webserver), dann in Safari
„Teilen“ → „Zum Home-Bildschirm“. Danach startet sie wie eine App im Vollbild.

**Eigener Webserver:** Den ganzen Ordner unverändert hochladen. Es wird keine Server-Software benötigt.

## Funktionen (Prototyp 0.1)

- Name eingeben (der zuletzt verwendete Name ist vorausgefüllt), danach Countdown 3 – 2 – 1
- 10 Aufgaben pro Runde, Eingabe über großes Ziffernfeld (oder Tastatur)
- Gleichverteilung: Die Reihe bestimmt der **zweite** Faktor (1 × 10 gehört zur 10er-Reihe).
  Pro Kind wird immer eine Reihe gewählt, die in den letzten 100 Rechnungen am seltensten vorkam.
  Keine Rechnung kommt in einer Runde doppelt vor, eine falsch gelöste also auch nicht.
- Meldung „Richtig!“ (automatisch weiter nach 2 s) bzw. „Leider falsch.“ mit Lösung (weiter nach 5 s), „Weiter“-Taste jederzeit
- Töne, abschaltbar
- Abbrechen mit Rückfrage; abgebrochene Runden werden mit den bisherigen Antworten gespeichert
- Ergebnis mit Belohnungsbild, Sternen, Gesamtdauer, schnellster und langsamster Antwort

| Richtig | Figur    | Sterne |
|---------|----------|--------|
| 10      | Kaffi    | 5      |
| 8–9     | Flauschi | 4      |
| 5–7     | Buh      | 3      |
| 1–4     | Pingu    | 2      |
| 0       | Rexi     | 1      |

- **Elternbereich** (PIN, Start-PIN `1234`): alle Übungen mit Ergebnis, Dauer, Ø Antwortzeit, schnellster und
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
2. Auswahl der Rechenart für Kinder (im Datenmodell bereits als `rechenart` vorgesehen)
3. Mehrere Kinder getrennt im Dashboard (Übungen werden bereits pro Kind gespeichert)
4. Schwierigkeitsgrad einfach / normal / schwierig (im Datenmodell bereits als `stufe` vorgesehen)
5. Bilderauswahl für Eltern
