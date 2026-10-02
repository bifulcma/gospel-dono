import Lectio from '../componenti/Lectio';
import { leggiGiorno, ultimaData } from '../../lib/content';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Lectio divina — Il Vangelo del giorno come dono',
  description:
    'La lectio divina sulle letture del giorno: lectio, meditatio, oratio, contemplatio, actio. Con un tempo di silenzio e un diario che resta nel tuo browser.',
};

// L'ultima frase interrogativa del paragrafo di Bachmann: la domanda della rubrica.
function domandaDelGiorno(sezioni) {
  const dono = sezioni.find((s) => /logica del dono/i.test(s.titolo));
  if (!dono) return null;
  const domande = dono.corpo.replace(/\s+/g, ' ').match(/[^.!?]*\?/g);
  return domande ? domande[domande.length - 1].trim() : null;
}

export default function PaginaLectio({ searchParams }) {
  const oggi = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });
  const chiesta = searchParams?.data;
  const data = [chiesta, oggi].find((d) => d && leggiGiorno(d)) || ultimaData();
  const giorno = data ? leggiGiorno(data) : null;

  if (!giorno) {
    return <p>Le letture non sono ancora disponibili. Riprova più tardi.</p>;
  }

  const { meta } = giorno;
  const letture = [
    { k: 'vangelo', nome: 'Vangelo', rif: meta.vangelo, testo: meta.vangelo_testo },
    { k: 'prima', nome: 'Prima lettura', rif: meta.prima_lettura, testo: meta.prima_testo },
    { k: 'seconda', nome: 'Seconda lettura', rif: meta.seconda_lettura, testo: meta.seconda_testo },
    { k: 'salmo', nome: 'Salmo', rif: meta.salmo, testo: meta.salmo_testo },
  ].filter((l) => l.rif && l.testo);

  const dataIT = new Date(data + 'T12:00:00Z').toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris',
  });

  return (
    <article>
      <header className="capo">
        <p className="eyebrow">{dataIT}</p>
        <h1 className="titolo">Lectio divina</h1>
        <p className="sottotitolo">La scala dei monaci, un gradino alla volta.</p>
        <div className="fregio" aria-hidden="true">❦</div>
      </header>
      {data !== (chiesta || oggi) ? (
        <p className="demo-nota">Le letture di oggi non sono ancora pronte: qui sotto quelle del {data}.</p>
      ) : null}
      <Lectio data={data} letture={letture} domanda={domandaDelGiorno(giorno.sezioni)} />
    </article>
  );
}
