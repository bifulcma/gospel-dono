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

  const [titolo, vangeloTitolo, primaTitolo, salmoTitolo] = await Promise.all([
    campo('liturgic_t'),
    campo('reading_lt', 'GSP'),
    campo('reading_lt', 'FR'),
    campo('reading_lt', 'PS'),
  ]);
  if (!titolo && !vangeloTitolo) return null;
  return {
    titolo: pulisci(titolo),
    vangelo: pulisci(vangeloTitolo),
    prima: pulisci(primaTitolo),
    salmo: pulisci(salmoTitolo),
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
function pulisci(s) {
  if (!s) return null;
  // Le risposte di errore di Evangelizo sono pagine HTML complete: non sono letture valide.
  if (/Evangelizo Error|<!DOCTYPE/i.test(s)) return null;
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() || null;
}
