import { elencoDate, leggiGiorno } from '../../lib/content';

export const dynamic = 'force-dynamic';

const esc = (s) =>
  String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function GET(request) {
  const origine = new URL(request.url).origin;
  const items = elencoDate()
    .slice(0, 30)
    .map((d) => {
      const { meta } = leggiGiorno(d);
      const titolo = meta.titolo && meta.titolo !== 'DA INSERIRE' ? meta.titolo : 'Vangelo del giorno';
      return `    <item>
      <title>${esc(`${d} — ${titolo}`)}</title>
      <link>${origine}/${d}</link>
      <guid>${origine}/${d}</guid>
      <description>${esc(`Vangelo: ${meta.vangelo || '—'}. Tre voci confessionali sotto la logica del dono.`)}</description>
      <pubDate>${new Date(d + 'T05:00:00Z').toUTCString()}</pubDate>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Il Vangelo del giorno come dono</title>
    <link>${origine}</link>
    <description>Commento quotidiano del Vangelo da tre voci — cattolica, protestante, dispensazionalista — con la logica del dono di Marcus Bachmann.</description>
    <language>it</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
