import { notFound } from 'next/navigation';
import Giorno from '../componenti/Giorno';
import { leggiGiorno, elencoDate } from '../../lib/content';

export function generateStaticParams() {
  return elencoDate().map((date) => ({ date }));
}

export const dynamicParams = true;

export function generateMetadata({ params }) {
  return { title: `${params.date} — Il Vangelo del giorno come dono` };
}

export default function Pagina({ params }) {
  const giorno = leggiGiorno(params.date);
  if (!giorno) notFound();

  const tutte = elencoDate();
  const idx = tutte.indexOf(params.date);
  const prec = tutte[idx + 1]; // più vecchia
  const succ = tutte[idx - 1]; // più recente

  return (
    <>
      <Giorno giorno={giorno} />
      <nav className="nav-date">
        <span>{prec ? <a href={`/${prec}`}>← {prec}</a> : null}</span>
        <span>{succ ? <a href={`/${succ}`}>{succ} →</a> : <a href="/">Oggi</a>}</span>
      </nav>
    </>
  );
}
