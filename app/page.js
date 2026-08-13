import Giorno from './componenti/Giorno';
import { leggiGiorno, ultimaData, elencoDate } from '../lib/content';

export const dynamic = 'force-dynamic';

export default function Home() {
  const oggi = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' }); // YYYY-MM-DD
  const data = leggiGiorno(oggi) ? oggi : ultimaData();
  if (!data) {
    return (
      <p>
        Nessun contenuto ancora. Genera il primo giorno chiamando <code>/api/daily</code> o
        aggiungendo un file in <code>content/</code>.
      </p>
    );
  }
  const giorno = leggiGiorno(data);
  const tutte = elencoDate();
  const idx = tutte.indexOf(data);
  const prec = tutte[idx + 1];

  return (
    <>
      {data !== oggi ? (
        <p className="demo-nota">
          Il commento di oggi non è ancora stato generato: qui sotto l&rsquo;ultimo disponibile ({data}).
        </p>
      ) : null}
      <Giorno giorno={giorno} />
      <nav className="nav-date">
        <span>{prec ? <a href={`/${prec}`}>← {prec}</a> : null}</span>
        <a href="/archivio">Archivio completo</a>
      </nav>
    </>
  );
}
