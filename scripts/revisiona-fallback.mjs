// Revisione qualità PIANO B (fallback): deepseek-v4-pro controlla la bozza
// quando herdr (claude/kimi) non è disponibile. Niente token in output.
// Uso: node scripts/revisiona-fallback.mjs YYYY-MM-DD
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { caricaEnv } from './carica-env.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const radice = path.resolve(__dirname, '..');
const ENDPOINT = 'https://ollama.com/v1/chat/completions';
const MODELLO = 'deepseek-v4-pro';

const data = process.argv[2];
if (!data) {
  console.log(JSON.stringify({ stato: 'errore', motivo: 'data mancante' }));
  process.exit(1);
}

const bozza = path.join(radice, '.tmp', `bozza-${data}.md`);
if (!fs.existsSync(bozza)) {
  console.log(JSON.stringify({ stato: 'errore', motivo: 'bozza non trovata', percorso: bozza }));
  process.exit(1);
}

const testoBozza = fs.readFileSync(bozza, 'utf8');

// Prompt di revisione identico al PIANO A (stesso criterio strutturale + qualità)
const sistema = `Sei un revisore editoriale del sito 'Il Vangelo come dono' (gospel). Devi valutare la bozza del giorno ${data}.`;

const userPrompt = `La bozza del giorno è:
---
${testoBozza}
---

Il sito ha una voce sola: il paragrafo 'La logica del dono', scritto in prima persona da Marcus Bachmann. Verifica DUE dimensioni:
A) STRUTTURA E ORTODOSSIA:
(1) il paragrafo è in prima persona come Marcus Bachmann e cita SOLO i suoi scritti (La Logica del Dono, La dialettica occultata, L'Illusione della Salvezza Tecnologica, o gli Esercizi) o la Scrittura del giorno, coerente col canone — niente citazioni inventate o fuori canone;
(2) nasce davvero dalle letture del giorno e non è un pezzo di teoria buono per qualunque pericope;
(3) rubricatura completa (frontmatter, letture del giorno corrette, domanda finale, firma Marcus Bachmann).

B) QUALITÀ della scrittura:
(4) tono: niente gergo, niente predica, l'ironia apre il testo invece di appesantirlo;
(5) fedeltà alla voce di Bachmann: concetti (grammatica del dono vs necessità, kenosi, punto di tangenza, santificazione del cosmo) usati con precisione;
(6) densità e valore: c'è un gancio (esegesi con citazione, movimento dono-vs-economia, domanda finale), testo pubblicabile e dignitoso;
(7) niente formule di repertorio o schemi identici ai giorni precedenti.

Rispondi SOLO con: 'APPROVATA' se struttura ORTODOSSA E qualità sufficiente; oppure 'RIGENERA - motivo preciso' (indica cosa correggere e perché). Niente altro.`;

caricaEnv(radice);
if (!process.env.OLLAMA_API_KEY) {
  console.log(JSON.stringify({ stato: 'errore', motivo: 'OLLAMA_API_KEY mancante' }));
  process.exit(1);
}

const ctrl = new AbortController();
const t = setTimeout(() => ctrl.abort(), 180000);
let r;
try {
  r = await fetch(ENDPOINT, {
    method: 'POST',
    signal: ctrl.signal,
    headers: {
      Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODELLO,
      messages: [
        { role: 'system', content: sistema },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1500,
    }),
  });
} catch (e) {
  clearTimeout(t);
  console.log(JSON.stringify({ stato: 'errore', motivo: e?.name === 'AbortError' ? 'timeout provider' : 'provider non raggiungibile' }));
  process.exit(1);
}
clearTimeout(t);

if (!r.ok) {
  console.log(JSON.stringify({ stato: 'errore', motivo: `provider ${r.status}` }));
  process.exit(1);
}

const j = await r.json();
const msg = j?.choices?.[0]?.message || {};
const testo = (msg?.content || msg?.reasoning || '').trim();
const approvata = /APPROVATA/i.test(testo);
console.log(JSON.stringify({
  stato: approvata ? 'approvata' : 'rigenera',
  revisore: 'deepseek-v4-pro',
  piano: 'B',
  verdetto: testo,
}));
