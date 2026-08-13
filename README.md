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

## Cron e generazione del giorno

`vercel.json` chiama `GET /api/daily` ogni giorno alle 02:00 UTC (04:00 a Monaco d'estate). La route:

1. legge i lezionari (Evangelizo / GOARCH; con `LEZIONARIO_MANUALE=1` o API giù → campi "DA INSERIRE" da compilare a mano);
2. assembla i 5 prompt (system della voce + canone + pericope del giorno);
3. **oggi**: scrive `content/DATA.md` con segnaposto; **domani** (vedi sotto): chiamerà il provider AI.

Protezione: imposta `CRON_SECRET` nelle env Vercel — il cron manda `Authorization: Bearer <CRON_SECRET>` automaticamente.

Test locale: `curl "http://localhost:3000/api/daily?data=2026-08-14"`.

> **Limite noto (scelta MDX-nel-repo):** su Vercel il filesystem delle funzioni è di sola lettura, quindi in produzione `fs.writeFileSync` non persiste. Due strade quando si attiva la generazione: (a) far committare il file dal cron via GitHub API (commit su `main` → redeploy automatico), oppure (b) passare a Neon Postgres. In locale tutto funziona già così com'è.

## Collegare la generazione AI (futuro)

Nessuna chiamata LLM è presente nel codice, per scelta. Quando vorrai attivarla:

```bash
npm install @anthropic-ai/sdk        # chiedi conferma a te stesso: è una dipendenza nuova :)
```

In `lib/pipeline.js`, dentro `generaGiorno`, al posto dei segnaposto:

```js
import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic(); // legge ANTHROPIC_API_KEY dalle env

async function generaCommento(prompt) {
  const msg = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 2048,
    system: prompt.system,          // system prompt della voce + canone
    messages: [{ role: 'user', content: prompt.user }], // pericope + istruzione
  });
  return msg.content.find((b) => b.type === 'text')?.text ?? '';
}

// 1) quattro bozze, una per voce (i prompt sono già pronti da assemblaPrompt)
const bozze = {};
for (const voce of VOCI) bozze[voce] = await generaCommento(prompts[voce]);

// 2) quinta chiamata: l'editor verifica la checklist e scrive "La logica del dono"
const editor = await generaCommento(assemblaPromptEditor(bozze));
// → se l'editor risponde RIGENERA per una voce: rigenera quella voce con il motivo
//   nel messaggio user, poi ripassa dall'editor. Max 2 giri, poi pubblica con nota.
```

Note tecniche:
- Modello: `claude-sonnet-5` (ottimo per scrittura tono-sensibile; `claude-opus-5` se vorrai il massimo).
- Niente `temperature`: sui modelli attuali non è supportata; la varietà la dà la pericope del giorno.
- 5 chiamate/giorno ≈ pochi centesimi. `ANTHROPIC_API_KEY` va nelle env Vercel (mai nel repo).
- L'output dell'editor decide: APPROVATA/RIGENERA per voce + paragrafo "La logica del dono" da mettere in testa al file.

## Deploy (quando sarà il momento)

Repo GitHub privato (`bifulcma`) → import su Vercel (`bifulcmas-projects`) → env: `CRON_SECRET`, in futuro `ANTHROPIC_API_KEY`. Il cron parte da solo dopo il primo deploy in produzione.
