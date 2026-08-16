import fs from 'fs';
import path from 'path';
import { esisteGiorno } from './content.js';
import { lettureCattoliche, lettureOrtodosseConTesto } from './lezionario.js';
import { generaCommento, aiDisponibile } from './ai.js';
import { commitSuGitHub, githubDisponibile } from './github.js';

const RADICE = process.cwd();
const VOCI = ['cattolica', 'ortodossa', 'protestante', 'dispensazionalista'];
const MAX_GIRI_EDITOR = 2; // rigenerazioni massime dopo il primo passaggio (regola README)

function leggi(rel) {
  return fs.readFileSync(path.join(RADICE, rel), 'utf8');
}

// Assembla il prompt completo di una voce: system prompt + canone + pericope del giorno
// (riferimenti E testo integrale, così la voce commenta il testo reale).
export function assemblaPrompt(voce, letture) {
  if (!VOCI.includes(voce)) throw new Error('voce sconosciuta: ' + voce);
  const sistema = leggi(`prompts/voce-${voce}.md`);
  const canone = leggi(`canon/${voce}.md`);
  const c = letture?.cattoliche || {};
  const o = letture?.ortodosse || {};

  let pericope;
  if (voce === 'ortodossa') {
    pericope =
      `Lezionario bizantino del giorno.\n` +
      `Vangelo: ${o.vangelo || 'DA INSERIRE'}\n` +
      (o.vangelo_testo ? `Testo del Vangelo (trad. inglese WEB):\n${o.vangelo_testo}\n` : '') +
      `Epistola: ${o.epistola || 'DA INSERIRE'}\n` +
      (o.epistola_testo ? `Testo dell'Epistola (trad. inglese WEB):\n${o.epistola_testo}\n` : '') +
      `\nScrivi il commento in italiano.`;
  } else {
    pericope =
      `Lezionario cattolico del giorno (${c.titolo || 'titolo da inserire'}).\n` +
      `Vangelo: ${c.vangelo || 'DA INSERIRE'}\n` +
      (c.vangelo_testo ? `Testo del Vangelo:\n${c.vangelo_testo}\n` : '') +
      `Prima lettura: ${c.prima || 'DA INSERIRE'}\n` +
      (c.prima_testo ? `Testo della prima lettura:\n${c.prima_testo}\n` : '') +
      `Salmo: ${c.salmo || 'DA INSERIRE'}\n`;
  }
  return {
    system: `${sistema}\n\n---\n\nCANONE DI FONTI (le sole fonti citabili):\n\n${canone}`,
    user: `${pericope}\n\nScrivi il commento del giorno seguendo la rubrica fissa. Rispondi con il SOLO testo del commento, senza titoli né premesse.`,
  };
}

export function assemblaPromptEditor(bozze, letture) {
  const sistema = leggi('prompts/editor-checklist.md');
  const c = letture?.cattoliche || {};
  const o = letture?.ortodosse || {};
  const contesto =
    `PERICOPI DEL GIORNO — cattolico: Vangelo ${c.vangelo || '—'}; prima lettura ${c.prima || '—'}; salmo ${c.salmo || '—'}. ` +
    `Bizantino: Vangelo ${o.vangelo || '—'}; epistola ${o.epistola || '—'}.`;
  const corpo = Object.entries(bozze)
    .map(([voce, testo]) => `### Bozza voce ${voce}\n\n${testo}`)
    .join('\n\n');
  return { system: sistema, user: `${contesto}\n\n${corpo}` };
}

// Estrae dall'output dell'editor i verdetti per voce e il paragrafo "La logica del dono".
export function analizzaEditor(testo) {
  const verdetti = {};
  for (const voce of VOCI) {
    const m = testo.match(new RegExp(`^VERDETTO\\s+${voce}\\s*:\\s*(APPROVATA|RIGENERA)(?:\\s*[—–-]\\s*(.+))?$`, 'im'));
    verdetti[voce] = m
      ? { esito: m[1].toUpperCase(), motivo: (m[2] || '').trim() }
      : { esito: 'APPROVATA', motivo: '' }; // verdetto assente = non bloccare la pubblicazione
  }
  const sep = testo.split(/^---$/m);
  let dono = (sep[1] || '').trim();
  if (!dono) {
    // fallback: tutto ciò che segue l'ultimo verdetto
    const righe = testo.split('\n');
    const ultima = righe.reduce((acc, r, i) => (/^VERDETTO\s+/i.test(r) ? i : acc), -1);
    dono = righe.slice(ultima + 1).join('\n').trim();
  }
  if (dono && !/Marcus Bachmann/.test(dono)) dono += '\n\n*Marcus Bachmann*';
  return { verdetti, dono };
}

function comporreMD(data, letture, bozze, dono, opzioni = {}) {
  const c = letture?.cattoliche || {};
  const o = letture?.ortodosse || {};
  const q = (v) => JSON.stringify(v || null);
  const nota = opzioni.notaEditoriale
    ? `nota_editoriale: ${JSON.stringify(opzioni.notaEditoriale)}\n`
    : '';
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
generato: "ai"
${nota}---

## La logica del dono

${dono}

## Voce cattolica

${bozze.cattolica}

## Voce ortodossa

${bozze.ortodossa}

## Voce protestante

${bozze.protestante}

## Voce dispensazionalista

${bozze.dispensazionalista}
`;
}

// Pipeline del giorno: letture → 4 voci → editor (checklist, max 2 rigenerazioni) → salvataggio.
// Salvataggio: commit su GitHub (produzione, triggera il redeploy Vercel) o filesystem (locale).
export async function generaGiorno(data) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return { stato: 'errore', dettaglio: 'data non valida' };
  if (esisteGiorno(data)) return { stato: 'presente', data };
  if (!aiDisponibile()) return { stato: 'errore', dettaglio: 'OLLAMA_API_KEY mancante nelle env' };

  const [cattoliche, ortodosse] = await Promise.all([
    lettureCattoliche(data),
    lettureOrtodosseConTesto(data),
  ]);
  if (!cattoliche) return { stato: 'errore', dettaglio: 'lezionario cattolico non raggiungibile: riprovare' };
  if (!ortodosse) return { stato: 'errore', dettaglio: 'lezionario bizantino non raggiungibile: riprovare' };
  const letture = { cattoliche, ortodosse };

  // 1) prime bozze, in parallelo
  const bozze = {};
  await Promise.all(
    VOCI.map(async (voce) => {
      bozze[voce] = await generaCommento(assemblaPrompt(voce, letture));
    })
  );

  // 2) loop editoriale: verifica checklist, rigenera le voci respinte (max 2 giri)
  let esitoEditor = analizzaEditor(await generaCommento(assemblaPromptEditor(bozze, letture), 8000));
  let giri = 0;
  let respinte = VOCI.filter((v) => esitoEditor.verdetti[v].esito === 'RIGENERA');
  while (respinte.length && giri < MAX_GIRI_EDITOR) {
    giri++;
    await Promise.all(
      respinte.map(async (voce) => {
        const p = assemblaPrompt(voce, letture);
        p.user += `\n\nNOTA DEL REDATTORE — la bozza precedente è stata respinta per questo motivo: "${esitoEditor.verdetti[voce].motivo || 'non conforme alla checklist'}". Riscrivi il commento correggendo esattamente questo difetto.`;
        bozze[voce] = await generaCommento(p);
      })
    );
    esitoEditor = analizzaEditor(await generaCommento(assemblaPromptEditor(bozze, letture), 8000));
    respinte = VOCI.filter((v) => esitoEditor.verdetti[v].esito === 'RIGENERA');
  }

  // 3) se dopo i giri restano voci respinte, si pubblica con nota (regola README)
  const notaEditoriale = respinte.length
    ? `Pubblicato con riserva dopo ${giri} rigenerazioni — voci non conformi: ` +
      respinte.map((v) => `${v} (${esitoEditor.verdetti[v].motivo || 'motivo non indicato'})`).join('; ')
    : null;

  if (!esitoEditor.dono) {
    return { stato: 'errore', dettaglio: "l'editor non ha prodotto il paragrafo 'La logica del dono'" };
  }

  const md = comporreMD(data, letture, bozze, esitoEditor.dono, { notaEditoriale });

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
    verdetti: Object.fromEntries(VOCI.map((v) => [v, esitoEditor.verdetti[v].esito])),
    ...(notaEditoriale ? { nota_editoriale: notaEditoriale } : {}),
  };
}
