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

function Brano({ testo, aperto = false }) {
  if (!testo) return null;
  return (
    <details className="brano" open={aperto || undefined}>
      <summary>Leggi il testo</summary>
      <p className="testo-sacro">{testo}</p>
    </details>
  );
}

export default function Giorno({ giorno }) {
  const { meta, sezioni } = giorno;
  const dataIT = new Date(giorno.data + 'T12:00:00Z').toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris',
  });
  const haBizantino = meta.vangelo_ortodosso || meta.epistola_ortodossa;

  return (
    <article>
      <header className="capo">
        <p className="eyebrow">{dataIT}</p>
        <h1 className="titolo">{meta.titolo && meta.titolo !== 'DA INSERIRE' ? meta.titolo : 'Il Vangelo del giorno'}</h1>
        <p className="sottotitolo">Quattro voci, un criterio: il dono.</p>
        <div className="fregio" aria-hidden="true">❦</div>
      </header>

      {meta.demo ? (
        <p className="demo-nota">
          Contenuto dimostrativo: commenti d&rsquo;esempio scritti per mostrare la rubrica.
          Le pericopi ortodosse sono indicative e da verificare sul calendario bizantino.
        </p>
      ) : null}

      <div className="letture">
        <section className="lezione">
          <h3 className="lezione-capo">Lezionario romano</h3>
          <p className="rif"><span className="segno" aria-hidden="true">✠</span>{meta.vangelo || '—'}</p>
          <Brano testo={meta.vangelo_testo} aperto />
          {meta.prima_lettura ? (
            <>
              <p className="rif">{meta.prima_lettura}</p>
              <Brano testo={meta.prima_testo} />
            </>
          ) : null}
          {meta.salmo ? (
            <>
              <p className="rif">{meta.salmo}</p>
              <Brano testo={meta.salmo_testo} />
            </>
          ) : null}
        </section>

        {haBizantino ? (
          <section className="lezione">
            <h3 className="lezione-capo">Lezionario bizantino</h3>
            {meta.vangelo_ortodosso ? (
              <>
                <p className="rif"><span className="segno" aria-hidden="true">✠</span>{meta.vangelo_ortodosso}</p>
                <Brano testo={meta.vangelo_ortodosso_testo} />
              </>
            ) : null}
            {meta.epistola_ortodossa ? (
              <>
                <p className="rif">{meta.epistola_ortodossa}</p>
                <Brano testo={meta.epistola_ortodossa_testo} />
              </>
            ) : null}
          </section>
        ) : null}
      </div>

      <div className="fregio" aria-hidden="true">❦</div>

      {sezioni.map((s) => {
        const { classe, firma } = stileSezione(s.titolo);
        return (
          <section key={s.titolo} className={`voce ${classe}`}>
            <h2>{s.titolo}</h2>
            {firma ? <p className="firma">{firma}</p> : null}
            <div className="corpo" dangerouslySetInnerHTML={{ __html: marked.parse(s.corpo) }} />
          </section>
        );
      })}
    </article>
  );
}
