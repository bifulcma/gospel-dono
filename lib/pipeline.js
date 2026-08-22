import fs from 'fs';
import path from 'path';
import { esisteGiorno } from './content.js';
import { lettureCattoliche } from './lezionario.js';
import { generaCommento, aiDisponibile } from './ai.js';
import { commitSuGitHub, githubDisponibile } from './github.js';

// Import statici dei testi (webpack asset/source, vedi next.config.mjs): i .md
// restano l'unica fonte e vengono incorporati nel bundle della funzione Vercel.
// Niente fs.readFileSync a runtime: su /var/task quei file non esistono.
import promptBachmann from '../prompts/bachmann.md';
import promptEditor from '../prompts/editor-checklist.md';
import canonBachmann from '../canon/bachmann.md';

const RADICE = process.cwd();
const MAX_GIRI_EDITOR = 2; // rigenerazioni massime dopo il primo passaggio (regola README)

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

// Il paragrafo "La logica del dono": Marcus Bachmann in prima persona, dal SUO canone.
// È l'unica voce del sito: nasce dall'incontro fra le letture del giorno e i suoi scritti.
export function assemblaPromptBachmann(letture) {
  return {
    system: `${promptBachmann}\n\n---\n\nIL TUO CANONE (il tuo libro, unica fonte citabile):\n\n${canonBachmann}`,
    user: `${pericopeCattolica(letture)}\nScrivi il paragrafo "La logica del dono" di oggi.`,
  };
}

export function assemblaPromptEditor(dono, letture) {
  const c = letture?.cattoliche || {};
  const contesto =
    `PERICOPI DEL GIORNO — Vangelo ${c.vangelo || '—'}; prima lettura ${c.prima || '—'}; ` +
    `${c.seconda ? `seconda lettura ${c.seconda}; ` : ''}salmo ${c.salmo || '—'}.`;
  return { system: promptEditor, user: `${contesto}\n\n### Bozza «La logica del dono»\n\n${dono}` };
}

// Estrae dall'output dell'editor il verdetto sul paragrafo del giorno.
export function analizzaEditor(testo) {
  const m = String(testo || '').match(
    /^VERDETTO\s+dono\s*:\s*(APPROVATA|RIGENERA)(?:\s*[—–-]\s*(.+))?$/im
  );
  // verdetto assente = non bloccare la pubblicazione
  return m ? { esito: m[1].toUpperCase(), motivo: (m[2] || '').trim() } : { esito: 'APPROVATA', motivo: '' };
}

// La firma chiude sempre il paragrafo: l'editor la vede già al suo posto.
function firmato(testo) {
  if (!testo) return testo;
  return /Marcus Bachmann/.test(testo) ? testo : `${testo}\n\n*Marcus Bachmann*`;
}

function comporreMD(data, letture, dono, opzioni = {}) {
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
`;
}

// Pipeline del giorno: letture → paragrafo di Bachmann → editor (checklist, max 2
// rigenerazioni, poi nota) → salvataggio (commit GitHub in produzione, fs in locale).
export async function generaGiorno(data) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return { stato: 'errore', dettaglio: 'data non valida' };
  if (esisteGiorno(data)) return { stato: 'presente', data };
  if (!aiDisponibile()) return { stato: 'errore', dettaglio: 'OLLAMA_API_KEY mancante nelle env' };

  const cattoliche = await lettureCattoliche(data);
  if (!cattoliche) return { stato: 'errore', dettaglio: 'lezionario cattolico non raggiungibile: riprovare' };
  const letture = { cattoliche };

  // 1) il paragrafo del giorno, dal canone di Bachmann
  let dono = firmato(await generaCommento(assemblaPromptBachmann(letture)));
  if (!dono) return { stato: 'errore', dettaglio: "Bachmann non ha prodotto il paragrafo 'La logica del dono'" };

  // 2) loop editoriale: verifica checklist, riscrive se respinto (max 2 giri)
  let verdetto = analizzaEditor(await generaCommento(assemblaPromptEditor(dono, letture), 8000));
  let giri = 0;
  while (verdetto.esito === 'RIGENERA' && giri < MAX_GIRI_EDITOR) {
    giri++;
    const p = assemblaPromptBachmann(letture);
    p.user += `\n\nNOTA DEL REDATTORE — il paragrafo precedente è stato respinto per questo motivo: "${verdetto.motivo || 'non conforme alla checklist'}". Riscrivilo correggendo esattamente questo difetto.`;
    dono = firmato(await generaCommento(p));
    verdetto = analizzaEditor(await generaCommento(assemblaPromptEditor(dono, letture), 8000));
  }

  // 3) se dopo i giri il paragrafo resta respinto, si pubblica con nota (regola README)
  const notaEditoriale =
    verdetto.esito === 'RIGENERA'
      ? `Pubblicato con riserva dopo ${giri} rigenerazioni — ${verdetto.motivo || 'motivo non indicato'}`
      : null;

  const md = comporreMD(data, letture, dono, { notaEditoriale });

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
    verdetto: verdetto.esito,
    ...(notaEditoriale ? { nota_editoriale: notaEditoriale } : {}),
  };
}
