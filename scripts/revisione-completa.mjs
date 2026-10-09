#!/usr/bin/env node
// Revisione qualità completa in un colpo solo.
// PIANO A = claude (headless) + glm-5.3 (API ollama-cloud) + mistral-large-3 (API ollama-cloud).
// PIANO B = deepseek-v4-pro (API), se il piano A non produce nemmeno un verdetto.
//
// PERCHÉ QUESTO SCRIPT: legge la bozza DA DISCO e la incolla nei prompt dei revisori.
// Così il testo del giorno non entra mai nel contesto dell'agente del cron: prima ogni
// passo del cron rispediva al modello tutto il contenuto accumulato (~466k token di prompt
// per lancio), ora restano solo poche centinaia di token di verdetto.
//
// Uso:  node scripts/revisione-completa.mjs YYYY-MM-DD
// Output: UNA riga JSON compatta. Mai token, mai header, mai contenuto lungo.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { caricaEnv } from './carica-env.mjs';

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
caricaEnv(RADICE);

const ENDPOINT = 'https://ollama.com/v1/chat/completions';
const TRONCO = 200; // i verdetti entrano nel contesto dell'agente troncati: basta il succo
const TIMEOUT_API_MS = 180000;
const TIMEOUT_CLAUDE_MS = 150000;

const data = process.argv[2];
function esci(obj, codice = 0) {
  console.log(JSON.stringify(obj));
  process.exit(codice);
}

if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) esci({ stato: 'errore', motivo: 'indicare la data YYYY-MM-DD' }, 1);
const percorsoBozza = path.join(RADICE, '.tmp', `bozza-${data}.md`);
if (!fs.existsSync(percorsoBozza)) esci({ stato: 'errore', motivo: 'bozza non trovata', percorso: percorsoBozza }, 1);
const testoBozza = fs.readFileSync(percorsoBozza, 'utf8');

// Criterio di revisione: identico al PIANO A storico (struttura/ortodossia + qualità).
const PROMPT = `La bozza del giorno è:
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

const SISTEMA = 'Sei un revisore editoriale. Rispondi SOLO con APPROVATA oppure RIGENERA - motivo preciso.';

function verdettoDa(testo) {
  const righe = String(testo || '').split(/\n+/).map((s) => s.trim()).filter(Boolean);
  const riga = righe.find((s) => /^(APPROVATA|RIGENERA)/i.test(s)) || String(testo || '').trim();
  return { approvata: /^APPROVATA/i.test(riga), breve: riga.slice(0, TRONCO).replace(/\s+/g, ' ') };
}

async function revisoreApi(nome, modello) {
  if (!process.env.OLLAMA_API_KEY) return { nome, disponibile: false, motivo: 'OLLAMA_API_KEY mancante' };
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_API_MS);
  try {
    const r = await fetch(ENDPOINT, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modello,
        messages: [
          { role: 'system', content: SISTEMA },
          { role: 'user', content: PROMPT },
        ],
        max_tokens: 6000,
      }),
    });
    clearTimeout(t);
    if (!r.ok) {
      const coda = await r.text().catch(() => '');
      const quota = /usage limit|quota/i.test(coda);
      return { nome, disponibile: false, motivo: quota ? `quota esaurita (${r.status})` : `provider ${r.status}` };
    }
    const j = await r.json();
    const msg = j?.choices?.[0]?.message || {};
    const v = verdettoDa(msg.content || msg.reasoning || '');
    if (!v.breve) return { nome, disponibile: false, motivo: 'risposta vuota' };
    return { nome, disponibile: true, stato: v.approvata ? 'approvata' : 'rigenera', verdetto_breve: v.breve };
  } catch (e) {
    clearTimeout(t);
    return { nome, disponibile: false, motivo: e?.name === 'AbortError' ? 'timeout provider' : 'provider non raggiungibile' };
  }
}

function revisoreClaude() {
  return new Promise((resolve) => {
    let out = '';
    let err = '';
    let chiuso = false;
    let p;
    try {
      p = spawn('claude', ['-p', PROMPT], { env: process.env, cwd: RADICE });
    } catch {
      return resolve({ nome: 'claude', disponibile: false, motivo: 'claude non lanciabile' });
    }
    const t = setTimeout(() => {
      if (chiuso) return;
      chiuso = true;
      try { p.kill('SIGKILL'); } catch {}
      resolve({ nome: 'claude', disponibile: false, motivo: 'timeout claude' });
    }, TIMEOUT_CLAUDE_MS);

    p.stdout.on('data', (d) => (out += d.toString()));
    p.stderr.on('data', (d) => (err += d.toString()));
    p.on('error', () => {
      if (chiuso) return;
      chiuso = true;
      clearTimeout(t);
      resolve({ nome: 'claude', disponibile: false, motivo: 'claude non trovato' });
    });
    p.on('close', () => {
      if (chiuso) return;
      chiuso = true;
      clearTimeout(t);
      const testo = out.trim();
      if (!testo) return resolve({ nome: 'claude', disponibile: false, motivo: (err.trim() || 'nessun output').slice(0, 120).replace(/\s+/g, ' ') });
      if (!/(APPROVATA|RIGENERA)/i.test(testo) && /oauth|expired|login|authenticate/i.test(testo + err)) {
        return resolve({ nome: 'claude', disponibile: false, motivo: 'login claude scaduto' });
      }
      const v = verdettoDa(testo);
      resolve({ nome: 'claude', disponibile: true, stato: v.approvata ? 'approvata' : 'rigenera', verdetto_breve: v.breve });
    });
  });
}

// PIANO A — i tre revisori in parallelo
const pianoA = await Promise.all([
  revisoreClaude(),
  revisoreApi('glm-5.3', 'glm-5.3'),
  revisoreApi('mistral-large-3', 'mistral-large-3:675b'),
]);

let piano = 'A';
let revisori = pianoA;
let disponibili = pianoA.filter((r) => r.disponibile);

// PIANO B — solo se il piano A tace del tutto
if (disponibili.length === 0) {
  const b = await revisoreApi('deepseek-v4-pro', 'deepseek-v4-pro');
  piano = 'B';
  revisori = [b];
  disponibili = b.disponibile ? [b] : [];
}

const approvate = disponibili.filter((r) => r.stato === 'approvata').length;
const rigenera = disponibili.filter((r) => r.stato === 'rigenera').length;
const maggioranza =
  disponibili.length === 0 ? 'nessun_revisore' : approvate > rigenera ? 'approvata' : rigenera > approvate ? 'rigenera' : 'pari';

esci({
  stato: 'ok',
  data,
  piano,
  disponibili: disponibili.length,
  approvate,
  rigenera,
  maggioranza,
  revisori: revisori.map((r) =>
    r.disponibile
      ? { nome: r.nome, stato: r.stato, verdetto_breve: r.verdetto_breve }
      : { nome: r.nome, disponibile: false, motivo: r.motivo }
  ),
});
