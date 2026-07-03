# AGENTS.md

## Struttura del progetto

```
src/
  index.html          # Entry point, layout HTML, data tiles
  db.js               # Data store centrale (stato iniziale + xf.reg handlers)
  functions.js        # Utility funzionali (equals, exists, empty, xf, ecc.)
  utils.js            # Utility (pad, formatTime, CRC, ecc.)
  sw.js               # Service worker con cache versionata
  watch.js            # Timer, lap, step, elapsed — dispatcha watch:* events
  models/
    models.js         # Logica di business, classi Model, istanze, session
    intervals.js      # Integrazione Intervals.icu (API Key auth diretto)
    auth.js           # Autenticazione
    api.js            # Router URL params
    config.js         # Config (URI, client IDs)
  views/
    data-views.js     # Web Components (DataView, ZStack, view-action)
  ble/                # Bluetooth Low Energy (servizi, caratteristiche, parser)
  ant/                # ANT+ (driver, messaggi, profili)
  fit/                # Encoder/decoder file FIT
  storage/            # localStorage, IndexedDB, UUID
  workouts/           # Parser workout (ZWO, ecc.)
  activity/           # Enum attività (TimerStatus, EventType)
test/                 # Mirror di src/ — jest + babel
```

## Comandi

| Azione | Comando |
|--------|---------|
| Dev server | `npx parcel` |
| Dev server HTTPS | `npx parcel --cert ./dev_cert/cert.pem --key ./dev_cert/key.pem` |
| Build produzione | `npx parcel build` |
| Test | `npx jest` |
| Test singolo file | `npx jest test/fit/hrv.test.js` |
| Test watch | `npx jest --watch` |

## Stile del codice

- JavaScript vanilla, ES modules (`import`/`export`). Nessun framework, nessun TypeScript.
- Factory functions con `Object.freeze()` per immutabilità — non classi (eccezione: `Model` base e Web Components che estendono `HTMLElement`).
- Web Components custom con `class extends HTMLElement` o `DataView`.
- 4 spazi di indentazione.
- Trailing comma solo su multiline quando già presente nel file.
- Nomi in camelCase. Costanti in camelCase (non UPPER_SNAKE).
- Funzioni piccole, una responsabilità. Preferire composizione a ereditarietà.
- `existance(value, fallback)` al posto di `value ?? fallback` quando si vuole validare anche `null`.
- `equals(a, b)` (usa `Object.is`) al posto di `===`.
- `exists(x)` al posto di `x !== null && x !== undefined`.
- `empty(x)` per verificare collezioni vuote.
- Nessun `this` nelle factory functions. Usare closure.
- Semicolons obbligatori.
- Le stringhe usano single quotes `'...'`. Template literals solo quando serve interpolazione.

## Sistema reattivo (xf)

- `xf.dispatch('prop', value)` — emette un valore.
- `xf.reg('prop', (value, db) => { ... })` — handler che scrive nel db.
- `xf.sub('db:prop', handler, signal)` — sottoscrizione a cambiamenti nel data store.
- Prefisso `db:` = campo nel data store. Prefisso `ui:` = azione utente.

## Divieti

- Mai introdurre framework, transpiler aggiuntivi, o dipendenze runtime.
- Mai usare `class` per logica di business (solo per Web Components e Model base).
- Mai mutare stato al di fuori di un handler `xf.reg`.
- Mai fare rebase, squash, o amend di commit già pushati. Mai force push.
- Mai saltare l'increment della versione SW dopo modifiche a `src/`.
- Mai creare file README, CHANGELOG, o documentazione non richiesta.
- Mai aggiungere test se non richiesto esplicitamente.
- Mai usare `var`. Usare `const` di default, `let` solo se necessario.
- Mai introdurre dipendenze npm runtime. Solo devDependencies per build/test.
- Mai modificare `xf` o `functions.js` senza esplicita richiesta.

## Standard di completamento

1. Il codice compila senza errori: `npx parcel build` deve terminare con successo.
2. I test esistenti passano: `npx jest` non deve introdurre regressioni.
3. Se si modifica un file sotto `src/`, bumpare `cacheName` in `src/sw.js` (incrementare il numero in `'Flux-vNNN'`).
4. Ogni nuovo campo dati segue il flusso completo: parser → dispatch → `xf.reg` in db.js → consumo in models/views.
5. Nuovi Web Components di visualizzazione estendono `DataView` o seguono lo stesso pattern.
6. Nuovi settings persistenti usano `LocalStorageItem` + restore in `app:start`.

## Standard di review

- Il codice segue le convenzioni esistenti (factory functions, `Object.freeze`, naming).
- Nessuna dipendenza aggiunta senza motivo esplicito.
- Le modifiche al data store (`db.js`) hanno un corrispondente stato iniziale nel literal `db`.
- I valori nel file FIT rispettano scale/offset/invalid dei profili in `src/fit/profiles/`.
- Le sottoscrizioni usano `AbortController` per cleanup.
- Nessun memory leak: listener rimossi via abort signal, nessun riferimento circolare.
- I record pushati in `db.records` sono oggetti nuovi, non riferimenti mutabili.
