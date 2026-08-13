import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const DIR = path.join(process.cwd(), 'content');
const RE_DATA = /^\d{4}-\d{2}-\d{2}$/;

export function elencoDate() {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith('.md') && RE_DATA.test(f.replace(/\.md$/, '')))
    .map((f) => f.replace(/\.md$/, ''))
    .sort()
    .reverse();
}

export function leggiGiorno(data) {
  if (!RE_DATA.test(data)) return null;
  const file = path.join(DIR, data + '.md');
  if (!fs.existsSync(file)) return null;
  const { data: meta, content } = matter(fs.readFileSync(file, 'utf8'));
  return { data, meta, sezioni: dividiSezioni(content) };
}

// Il corpo del file è diviso in sezioni "## Titolo": una per voce.
function dividiSezioni(md) {
  return md
    .split(/^## /m)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const i = p.indexOf('\n');
      if (i === -1) return { titolo: p.trim(), corpo: '' };
      return { titolo: p.slice(0, i).trim(), corpo: p.slice(i + 1).trim() };
    });
}

export function ultimaData() {
  return elencoDate()[0] || null;
}

export function esisteGiorno(data) {
  return RE_DATA.test(data) && fs.existsSync(path.join(DIR, data + '.md'));
}
