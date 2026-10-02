import Percorso from '../componenti/Percorso';

export const metadata = {
  title: 'Il percorso degli Esercizi — Il Vangelo del giorno come dono',
  description:
    'Gli Esercizi spirituali di sant’Ignazio una tappa alla volta, nell’ordine del libro: dal Principio e Fondamento alla Contemplazione per ottenere amore, con le regole di discernimento al momento giusto.',
};

export default function PaginaPercorso() {
  return (
    <article>
      <header className="capo">
        <p className="eyebrow">Esercizi spirituali</p>
        <h1 className="titolo">Il percorso di Ignazio</h1>
        <p className="sottotitolo">Una tappa alla volta, nell’ordine del libro.</p>
        <div className="fregio" aria-hidden="true">❦</div>
      </header>
      <Percorso />
      <p className="lectio-nota fonte">
        Testi tradotti dall’Autografo spagnolo degli <em>Esercizi spirituali</em>; i numeri tra
        parentesi quadre sono quelli del libro. Le parole del Vangelo nei punti sono quelle che
        Ignazio stesso cita.
      </p>
    </article>
  );
}
