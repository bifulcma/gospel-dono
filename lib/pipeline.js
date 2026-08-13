import fs from 'fs';
import path from 'path';
import { esisteGiorno } from './content.js';
import { lettureCattoliche, lettureOrtodosseConTesto } from './lezionario.js';

const RADICE = process.cwd();
const VOCI = ['cattolica', 'ortodossa', 'protestante', 'dispensazionalista'];

function leggi(rel) {
  return fs.readFileSync(path.join(RADICE, rel), 'utf8');
}

// Assembla il prompt completo di una voce: system prompt + canone + pericope del giorno.
// È quello che in futuro verrà passato al provider AI (vedi README).
export function assemblaPrompt(voce, letture) {
  if (!VOCI.includes(voce)) throw new Error('voce sconosciuta: ' + voce);
  const sistema = leggi(`prompts/voce-${voce}.md`);
  const canone = leggi(`canon/${voce}.md`);
  const pericope =
    voce === 'ortodossa'
      ? `Lezionario bizantino del giorno — Vangelo: ${letture?.ortodosse?.vangelo || 'DA INSERIRE'}; Epistola: ${letture?.ortodosse?.epistola || 'DA INSERIRE'}`
      : `Lezionario cattolico del giorno (${letture?.cattoliche?.titolo || 'titolo da inserire'}) — Vangelo: ${letture?.cattoliche?.vangelo || 'DA INSERIRE'}; Prima lettura: ${letture?.cattoliche?.prima || 'DA INSERIRE'}; Salmo: ${letture?.cattoliche?.salmo || 'DA INSERIRE'}`;
  return {
    system: `${sistema}\n\n---\n\nCANONE DI FONTI (le sole fonti citabili):\n\n${canone}`,
    user: `${pericope}\n\nScrivi il commento del giorno seguendo la rubrica fissa.`,
  };
}

export function assemblaPromptEditor(bozze) {
  const sistema = leggi('prompts/editor-checklist.md');
  const corpo = Object.entries(bozze)
    .map(([voce, testo]) => `### Bozza voce ${voce}\n\n${testo}`)
    .join('\n\n');
  return { system: sistema, user: corpo };
}

const SEGNAPOSTO = (voce) =>
  `*Commento non ancora generato per questa voce (${voce}). ` +
  `L'infrastruttura è pronta: collegare il provider AI come descritto nel README, ` +
  `oppure scrivere il commento a mano in questo file.*`;

function scaffoldMD(data, letture) {
  const c = letture?.cattoliche || {};
  const o = letture?.ortodosse || {};
  const q = (v) => JSON.stringify(v || 'DA INSERIRE');
  return `---
data: "${data}"
titolo: ${q(c.titolo)}
vangelo: ${q(c.vangelo)}
prima_lettura: ${q(c.prima)}
salmo: ${q(c.salmo)}
vangelo_testo: ${q(c.vangelo_testo)}
prima_testo: ${q(c.prima_testo)}
salmo_testo: ${q(c.salmo_testo)}
vangelo_ortodosso: ${q(o.vangelo)}
epistola_ortodossa: ${q(o.epistola)}
vangelo_ortodosso_testo: ${q(o.vangelo_testo)}
epistola_ortodossa_testo: ${q(o.epistola_testo)}
demo: false
generato: "scaffold"
---

## La logica del dono

${SEGNAPOSTO('principale — firma Marcus Bachmann')}

## Voce cattolica

${SEGNAPOSTO('cattolica')}

## Voce ortodossa

${SEGNAPOSTO('ortodossa')}

## Voce protestante

${SEGNAPOSTO('protestante')}

## Voce dispensazionalista

${SEGNAPOSTO('dispensazionalista')}
`;
}

// Pipeline del giorno: letture → prompt → (futura generazione AI) → file content/DATA.md
export async function generaGiorno(data) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return { stato: 'errore', dettaglio: 'data non valida' };
  if (esisteGiorno(data)) return { stato: 'presente', data };

  const [cattoliche, ortodosse] = await Promise.all([
    lettureCattoliche(data),
    lettureOrtodosseConTesto(data),
  ]);
  const letture = { cattoliche, ortodosse };

  // I 5 prompt sono pronti: qui in futuro andranno le chiamate al provider AI (vedi README).
  const prompts = {};
  for (const voce of VOCI) prompts[voce] = assemblaPrompt(voce, letture);

  const file = path.join(RADICE, 'content', data + '.md');
  fs.writeFileSync(file, scaffoldMD(data, letture));

  return {
    stato: 'creato',
    data,
    letture: {
      cattoliche: cattoliche ? 'ok' : 'non raggiungibili (inserire a mano)',
      ortodosse: ortodosse ? 'ok' : 'non raggiungibili (inserire a mano)',
    },
    prompts_pronti: Object.fromEntries(
      Object.entries(prompts).map(([v, p]) => [v, p.system.length + p.user.length + ' caratteri'])
    ),
    nota: 'Commenti segnaposto scritti. Collegare la generazione AI: vedi README.',
  };
}
