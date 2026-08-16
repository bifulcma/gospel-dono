import fs from 'fs';
import path from 'path';
import { esisteGiorno } from './content.js';
import { lettureCattoliche } from './lezionario.js';
import { generaCommento, aiDisponibile } from './ai.js';
import { commitSuGitHub, githubDisponibile } from './github.js';

// Import statici dei testi (webpack asset/source, vedi next.config.mjs): i .md
// restano l'unica fonte e vengono incorporati nel bundle della funzione Vercel.
// Niente fs.readFileSync a runtime: su /var/task quei file non esistono.
import promptCattolica from '../prompts/voce-cattolica.md';
import promptProtestante from '../prompts/voce-protestante.md';
import promptDispensazionalista from '../prompts/voce-dispensazionalista.md';
import promptBachmann from '../prompts/bachmann.md';
import promptEditor from '../prompts/editor-checklist.md';
import canonCattolica from '../canon/cattolica.md';
import canonProtestante from '../canon/protestante.md';
import canonDispensazionalista from '../canon/dispensazionalista.md';
import canonBachmann from '../canon/bachmann.md';

const RADICE = process.cwd();
const VOCI = ['cattolica', 'protestante', 'dispensazionalista'];
const MAX_GIRI_EDITOR = 2; // rigenerazioni massime dopo il primo passaggio (regola README)

const PROMPTS = {
  cattolica: promptCattolica,
  protestante: promptProtestante,
  dispensazionalista: promptDispensazionalista,
};
const CANONI = {
  cattolica: canonCattolica,
  protestante: canonProtestante,
  dispensazionalista: canonDispensazionalista,
};

function pericopeCattolica(letture) {
  const c = letture?.cattoliche || {};
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

// Assembla il prompt di una voce confessionale: system + canone + pericope con testi.
export function assemblaPrompt(voce, letture) {
  if (!VOCI.includes(voce)) throw new Error('voce sconosciuta: ' + voce);
  return {
    system: `${PROMPTS[voce]}\n\n---\n\nCANONE DI FONTI (le sole fonti citabili):\n\n${CANONI[voce]}`,
    user: `${pericopeCattolica(letture)}\nScrivi il commento del giorno seguendo la rubrica fissa. Rispondi con il SOLO testo del commento, senza titoli né premesse.`,
  };
}

// Il paragrafo "La logica del dono": Marcus Bachmann in prima persona, dal SUO canone.
// Nessuna bozza delle voci nel contesto: nasce solo da letture + pensiero di Bachmann.
export function assemblaPromptBachmann(letture) {
  return {
    system: `${promptBachmann}\n\n---\n\nIL TUO CANONE (il tuo libro, unica fonte citabile):\n\n${canonBachmann}`,
    user: `${pericopeCattolica(letture)}\nScrivi il paragrafo "La logica del dono" di oggi.`,
  };
}

export function assemblaPromptEditor(bozze, letture) {
  const c = letture?.cattoliche || {};
  const contesto =
    `PERICOPI DEL GIORNO — Vangelo ${c.vangelo || '—'}; prima lettura ${c.prima || '—'}; ` +
    `${c.seconda ? `seconda lettura ${c.seconda}; ` : ''}salmo ${c.salmo || '—'}.`;
  const corpo = Object.entries(bozze)
    .map(([voce, testo]) => `### Bozza voce ${voce}\n\n${testo}`)
    .join('\n\n');
  return { system: promptEditor, user: `${contesto}\n\n${corpo}` };
}

// Estrae dall'output dell'editor i verdetti per le tre voci.
export function analizzaEditor(testo) {
  const verdetti = {};
  for (const voce of VOCI) {
    const m = testo.match(new RegExp(`^VERDETTO\\s+${voce}\\s*:\\s*(APPROVATA|RIGENERA)(?:\\s*[—–-]\\s*(.+))?$`, 'im'));
    verdetti[voce] = m
      ? { esito: m[1].toUpperCase(), motivo: (m[2] || '').trim() }
      : { esito: 'APPROVATA', motivo: '' }; // verdetto assente = non bloccare la pubblicazione
  }
  return verdetti;
}

function comporreMD(data, letture, bozze, dono, opzioni = {}) {
  const c = letture?.cattoliche || {};
  const q = (v) => JSON.stringify(v || null);
  const nota = opzioni.notaEditoriale
    ? `nota_editoriale: ${JSON.stringify(opzioni.notaEditoriale)}\n`
    : '';
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
generato: "ai"
${nota}---

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

// Pipeline del giorno: letture → Bachmann + 3 voci in parallelo → editor (checklist,
// max 2 rigenerazioni, poi nota) → salvataggio (commit GitHub in produzione, fs in locale).
export async function generaGiorno(data) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return { stato: 'errore', dettaglio: 'data non valida' };
  if (esisteGiorno(data)) return { stato: 'presente', data };
  if (!aiDisponibile()) return { stato: 'errore', dettaglio: 'OLLAMA_API_KEY mancante nelle env' };

  const cattoliche = await lettureCattoliche(data);
  if (!cattoliche) return { stato: 'errore', dettaglio: 'lezionario cattolico non raggiungibile: riprovare' };
  const letture = { cattoliche };

  // 1) Bachmann (dal suo canone, senza vedere le voci) + le 3 voci, tutto in parallelo
  const bozze = {};
  let dono = '';
  await Promise.all([
    generaCommento(assemblaPromptBachmann(letture)).then((t) => { dono = t; }),
    ...VOCI.map(async (voce) => {
      bozze[voce] = await generaCommento(assemblaPrompt(voce, letture));
    }),
  ]);
  if (dono && !/Marcus Bachmann/.test(dono)) dono += '\n\n*Marcus Bachmann*';
  if (!dono) return { stato: 'errore', dettaglio: "Bachmann non ha prodotto il paragrafo 'La logica del dono'" };

  // 2) loop editoriale sulle 3 voci: verifica checklist, rigenera le respinte (max 2 giri)
  let verdetti = analizzaEditor(await generaCommento(assemblaPromptEditor(bozze, letture), 8000));
  let giri = 0;
  let respinte = VOCI.filter((v) => verdetti[v].esito === 'RIGENERA');
  while (respinte.length && giri < MAX_GIRI_EDITOR) {
    giri++;
    await Promise.all(
      respinte.map(async (voce) => {
        const p = assemblaPrompt(voce, letture);
        p.user += `\n\nNOTA DEL REDATTORE — la bozza precedente è stata respinta per questo motivo: "${verdetti[voce].motivo || 'non conforme alla checklist'}". Riscrivi il commento correggendo esattamente questo difetto.`;
        bozze[voce] = await generaCommento(p);
      })
    );
    verdetti = analizzaEditor(await generaCommento(assemblaPromptEditor(bozze, letture), 8000));
    respinte = VOCI.filter((v) => verdetti[v].esito === 'RIGENERA');
  }

  // 3) se dopo i giri restano voci respinte, si pubblica con nota (regola README)
  const notaEditoriale = respinte.length
    ? `Pubblicato con riserva dopo ${giri} rigenerazioni — voci non conformi: ` +
      respinte.map((v) => `${v} (${verdetti[v].motivo || 'motivo non indicato'})`).join('; ')
    : null;

  const md = comporreMD(data, letture, bozze, dono, { notaEditoriale });

  // 4) salvataggio
  let salvataggio;
  if (githubDisponibile()) {
    const { commit } = await commitSuGitHub(
      `content/${data}.md`,
      md,
      `contenuto ${data} (generazione automatica giornaliera)`
    );
    salvataggio = `github (commit ${commit || 'ok'}) — il redeploy Vercel pubblicherà il giorno`;
  } else {
    // sviluppo locale: scrittura diretta (su Vercel fallirebbe: filesystem read-only)
    fs.writeFileSync(path.join(RADICE, 'content', data + '.md'), md);
    salvataggio = 'filesystem locale (GITHUB_TOKEN assente)';
  }

  return {
    stato: 'creato',
    data,
    salvataggio,
    giri_editor: giri,
    verdetti: Object.fromEntries(VOCI.map((v) => [v, verdetti[v].esito])),
    ...(notaEditoriale ? { nota_editoriale: notaEditoriale } : {}),
  };
}
