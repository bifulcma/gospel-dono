import { marked } from 'marked';

// Il sito ha una voce sola: il paragrafo di Marcus Bachmann. I giorni d'archivio
// generati quando c'erano anche le voci confessionali conservano quelle sezioni nel
// file, ma non vengono più pubblicate.
const SEZIONE_DONO = /logica del dono/i;
const FIRMA_DONO = 'Marcus Bachmann, dal suo La logica del dono';

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

  return (
    <article>
      <header className="capo">
        <p className="eyebrow">{dataIT}</p>
        <h1 className="titolo">{meta.titolo && meta.titolo !== 'DA INSERIRE' ? meta.titolo : 'Il Vangelo del giorno'}</h1>
        <p className="sottotitolo">Una voce, un criterio: il dono.</p>
        <div className="fregio" aria-hidden="true">❦</div>
      </header>

      {meta.demo ? (
        <p className="demo-nota">
          Contenuto dimostrativo: commenti d&rsquo;esempio scritti per mostrare la rubrica.
        </p>
      ) : null}

      <div className="letture">
        <section className="lezione">
          <h3 className="lezione-capo">Le letture del giorno</h3>
          <p className="rif"><span className="segno" aria-hidden="true">✠</span>{meta.vangelo || '—'}</p>
          <Brano testo={meta.vangelo_testo} aperto />
          {meta.prima_lettura ? (
            <>
              <p className="rif">{meta.prima_lettura}</p>
              <Brano testo={meta.prima_testo} />
            </>
          ) : null}
          {meta.seconda_lettura ? (
            <>
              <p className="rif">{meta.seconda_lettura}</p>
              <Brano testo={meta.seconda_testo} />
            </>
          ) : null}
          {meta.salmo ? (
            <>
              <p className="rif">{meta.salmo}</p>
              <Brano testo={meta.salmo_testo} />
            </>
          ) : null}
        </section>
      </div>

      <div className="fregio" aria-hidden="true">❦</div>

      {sezioni
        .filter((s) => SEZIONE_DONO.test(s.titolo))
        .map((s) => (
          <section key={s.titolo} className="voce dono">
            <h2>{s.titolo}</h2>
            <p className="firma">{FIRMA_DONO}</p>
            <div className="corpo" dangerouslySetInnerHTML={{ __html: marked.parse(s.corpo) }} />
          </section>
        ))}
    </article>
  );
}
