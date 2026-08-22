# Il Vangelo del giorno come dono

Sito Next.js 14 (App Router) per Vercel: il Vangelo del giorno commentato da **Marcus Bachmann**. Una voce sola — il paragrafo **«La logica del dono»**, scritto in prima persona sul canone dei suoi libri (`canon/bachmann.md`). È il braccio quotidiano di [marcus-bachmann.vercel.app](https://marcus-bachmann.vercel.app), linkato dalla pagina degli Esercizi.

## Avvio locale

```bash
npm install
npm run dev        # http://localhost:3000
```

## Struttura

```
app/                pagine (/, /[date], /archivio, /rss.xml) + /api/daily
lib/content.js      lettura dei file content/*.md (frontmatter + sezioni "## ...")
lib/lezionario.js   lezionario cattolico via Evangelizo (con seconda lettura nelle domeniche/solennità)
lib/pipeline.js     assembla i prompt e scrive content/YYYY-MM-DD.md
prompts/            2 system prompt: bachmann + editor-checklist (layer di qualità)
canon/              bachmann.md — le sole fonti citabili
content/            un file Markdown per giorno = lo storage (committato nel repo)
vercel.json         cron giornaliero 02:00 UTC → GET /api/daily
```

Formato di `content/YYYY-MM-DD.md`: frontmatter (letture con testi integrali, seconda lettura inclusa quando c'è) + la sezione `## La logica del dono`.

I due giorni presenti (12–13 agosto 2026) sono **esempi dimostrativi** (`demo: true`): mostrano la rubrica reale — esegesi con citazione dal canone, dono vs economia, domanda al lettore.

## Regole editoriali (non negoziabili)

- Bachmann scrive **in prima persona**, mai in terza persona sociologica, mai in tono devozionale generico.
- Citazioni **solo dal canone** in `canon/bachmann.md` (o dalla Scrittura del giorno), con riferimento puntuale, mai inventate.
- Il paragrafo deve nascere dalle **letture del giorno**: se è intercambiabile fra pericopi diverse, non va pubblicato.
- Movimento fisso della rubrica: dove il dono si dona / dove lo irrigidiamo in economia → domanda finale in prima persona → firma.
- Layer editoriale (`prompts/editor-checklist.md`): citazione verificata, ancoraggio alla pericope, rubrica completa, tenuta letteraria; se fallisce → rigenerare, non pubblicare.

## Cron e generazione del giorno (ATTIVA)

`vercel.json` chiama `GET /api/daily` ogni giorno alle 02:00 UTC (04:00 a Monaco d'estate). La route (`maxDuration: 300`):

1. legge il lezionario cattolico con testi integrali (Evangelizo; seconda lettura `content=SR` presente in domeniche/solennità); se non risponde → errore e nessuna pubblicazione (riprovare con `?data=`);
2. genera **il paragrafo di Bachmann** dal suo canone con `deepseek-v4-pro` su Ollama cloud (`lib/ai.js`): system prompt + canone + pericope con testi;
3. **layer editoriale**: chiamata con `prompts/editor-checklist.md` → una sola riga `VERDETTO dono: APPROVATA/RIGENERA — motivo` (formato vincolante, parsato da `analizzaEditor`); se respinto il paragrafo viene riscritto col motivo del rifiuto, **max 2 giri**, poi si pubblica con `nota_editoriale` nel frontmatter;
4. **salvataggio**: in produzione commit di `content/DATA.md` su `main` via **GitHub API Contents** (`lib/github.js`, token `GITHUB_TOKEN`) → il push triggera il **redeploy automatico Vercel** e il giorno entra nel sito. In locale (senza `GITHUB_TOKEN`) scrive su disco.

Protezione: con `CRON_SECRET` impostato, `/api/daily` accetta solo `Authorization: Bearer <CRON_SECRET>` (il cron Vercel lo manda da solo).

Test: locale `curl "http://localhost:3000/api/daily?data=2026-08-20"`; produzione `curl -H "Authorization: Bearer $CRON_SECRET" "https://gospel-dono.vercel.app/api/daily?data=2026-08-20"`.

Env necessarie (vedi `.env.local.example`): `OLLAMA_API_KEY`, `GITHUB_TOKEN` (fine-grained PAT, solo repo gospel-dono, permesso Contents R/W), `CRON_SECRET`.

Note tecniche:
- Provider: Ollama cloud, modello `deepseek-v4-pro`, 2 chiamate/giorno (fino a 6 nel caso peggiore, con 2 rigenerazioni). Niente `temperature`. Nessun SDK: `fetch` nativo verso `https://ollama.com/v1/chat/completions`.
- `max_tokens` 6000 per il paragrafo, 8000 per l'editor; timeout 3 min per chiamata (route `maxDuration: 300`).
- Perché il commit e non un DB: il contenuto resta MDX versionato nel repo (storia, diff, rollback), e Vercel ricostruisce il sito da solo a ogni push.

## Deploy (quando sarà il momento)

Repo GitHub privato (`bifulcma`) → import su Vercel (`bifulcmas-projects`) → env: `OLLAMA_API_KEY`, `GITHUB_TOKEN`, `CRON_SECRET`. Il cron parte da solo dopo il primo deploy in produzione.
