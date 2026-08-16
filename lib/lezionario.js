// Lezionario cattolico del giorno via API Evangelizo (feed.evangelizo.org).
// Se l'API non risponde (o LEZIONARIO_MANUALE=1) la funzione restituisce null:
// la pipeline si ferma con errore e si riprova (nessuna pubblicazione a metà).

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

// data: 'YYYY-MM-DD' → letture cattoliche con testi integrali, o null.
// Manuale API: type=liturgic_t (titolo del giorno); type=reading_lt|reading con
// content=GSP (Vangelo) | FR (prima lettura) | PS (salmo) | SR (seconda lettura —
// presente solo in domeniche e solennità: nei feriali l'API risponde con una pagina
// di errore, che pulisci() converte in null).
export async function lettureCattoliche(data) {
  if (MANUALE()) return null;
  const ymd = data.replaceAll('-', '');
  const base = 'https://feed.evangelizo.org/v2/reader.php';
  const campo = (type, content) =>
    fetchTesto(`${base}?date=${ymd}&type=${type}${content ? `&content=${content}` : ''}&lang=IT`);

  const [
    titolo,
    vangeloTitolo, primaTitolo, salmoTitolo, secondaTitolo,
    vangeloTesto, primaTesto, salmoTesto, secondaTesto,
  ] = await Promise.all([
    campo('liturgic_t'),
    campo('reading_lt', 'GSP'),
    campo('reading_lt', 'FR'),
    campo('reading_lt', 'PS'),
    campo('reading_lt', 'SR'),
    campo('reading', 'GSP'),
    campo('reading', 'FR'),
    campo('reading', 'PS'),
    campo('reading', 'SR'),
  ]);
  if (!titolo && !vangeloTitolo) return null;
  return {
    titolo: pulisci(titolo),
    vangelo: pulisci(vangeloTitolo),
    prima: pulisci(primaTitolo),
    salmo: pulisci(salmoTitolo),
    seconda: pulisci(secondaTitolo),
    vangelo_testo: pulisci(vangeloTesto),
    prima_testo: pulisci(primaTesto),
    salmo_testo: pulisci(salmoTesto),
    seconda_testo: pulisci(secondaTesto),
  };
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
