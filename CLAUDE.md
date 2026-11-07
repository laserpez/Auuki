# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Comandi, stile, divieti e standard di completamento/review sono in `AGENTS.md` (importato sopra). Qui sotto c'è solo ciò che richiede di leggere più file per essere capito.

## Cos'è

Auuki: PWA per allenamento indoor su rullo smart (workout `.zwo`, sensori via Web Bluetooth, registrazione `.FIT`, sync Intervals.icu/Strava). Parcel serve/builda da `src/index.html` (campo `source` in `package.json`). Non c'è lint.

## Architettura

**Bus eventi `xf` (`src/functions.js`).** Tutto è un `CustomEvent` su `window`. `xf.create(db)` (in `db.js`) avvolge il literal `db` in un `Proxy`: ogni `db.prop = x` dentro un handler `xf.reg` emette automaticamente `db:prop`, a cui i componenti si iscrivono con `xf.sub('db:prop', ...)`. Quindi il flusso tipico è: sorgente (BLE, `watch.js`, UI) → `xf.dispatch('evento', v)` → `xf.reg` in `db.js` scrive nel db → i view reagiscono a `db:*`. Non esiste altro stato condiviso.

**Bootstrap.** `src/index.js` importa `db.js`, `views/views.js`, `ble/devices.js`, `watch.js`, `course.js`, `lock.js` (la registrazione degli handler avviene all'import) e poi dispatcha `app:start`. L'handler `app:start` in `db.js` ripristina settings da localStorage, apre IndexedDB (`session`, `workouts`, `activity`) e ricostruisce workout/sessione. Il service worker è registrato solo per la versione stabile (`startServiceWorker()` è commentato in `index.js`).

**Dati dai sensori.** `src/ble/*` ha una cartella per servizio GATT (ftms, cps, hrs, moxy, fec, wcps, ...) con parser. `ble/devices.js` crea una `ReactiveConnectable` per tipo di dispositivo; i parser dispatchano i valori grezzi, `db.js` li salva e `models/models.js` calcola i derivati (medie mobili, `power1s`, lap, TSS, kcal, `PropAccumulator`/`RollingAvg`/`VirtualState`...). `src/ant/` è sperimentale.

**Tempo e sessione.** `watch.js` gestisce timer/lap/step e dispatcha `watch:elapsed` ogni secondo, che è il "tick" a cui si agganciano grafici, registrazione dei `records` e sessione (`models.session`).

**Models.** `models/models.js` (~1900 righe) contiene la classe base `Model` (persistenza `set`/`restore` su localStorage) e le istanze usate in `db.js`. I nuovi settings persistenti vanno qui (`LocalStorageItem`) e ripristinati in `app:start`.

**Views.** Web Components registrati con `customElements.define`; il markup e i punti di aggancio sono in `src/index.html`. Le pagine (`home`, `settings`, ...) sono `div.page` con `page="..."`, mostrate/nascoste via CSS (`.page` ha `display:none`, `.page.active` no). Un componente nella pagina nascosta ha `getBoundingClientRect()` a 0: se calcola layout, deve reagire con un `ResizeObserver` e non cachare la larghezza alla connessione (bug già successo in `views/moxy-graph.js`).

**FIT.** `src/fit/` codifica/decodifica; i campi devono rispettare scale/offset/invalid dei profili in `src/fit/profiles/`.

## Trappole

- **`src/sw.js` ha una lista statica `resources` dei file in cache.** Ogni nuovo file sotto `src/` (js, css, immagini) va aggiunto a mano a quella lista, altrimenti non sarà disponibile offline. Solo `cacheName` è gestito dall'hook.
- **Hook `sw-bump` (`.claude/hooks/sw-bump.sh`).** È un `PreToolUse` su `git commit` e guarda lo stage *prima* che il comando giri. Quindi `git add` e `git commit` vanno in chiamate Bash separate, con `git commit` come comando iniziale (niente `cd … && git add … && git commit`), altrimenti `cacheName` non viene bumpato.
- **Test.** Jest 27 + Babel (`.babelrc` trasforma i moduli in CommonJS solo in `NODE_ENV=test`). `test/` rispecchia `src/`; `fake-indexeddb` simula IndexedDB.
- `ltm/`, `.kiro/` e i file non tracciati in root (`slate.json`, `task.md`, `workout.json`) non fanno parte dell'app.
