// Caricatore env minimale per gli script da terminale (nessuna dipendenza).
// Ordine: variabili d'ambiente già presenti > .env.local del progetto > ~/.hermes/.env.
// I valori non vengono mai stampati.

import fs from 'fs';
import os from 'os';
import path from 'path';

export function caricaEnv(radice) {
  const candidati = [
    path.join(radice, '.env.local'),
    path.join(os.homedir(), '.hermes', '.env'),
  ];
  const caricati = [];
  for (const file of candidati) {
    if (!fs.existsSync(file)) continue;
    for (const riga of fs.readFileSync(file, 'utf8').split('\n')) {
      const m = riga.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!m) continue;
      const chiave = m[1];
      if (process.env[chiave] !== undefined) continue; // il primo che arriva vince
      let valore = m[2].trim();
      if (
        (valore.startsWith('"') && valore.endsWith('"')) ||
        (valore.startsWith("'") && valore.endsWith("'"))
      ) {
        valore = valore.slice(1, -1);
      }
      process.env[chiave] = valore;
    }
    caricati.push(file);
  }
  return caricati; // solo percorsi, mai valori
}
