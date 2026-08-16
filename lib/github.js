// Salvataggio del contenuto generato: commit su GitHub via API Contents.
// Su Vercel il filesystem è read-only: il commit su main triggera il redeploy
// automatico, e il nuovo giorno entra nel sito. Token da process.env.GITHUB_TOKEN
// (fine-grained PAT con permesso Contents: Read and write sul solo repo gospel-dono).
// Il token non va MAI loggato né incluso nei messaggi di errore.

const REPO = 'bifulcma/gospel-dono';
const BRANCH = 'main';
const API_VERSIONE = '2022-11-28';

export const githubDisponibile = () => Boolean(process.env.GITHUB_TOKEN);

function intestazioni() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': API_VERSIONE,
  };
}

// Crea o aggiorna un file nel repo. Ritorna { commit: shaBreve }.
export async function commitSuGitHub(percorso, contenuto, messaggio) {
  if (!githubDisponibile()) throw new Error('GITHUB_TOKEN mancante');
  const url = `https://api.github.com/repos/${REPO}/contents/${percorso}`;

  // Se il file esiste già serve lo sha corrente (aggiornamento, non creazione)
  let sha;
  const esistente = await fetch(`${url}?ref=${BRANCH}`, { headers: intestazioni() });
  if (esistente.ok) {
    const j = await esistente.json();
    sha = j?.sha;
  } else if (esistente.status !== 404) {
    throw new Error(`GitHub API (lettura) ${esistente.status}`);
  }

  const r = await fetch(url, {
    method: 'PUT',
    headers: { ...intestazioni(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: messaggio,
      content: Buffer.from(contenuto, 'utf8').toString('base64'),
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!r.ok) {
    let dettaglio = '';
    try {
      dettaglio = (await r.json())?.message || '';
    } catch {}
    throw new Error(`GitHub API (scrittura) ${r.status}${dettaglio ? ': ' + dettaglio : ''}`);
  }
  const j = await r.json();
  return { commit: j?.commit?.sha ? j.commit.sha.slice(0, 7) : null };
}
