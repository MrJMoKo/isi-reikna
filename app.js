/* ISI reikna – das kleine 1×1 üben (Prototyp 0.1)
   Reines JavaScript ohne Frameworks. Läuft direkt aus der Datei (Doppelklick auf index.html)
   oder von einem Webserver. Alle Daten bleiben im Browser des Geräts (localStorage). */
'use strict';

/* ======================= Einstellungen ======================= */
const CONFIG = {
  aufgabenProRunde: 10,
  zahlen: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],   // erlaubte Faktoren; der 2. Faktor bestimmt die Reihe
  historie: 100,                                // Gleichverteilung über die letzten 100 Rechnungen (pro Kind)
  weiterNachRichtigMs: 2000,
  weiterNachFalschMs: 5000,
  startPin: '1234',
  // Belohnungsstufen: "ab" = Mindestanzahl richtiger Antworten. Bilder liegen im Ordner bilder/.
  stufen: [
    { ab: 10, figur: 'Kaffi',    bild: 'bilder/kaffi.svg',    farbe: 'horse', sterne: 5,
      titel: n => `Perfekt, ${n}!`,       text: () => 'Alle 10 Aufgaben richtig. Kaffi galoppiert vor Freude!' },
    { ab: 8,  figur: 'Flauschi', bild: 'bilder/flauschi.svg', farbe: 'puppy', sterne: 4,
      titel: n => `Super gemacht, ${n}!`, text: c => `${c} von 10 Aufgaben richtig. Flauschi wedelt mit dem Schwanz.` },
    { ab: 5,  figur: 'Buh',      bild: 'bilder/buh.svg',      farbe: 'ghost', sterne: 3,
      titel: n => `Gut gemacht, ${n}!`,   text: c => `${c} von 10 Aufgaben richtig. Buh sagt: Weiter so!` },
    { ab: 1,  figur: 'Pingu',    bild: 'bilder/pingu.svg',    farbe: 'pingu', sterne: 2,
      titel: n => `Weiter üben, ${n}!`,   text: c => `${c} von 10 Aufgaben richtig. Pingu watschelt mit dir in die nächste Runde.` },
    { ab: 0,  figur: 'Rexi',     bild: 'bilder/rexi.svg',     farbe: 'rex',   sterne: 1,
      titel: n => `Dranbleiben, ${n}!`,   text: () => 'Diesmal hat es noch nicht geklappt. Rexi übt mit dir, nächstes Mal wird es besser.' },
  ],
};
const STERN_BILD = 'bilder/stern.svg';

/* ======================= Daten (localStorage) ======================= */
const SPEICHER_KEY = 'isi-reikna-daten';
function leereDaten() { return { version: 1, pin: CONFIG.startPin, ton: true, letzterName: '', uebungen: [] }; }
function laden() {
  try {
    const d = JSON.parse(localStorage.getItem(SPEICHER_KEY));
    if (d && d.version === 1 && Array.isArray(d.uebungen)) return Object.assign(leereDaten(), d);
  } catch (e) { /* kein Speicher verfügbar */ }
  return leereDaten();
}
const db = laden();
function speichern() {
  try { localStorage.setItem(SPEICHER_KEY, JSON.stringify(db)); return true; }
  catch (e) { toast('Speichern ist in diesem Browser nicht möglich.'); return false; }
}

/* ======================= Hilfsfunktionen ======================= */
const $ = s => document.querySelector(s);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const kindKey = name => name.trim().toLocaleLowerCase('de-AT');
const fmtS = ms => (ms / 1000).toFixed(1).replace('.', ',') + ' s';
const fmtMin = ms => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} min`; };
const fmtDatum = iso => { const d = new Date(iso); return d.toLocaleDateString('de-AT', { weekday: 'short', day: '2-digit', month: '2-digit', year: '2-digit' }) + ', ' + d.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' }); };
const fmtR = r => r ? `${fmtS(r.ms)} <small>(${r.a}×${r.b})</small>` : '–';
const stufeFuer = richtig => CONFIG.stufen.find(s => richtig >= s.ab);

function auswerten(rechnungen) {
  const richtig = rechnungen.filter(r => r.richtig).length;
  if (!rechnungen.length) return { richtig, anzahl: 0, schnellste: null, langsamste: null, schnitt: null };
  let schnellste = rechnungen[0], langsamste = rechnungen[0];
  rechnungen.forEach(r => { if (r.ms < schnellste.ms) schnellste = r; if (r.ms > langsamste.ms) langsamste = r; });
  return { richtig, anzahl: rechnungen.length, schnellste, langsamste, schnitt: rechnungen.reduce((s, r) => s + r.ms, 0) / rechnungen.length };
}
function toast(text) {
  const t = $('#toast'); t.textContent = text; t.hidden = false;
  clearTimeout(toast.h); toast.h = setTimeout(() => { t.hidden = true; }, 2600);
}

/* ======================= Aufgaben mit Gleichverteilung ======================= */
// Liefert die Reihen (2. Faktor) der letzten `max` Rechnungen dieses Kindes, neueste zuerst.
function letzteReihen(key, max) {
  const out = [];
  for (let i = db.uebungen.length - 1; i >= 0 && out.length < max; i--) {
    const u = db.uebungen[i];
    if (u.kindKey !== key) continue;
    for (let j = u.rechnungen.length - 1; j >= 0 && out.length < max; j--) out.push(u.rechnungen[j].reihe);
  }
  return out;
}
// Erstellt eine Runde: Es wird immer eine der Reihen gewählt, die in den letzten
// 100 Rechnungen (inkl. dieser Runde) am seltensten vorkam. Keine Rechnung kommt in einer Runde doppelt.
function neueRunde(key) {
  const n = CONFIG.aufgabenProRunde, zahlen = CONFIG.zahlen;
  const anzahl = new Map(zahlen.map(z => [z, 0]));
  letzteReihen(key, CONFIG.historie - n).forEach(r => { if (anzahl.has(r)) anzahl.set(r, anzahl.get(r) + 1); });
  const benutzt = new Set(), runde = [];
  for (let k = 0; k < n; k++) {
    const min = Math.min(...anzahl.values());
    const reihe = pick(zahlen.filter(z => anzahl.get(z) === min));
    anzahl.set(reihe, min + 1);
    const a = pick(zahlen.filter(x => !benutzt.has(x + 'x' + reihe)));
    benutzt.add(a + 'x' + reihe);
    runde.push({ a, b: reihe });
  }
  return runde;
}

/* ======================= Navigation ======================= */
const SCREENS = ['start', 'countdown', 'rechnen', 'abbruch', 'ergebnis', 'pin', 'eltern', 'detail'];
function zeige(id) {
  if (id !== 'rechnen') clearTimeout(spiel.auto);
  if (id !== 'countdown') clearTimeout(cdTimer);
  SCREENS.forEach(s => { $('#s-' + s).hidden = s !== id; });
  if (id === 'countdown') countdown();
  if (id === 'eltern') zeigeUebersicht();
  if (id === 'start') { $('#name').value = db.letzterName || ''; $('#name-error').textContent = ''; }
}
document.addEventListener('click', e => {
  const go = e.target.closest('[data-go]');
  if (go) return zeige(go.dataset.go);
  if (e.target.closest('[data-action="again"]')) return zeige('countdown');
  if (e.target.closest('.sound-btn')) { db.ton = !db.ton; speichern(); zeigeTon(); }
});

/* ======================= Dialog ======================= */
function frage({ titel, text, eingabe = false, knoepfe }) {
  return new Promise(resolve => {
    const ov = $('#overlay'), inp = $('#dlg-input'), act = $('#dlg-actions');
    $('#dlg-title').textContent = titel;
    $('#dlg-text').textContent = text;
    inp.hidden = !eingabe; inp.value = '';
    act.innerHTML = '';
    const fertig = wert => { ov.hidden = true; inp.onkeydown = null; resolve(wert); };
    knoepfe.forEach(k => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'big-btn' + (k.haupt ? '' : ' ghost'); b.textContent = k.text;
      b.onclick = () => fertig(eingabe ? (k.wert ? inp.value.trim() : null) : k.wert);
      act.appendChild(b);
    });
    inp.onkeydown = e => { if (e.key === 'Enter') fertig(inp.value.trim()); };
    ov.hidden = false;
    (eingabe ? inp : act.querySelector('.big-btn:not(.ghost)') || act.firstChild).focus();
  });
}
const dialogOffen = () => !$('#overlay').hidden;

/* ======================= Ton ======================= */
let audio = null;
function zeigeTon() {
  const an = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>';
  const aus = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
  document.querySelectorAll('.sound-btn').forEach(b => { b.innerHTML = db.ton ? an : aus; b.setAttribute('aria-label', db.ton ? 'Ton aus' : 'Ton an'); });
}
function spiele(noten) {
  if (!db.ton) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    noten.forEach(([f, ab, dauer]) => {
      const o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime + ab;
      o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(audio.destination);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
      o.start(t); o.stop(t + dauer + 0.05);
    });
  } catch (e) { /* Ton nicht verfügbar */ }
}
const TON_RICHTIG = [[660, 0, .18], [880, .12, .28]];
const TON_FALSCH = [[330, 0, .22], [262, .16, .32]];
const TON_ENDE = [[523, 0, .2], [659, .15, .2], [784, .3, .2], [1047, .45, .45]];

/* ======================= Ziffernfelder ======================= */
function baueFeld(el, tasten) {
  el.innerHTML = tasten.map(t => `<button type="button" data-key="${t.k}" class="${t.c || ''}" aria-label="${t.a || t.l}">${t.l}</button>`).join('');
}
const ZIFFERN = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => ({ k: n, l: n }));
baueFeld($('#pad'), [...ZIFFERN, { k: 'del', l: '⌫', c: 'soft', a: 'Löschen' }, { k: 0, l: 0 }, { k: 'ok', l: 'Fertig', c: 'ok' }]);
baueFeld($('#pin-pad'), [...ZIFFERN, { k: 'cancel', l: 'Zurück', c: 'soft' }, { k: 0, l: 0 }, { k: 'del', l: '⌫', c: 'soft', a: 'Löschen' }]);
$('#pad').addEventListener('click', e => { const b = e.target.closest('[data-key]'); if (b) taste(b.dataset.key); });
$('#pin-pad').addEventListener('click', e => { const b = e.target.closest('[data-key]'); if (b) pinTaste(b.dataset.key); });
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || dialogOffen()) return;
  const k = /^[0-9]$/.test(e.key) ? e.key : e.key === 'Backspace' ? 'del' : e.key === 'Enter' ? 'ok' : null;
  if (!k) return;
  if (!$('#s-rechnen').hidden) { e.preventDefault(); spiel.gesperrt && k === 'ok' ? weiter() : taste(k); }
  else if (!$('#s-pin').hidden && k !== 'ok') { e.preventDefault(); pinTaste(k); }
});

/* ======================= Start & Countdown ======================= */
$('#friends').innerHTML = CONFIG.stufen.map(s => `<span class="badge ${s.farbe}"><img src="${s.bild}" alt="${s.figur}"></span>`).join('');
$('#name-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#name').value.trim().replace(/\s+/g, ' ');
  if (!name) { $('#name-error').textContent = 'Bitte gib zuerst deinen Namen ein.'; $('#name').focus(); return; }
  spiel.kind = name; spiel.kindKey = kindKey(name);
  db.letzterName = name; speichern();
  zeige('countdown');
});
let cdTimer = 0;
function countdown() {
  clearTimeout(cdTimer);
  $('#cd-text').textContent = `Mach dich bereit, ${spiel.kind}!`;
  let n = 3;
  const tick = () => {
    if (n === 0) { starteRunde(); zeige('rechnen'); return; }
    const el = $('#cd-num'); el.textContent = n;
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    spiele([[n === 1 ? 784 : 523, 0, .18]]);
    n--; cdTimer = setTimeout(tick, 1000);
  };
  tick();
}

/* ======================= Rechnen ======================= */
const spiel = {
  kind: '', kindKey: '', aufgaben: [], i: 0, eingabe: '', rechnungen: [],
  t0: 0, start: 0, startIso: '', letzteAntwort: 0, pause: 0, pauseSeit: 0,
  gesperrt: false, aktiv: false, auto: 0, autoEnde: 0, autoRest: 0,
};
function starteRunde() {
  Object.assign(spiel, { aufgaben: neueRunde(spiel.kindKey), i: 0, rechnungen: [], start: Date.now(), startIso: new Date().toISOString(), pause: 0, aktiv: true });
  $('#who').textContent = $('#who2').textContent = spiel.kind;
  zeigeAufgabe();
}
function zeigeAufgabe() {
  const { a, b } = spiel.aufgaben[spiel.i];
  spiel.eingabe = ''; spiel.gesperrt = false; spiel.t0 = Date.now();
  $('#task').textContent = `${a} × ${b} =`;
  $('#counter').textContent = `Aufgabe ${spiel.i + 1} von ${CONFIG.aufgabenProRunde}`;
  $('#dots').innerHTML = spiel.aufgaben.map((_, j) => `<i class="${j < spiel.rechnungen.length ? (spiel.rechnungen[j].richtig ? 'ok' : 'no') : j === spiel.i ? 'now' : ''}"></i>`).join('');
  $('#feedback').hidden = true;
  $('#pad').querySelectorAll('button').forEach(b => { b.disabled = false; });
  zeigeEingabe();
}
function zeigeEingabe(zustand) {
  const el = $('#answer');
  el.textContent = spiel.eingabe || '?';
  el.className = 'answer' + (spiel.eingabe ? '' : ' empty') + (zustand ? ' ' + zustand : '');
}
function taste(k) {
  if (spiel.gesperrt || !spiel.aktiv) return;
  if (k === 'del') spiel.eingabe = spiel.eingabe.slice(0, -1);
  else if (k === 'ok') return pruefe();
  else if (spiel.eingabe.length < 3) spiel.eingabe = (spiel.eingabe === '0' ? '' : spiel.eingabe) + k;
  zeigeEingabe();
}
function pruefe() {
  if (!spiel.eingabe) return;
  const { a, b } = spiel.aufgaben[spiel.i], wert = Number(spiel.eingabe), ok = wert === a * b;
  spiel.letzteAntwort = Date.now();
  spiel.rechnungen.push({ a, b, reihe: b, eingabe: wert, richtig: ok, ms: spiel.letzteAntwort - spiel.t0 });
  spiel.gesperrt = true;
  $('#pad').querySelectorAll('button').forEach(btn => { btn.disabled = true; });
  zeigeEingabe(ok ? 'ok' : 'no');
  const wartezeit = ok ? CONFIG.weiterNachRichtigMs : CONFIG.weiterNachFalschMs;
  const letzte = spiel.i === CONFIG.aufgabenProRunde - 1;
  const fb = $('#feedback');
  fb.className = 'feedback ' + (ok ? 'ok' : 'no');
  fb.innerHTML = `<div class="fb-icon">${ok
      ? '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="currentColor"/><path d="M14 25l7 7 13-15" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="currentColor"/><path d="M16 16l16 16M32 16L16 32" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></svg>'}</div>
    <div class="fb-text"><b>${ok ? 'Richtig!' : 'Leider falsch.'}</b><span>${ok ? 'Toll gerechnet.' : `Richtig ist: ${a} × ${b} = ${a * b}`}</span>
    <div class="auto-bar"><i style="animation-duration:${wartezeit}ms"></i></div></div>
    <button class="big-btn" type="button" id="next">${letzte ? 'Zum Ergebnis' : 'Weiter'}</button>`;
  fb.hidden = false;
  $('#next').addEventListener('click', weiter);
  spiele(ok ? TON_RICHTIG : TON_FALSCH);
  starteAuto(wartezeit);
}
function starteAuto(ms) {
  clearTimeout(spiel.auto);
  spiel.autoEnde = Date.now() + ms;
  spiel.auto = setTimeout(weiter, ms);
}
function weiter() {
  clearTimeout(spiel.auto);
  if (!spiel.gesperrt || !spiel.aktiv || dialogOffen()) return;
  spiel.i++;
  if (spiel.i < CONFIG.aufgabenProRunde) return zeigeAufgabe();
  const u = rundeSpeichern(false, spiel.letzteAntwort - spiel.start - spiel.pause);
  zeigeErgebnis(u);
  zeige('ergebnis');
  spiele(TON_ENDE);
}
function rundeSpeichern(abgebrochen, dauerMs) {
  const u = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    kind: spiel.kind, kindKey: spiel.kindKey,
    start: spiel.startIso, ende: new Date().toISOString(),
    dauerMs: Math.max(0, Math.round(dauerMs)), abgebrochen,
    rechenart: 'mal', stufe: 'normal',            // für spätere Erweiterungen
    rechnungen: spiel.rechnungen.map(r => ({ ...r })),
  };
  db.uebungen.push(u);
  speichern();
  Object.assign(spiel, { aktiv: false, gesperrt: false, aufgaben: [] });
  return u;
}

// Abbrechen mit Rückfrage. Während der Rückfrage ist die Zeit angehalten.
$('#abort').addEventListener('click', async () => {
  if (!spiel.aktiv || dialogOffen()) return;
  clearTimeout(spiel.auto);
  spiel.pauseSeit = Date.now();
  spiel.autoRest = Math.max(0, spiel.autoEnde - spiel.pauseSeit);
  const balken = $('#feedback .auto-bar i');
  if (balken) balken.style.animationPlayState = 'paused';
  const abbrechen = await frage({
    titel: 'Runde wirklich abbrechen?',
    text: 'Deine bisherigen Antworten werden gespeichert.',
    knoepfe: [{ text: 'Weiterrechnen', wert: false, haupt: true }, { text: 'Ja, abbrechen', wert: true }],
  });
  if (abbrechen) {
    rundeSpeichern(true, spiel.pauseSeit - spiel.start - spiel.pause);
    zeige('abbruch');
    return;
  }
  const pause = Date.now() - spiel.pauseSeit;
  spiel.pause += pause; spiel.t0 += pause;
  if (spiel.gesperrt) { if (balken) balken.style.animationPlayState = 'running'; starteAuto(spiel.autoRest); }
});

/* ======================= Ergebnis ======================= */
function zeigeErgebnis(u) {
  const a = auswerten(u.rechnungen), s = stufeFuer(a.richtig);
  $('#r-badge').className = 'badge ' + s.farbe;
  $('#r-img').src = s.bild; $('#r-img').alt = s.figur;
  $('#r-stars').innerHTML = `<img src="${STERN_BILD}" alt="">`.repeat(s.sterne);
  $('#r-stars').setAttribute('aria-label', s.sterne === 1 ? '1 Stern' : `${s.sterne} Sterne`);
  $('#r-title').textContent = s.titel(u.kind);
  $('#r-lead').textContent = s.text(a.richtig);
  $('#r-correct').textContent = `${a.richtig} von ${CONFIG.aufgabenProRunde}`;
  $('#r-total').textContent = fmtMin(u.dauerMs);
  $('#r-fast').innerHTML = `${fmtS(a.schnellste.ms)} <small>bei ${a.schnellste.a} × ${a.schnellste.b}</small>`;
  $('#r-slow').innerHTML = `${fmtS(a.langsamste.ms)} <small>bei ${a.langsamste.a} × ${a.langsamste.b}</small>`;
}

/* ======================= PIN ======================= */
let pinModus = 'login', pinEingabe = '', pinNeu = '';
const PIN_TEXTE = {
  login: ['Elternbereich', 'Bitte die 4-stellige PIN eingeben.'],
  neu1: ['Neue PIN', 'Bitte eine neue 4-stellige PIN eingeben.'],
  neu2: ['Neue PIN bestätigen', 'Bitte die neue PIN noch einmal eingeben.'],
};
function pinOeffnen(modus, meldung = '') {
  pinModus = modus; pinEingabe = '';
  $('#pin-title').textContent = PIN_TEXTE[modus][0];
  $('#pin-text').textContent = PIN_TEXTE[modus][1];
  $('#pin-msg').textContent = meldung;
  $('#pin-forgot').hidden = modus !== 'login';
  zeigePin();
  zeige('pin');
}
function zeigePin() { $('#pin-dots').querySelectorAll('i').forEach((d, i) => d.classList.toggle('on', i < pinEingabe.length)); }
function pinFehler(text) {
  const d = $('#pin-dots'); d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake');
  $('#pin-msg').textContent = text; pinEingabe = ''; zeigePin();
}
function pinZurueck() { pinModus === 'login' ? zeige('start') : zeige('eltern'); }
function pinTaste(k) {
  if (k === 'cancel') return pinZurueck();
  if (k === 'del') { pinEingabe = pinEingabe.slice(0, -1); return zeigePin(); }
  if (pinEingabe.length >= 4) return;
  pinEingabe += k; zeigePin(); $('#pin-msg').textContent = '';
  if (pinEingabe.length < 4) return;
  setTimeout(() => {
    if (pinModus === 'login') {
      if (pinEingabe === db.pin) { pinEingabe = ''; zeige('eltern'); } else pinFehler('Falsche PIN. Bitte nochmal versuchen.');
    } else if (pinModus === 'neu1') {
      pinNeu = pinEingabe; pinOeffnen('neu2');
    } else if (pinEingabe === pinNeu) {
      db.pin = pinNeu; speichern(); pinEingabe = ''; zeige('eltern'); toast('Die PIN wurde geändert.');
    } else {
      pinOeffnen('neu1', 'Die PINs stimmen nicht überein. Bitte neu beginnen.');
    }
  }, 180);
}
$('#open-parents').addEventListener('click', () => pinOeffnen('login'));
$('#pin-back').addEventListener('click', pinZurueck);
$('#pin-change').addEventListener('click', () => pinOeffnen('neu1'));
$('#pin-forgot').addEventListener('click', async () => {
  const x = 12 + Math.floor(Math.random() * 18), y = 12 + Math.floor(Math.random() * 18);
  const antwort = await frage({
    titel: 'PIN zurücksetzen',
    text: `Frage für Erwachsene: Wie viel ist ${x} × ${y}? Bei richtiger Antwort wird die PIN auf ${CONFIG.startPin} zurückgesetzt. Die Übungen bleiben erhalten.`,
    eingabe: true,
    knoepfe: [{ text: 'Abbrechen', wert: false }, { text: 'Zurücksetzen', wert: true, haupt: true }],
  });
  if (antwort === null) return;
  if (Number(antwort) === x * y) { db.pin = CONFIG.startPin; speichern(); pinOeffnen('login', ''); toast(`Die PIN ist wieder ${CONFIG.startPin}.`); }
  else toast('Die Antwort war leider falsch.');
});

/* ======================= Elternbereich ======================= */
function zeigeUebersicht() {
  const liste = db.uebungen.slice().reverse();
  $('#sessions-wrap').hidden = !liste.length;
  $('#sessions-empty').hidden = !!liste.length;
  $('#sessions').innerHTML = liste.map(u => {
    const a = auswerten(u.rechnungen), s = CONFIG.stufen.indexOf(stufeFuer(a.richtig));
    const ergebnis = u.abgebrochen
      ? `<span class="pill neutral">${a.richtig}/${a.anzahl}</span><span class="tag">abgebrochen</span>`
      : `<span class="pill l${s}">${a.richtig}/${a.anzahl}</span>`;
    return `<tr class="link" data-id="${esc(u.id)}" tabindex="0"><td>${fmtDatum(u.start)}</td><td>${esc(u.kind)}</td>
      <td>${ergebnis}</td><td>${fmtMin(u.dauerMs)}</td><td>${a.schnitt ? fmtS(a.schnitt) : '–'}</td>
      <td>${fmtR(a.schnellste)}</td><td>${fmtR(a.langsamste)}</td><td class="chev">›</td></tr>`;
  }).join('');
}
function oeffneDetail(id) {
  const u = db.uebungen.find(x => x.id === id);
  if (!u) return;
  const a = auswerten(u.rechnungen);
  $('#d-title').textContent = `Übung von ${u.kind}` + (u.abgebrochen ? ' (abgebrochen)' : '');
  $('#d-sub').textContent = fmtDatum(u.start);
  $('#d-correct').innerHTML = `${a.richtig} <small>von ${a.anzahl}</small>`;
  $('#d-total').textContent = fmtMin(u.dauerMs);
  $('#d-avg').textContent = a.schnitt ? fmtS(a.schnitt) : '–';
  $('#d-fast').innerHTML = fmtR(a.schnellste);
  $('#d-slow').innerHTML = fmtR(a.langsamste);
  $('#calcs').innerHTML = u.rechnungen.length
    ? u.rechnungen.map((r, j) => `<tr><td>${j + 1}</td><td><b>${r.a} × ${r.b}</b></td><td>${r.reihe}er</td><td>${r.eingabe}</td><td>${r.a * r.b}</td>
      <td><span class="pill ${r.richtig ? 'ok' : 'no'}">${r.richtig ? 'richtig' : 'falsch'}</span></td><td>${fmtS(r.ms)}</td></tr>`).join('')
    : '<tr><td colspan="7">In dieser Runde wurde keine Aufgabe beantwortet.</td></tr>';
  zeige('detail');
}
$('#sessions').addEventListener('click', e => { const tr = e.target.closest('tr[data-id]'); if (tr) oeffneDetail(tr.dataset.id); });
$('#sessions').addEventListener('keydown', e => { const tr = e.target.closest('tr[data-id]'); if (tr && e.key === 'Enter') oeffneDetail(tr.dataset.id); });

/* Export & Import */
function herunterladen(dateiname, inhalt, typ) {
  const url = URL.createObjectURL(new Blob([inhalt], { type: typ }));
  const a = document.createElement('a');
  a.href = url; a.download = dateiname; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
const heute = () => new Date().toISOString().slice(0, 10);
$('#export-json').addEventListener('click', () => {
  if (!db.uebungen.length) return toast('Es gibt noch keine Übungen zum Exportieren.');
  herunterladen(`isi-reikna-sicherung-${heute()}.json`,
    JSON.stringify({ app: 'ISI reikna', version: 1, exportiert: new Date().toISOString(), uebungen: db.uebungen }, null, 1), 'application/json');
});
$('#export-csv').addEventListener('click', () => {
  if (!db.uebungen.length) return toast('Es gibt noch keine Übungen zum Exportieren.');
  const zeilen = [['Datum', 'Uhrzeit', 'Kind', 'Abgebrochen', 'Nr', 'Aufgabe', 'Reihe', 'Eingabe', 'Lösung', 'Richtig', 'Dauer (s)']];
  db.uebungen.forEach(u => {
    const d = new Date(u.start), datum = d.toLocaleDateString('de-AT'), zeit = d.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' });
    u.rechnungen.forEach((r, j) => zeilen.push([datum, zeit, u.kind, u.abgebrochen ? 'ja' : 'nein', j + 1, `${r.a} x ${r.b}`, r.reihe, r.eingabe, r.a * r.b, r.richtig ? 'ja' : 'nein', (r.ms / 1000).toFixed(1).replace('.', ',')]));
  });
  const csv = '﻿' + zeilen.map(z => z.map(f => `"${String(f).replace(/"/g, '""')}"`).join(';')).join('\r\n');
  herunterladen(`isi-reikna-rechnungen-${heute()}.csv`, csv, 'text/csv;charset=utf-8');
});
$('#import-json').addEventListener('click', () => { $('#import-file').value = ''; $('#import-file').click(); });
$('#import-file').addEventListener('change', async e => {
  const datei = e.target.files[0];
  if (!datei) return;
  try {
    const daten = JSON.parse(await datei.text());
    if (!daten || !Array.isArray(daten.uebungen)) throw new Error('Format');
    const vorhanden = new Set(db.uebungen.map(u => u.id));
    const neu = daten.uebungen.filter(u => u && u.id && Array.isArray(u.rechnungen) && u.start && !vorhanden.has(u.id));
    db.uebungen = db.uebungen.concat(neu).sort((x, y) => x.start.localeCompare(y.start));
    speichern(); zeigeUebersicht();
    toast(neu.length ? `${neu.length} Übung${neu.length === 1 ? '' : 'en'} importiert.` : 'Alle Übungen aus der Datei waren schon vorhanden.');
  } catch (err) {
    toast('Die Datei ist keine gültige ISI-reikna-Sicherung.');
  }
});

/* ======================= Los geht's ======================= */
zeigeTon();
zeige('start');
// Für Tests in der Browser-Konsole
window.ISI = { CONFIG, db, neueRunde };
