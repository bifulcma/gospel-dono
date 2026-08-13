import { marked } from 'marked';

const CLASSI = [
  { test: /logica del dono/i, classe: 'dono', firma: 'La voce principale · Marcus Bachmann' },
  { test: /cattolica/i, classe: 'cattolica', firma: 'Balthasar · Marion · CCC · Ratzinger' },
  { test: /ortodossa/i, classe: 'ortodossa', firma: 'Crisostomo · Massimo · Palamas · Schmemann · Lossky — sul proprio lezionario' },
  { test: /protestante/i, classe: 'protestante', firma: 'Lutero · Calvino · Confessioni · Barth · Bonhoeffer' },
  { test: /dispensazionalista/i, classe: 'dispensazionalista', firma: 'Scofield · Darby · Chafer · Ryrie · Walvoord — chiave premillenarista dichiarata' },
];

function stileSezione(titolo) {
  return CLASSI.find((c) => c.test.test(titolo)) || { classe: '', firma: '' };
}

export default function Giorno({ giorno }) {
  const { meta, sezioni } = giorno;
  const dataIT = new Date(giorno.data + 'T12:00:00Z').toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris',
  });

  return (
    <article>
      <p className="eyebrow">{dataIT}</p>
      <h1 className="titolo">{meta.titolo && meta.titolo !== 'DA INSERIRE' ? meta.titolo : 'Il Vangelo del giorno'}</h1>
      <p className="sottotitolo">Quattro voci, un criterio: il dono.</p>

      {meta.demo ? (
        <p className="demo-nota">
          Contenuto dimostrativo: commenti d&rsquo;esempio scritti per mostrare la rubrica.
          Le pericopi ortodosse sono indicative e da verificare sul calendario bizantino.
        </p>
      ) : null}

      <dl className="letture">
        <dt>Vangelo (lezionario cattolico)</dt>
        <dd>{meta.vangelo || '—'}</dd>
        {meta.vangelo_testo ? <dd className="testo-sacro">{meta.vangelo_testo}</dd> : null}
        {meta.prima_lettura ? (<><dt>Prima lettura</dt><dd>{meta.prima_lettura}</dd></>) : null}
        {meta.prima_testo ? <dd className="testo-sacro">{meta.prima_testo}</dd> : null}
        {meta.salmo ? (<><dt>Salmo</dt><dd>{meta.salmo}</dd></>) : null}
        {meta.salmo_testo ? <dd className="testo-sacro">{meta.salmo_testo}</dd> : null}
        {meta.vangelo_ortodosso ? (<><dt>Vangelo (lezionario bizantino)</dt><dd>{meta.vangelo_ortodosso}</dd></>) : null}
        {meta.vangelo_ortodosso_testo ? <dd className="testo-sacro">{meta.vangelo_ortodosso_testo}</dd> : null}
        {meta.epistola_ortodossa ? (<><dt>Epistola (lezionario bizantino)</dt><dd>{meta.epistola_ortodossa}</dd></>) : null}
        {meta.epistola_ortodossa_testo ? <dd className="testo-sacro">{meta.epistola_ortodossa_testo}</dd> : null}
      </dl>

      {sezioni.map((s) => {
        const { classe, firma } = stileSezione(s.titolo);
        return (
          <section key={s.titolo} className={`voce ${classe}`}>
            <h2>{s.titolo}</h2>
            {firma ? <p className="firma">{firma}</p> : null}
            <div dangerouslySetInnerHTML={{ __html: marked.parse(s.corpo) }} />
          </section>
        );
      })}
    </article>
  );
}
