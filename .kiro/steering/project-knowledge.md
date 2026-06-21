---
inclusion: auto
name: project-knowledge
description: "Key architectural knowledge about the Auuki project gathered during development sessions."
---

# Auuki — Project Knowledge

## Architecture

PWA browser-based per indoor cycling. Frontend puro (HTML + JS vanilla, Web Components custom). Build con Parcel. Nessun framework.

## Reactive System

- `xf` è un event bus custom.
- `xf.reg('prop', handler)` registra handler nel db.
- `xf.dispatch('prop', value)` emette un valore.
- `xf.sub('db:prop', handler)` sottoscrive a cambiamenti nel data store.
- Il prefisso `db:` indica un campo nel data store centrale.

## Web Components pattern

- **DataView**: Classe base per componenti che mostrano un singolo valore reattivo. Si estende specificando `getDefaults() → {prop}` e opzionalmente `transform(state)`. Override `subs()` per multi-prop.
- **ZStack** (`<z-stack>`): Cicla tra `<z-stack-item>` al click/pointerup. Persistenza in localStorage tramite `data-key="nomeChiave"`. Le chiavi vanno registrate in `models.Sources.default` dentro `src/models/models.js`.
- **view-action** (`<view-action>`): Dispatcha un'azione al click. Ha attributi `action`, `topic`, e opzionale `stoppropagation`.

## Modelli dati

- **PropInterval**: Media su intervallo temporale fisso (es. power1s = 1s, power3s = 3s). Accumula valori, li media allo scadere del timer, dispatcha il risultato.
- **PropAccumulator**: Accumula valori fino a un evento di reset (lap, stop). Usato per heartRateAvg, powerLap, ecc.
- **RollingAvg**: Buffer circolare a finestra fissa per medie mobili (es. heartRate60s). Ha `setSize(n)` per resize dinamico. Non dispatcha finché buffer non è pieno.
- **LocalStorageItem**: Wrapper per localStorage con chiave, fallback, validazione, parse/encode.
- **Target** (e sottoclassi PowerTarget, ResistanceTarget, SlopeTarget): `inc(value)`, `dec(value)`, `set(value)` con clamp min/max.
- **PowerTargetStep**: Configurabile (1-50W), persiste in localStorage, usato da inc/dec del power target.
- **RollingAvgSize**: Configurabile (30-300s), persiste in localStorage, regola la finestra di heartRate60s.

## Bias (workout intensity multiplier)

- `db.bias` = percentuale (default 100, min 0, no max, step ±1%)
- Applicato in `watch:stepIndex` handler: `ftp.toAbsolute(power, ftp) * bias / 100`
- Quando bias cambia, i handler `ui:bias-inc/dec/set` ricalcolano il power target dallo step corrente
- Si resetta a 100 su `workout:started`
- Il workout graph hover applica bias al valore power mostrato
- UI: controllo +/− sotto power target nel pannello ERG (BiasControl in data-views.js)

## Integrazione Intervals.icu

Chiamate dirette (senza backend proxy) con Basic Auth:
- Header: `Authorization: Basic btoa('API_KEY:' + apiKey)`
- Base URL: `https://intervals.icu/api/v1/athlete/{athleteId}`
- Credenziali salvate in localStorage: `intervals-api-key`, `intervals-athlete-id`
- Endpoints: `GET /events?oldest=&newest=` (calendario workout), `POST /activities` (upload .FIT), `GET /` (profilo atleta — peso, FTP)

## Git workflow

- **Mai fare rebase o squash** di commit già pushati. Causa force push.
- Commit lineari e separati. Se serve riorganizzare, farlo PRIMA del push.
- No `git rebase -i`, no `--amend` su commit pushati.

## Service Worker

- File: `src/sw.js`
- Strategia: cache-first con cache name versionato (`Flux-vNNN`)
- **Bisogna incrementare la versione ad ogni deploy** altrimenti i browser servono file vecchi dalla cache
- Al cambio versione il SW cancella la vecchia cache e ri-scarica tutto

## Backend

L'app originariamente dipendeva da `api.auuki.com` per auth e proxy OAuth. Ora per intervals.icu funziona senza backend. Quando il backend non è raggiungibile, la UI mostra direttamente la vista profilo (invece dell'errore "No internet connection").

## File chiave

| File | Responsabilità |
|------|---------------|
| `src/db.js` | Data store, registrazioni xf.reg, stato iniziale |
| `src/models/models.js` | Logica di business, classi modello, istanze |
| `src/views/data-views.js` | Web components di visualizzazione dati (DataView, ZStack, ecc.) |
| `src/index.html` | Layout e struttura HTML dei data tiles |
| `src/models/intervals.js` | Integrazione Intervals.icu (API Key auth) |
| `src/models/auth.js` | Gestione autenticazione e status |
| `src/models/api.js` | Router URL params e orchestrazione servizi |
| `src/sw.js` | Service worker con cache versioning |
| `src/models/config.js` | Config (URI, client IDs) |
| `src/storage/local-storage.js` | LocalStorageItem utility |
| `src/watch.js` | Timer, lap, step, elapsed — dispatcha watch:* events |

## Workflow per nuove data tile

1. Creare il modello/calcolo in `src/models/models.js` (o `src/db.js` se è un semplice passthrough)
2. Registrare il campo in `src/db.js` (stato iniziale + `xf.reg`)
3. Creare il web component DataView in `src/views/data-views.js`
4. Aggiungere l'HTML in `src/index.html` (dentro un `<z-stack>` se si vuole il cycling)
5. Se z-stack: registrare la chiave in `Sources.default` in `src/models/models.js`
6. Bumpare la versione SW in `src/sw.js`
7. Build con `npx parcel build`

## Workflow per nuovi settings persistenti

1. Creare classe Model con `storage`, `defaultValue()`, `defaultIsValid()` in `src/models/models.js`
2. Istanziare con `LocalStorageItem`, esportare nell'oggetto `models`
3. Aggiungere campo iniziale in `src/db.js`
4. Aggiungere `xf.reg('ui:effect-set', ...)` con `storage.set()` in `src/db.js`
5. Aggiungere restore in `app:start` handler in `src/db.js`
6. Aggiungere HTML in settings tab: `<input is="int-input" prop="..." effect="..."/>` + `<button is="set-button" ...>`
7. Bumpare SW e build

## Watch.js — navigazione workout

- `onTick()`: decrementa `lapTime` e `stepTime` durante workout, incrementa `lapTime` in modalità libera
- `step()`: avanza allo step/intervallo successivo
- `lap()`: salta all'intervallo successivo (skip forward)
- `back()`: singolo press = restart intervallo corrente, doppio press (500ms) = intervallo precedente
- `nextInterval()` / `nextStep()`: dispatchano durate e indici
- `watch:stepIndex` handler in db: applica bias e dispatcha power/slope/cadence target
