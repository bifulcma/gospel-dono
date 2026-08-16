# Il Vangelo del giorno come dono

Sito Next.js 14 (App Router) per Vercel: il Vangelo del giorno commentato da **4 voci confessionali** — cattolica, ortodossa, protestante, dispensazionalista — sotto un unico criterio trasversale, la **logica del dono** (Marion/Balthasar), firmato *Marcus Bachmann*.

## Avvio locale

```bash
npm install
npm run dev        # http://localhost:3000
```

## Struttura

```
app/                pagine (/, /[date], /archivio, /rss.xml) + /api/daily
lib/content.js      lettura dei file content/*.md (frontmatter + sezioni "## ...")
lib/lezionario.js   API lezionari: Evangelizo (cattolico), GOARCH + fallback (ortodosso)
lib/pipeline.js     assembla i prompt e scrive content/YYYY-MM-DD.md
prompts/            5 system prompt: 4 voci + editor-checklist (layer anti-caricatura)
canon/              canone di fonti fisse per voce (le sole citabili)
content/            un file Markdown per giorno = lo storage (committato nel repo)
vercel.json         cron giornaliero 02:00 UTC → GET /api/daily
```

Formato di `content/YYYY-MM-DD.md`: frontmatter (letture dei due lezionari) + 5 sezioni `## La logica del dono`, `## Voce cattolica`, `## Voce ortodossa` (sul lezionario bizantino), `## Voce protestante`, `## Voce dispensazionalista`.

I due giorni presenti (12–13 agosto 2026) sono **esempi dimostrativi** (`demo: true`): mostrano la rubrica reale — esegesi con citazione dal canone, dono vs economia, domanda al lettore.

## Regole editoriali (non negoziabili)

- Ogni voce scrive **in prima persona confessionale**; vietato "gli X credono che".
- Citazioni **solo dal canone** in `canon/<voce>.md`, mai inventate.
- **Balthasar solo nella voce cattolica.** L'ortodosso commenta il **suo** lezionario.
- Layer editoriale (`prompts/editor-checklist.md`): citazione verificata, rubrica completa, test dello specchio; se fallisce → rigenerare, non pubblicare.

## Cron e generazione del giorno (ATTIVA)

`vercel.json` chiama `GET /api/daily` ogni giorno alle 02:00 UTC (04:00 a Monaco d'estate). La route (`maxDuration: 300`):

1. legge i lezionari con testi integrali (Evangelizo per il cattolico; GOARCH/holytrinity + bible-api per il bizantino); se uno dei due non risponde → errore e nessuna pubblicazione (riprovare con `?data=`);
2. genera le **4 voci in parallelo** con `deepseek-v4-pro` su Ollama cloud (`lib/ai.js`, endpoint OpenAI-compatible), ognuna col proprio system prompt + canone + pericope con testo;
3. **layer editoriale**: quinta chiamata con `prompts/editor-checklist.md` → verdetto `APPROVATA/RIGENERA` per voce (formato vincolante, parsato da `analizzaEditor`) + paragrafo "La logica del dono" firmato Marcus Bachmann; le voci respinte vengono rigenerate col motivo del rifiuto, **max 2 giri**, poi si pubblica con `nota_editoriale` nel frontmatter;
4. **salvataggio**: in produzione commit di `content/DATA.md` su `main` via **GitHub API Contents** (`lib/github.js`, token `GITHUB_TOKEN`) → il push triggera il **redeploy automatico Vercel** e il giorno entra nel sito. In locale (senza `GITHUB_TOKEN`) scrive su disco.

Protezione: con `CRON_SECRET` impostato, `/api/daily` accetta solo `Authorization: Bearer <CRON_SECRET>` (il cron Vercel lo manda da solo).

Test: locale `curl "http://localhost:3000/api/daily?data=2026-08-20"`; produzione `curl -H "Authorization: Bearer $CRON_SECRET" "https://gospel-dono.vercel.app/api/daily?data=2026-08-20"`.

Env necessarie (vedi `.env.local.example`): `OLLAMA_API_KEY`, `GITHUB_TOKEN` (fine-grained PAT, solo repo gospel-dono, permesso Contents R/W), `CRON_SECRET`.

Note tecniche:
- Provider: Ollama cloud, modello `deepseek-v4-pro`, 5 chiamate/giorno. Niente `temperature`. Nessun SDK: `fetch` nativo verso `https://ollama.com/v1/chat/completions`.
- `max_tokens` 6000 per voce, 8000 per l'editor; timeout 3 min per chiamata (route `maxDuration: 300`).
- Perché il commit e non un DB: il contenuto resta MDX versionato nel repo (storia, diff, rollback), e Vercel ricostruisce il sito da solo a ogni push.

## Deploy (quando sarà il momento)

Repo GitHub privato (`bifulcma`) → import su Vercel (`bifulcmas-projects`) → env: `OLLAMA_API_KEY`, `GITHUB_TOKEN`, `CRON_SECRET`. Il cron parte da solo dopo il primo deploy in produzione.
