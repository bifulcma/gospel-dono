// Generazione dei commenti via Anthropic SDK.
// Legge ANTHROPIC_API_KEY dall'ambiente (mai hardcodata, mai loggata).

import Anthropic from '@anthropic-ai/sdk';

const MODELLO = 'claude-sonnet-5';

let client = null;
function clienteAI() {
  if (!client) client = new Anthropic(); // legge ANTHROPIC_API_KEY dall'ambiente
  return client;
}

export const aiDisponibile = () => Boolean(process.env.ANTHROPIC_API_KEY);

// prompt = { system, user } → testo del commento.
// max_tokens copre pensiero + testo (su claude-sonnet-5 il thinking adattivo è attivo di default).
export async function generaCommento(prompt, maxTokens = 6000) {
  if (!aiDisponibile()) throw new Error('ANTHROPIC_API_KEY mancante: impostala nelle env (Vercel o .env.local)');
  const msg = await clienteAI().messages.create({
    model: MODELLO,
    max_tokens: maxTokens,
    system: prompt.system,
    messages: [{ role: 'user', content: prompt.user }],
  });
  if (msg.stop_reason === 'refusal') throw new Error('generazione rifiutata dal modello');
  const testo = msg.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
  if (!testo) throw new Error('risposta vuota dal modello (stop: ' + msg.stop_reason + ')');
  return testo;
}
