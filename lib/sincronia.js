// Sincronizzazione del percorso tra dispositivi (pagina /percorso).
//
// Ogni dispositivo tiene tutto in localStorage, come prima. Se la persona crea un
// codice personale, una copia viene cifrata nel browser con quel codice (AES-GCM)
// e custodita su Supabase tramite /api/percorso: il server riceve solo un id derivato
// dal codice e un testo illeggibile. Né il codice né il diario arrivano in chiaro.
//
// Il documento condiviso:
//   stato.<campo>  { v, t }  raggiunta, corrente, ripeti, azzerato (t = ms dell'ultima modifica)
//   bozze.<tappa>  { v, t }  v = la bozza, oppure null se svuotata (seduta salvata, percorso ricominciato)
//   diario.<id>    seduta    le sedute non cambiano: si uniscono
//   eliminate.<id> t         sedute eliminate, perché non ricompaiano dagli altri dispositivi
//
// Unione: per ogni campo vince la modifica più recente; a parità, ciò che è già sul server.
// Eccezione: la tappa raggiunta non torna indietro (vince la più avanzata), se non dopo
// «Ricomincia il percorso» (stato.azzerato).

const ALFABETO = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford: niente I, L, O, U
const LUNGHEZZA = 25; // 125 bit casuali
const ID = /^[a-z0-9][a-z0-9-]{0,79}$/i;
const CAMPO = /^[a-z][a-z0-9_]{0,39}$/i;
export const CAMPI_STATO = ['raggiunta', 'corrente', 'ripeti'];

// ── codice personale

export function nuovoCodice() {
  const r = crypto.getRandomValues(new Uint8Array(LUNGHEZZA));
  return Array.from(r, (b) => ALFABETO[b & 31]).join('');
}

// Accetta il codice con o senza trattini, minuscolo, oppure il link intero.
export function normalizzaCodice(testo) {
  let s = String(testo || '');
  const link = s.match(/codice=([^&\s]+)/i);
  if (link) {
    try {
      s = decodeURIComponent(link[1]);
    } catch {
      s = link[1];
    }
  }
  return s.toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
}

export const codiceValido = (c) =>
  typeof c === 'string' && c.length === LUNGHEZZA && [...c].every((x) => ALFABETO.includes(x));

export const formattaCodice = (c) => c.match(/.{1,5}/g).join('-');

// ── cifratura (Web Crypto, nel browser)

const utf8 = new TextEncoder();

export async function chiaviDa(codice) {
  const base = await crypto.subtle.importKey('raw', utf8.encode(codice), 'HKDF', false, ['deriveBits', 'deriveKey']);
  const hkdf = (info) => ({ name: 'HKDF', hash: 'SHA-256', salt: utf8.encode('gospel-dono/percorso/v1'), info: utf8.encode(info) });
  const bit = await crypto.subtle.deriveBits(hkdf('id'), base, 256);
  const chiave = await crypto.subtle.deriveKey(hkdf('chiave'), base, { name: 'AES-GCM', length: 256 }, false, [
    'encrypt',
    'decrypt',
  ]);
  return { id: Array.from(new Uint8Array(bit), (b) => b.toString(16).padStart(2, '0')).join(''), chiave };
}

export async function cifra(chiave, doc) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const dati = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, chiave, utf8.encode(JSON.stringify(doc)));
  return `v1.${b64(iv)}.${b64(new Uint8Array(dati))}`;
}

export async function decifra(chiave, testo) {
  const [v, iv, dati] = String(testo).split('.');
  if (v !== 'v1') throw new Error('formato sconosciuto');
  const chiaro = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: daB64(iv) }, chiave, daB64(dati));
  return JSON.parse(new TextDecoder().decode(chiaro));
}

function b64(u8) {
  let s = '';
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(s);
}
function daB64(s) {
  const b = atob(s);
  const u8 = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) u8[i] = b.charCodeAt(i);
  return u8;
}

// ── documento e unione

const ha = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const oggetto = (x) => (x && typeof x === 'object' && !Array.isArray(x) ? x : {});
const tempo = (t) => (Number.isFinite(t) && t > 0 ? t : 0);

// Solo campi semplici (testo, numeri, sì/no): ciò che le sedute e le bozze contengono.
function piatto(o) {
  const out = {};
  for (const [k, v] of Object.entries(o)) {
    if (CAMPO.test(k) && (typeof v === 'string' || typeof v === 'boolean' || v === null || Number.isFinite(v))) out[k] = v;
  }
  return out;
}

function valoreStato(k, v) {
  if (k === 'ripeti') return v == null ? null : typeof v === 'string' && ID.test(v) ? v : undefined;
  return Number.isInteger(v) && v >= 0 ? v : undefined;
}

// Ripulisce un documento (anche arrivato dalla rete) tenendo solo ciò che ha senso.
export function pulisci(doc) {
  const d = oggetto(doc);
  const out = { versione: 1, stato: {}, bozze: {}, diario: {}, eliminate: {} };
  const st = oggetto(d.stato);
  for (const k of [...CAMPI_STATO, 'azzerato']) {
    const c = oggetto(st[k]);
    if (!ha(c, 'v')) continue;
    const v = valoreStato(k, c.v);
    if (v !== undefined) out.stato[k] = { v, t: tempo(c.t) };
  }
  for (const [id, c] of Object.entries(oggetto(d.bozze))) {
    if (!ID.test(id) || !c || typeof c !== 'object') continue;
    const v = c.v === null ? null : c.v && typeof c.v === 'object' && !Array.isArray(c.v) ? piatto(c.v) : undefined;
    if (v !== undefined) out.bozze[id] = { v, t: tempo(c.t) };
  }
  for (const [id, t] of Object.entries(oggetto(d.eliminate))) if (ID.test(id)) out.eliminate[id] = tempo(t);
  for (const s of Object.values(oggetto(d.diario))) {
    if (s && typeof s === 'object' && typeof s.id === 'string' && ID.test(s.id) && !ha(out.eliminate, s.id)) {
      out.diario[s.id] = piatto(s);
    }
  }
  return out;
}

// a = questo dispositivo, b = il server: a parità di tempo vince b.
function recente(x, y, pari) {
  if (!x) return y;
  if (!y) return x;
  if (x.t !== y.t) return x.t > y.t ? x : y;
  return pari ? pari(x, y) : y;
}

export function unisci(a, b) {
  a = pulisci(a);
  b = pulisci(b);
  const out = { versione: 1, stato: {}, bozze: {}, diario: {}, eliminate: { ...a.eliminate } };

  for (const [id, t] of Object.entries(b.eliminate)) {
    out.eliminate[id] = ha(out.eliminate, id) ? Math.max(out.eliminate[id], t) : t;
  }

  const az = recente(a.stato.azzerato, b.stato.azzerato, (x, y) => (x.v > y.v ? x : y));
  if (az) out.stato.azzerato = az;
  // La tappa raggiunta: la più avanzata tra quelle segnate dopo l'ultimo «Ricomincia».
  const dopo = [a.stato.raggiunta, b.stato.raggiunta].filter((e) => e && e.t >= (az?.v || 0));
  if (dopo.length) out.stato.raggiunta = dopo.reduce((x, y) => (y.v > x.v || (y.v === x.v && y.t > x.t) ? y : x));
  else if (a.stato.raggiunta || b.stato.raggiunta) out.stato.raggiunta = { v: 0, t: az.v };
  for (const k of ['corrente', 'ripeti']) {
    const e = recente(a.stato[k], b.stato[k]);
    if (e) out.stato[k] = e;
  }

  for (const id of new Set([...Object.keys(a.bozze), ...Object.keys(b.bozze)])) {
    out.bozze[id] = recente(a.bozze[id], b.bozze[id], (x, y) => (y.v === null && x.v !== null ? x : y));
  }

  for (const s of [...Object.values(b.diario), ...Object.values(a.diario)]) {
    if (!ha(out.eliminate, s.id) && !ha(out.diario, s.id)) out.diario[s.id] = s;
  }
  return out;
}

// Dallo stato della pagina (più i tempi delle modifiche) al documento, e ritorno.
export function componi({ stato, bozze, diario, tempi, eliminate }) {
  const doc = { stato: {}, bozze: {}, diario: {}, eliminate };
  for (const k of CAMPI_STATO) if (tempi['stato.' + k]) doc.stato[k] = { v: stato[k] ?? null, t: tempi['stato.' + k] };
  if (tempi.azzerato) doc.stato.azzerato = { v: tempi.azzerato, t: tempi.azzerato };
  const ids = new Set(Object.keys(bozze));
  for (const k of Object.keys(tempi)) if (k.startsWith('bozza.')) ids.add(k.slice(6));
  for (const id of ids) doc.bozze[id] = { v: bozze[id] ?? null, t: tempi['bozza.' + id] || 1 };
  for (const s of diario) doc.diario[s.id] = s;
  return pulisci(doc);
}

export function scomponi(doc) {
  const d = pulisci(doc);
  const tempi = {};
  const stato = { raggiunta: 0, corrente: 0 };
  for (const [k, e] of Object.entries(d.stato)) {
    if (k === 'azzerato') {
      tempi.azzerato = e.v;
      continue;
    }
    tempi['stato.' + k] = e.t;
    if (e.v !== null) stato[k] = e.v;
  }
  const bozze = {};
  for (const [id, e] of Object.entries(d.bozze)) {
    tempi['bozza.' + id] = e.t;
    if (e.v) bozze[id] = e.v;
  }
  const diario = Object.values(d.diario).sort((x, y) => (y.createdAt || 0) - (x.createdAt || 0));
  return { stato, bozze, diario, tempi, eliminate: d.eliminate };
}

// JSON con le chiavi in ordine: per confrontare due documenti.
export function canonico(x) {
  if (Array.isArray(x)) return `[${x.map(canonico).join(',')}]`;
  if (x && typeof x === 'object') {
    const chiavi = Object.keys(x).filter((k) => x[k] !== undefined).sort();
    return `{${chiavi.map((k) => `${JSON.stringify(k)}:${canonico(x[k])}`).join(',')}}`;
  }
  return JSON.stringify(x ?? null);
}
