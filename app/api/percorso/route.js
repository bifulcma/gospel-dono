import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Copia di sicurezza del percorso (/percorso), per ritrovarlo su altri dispositivi.
// Il browser cifra tutto con il codice personale prima di inviarlo (lib/sincronia.js):
// qui arrivano solo un id derivato dal codice e un testo illeggibile. Nel database l'id
// è salvato a sua volta come hash. Supabase si raggiunge solo da qui, con la service
// role key che resta sul server (env Vercel); la tabella ha RLS senza policy.
//
// POST { azione: 'leggi', id }                     → { cifrato | null, versione }
// POST { azione: 'scrivi', id, versione, cifrato } → { versione } · 409 se nel frattempo
//      un altro dispositivo ha scritto (il browser rilegge, unisce e riprova)

const TABELLA = 'percorso_sync';
const MAX = 3_000_000; // caratteri cifrati: anni di diario
const CIFRATO = /^v1\.[A-Za-z0-9+/=]{16,}\.[A-Za-z0-9+/=]+$/;

function database() {
  const url = process.env.SUPABASE_URL;
  const chiave = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !chiave) return null;
  const headers = { apikey: chiave, 'Content-Type': 'application/json' };
  // Le chiavi "legacy" (JWT) vanno anche in Authorization; le nuove sb_secret_ solo in apikey.
  if (chiave.startsWith('eyJ')) headers.Authorization = `Bearer ${chiave}`;
  return { base: `${url.replace(/\/+$/, '')}/rest/v1/${TABELLA}`, headers };
}

const errore = (msg, status) => NextResponse.json({ errore: msg }, { status });

export async function POST(request) {
  const db = database();
  if (!db) return errore('sincronizzazione non configurata', 503);

  const testo = await request.text();
  if (testo.length > MAX + 1000) return errore('troppo grande', 413);
  let corpo;
  try {
    corpo = JSON.parse(testo);
  } catch {
    return errore('richiesta non valida', 400);
  }
  const { azione, id } = corpo || {};
  if (typeof id !== 'string' || !/^[0-9a-f]{64}$/.test(id)) return errore('id non valido', 400);
  const riga = createHash('sha256').update(id).digest('hex');

  try {
    if (azione === 'leggi') {
      const r = await fetch(`${db.base}?id=eq.${riga}&select=cifrato,versione`, { headers: db.headers, cache: 'no-store' });
      if (!r.ok) throw new Error(`lettura ${r.status}`);
      const [trovata] = await r.json();
      return NextResponse.json({ cifrato: trovata?.cifrato ?? null, versione: trovata?.versione ?? 0 });
    }

    if (azione === 'scrivi') {
      const { versione, cifrato } = corpo;
      if (!Number.isInteger(versione) || versione < 0) return errore('versione non valida', 400);
      if (typeof cifrato !== 'string' || cifrato.length > MAX || !CIFRATO.test(cifrato)) return errore('dati non validi', 400);
      const nuova = versione + 1;
      if (versione === 0) {
        const r = await fetch(db.base, {
          method: 'POST',
          headers: { ...db.headers, Prefer: 'return=minimal' },
          body: JSON.stringify({ id: riga, cifrato, versione: nuova }),
          cache: 'no-store',
        });
        if (r.status === 409) return errore('conflitto', 409);
        if (!r.ok) throw new Error(`inserimento ${r.status}`);
      } else {
        // Scrive solo se la versione è ancora quella letta dal browser.
        const r = await fetch(`${db.base}?id=eq.${riga}&versione=eq.${versione}&select=versione`, {
          method: 'PATCH',
          headers: { ...db.headers, Prefer: 'return=representation' },
          body: JSON.stringify({ cifrato, versione: nuova, aggiornato_il: new Date().toISOString() }),
          cache: 'no-store',
        });
        if (!r.ok) throw new Error(`aggiornamento ${r.status}`);
        if ((await r.json()).length === 0) return errore('conflitto', 409);
      }
      return NextResponse.json({ versione: nuova });
    }

    return errore('azione sconosciuta', 400);
  } catch (e) {
    console.error('[percorso]', e?.message || e);
    return errore('database non raggiungibile', 502);
  }
}
