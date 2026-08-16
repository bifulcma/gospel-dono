#!/usr/bin/env node
// Genera la BOZZA del giorno (3 voci confessionali + paragrafo Bachmann) SENZA committarla.
// Percorso guidato da Hermes: la revisione qualitativa avviene dopo, la pubblicazione
// la fa scripts/commit-giorno.mjs.
//
// Uso:  node scripts/genera-giorno.mjs [YYYY-MM-DD]   (default: oggi, Europe/Paris)
// Output su stdout: una riga JSON. Bozza in .tmp/bozza-YYYY-MM-DD.md.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { caricaEnv } from './carica-env.mjs';

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
caricaEnv(RADICE);

const { lettureCattoliche } = await import(new URL('../lib/lezionario.js', import.meta.url));
const { generaCommento, aiDisponibile } = await import(new URL('../lib/ai.js', import.meta.url));

const VOCI = ['cattolica', 'protestante', 'dispensazionalista'];

function esci(obj, codice = 0) {
  console.log(JSON.stringify(obj));
  process.exit(codice);
}

const data =
  process.argv[2] || new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });
if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) esci({ stato: 'errore', dettaglio: 'data non valida (YYYY-MM-DD)' }, 1);

const fileContenuto = path.join(RADICE, 'content', data + '.md');
if (fs.existsSync(fileContenuto)) esci({ stato: 'presente', data });
if (!aiDisponibile()) esci({ stato: 'errore', dettaglio: 'OLLAMA_API_KEY mancante (.env.local o ~/.hermes/.env)' }, 1);

const leggi = (rel) => fs.readFileSync(path.join(RADICE, rel), 'utf8');

function pericopeCattolica(c) {
  return (
    `Lezionario cattolico del giorno (${c.titolo || 'titolo da inserire'}).\n` +
    `Vangelo: ${c.vangelo || 'DA INSERIRE'}\n` +
    (c.vangelo_testo ? `Testo del Vangelo:\n${c.vangelo_testo}\n` : '') +
    `Prima lettura: ${c.prima || 'DA INSERIRE'}\n` +
    (c.prima_testo ? `Testo della prima lettura:\n${c.prima_testo}\n` : '') +
    (c.seconda ? `Seconda lettura: ${c.seconda}\n` : '') +
    (c.seconda_testo ? `Testo della seconda lettura:\n${c.seconda_testo}\n` : '') +
    `Salmo: ${c.salmo || 'DA INSERIRE'}\n`
  );
}

function promptVoce(voce, c) {
  return {
    system: `${leggi(`prompts/voce-${voce}.md`)}\n\n---\n\nCANONE DI FONTI (le sole fonti citabili):\n\n${leggi(`canon/${voce}.md`)}`,
    user: `${pericopeCattolica(c)}\nScrivi il commento del giorno seguendo la rubrica fissa. Rispondi con il SOLO testo del commento, senza titoli né premesse.`,
  };
}

function promptBachmann(c) {
  return {
    system: `${leggi('prompts/bachmann.md')}\n\n---\n\nIL TUO CANONE (il tuo libro, unica fonte citabile):\n\n${leggi('canon/bachmann.md')}`,
    user: `${pericopeCattolica(c)}\nScrivi il paragrafo "La logica del dono" di oggi.`,
  };
}

function comporreMD(c, bozze, dono) {
  const q = (v) => JSON.stringify(v || null);
  return `---
data: "${data}"
titolo: ${q(c.titolo)}
vangelo: ${q(c.vangelo)}
prima_lettura: ${q(c.prima)}
seconda_lettura: ${q(c.seconda)}
salmo: ${q(c.salmo)}
vangelo_testo: ${q(c.vangelo_testo)}
prima_testo: ${q(c.prima_testo)}
seconda_testo: ${q(c.seconda_testo)}
salmo_testo: ${q(c.salmo_testo)}
demo: false
generato: "ai-hermes"
---

## La logica del dono

${dono}

## Voce cattolica

${bozze.cattolica}

## Voce protestante

${bozze.protestante}

## Voce dispensazionalista

${bozze.dispensazionalista}
`;
}

try {
  const c = await lettureCattoliche(data);
  if (!c) esci({ stato: 'errore', dettaglio: 'lezionario cattolico non raggiungibile' }, 1);

  const bozze = {};
  let dono = '';
  await Promise.all([
    generaCommento(promptBachmann(c)).then((t) => { dono = t; }),
    ...VOCI.map(async (voce) => {
      bozze[voce] = await generaCommento(promptVoce(voce, c));
    }),
  ]);
  if (dono && !/Marcus Bachmann/.test(dono)) dono += '\n\n*Marcus Bachmann*';
  if (!dono) esci({ stato: 'errore', dettaglio: 'paragrafo Bachmann non generato' }, 1);

  const dirTmp = path.join(RADICE, '.tmp');
  fs.mkdirSync(dirTmp, { recursive: true });
  const percorso = path.join(dirTmp, `bozza-${data}.md`);
  fs.writeFileSync(percorso, comporreMD(c, bozze, dono));

  esci({
    stato: 'bozza',
    data,
    percorso,
    voci: { ...Object.fromEntries(VOCI.map((v) => [v, Boolean(bozze[v])])), bachmann: Boolean(dono) },
  });
} catch (e) {
  esci({ stato: 'errore', dettaglio: String(e?.message || e).slice(0, 300) }, 1);
}
