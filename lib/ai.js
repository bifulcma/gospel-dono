// Generazione dei commenti via Ollama cloud (endpoint OpenAI-compatible).
// Legge OLLAMA_API_KEY dall'ambiente (mai hardcodata, mai loggata).

const ENDPOINT = 'https://ollama.com/v1/chat/completions';
const MODELLO = 'deepseek-v4-pro';
const TIMEOUT_MS = 180000; // ogni chiamata entro 3 minuti (maxDuration della route: 300s)

export const aiDisponibile = () => Boolean(process.env.OLLAMA_API_KEY);

// prompt = { system, user } → testo del commento. Firma invariata rispetto al provider precedente.
export async function generaCommento(prompt, maxTokens = 6000) {
  if (!aiDisponibile()) throw new Error('OLLAMA_API_KEY mancante: impostala nelle env (Vercel o .env.local)');

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let r;
  try {
    r = await fetch(ENDPOINT, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODELLO,
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user },
        ],
        max_tokens: maxTokens,
      }),
    });
  } catch (e) {
    clearTimeout(t);
    throw new Error(e?.name === 'AbortError' ? 'timeout del provider AI' : 'provider AI non raggiungibile');
  }
  clearTimeout(t);

  if (!r.ok) {
    let dettaglio = '';
    try {
      dettaglio = (await r.json())?.error?.message || '';
    } catch {}
    throw new Error(`provider AI ${r.status}${dettaglio ? ': ' + dettaglio.slice(0, 200) : ''}`);
  }

  const j = await r.json();
  const testo = j?.choices?.[0]?.message?.content?.trim();
  if (!testo) throw new Error('risposta vuota dal provider AI');
  return testo;
}
