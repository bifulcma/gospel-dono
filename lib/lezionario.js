// Lezionari del giorno.
// - Cattolico: API Evangelizo (feed.evangelizo.org) — pericope IT del giorno.
// - Ortodosso: calendario GOARCH; fallback holytrinityorthodox.com.
// Se le API non rispondono (o LEZIONARIO_MANUALE=1) le funzioni restituiscono null:
// la pipeline scrive allora il file del giorno con letture "da inserire a mano".

const MANUALE = () => process.env.LEZIONARIO_MANUALE === '1';

async function fetchTesto(url, ms = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

// data: 'YYYY-MM-DD' → letture cattoliche { titolo, vangelo, prima, salmo } o null
export async function lettureCattoliche(data) {
  if (MANUALE()) return null;
  const ymd = data.replaceAll('-', '');
  const base = 'https://feed.evangelizo.org/v2/reader.php';
  // Manuale API: type=liturgic_t per il titolo; type=reading_lt + content=GSP|FR|PS per i titoli delle letture
  const campo = (type, content) =>
    fetchTesto(`${base}?date=${ymd}&type=${type}${content ? `&content=${content}` : ''}&lang=IT`);

  const [titolo, vangeloTitolo, primaTitolo, salmoTitolo, vangeloTesto, primaTesto, salmoTesto] =
    await Promise.all([
      campo('liturgic_t'),
      campo('reading_lt', 'GSP'),
      campo('reading_lt', 'FR'),
      campo('reading_lt', 'PS'),
      campo('reading', 'GSP'),
      campo('reading', 'FR'),
      campo('reading', 'PS'),
    ]);
  if (!titolo && !vangeloTitolo) return null;
  return {
    titolo: pulisci(titolo),
    vangelo: pulisci(vangeloTitolo),
    prima: pulisci(primaTitolo),
    salmo: pulisci(salmoTitolo),
    vangelo_testo: pulisci(vangeloTesto),
    prima_testo: pulisci(primaTesto),
    salmo_testo: pulisci(salmoTesto),
  };
}

// data: 'YYYY-MM-DD' → letture ortodosse (lezionario bizantino) { vangelo, epistola } o null
export async function lettureOrtodosse(data) {
  if (MANUALE()) return null;
  const [y, m, g] = data.split('-');

  // Tentativo 1: API calendario GOARCH
  const goarch = await fetchTesto(
    `https://orthodoxcalendar.goarch.org/api/v1/calendar/date/${y}-${m}-${g}`
  );
  if (goarch) {
    try {
      const j = JSON.parse(goarch);
      const letture = j?.readings || j?.data?.readings;
      if (Array.isArray(letture) && letture.length) {
        const vangelo = letture.find((l) => /gospel|vangelo/i.test(l.type || l.title || ''));
        const epistola = letture.find((l) => /epistle|apostol/i.test(l.type || l.title || ''));
        return {
          vangelo: vangelo?.display || vangelo?.short_display || null,
          epistola: epistola?.display || epistola?.short_display || null,
        };
      }
    } catch {
      /* formato inatteso: si passa al fallback */
    }
  }

  // Tentativo 2 (fallback): holytrinityorthodox.com — HTML con i riferimenti delle Scritture
  const html = await fetchTesto(
    `https://holytrinityorthodox.com/calendar/calendar.php?month=${+m}&today=${+g}&year=${y}&dt=1&header=0&lives=0&trp=0&scripture=1`
  );
  if (html) {
    const refs = [...html.matchAll(/<a[^>]*>([^<]+\d[^<]*)<\/a>/g)].map((x) => x[1].trim());
    if (refs.length) {
      return { epistola: refs[0] || null, vangelo: refs[1] || refs[0] || null };
    }
  }
  return null;
}

// Recupera il testo biblico completo di un riferimento (es. "Matthew 23:29-39") via bible-api.com.
// Ritorna il testo in inglese (WEB) o null se non risolvibile.
async function testoBiblico(ref) {
  if (!ref) return null;
  // Gestisce libri numerati (es. "2 Corinthians 3:4-11", "1 John 2:1-5")
  const m = ref.match(/(\d*\s*[A-Za-z]+(?:\s+[A-Za-z]+)?)\s*(\d+)[:,]?\s*(\d+)?\s*-?\s*(\d+)?/);
  if (!m) return null;
  const libro = m[1].trim().toLowerCase().replace(/\s+/g, '+');
  const cap = m[2];
  const da = m[3] || '1';
  const a = m[4] || da;
  const url = `https://bible-api.com/${libro}+${cap}:${da}-${a}`;
  const raw = await fetchTesto(url, 10000);
  if (!raw) return null;
  try {
    const j = JSON.parse(raw);
    return j?.text ? j.text.replace(/\s+/g, ' ').trim() : null;
  } catch {
    return null;
  }
}

// data: 'YYYY-MM-DD' → letture ortodosse con testo biblico completo
export async function lettureOrtodosseConTesto(data) {
  const base = await lettureOrtodosse(data);
  if (!base) return null;
  const [vangeloTesto, epistolaTesto] = await Promise.all([
    testoBiblico(base.vangelo),
    testoBiblico(base.epistola),
  ]);
  return { ...base, vangelo_testo: vangeloTesto, epistola_testo: epistolaTesto };
}
function pulisci(s) {
  if (!s) return null;
  // Le risposte di errore di Evangelizo sono pagine HTML complete: non sono letture valide.
  if (/Evangelizo Error|<!DOCTYPE/i.test(s)) return null;
  let t = s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  // Rimuovi il footer copyright CEI e la riga di iscrizione
  t = t.replace(/Copyright\s*@\s*Conferenza Episcopale Italiana.*$/i, '').trim();
  t = t.replace(/Per ricevere il Vangelo ogni mattina.*$/i, '').trim();
  // Decodifica le entità HTML comuni
  t = t
    .replace(/&#0*39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
  return t.trim() || null;
}
