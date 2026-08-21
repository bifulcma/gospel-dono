// Feedback editoriale su "La Logica del Dono" (serie C) via mistral-large-3 API (ZDR, EU).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const radice = path.resolve(__dirname, '..');
const ENDPOINT = 'https://ollama.com/v1/chat/completions';
const MODELLO = 'mistral-large-3:675b';

// carica .env (progetto + ~/.hermes/.env)
const envPaths = [path.join(radice, '.env'), path.join(radice, '.env.local'), path.join(process.env.HOME, '.hermes', '.env')];
for (const p of envPaths) {
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
if (!process.env.OLLAMA_API_KEY) {
  console.log(JSON.stringify({ stato: 'errore', motivo: 'OLLAMA_API_KEY mancante' }));
  process.exit(1);
}

// concatena i file C in ordine
const dir = '/Users/marcobifulco/Documents/GitHub/secondo-mb/libri-esalogia/_lavoro';
const files = fs.readdirSync(dir)
  .filter(f => /^\d+-C-/.test(f))
  .sort((a, b) => parseInt(a) - parseInt(b));

let testo = '';
for (const f of files) {
  testo += `\n\n===== FILE: ${f} =====\n` + fs.readFileSync(path.join(dir, f), 'utf8');
}
console.log(JSON.stringify({ stato: 'ok', file: files.length, caratteri: testo.length }));

const sistema = `Sei un editor letterario e teologo cattolico colto. Devi dare un feedback critico, onesto e concreto su un manoscritto filosofico-teologico. Rispondi in italiano.`;

const userPrompt = `Ecco il manoscritto completo "La Logica del Dono" (serie C, ${files.length} file, ${testo.length} caratteri):

---
${testo}
---

Dammi un feedback editoriale strutturato:
1. PUNTI DI FORZA (3-5, specifici con riferimenti ai capitoli)
2. DEBOLEZZE / PROBLEMI (3-5, specifici: argomentativi, strutturali, stilistici, teologici)
3. COERENZA INTERNA: contraddizioni, ripetizioni, capitoli che non reggono
4. SUGGERIMENTI CONCRETI di revisione (prioritizzati)
5. VOTO FINALE UK (1-10) con una riga di motivazione

Sii severo e specifico, cita i capitoli per nome. Niente lodi generiche.`;

const ctrl = new AbortController();
const t = setTimeout(() => ctrl.abort(), 300000);
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
      max_tokens: 4000,
    }),
  });
} catch (e) {
  clearTimeout(t);
  console.log(JSON.stringify({ stato: 'errore', motivo: e?.name === 'AbortError' ? 'timeout provider' : 'provider non raggiungibile' }));
  process.exit(1);
}
clearTimeout(t);

const data = await r.json();
if (!r.ok) {
  console.log(JSON.stringify({ stato: 'errore', motivo: data?.error?.message || r.status }));
  process.exit(1);
}
const risposta = data?.choices?.[0]?.message?.content || '';
console.log('\n===== FEEDBACK GLM-5.2 =====\n');
console.log(risposta);
