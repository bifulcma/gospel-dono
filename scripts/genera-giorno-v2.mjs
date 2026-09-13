#!/usr/bin/env node
// genera-giorno-v2.mjs — TEST anti-ripetizione
// Rigenera la bozza del giorno con due mosse del panel:
//   1. memoriale: gli ultimi 4 commenti pubblicati (aperture estratte) finiscono
//      nel prompt con divieto di riusare aperture, snodi e formule.
//   2. rotazione: l'angolo di ingresso del giorno è scelto da un calendario a
//      rotazione (7 porte), annotato nel frontmatter.
// NON committa nulla: lascia la bozza in .tmp/bozza-v2-YYYY-MM-DD.md.
//
// Uso: node scripts/genera-giorno-v2.mjs [YYYY-MM-DD]

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { caricaEnv } from './carica-env.mjs';

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
caricaEnv(RADICE);

const { lettureCattoliche } = await import(new URL('../lib/lezionario.js', import.meta.url));
const { generaCommento, aiDisponibile } = await import(new URL('../lib/ai.js', import.meta.url));

function esci(obj, codice = 0) {
  console.log(JSON.stringify(obj));
  process.exit(codice);
}

const data =
  process.argv[2] || new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });
if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) esci({ stato: 'errore', dettaglio: 'data non valida' }, 1);

const leggi = (rel) => fs.readFileSync(path.join(RADICE, rel), 'utf8');

// --- 1. MEMORIALE: ultimi 4 giorni pubblicati ---
const N_GIORNI = 4; // limite di Marco: pochi giorni, prompt leggero
function ultimiCommenti(n) {
  const dir = path.join(RADICE, 'content');
  const files = fs
    .readdirSync(dir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f) && f < data + '.md')
    .sort();
  return files.slice(-n).map((f) => {
    const testo = fs.readFileSync(path.join(dir, f), 'utf8');
    const corpo = testo.split('## La logica del dono')[1] || '';
    const paragrafo = corpo.split('\n').filter((l) => l.trim() && !/^\*Marcus/.test(l.trim())).join(' ').trim();
    return { data: f.replace('.md', ''), testo: paragrafo.slice(0, 700) }; // tronco: basta l'incipit + snodi
  });
}

// --- 2. ROTAZIONE: 7 porte d'ingresso ---
const PORTE = [
  'una domanda diretta al lettore',
  'una scena quotidiana concreta',
  'una parola-chiave del Vangelo presa sul serio',
  'un contrasto netto (due grammatiche a confronto)',
  'un silenzio o un assenza notevole nel testo',
  'un personaggio minore della pericope',
  'una citazione del canone che apre la scena',
];
const giorniDaEpoca = Math.floor(new Date(data + 'T00:00:00Z').getTime() / 86400000);
const portaOggi = PORTE[giorniDaEpoca % PORTE.length];

// --- 3. CANCELLO: controllo sovrapposizione n-grammi con gli ultimi N giorni ---
function ngrammi(testo, n) {
  const parole = testo.toLowerCase().replace(/[«».,;:!?()—']/g, ' ').split(/\s+/).filter(Boolean);
  const set = new Set();
  for (let i = 0; i + n <= parole.length; i++) set.add(parole.slice(i, i + n).join(' '));
  return set;
}
function sovrapposizione(bozza, passati) {
  const NUOVI = 5; // 5 parole consecutive
  const setNuovo = ngrammi(bozza, NUOVI);
  let hits = [];
  for (const p of passati) {
    const setP = ngrammi(p.testo, NUOVI);
    for (const g of setNuovo) if (setP.has(g)) hits.push({ giorno: p.data, gram: g });
  }
  return hits;
}

// --- costruzione prompt con memoriale ---
const memoriale = ultimiCommenti(N_GIORNI);
const memorialeTxt = memoriale
  .map((m) => `— ${m.data}:\n"${m.testo}"`)
  .join('\n\n');

const c = await lettureCattoliche(data);
if (!c) esci({ stato: 'errore', dettaglio: 'lezionario non raggiungibile' }, 1);
if (!aiDisponibile()) esci({ stato: 'errore', dettaglio: 'OLLAMA_API_KEY mancante' }, 1);

const system = `${leggi('prompts/bachmann.md')}\n\n---\n\nIL TUO CANONE (unica fonte citabile):\n\n${leggi('canon/bachmann.md')}\n\n---\n\n## MEMORIA ANTI-RIPETIZIONE\nEcco i tuoi ultimi ${memoriale.length} paragrafi pubblicati. DIVIETO TASSATIVO: non riusare nessuna apertura, nessuno snodo concettuale, nessuna formula già presente qui (parole chiave come "grammatica della necessità", "non-economia", "contabilità", "punto di tangenza", "tesoro", "conto corrente" sono GIÀ USATI: o non compariranno, o ruoterai completamente il contesto in cui vivono):\n\n${memoriale.map((m) => `— ${m.data}: "${m.testo}"`).join('\n\n')}\n\n## PORTA D'INGRESSO DI OGGI (obbligatoria)\nOggi il commento DEVE partire da: ${portaOggi}.\nNon dichiararla esplicitamente: che si veda nella costruzione.`;

const user = `${c.vangelo_testo ? `Vangelo del giorno:\n${c.vangelo_testo}\n\n` : ''}Scrivi il paragrafo "La logica del dono" di oggi.`;

let dono = await generaCommento({ system, user });
if (!dono) esci({ stato: 'errore', dettaglio: 'generazione vuota' }, 1);
if (!/Marcus Bachmann/.test(dono)) dono += '\n\n*Marcus Bachmann*';

// --- 4. CANCELLO post-generazione ---
const hits = sovrapposizione(dono, memoriale);
const esitoCancello = {
  ngram_rispettati: hits.length === 0,
  collisioni: hits.slice(0, 5).map((h) => h.gram),
};

// --- bozza v2 ---
const dirTmp = path.join(RADICE, '.tmp');
fs.mkdirSync(dirTmp, { recursive: true });
const percorso = path.join(dirTmp, `bozza-v2-${data}.md`);
const q = (v) => JSON.stringify(v || null);
const md = `---
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
generato: "ai-hermes-v2"
porta: ${q(portaOggi)}
memoriale_giorni: ${memoriale.length}
cancello: ${JSON.stringify(esitoCancello)}
---

## La logica del dono

${dono}
`;
fs.writeFileSync(percorso, md);

esci({
  stato: 'bozza-v2',
  data,
  percorso,
  porta: portaOggi,
  memoriale_giorni: memoriale.map((m) => m.data),
  cancello: esitoCancello,
});