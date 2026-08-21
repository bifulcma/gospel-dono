// Revisione qualità terzo revisore (mistral-large-3) via API ollama cloud (ZDR, EU).
// Uso: node scripts/revisiona-glm.mjs YYYY-MM-DD
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { caricaEnv } from './carica-env.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const radice = path.resolve(__dirname, '..');
const ENDPOINT = 'https://ollama.com/v1/chat/completions';
const MODELLO = 'mistral-large-3:675b';

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

const sistema = `Sei un revisore editoriale del sito 'Il Vangelo come dono' (gospel). Devi valutare la bozza del giorno ${data}.`;

const userPrompt = `La bozza del giorno è:
---
${testoBozza}
---

Verifica DUE dimensioni:
A) STRUTTURA E ORTODOSSIA:
(1) ogni voce (cattolica, protestante, dispensazionalista) è in prima persona confessionale e cita SOLO il proprio canone (Balthasar/Marion/CCC per la cattolica; Lutero/Calvino/Bonhoeffer per la protestante; Scofield/Darby/Ryrie per la dispensazionalista) — niente citazioni inventate o fuori canone;
(2) il paragrafo 'La logica del dono' è in prima persona come Marcus Bachmann e cita SOLO i suoi scritti (La Logica del Dono, La dialettica occultata, L'Illusione della Salvezza Tecnologica, o gli Esercizi), coerente col canone;
(3) rubricatura completa (frontmatter, letture del giorno corrette, domanda finale per sezione).

B) QUALITÀ della scrittura:
(4) tono: niente caricature confessionali ('i cattolici credono che', stereotipi), niente gergo;
(5) fedeltà alla voce di Bachmann: concetti (grammatica del dono vs necessità, kenosi, punto di tangenza, santificazione del cosmo) usati con precisione, senza sconfinare nel lessico altrui;
(6) densità e valore: ogni voce ha un gancio (esegesi con citazione, movimento spirituale, domanda finale), testo pubblicabile e dignitoso;
(7) coerenza interna tra le sezioni.

Rispondi SOLO con: 'APPROVATA' se struttura ORTODOSSA E qualità sufficiente; oppure 'RIGENERA - motivo preciso' (indica la voce o sezione da correggere e perché). Niente altro.`;

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
  revisore: 'mistral-large-3',
  piano: 'A',
  verdetto: testo,
}));
