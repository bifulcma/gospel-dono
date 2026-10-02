'use client';

import { useEffect, useRef, useState } from 'react';

// La lectio divina sulle letture del giorno: la scala di Guigo il Certosino in cinque
// gradini. Il testo arriva dal file del giorno; quello che la persona scrive resta solo
// nel suo browser (localStorage): il sito non ha account né database.

const GRADINI = [
  { k: 'lectio', n: 'I', t: 'Lectio', s: 'leggi' },
  { k: 'meditatio', n: 'II', t: 'Meditatio', s: 'rifletti' },
  { k: 'oratio', n: 'III', t: 'Oratio', s: 'prega' },
  { k: 'contemplatio', n: 'IV', t: 'Contemplatio', s: 'taci' },
  { k: 'actio', n: 'V', t: 'Actio', s: 'vivi' },
];
const MINUTI = [5, 10, 15, 20, 30];
const CHIAVE_BOZZA = 'lectio-bozza-v1';
const CHIAVE_DIARIO = 'lectio-diario-v1';
const ARCO = 289.03; // circonferenza del quadrante, r = 46

const vuota = () => ({ word: '', meditatio: '', oratio: '', minutes: 10, silenced: 0, actio: '' });

function leggi(chiave, base) {
  try {
    const v = JSON.parse(localStorage.getItem(chiave) || 'null');
    return v ?? base;
  } catch {
    return base;
  }
}
function scrivi(chiave, valore) {
  try {
    localStorage.setItem(chiave, JSON.stringify(valore));
    return true;
  } catch {
    return false;
  }
}

// Campana sintetizzata: parziali inarmoniche con decadimento esponenziale.
function campana(ctxRef) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (ctxRef.current = ctxRef.current || new AC());
    const t0 = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    [[1, 1, 6], [2.01, 0.5, 4], [2.76, 0.35, 3], [5.4, 0.18, 2], [8.9, 0.08, 1.2]].forEach(([r, a, d]) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 196 * r;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(a, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      o.connect(g);
      g.connect(master);
      o.start(t0);
      o.stop(t0 + d + 0.1);
    });
  } catch {}
}

const giornoBreve = (iso) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('it-IT', { day: 'numeric', month: 'short', timeZone: 'Europe/Paris' });

export default function Lectio({ data, letture, domanda }) {
  const [cur, setCur] = useState(0);
  const [scelta, setScelta] = useState(0);
  const [bozza, setBozza] = useState(vuota);
  const [diario, setDiario] = useState([]);
  const [pronto, setPronto] = useState(false);
  const [aperta, setAperta] = useState(null);
  const [daEliminare, setDaEliminare] = useState(null);
  const [azzera, setAzzera] = useState(false);
  const [avviso, setAvviso] = useState('');
  const [timer, setTimer] = useState({ attivo: false, totale: 0, resto: 0 });

  const audio = useRef(null);
  const fine = useRef(0);
  const intervallo = useRef(null);
  const wake = useRef(null);
  const avvisoT = useRef(null);
  const timerRef = useRef(timer);
  timerRef.current = timer;

  const lettura = letture[scelta] || letture[0];

  // bozza del giorno e diario: solo dopo il montaggio, il server non vede localStorage
  useEffect(() => {
    const b = leggi(CHIAVE_BOZZA, null);
    if (b && b.data === data) {
      setBozza({ ...vuota(), ...b.bozza });
      if (typeof b.scelta === 'number' && letture[b.scelta]) setScelta(b.scelta);
    }
    setDiario(leggi(CHIAVE_DIARIO, []));
    setPronto(true);
  }, [data, letture]);

  useEffect(() => {
    if (pronto) scrivi(CHIAVE_BOZZA, { data, scelta, bozza });
  }, [pronto, data, scelta, bozza]);

  useEffect(() => () => clearInterval(intervallo.current), []);

  function dire(msg) {
    setAvviso(msg);
    clearTimeout(avvisoT.current);
    avvisoT.current = setTimeout(() => setAvviso(''), 2600);
  }

  const campo = (k) => (e) => setBozza((b) => ({ ...b, [k]: e.target.value }));

  function vai(i) {
    if (i !== 3) ferma(true, false);
    setCur(i);
    setAzzera(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function inizia() {
    campana(audio);
    const totale = bozza.minutes * 60;
    fine.current = Date.now() + totale * 1000;
    setTimer({ attivo: true, totale, resto: totale });
    try {
      wake.current = await navigator.wakeLock?.request('screen');
    } catch {
      wake.current = null;
    }
    clearInterval(intervallo.current);
    intervallo.current = setInterval(() => {
      const resto = Math.max(0, (fine.current - Date.now()) / 1000);
      setTimer((t) => ({ ...t, resto }));
      if (resto <= 0) ferma(true, true);
    }, 250);
  }

  function ferma(registra, finito) {
    const t = timerRef.current;
    if (!t.attivo) return;
    clearInterval(intervallo.current);
    const resto = Math.max(0, (fine.current - Date.now()) / 1000);
    const fatti = Math.round((t.totale - resto) / 60);
    timerRef.current = { ...t, attivo: false };
    setTimer({ attivo: false, totale: 0, resto: 0 });
    try {
      wake.current?.release();
    } catch {}
    wake.current = null;
    if (finito) {
      campana(audio);
      dire('Il silenzio è finito');
    }
    if (registra && fatti > 0) setBozza((b) => ({ ...b, silenced: b.silenced + fatti }));
  }

  function salva() {
    if (!bozza.word.trim() && !bozza.meditatio.trim() && !bozza.oratio.trim() && !bozza.actio.trim() && !bozza.silenced) {
      dire('Non c’è ancora niente da salvare');
      return;
    }
    const seduta = {
      id: 's' + Date.now().toString(36),
      day: new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' }),
      createdAt: Date.now(),
      giorno: data,
      ref: lettura.rif,
      word: bozza.word.trim(),
      meditatio: bozza.meditatio.trim(),
      oratio: bozza.oratio.trim(),
      minutes: bozza.silenced,
      actio: bozza.actio.trim(),
    };
    const nuovo = [seduta, ...diario];
    if (!scrivi(CHIAVE_DIARIO, nuovo)) {
      dire('Questo browser non permette di salvare: la seduta resta qui finché non chiudi la pagina');
      return;
    }
    setDiario(nuovo);
    setBozza(vuota());
    setCur(0);
    dire('Salvata nel diario');
  }

  function elimina(id) {
    if (daEliminare !== id) {
      setDaEliminare(id);
      return;
    }
    const nuovo = diario.filter((s) => s.id !== id);
    scrivi(CHIAVE_DIARIO, nuovo);
    setDiario(nuovo);
    setDaEliminare(null);
    setAperta(null);
  }

  const fatto = {
    lectio: cur > 0 || bozza.word || bozza.meditatio,
    meditatio: bozza.word.trim() || bozza.meditatio.trim(),
    oratio: bozza.oratio.trim(),
    contemplatio: bozza.silenced > 0,
    actio: bozza.actio.trim(),
  };

  // statistiche del diario
  const giorni = new Set(diario.map((s) => s.day));
  const iso = (d) => d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });
  let fila = 0;
  if (pronto) {
    const d = new Date();
    if (!giorni.has(iso(d))) d.setDate(d.getDate() - 1);
    while (giorni.has(iso(d))) {
      fila++;
      d.setDate(d.getDate() - 1);
    }
  }
  const settimana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { iso: iso(d), lettera: d.toLocaleDateString('it-IT', { weekday: 'narrow' }) };
  });
  const minutiTot = diario.reduce((a, s) => a + (Number(s.minutes) || 0), 0);

  const secondi = timer.attivo ? Math.ceil(timer.resto) : bozza.minutes * 60;
  const frazione = timer.attivo && timer.totale ? timer.resto / timer.totale : 1;
  const orologio = `${Math.floor(secondi / 60)}:${String(Math.floor(secondi % 60)).padStart(2, '0')}`;

  const Brano = ({ piccolo }) => (
    <div className={'lectio-brano' + (piccolo ? ' piccolo' : '')}>
      <span className="lectio-rif">{lettura.rif}</span>
      {lettura.testo}
    </div>
  );

  const Nav = () => (
    <div className="lectio-nav">
      {cur > 0 ? (
        <button className="lectio-btn quieto" onClick={() => vai(cur - 1)}>← {GRADINI[cur - 1].t}</button>
      ) : <span />}
      {cur < 4 ? (
        <button className="lectio-btn vuoto" onClick={() => vai(cur + 1)}>{GRADINI[cur + 1].t} →</button>
      ) : null}
    </div>
  );

  return (
    <div className="lectio">
      <nav className="scala" aria-label="I cinque gradini">
        {GRADINI.map((g, i) => (
          <button
            key={g.k}
            className={'gradino' + (fatto[g.k] ? ' fatto' : '')}
            aria-current={i === cur ? 'step' : undefined}
            onClick={() => vai(i)}
          >
            <b>{g.n}</b>
            <span>{g.t}</span>
          </button>
        ))}
      </nav>

      <section className="lectio-passo">
        {cur === 0 && (
          <>
            <h2>Lectio</h2>
            <p className="lectio-guida">Leggi lentamente, anche a voce bassa. Poi una seconda volta. Fermati dove una parola ti trattiene.</p>
            {letture.length > 1 && (
              <div className="lectio-scelte" role="group" aria-label="Quale lettura">
                {letture.map((l, i) => (
                  <button key={l.k} className="lectio-chip" aria-pressed={i === scelta} onClick={() => setScelta(i)}>
                    {l.nome}
                  </button>
                ))}
              </div>
            )}
            <Brano />
            <Nav />
          </>
        )}

        {cur === 1 && (
          <>
            <h2>Meditatio</h2>
            <p className="lectio-guida">Rumina la parola. Che cosa dice a te, oggi, nella tua vita concreta?</p>
            <Brano piccolo />
            {domanda ? (
              <div className="lectio-domanda">
                <span className="lectio-etichetta">La domanda di oggi</span>
                <p>{domanda}</p>
                <a href={`/${data}`}>Leggi il paragrafo di Marcus Bachmann</a>
              </div>
            ) : null}
            <label htmlFor="lectio-parola">La parola che mi ha colpito</label>
            <input id="lectio-parola" type="text" placeholder="una frase, o anche una sola parola" value={bozza.word} onChange={campo('word')} />
            <label htmlFor="lectio-med">Che cosa mi dice</label>
            <textarea id="lectio-med" value={bozza.meditatio} onChange={campo('meditatio')} />
            <Nav />
          </>
        )}

        {cur === 2 && (
          <>
            <h2>Oratio</h2>
            <p className="lectio-guida">Rispondi a Dio con le parole che la Parola ti ha suscitato: lode, domanda, pentimento, ringraziamento.</p>
            {bozza.word ? (
              <div className="lectio-brano piccolo"><span className="lectio-rif">la tua parola</span>{bozza.word}</div>
            ) : null}
            <label htmlFor="lectio-ora">La mia preghiera</label>
            <textarea id="lectio-ora" className="alto" value={bozza.oratio} onChange={campo('oratio')} />
            <Nav />
          </>
        )}

        {cur === 3 && (
          <>
            <h2>Contemplatio</h2>
            <p className="lectio-guida">Lascia le parole. Resta davanti a Lui in silenzio. Una campana apre e una chiude.</p>
            <div className="silenzio">
              <div className="quadrante">
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <circle className="traccia" cx="50" cy="50" r="46" />
                  <circle className="arco" cx="50" cy="50" r="46" strokeDasharray={ARCO} strokeDashoffset={ARCO * (1 - frazione)} />
                </svg>
                <div className="ore">{orologio}</div>
              </div>
              <div className="lectio-scelte" role="group" aria-label="Durata">
                {MINUTI.map((m) => (
                  <button
                    key={m}
                    className="lectio-chip"
                    aria-pressed={m === bozza.minutes}
                    disabled={timer.attivo}
                    onClick={() => setBozza((b) => ({ ...b, minutes: m }))}
                  >
                    {m} min
                  </button>
                ))}
              </div>
              {timer.attivo ? (
                <button className="lectio-btn quieto" onClick={() => ferma(true, false)}>Termina</button>
              ) : (
                <button className="lectio-btn" onClick={inizia}>Inizia il silenzio</button>
              )}
              {bozza.silenced ? <p className="lectio-nota">Oggi: {bozza.silenced} min di silenzio.</p> : null}
            </div>
            <Nav />
          </>
        )}

        {cur === 4 && (
          <>
            <h2>Actio</h2>
            <p className="lectio-guida">Un solo gesto concreto per oggi che nasce da questa Parola. Piccolo, verificabile.</p>
            <label htmlFor="lectio-act">Il mio proposito</label>
            <textarea id="lectio-act" className="basso" value={bozza.actio} onChange={campo('actio')} />
            <div className="lectio-riga">
              <button className="lectio-btn" onClick={salva}>Salva nel diario</button>
              <button
                className="lectio-btn quieto"
                onClick={() => {
                  if (!azzera) return setAzzera(true);
                  setBozza(vuota());
                  setAzzera(false);
                  vai(0);
                }}
              >
                {azzera ? 'Sicuro? Tocca di nuovo' : 'Ricomincia da capo'}
              </button>
            </div>
            <Nav />
          </>
        )}
      </section>

      <div className="fregio" aria-hidden="true">❦</div>

      <section className="diario" aria-labelledby="diario-titolo">
        <h2 id="diario-titolo">Il tuo diario</h2>
        <div className="diario-cifre">
          <div><b>{fila}</b><span>giorni di fila</span></div>
          <div><b>{diario.length}</b><span>sedute</span></div>
          <div><b>{minutiTot}</b><span>minuti di silenzio</span></div>
        </div>
        <div className="diario-settimana" aria-label="Ultimi 7 giorni">
          {settimana.map((g) => (
            <i key={g.iso} className={giorni.has(g.iso) ? 'pieno' : ''} title={giornoBreve(g.iso)}>{g.lettera}</i>
          ))}
        </div>
        <p className="lectio-nota">Il diario resta in questo browser, su questo dispositivo: nessuno, nemmeno il sito, lo legge.</p>
        {pronto && diario.length === 0 ? (
          <p className="diario-vuoto">Qui compariranno le tue sedute: la data, il brano, la parola che ti ha colpito e il proposito. Percorri i cinque gradini e salva la prima.</p>
        ) : (
          <ul className="diario-lista">
            {diario.map((s) => (
              <li key={s.id}>
                <button
                  className="diario-voce"
                  aria-expanded={aperta === s.id}
                  onClick={() => {
                    setAperta(aperta === s.id ? null : s.id);
                    setDaEliminare(null);
                  }}
                >
                  <span className="data">{giornoBreve(s.day)}</span>
                  <span className="che">
                    <strong>{s.word || s.ref || 'Seduta'}</strong>
                    <small>{[s.ref, s.minutes ? s.minutes + ' min' : ''].filter(Boolean).join(' · ')}</small>
                  </span>
                </button>
                {aperta === s.id && (
                  <div className="diario-corpo">
                    {s.meditatio && <p><span className="lectio-etichetta">Meditatio</span>{s.meditatio}</p>}
                    {s.oratio && <p><span className="lectio-etichetta">Oratio</span>{s.oratio}</p>}
                    {s.actio && <p><span className="lectio-etichetta">Actio</span>{s.actio}</p>}
                    {s.giorno && <a href={`/${s.giorno}`}>Le letture di quel giorno</a>}
                    <div>
                      <button className="lectio-btn pericolo" onClick={() => elimina(s.id)}>
                        {daEliminare === s.id ? 'Conferma: elimina' : 'Elimina'}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {avviso ? <div className="lectio-avviso" role="status">{avviso}</div> : null}
    </div>
  );
}
