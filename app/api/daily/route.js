import { NextResponse } from 'next/server';
import { generaGiorno } from '../../../lib/pipeline';

export const dynamic = 'force-dynamic';

// Chiamata dal cron Vercel ogni giorno alle 02:00 UTC (vercel.json).
// In locale: curl "http://localhost:3000/api/daily?data=2026-08-14"
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ errore: 'non autorizzato' }, { status: 401 });
    }
  }

  const url = new URL(request.url);
  const data =
    url.searchParams.get('data') ||
    new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });

  try {
    const esito = await generaGiorno(data);
    return NextResponse.json(esito, { status: esito.stato === 'errore' ? 400 : 200 });
  } catch (e) {
    return NextResponse.json({ stato: 'errore', dettaglio: String(e?.message || e) }, { status: 500 });
  }
}
