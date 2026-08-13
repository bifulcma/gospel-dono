import { elencoDate, leggiGiorno } from '../../lib/content';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Archivio — Il Vangelo del giorno come dono' };

export default function Archivio() {
  const giorni = elencoDate().map((d) => ({ data: d, meta: leggiGiorno(d).meta }));
  return (
    <>
      <h1 className="titolo">Archivio</h1>
      <p className="sottotitolo">Tutti i giorni commentati, dal più recente.</p>
      <ul className="archivio">
        {giorni.map(({ data, meta }) => (
          <li key={data}>
            <a href={`/${data}`}>{meta.titolo && meta.titolo !== 'DA INSERIRE' ? meta.titolo : 'Vangelo del giorno'}</a>
            <span className="data">{data} · {meta.vangelo || '—'}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
