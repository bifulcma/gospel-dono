#!/usr/bin/env node
// Pubblica il giorno: committa content/YYYY-MM-DD.md (o la bozza .tmp/bozza-YYYY-MM-DD.md)
// su GitHub via API Contents → il push triggera il redeploy Vercel.
//
// Uso:  node scripts/commit-giorno.mjs YYYY-MM-DD
// Output su stdout: una riga JSON. Il token non viene mai stampato.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { caricaEnv } from './carica-env.mjs';

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
caricaEnv(RADICE);

const { commitSuGitHub, githubDisponibile } = await import(new URL('../lib/github.js', import.meta.url));

function esci(obj, codice = 0) {
  console.log(JSON.stringify(obj));
  process.exit(codice);
}

const data = process.argv[2];
if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
  esci({ stato: 'errore', dettaglio: 'indica la data: node scripts/commit-giorno.mjs YYYY-MM-DD' }, 1);
}
if (!githubDisponibile()) {
  esci({ stato: 'errore', dettaglio: 'GITHUB_TOKEN mancante (.env.local o ~/.hermes/.env)' }, 1);
}

const candidati = [
  path.join(RADICE, 'content', data + '.md'),
  path.join(RADICE, '.tmp', `bozza-${data}.md`),
];
const sorgente = candidati.find((f) => fs.existsSync(f));
if (!sorgente) {
  esci({ stato: 'errore', dettaglio: `nessun file per ${data}: genera prima la bozza (npm run generate -- ${data})` }, 1);
}

try {
  // già pubblicato su GitHub? (controllo remoto, non locale)
  const r = await fetch(
    `https://api.github.com/repos/bifulcma/gospel-dono/contents/content/${data}.md?ref=main`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );
  if (r.ok) esci({ stato: 'presente', data });
  if (r.status !== 404) esci({ stato: 'errore', dettaglio: `GitHub API (verifica) ${r.status}` }, 1);

  const contenuto = fs.readFileSync(sorgente, 'utf8');
  const { commit } = await commitSuGitHub(
    `content/${data}.md`,
    contenuto,
    `contenuto ${data} (flusso guidato da Hermes)`
  );
  esci({ stato: 'committato', data, commit });
} catch (e) {
  esci({ stato: 'errore', dettaglio: String(e?.message || e).slice(0, 300) }, 1);
}
