// Revisione qualità PIANO B (fallback): deepseek-v4-pro controlla la bozza
// quando herdr (claude/kimi) non è disponibile. Niente token in output.
// Se anche il cloud non risponde, la bozza la legge il modello locale del Mac
// Studio (riserva della riserva): gratis e privato, ma più piccolo.
// Uso: node scripts/revisiona-fallback.mjs YYYY-MM-DD
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { caricaEnv } from './carica-env.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const radice = path.resolve(__dirname, '..');

const CLOUD = {
  revisore: 'deepseek-v4-pro',
  endpoint: 'https://ollama.com/v1/chat/completions',
  attesa: 180000,
  corpo: (messages) => ({ model: 'deepseek-v4-pro', messages, max_tokens: 1500 }),
  testo: (j) => {
    const msg = j?.choices?.[0]?.message || {};
    return msg?.content || msg?.reasoning || '';
  },
};

// Lo Studio si raggiunge dal Mac mini attraverso il tunnel via cavo
// (strumenti/tunnel-studio nel vault: Mini 127.0.0.1:11435 → Studio 11434).
// API nativa di Ollama per spegnere il ragionamento: qui serve un verdetto
// secco, e i 1500 token non devono finire nel «pensiero».
const STUDIO = {
  revisore: 'qwen3.8 (Mac Studio, locale)',
  endpoint: 'http://127.0.0.1:11435/api/chat',
  attesa: 600000,
  corpo: (messages) => ({
    model: 'qwen3.8-4bit-256k', messages, stream: false, think: false,
    options: { num_predict: 1500 },
  }),
  testo: (j) => j?.message?.content || '',
};

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

const messages = [
  { role: 'system', content: sistema },
  { role: 'user', content: userPrompt },
];

// Una domanda a un revisore: { testo } se ha risposto, { errore } se no.
async function chiedi(p, chiave) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), p.attesa);
  try {
    const r = await fetch(p.endpoint, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(chiave ? { Authorization: `Bearer ${chiave}` } : {}),
      },
      body: JSON.stringify(p.corpo(messages)),
    });
    if (!r.ok) return { errore: `provider ${r.status}` };
    const testo = p.testo(await r.json()).trim();
    return testo ? { testo } : { errore: 'risposta vuota' };
  } catch (e) {
    return { errore: e?.name === 'AbortError' ? 'timeout provider' : 'provider non raggiungibile' };
  } finally {
    clearTimeout(t);
  }
}

caricaEnv(radice);
const chiave = process.env.OLLAMA_API_KEY;

let revisore = CLOUD;
let esito = chiave ? await chiedi(CLOUD, chiave) : { errore: 'OLLAMA_API_KEY mancante' };
let nota;
if (esito.errore) {
  nota = `cloud non disponibile (${esito.errore}): ha letto lo Studio`;
  revisore = STUDIO;
  const cloud = esito.errore;
  esito = await chiedi(STUDIO);
  if (esito.errore) {
    console.log(JSON.stringify({ stato: 'errore', motivo: `cloud: ${cloud}; Studio: ${esito.errore}` }));
    process.exit(1);
  }
}

const approvata = /APPROVATA/i.test(esito.testo);
console.log(JSON.stringify({
  stato: approvata ? 'approvata' : 'rigenera',
  revisore: revisore.revisore,
  piano: 'B',
  verdetto: esito.testo,
  ...(nota ? { nota } : {}),
}));
