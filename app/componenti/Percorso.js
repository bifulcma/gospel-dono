'use client';

import { useEffect, useRef, useState } from 'react';
import {
  TAPPE, FASI, REGOLE, ORAZIONE_PREPARATORIA, ADDIZIONE_INGRESSO, ESAME_PREGHIERA,
} from '../../lib/percorso';

// Il percorso degli Esercizi, una tappa alla volta, nell'ordine del libro.
// Si avanza quando la persona lo decide [4], si può ripetere [62], e non si legge
// il mistero che non si deve ancora contemplare [127]: le tappe future restano velate.
// Tutto resta nel browser (localStorage): il sito non ha account né database.

const PASSI = [
  { k: 'preparazione', n: 'I', t: 'Preparazione' },
  { k: 'punti', n: 'II', t: 'I punti' },
  { k: 'colloquio', n: 'III', t: 'Colloquio' },
  { k: 'esame', n: 'IV', t: 'Esame' },
];
const MINUTI = [15, 30, 45, 60];
const STATI = [
  { k: 'consolazione', t: 'Consolazione' },
  { k: 'desolazione', t: 'Desolazione' },
  { k: 'quiete', t: 'Né l’una né l’altra' },
];
const CHIAVE_STATO = 'percorso-stato-v1';
const CHIAVE_BOZZE = 'percorso-bozze-v1';
const CHIAVE_DIARIO = 'percorso-diario-v1';
const ARCO = 289.03;

const vuota = () => ({ note: '', colloquio: '', esame: '', stato: '', minutes: 30, silenced: 0 });

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

const oggiISO = (d = new Date()) => d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });
const giornoBreve = (iso) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('it-IT', { day: 'numeric', month: 'short', timeZone: 'Europe/Paris' });

export default function Percorso() {
  const [pronto, setPronto] = useState(false);
  const [stato, setStato] = useState({ raggiunta: 0, corrente: 0 });
  const [bozze, setBozze] = useState({});
  const [diario, setDiario] = useState([]);
  const [passo, setPasso] = useState(0);
  const [salvata, setSalvata] = useState(false);
  const [mappa, setMappa] = useState(false);
  const [aperta, setAperta] = useState(null);
  const [daEliminare, setDaEliminare] = useState(null);
  const [daAzzerare, setDaAzzerare] = useState(false);
  const [avviso, setAvviso] = useState('');
  const [timer, setTimer] = useState({ attivo: false, totale: 0, resto: 0 });

  const audio = useRef(null);
  const fine = useRef(0);
  const intervallo = useRef(null);
  const wake = useRef(null);
  const avvisoT = useRef(null);
  const timerRef = useRef(timer);
  timerRef.current = timer;

  useEffect(() => {
    const s = leggi(CHIAVE_STATO, null);
    const d = leggi(CHIAVE_DIARIO, []);
    if (s && Number.isInteger(s.raggiunta)) {
      let r = Math.min(Math.max(s.raggiunta, 0), TAPPE.length - 1);
      let c = Math.min(Math.max(s.corrente ?? r, 0), r);
      // Seduta salvata sull'ultima tappa raggiunta e pagina chiusa senza scegliere:
      // si prosegue, a meno che la persona abbia chiesto di ripeterla.
      const id = TAPPE[c].id;
      if (c === r && c < TAPPE.length - 1 && s.ripeti !== id && d.some((x) => x.tappaId === id)) {
        r = c = c + 1;
        dire(`Hai concluso «${TAPPE[c - 1].titolo}»: oggi si prosegue.`);
      }
      setStato({ raggiunta: r, corrente: c, ripeti: c === s.corrente ? s.ripeti : undefined });
    }
    setBozze(leggi(CHIAVE_BOZZE, {}));
    setDiario(d);
    setPronto(true);
  }, []);

  useEffect(() => { if (pronto) scrivi(CHIAVE_STATO, stato); }, [pronto, stato]);
  useEffect(() => { if (pronto) scrivi(CHIAVE_BOZZE, bozze); }, [pronto, bozze]);
  useEffect(() => () => clearInterval(intervallo.current), []);

  const tappa = TAPPE[stato.corrente];
  const bozza = { ...vuota(), ...(bozze[tappa.id] || {}) };
  const regola = REGOLE[tappa.regole];
  const sedutePerGruppo = diario.filter((s) => (TAPPE.find((t) => t.id === s.tappaId)?.regole || 'prima') === tappa.regole).length;
  const indiceRegola = sedutePerGruppo % regola.testi.length;
  const volteQui = diario.filter((s) => s.tappaId === tappa.id).length;

  function dire(msg) {
    setAvviso(msg);
    clearTimeout(avvisoT.current);
    avvisoT.current = setTimeout(() => setAvviso(''), 2800);
  }

  function aggiorna(campi) {
    setBozze((b) => ({ ...b, [tappa.id]: { ...vuota(), ...(b[tappa.id] || {}), ...campi } }));
  }
  const campo = (k) => (e) => aggiorna({ [k]: e.target.value });

  function vaiPasso(i) {
    if (i !== 1) ferma(true, false);
    setPasso(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function scegliTappa(i) {
    ferma(true, false);
    setStato((s) => ({ ...s, corrente: i }));
    setPasso(0);
    setSalvata(false);
    setMappa(false);
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
      dire('Il tempo della preghiera è finito');
    }
    if (registra && fatti > 0) {
      setBozze((b) => {
        const cur = { ...vuota(), ...(b[tappa.id] || {}) };
        return { ...b, [tappa.id]: { ...cur, silenced: cur.silenced + fatti } };
      });
    }
  }

  function salva() {
    if (!bozza.note.trim() && !bozza.colloquio.trim() && !bozza.esame.trim() && !bozza.stato && !bozza.silenced) {
      dire('Non c’è ancora niente da salvare');
      return;
    }
    const seduta = {
      id: 's' + Date.now().toString(36),
      day: oggiISO(),
      createdAt: Date.now(),
      tappaId: tappa.id,
      n: tappa.n,
      titolo: tappa.titolo,
      note: bozza.note.trim(),
      colloquio: bozza.colloquio.trim(),
      esame: bozza.esame.trim(),
      stato: bozza.stato,
      minutes: bozza.silenced,
    };
    const nuovo = [seduta, ...diario];
    if (!scrivi(CHIAVE_DIARIO, nuovo)) {
      dire('Questo browser non permette di salvare');
      return;
    }
    setDiario(nuovo);
    setBozze((b) => {
      const { [tappa.id]: _, ...resto } = b;
      return resto;
    });
    setSalvata(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function avanza() {
    const prossima = Math.min(stato.corrente + 1, TAPPE.length - 1);
    setStato((s) => ({ raggiunta: Math.max(s.raggiunta, prossima), corrente: prossima }));
    setPasso(0);
    setSalvata(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function ripeti() {
    setStato((s) => ({ ...s, ripeti: tappa.id }));
    setPasso(0);
    setSalvata(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function elimina(id) {
    if (daEliminare !== id) return setDaEliminare(id);
    const nuovo = diario.filter((s) => s.id !== id);
    scrivi(CHIAVE_DIARIO, nuovo);
    setDiario(nuovo);
    setDaEliminare(null);
    setAperta(null);
  }

  function azzera() {
    if (!daAzzerare) return setDaAzzerare(true);
    setStato({ raggiunta: 0, corrente: 0 });
    setBozze({});
    setDaAzzerare(false);
    setMappa(false);
    setPasso(0);
    dire('Il percorso riparte dal Principio e Fondamento. Il diario resta.');
  }

  // statistiche
  const giorni = new Set(diario.map((s) => s.day));
  let fila = 0;
  if (pronto) {
    const d = new Date();
    if (!giorni.has(oggiISO(d))) d.setDate(d.getDate() - 1);
    while (giorni.has(oggiISO(d))) {
      fila++;
      d.setDate(d.getDate() - 1);
    }
  }
  const minutiTot = diario.reduce((a, s) => a + (Number(s.minutes) || 0), 0);

  const secondi = timer.attivo ? Math.ceil(timer.resto) : bozza.minutes * 60;
  const frazione = timer.attivo && timer.totale ? timer.resto / timer.totale : 1;
  const orologio = `${Math.floor(secondi / 60)}:${String(Math.floor(secondi % 60)).padStart(2, '0')}`;

  const fatto = {
    preparazione: passo > 0,
    punti: bozza.note.trim() || bozza.silenced > 0,
    colloquio: bozza.colloquio.trim(),
    esame: bozza.esame.trim() || bozza.stato,
  };

  const Nav = () => (
    <div className="lectio-nav">
      {passo > 0 ? (
        <button className="lectio-btn quieto" onClick={() => vaiPasso(passo - 1)}>← {PASSI[passo - 1].t}</button>
      ) : <span />}
      {passo < 3 ? (
        <button className="lectio-btn vuoto" onClick={() => vaiPasso(passo + 1)}>{PASSI[passo + 1].t} →</button>
      ) : null}
    </div>
  );

  return (
    <div className="lectio">
      {/* dove sono nel cammino */}
      <div className="cammino-testa">
        <div className="cammino-dove">
          <span className="lectio-etichetta">{tappa.faseNome}</span>
          <span className="cammino-n">Tappa {tappa.n} di {TAPPE.length}</span>
        </div>
        <div className="cammino-barra" aria-hidden="true">
          {FASI.map((f) => {
            const tot = TAPPE.filter((t) => t.fase === f.k).length;
            const fatte = TAPPE.filter((t) => t.fase === f.k && t.n - 1 <= stato.raggiunta).length;
            return (
              <span key={f.k} style={{ flexGrow: tot }} className={f.k === tappa.fase ? 'qui' : ''}>
                <i style={{ width: `${(fatte / tot) * 100}%` }} />
              </span>
            );
          })}
        </div>
        <button className="cammino-apri" onClick={() => setMappa((m) => !m)} aria-expanded={mappa}>
          {mappa ? 'Chiudi il cammino' : 'Il cammino'}
        </button>
      </div>

      {mappa && (
        <section className="cammino-mappa" aria-label="Il cammino">
          <p className="lectio-nota">
            Si legge solo il mistero che si contempla: le tappe che non hai ancora raggiunto restano velate [127].
          </p>
          {FASI.map((f) => {
            const tappe = TAPPE.filter((t) => t.fase === f.k);
            const viste = tappe.filter((t) => t.n - 1 <= stato.raggiunta);
            const velate = tappe.length - viste.length;
            return (
              <div key={f.k} className="cammino-fase">
                <h3>{f.nome}</h3>
                <ol>
                  {viste.map((t) => (
                    <li key={t.id}>
                      <button
                        className={t.n - 1 === stato.corrente ? 'qui' : ''}
                        onClick={() => scegliTappa(t.n - 1)}
                      >
                        <span className="num">{t.n}</span>
                        {t.titolo}
                        {diario.some((s) => s.tappaId === t.id) ? <span className="segno" aria-label="fatta"> ✓</span> : null}
                      </button>
                    </li>
                  ))}
                </ol>
                {velate > 0 ? <p className="velate">{velate === 1 ? 'Ancora una tappa' : `Ancora ${velate} tappe`}</p> : null}
              </div>
            );
          })}
          <button className="lectio-btn quieto" onClick={azzera}>
            {daAzzerare ? 'Sicuro? Il diario resta. Tocca di nuovo' : 'Ricomincia il percorso'}
          </button>
        </section>
      )}

      <header className="tappa-capo">
        <h2>{tappa.titolo}</h2>
        <p className="tappa-num">Esercizi {tappa.num}{volteQui ? ` · fatta ${volteQui === 1 ? 'una volta' : volteQui + ' volte'}` : ''}</p>
      </header>

      {salvata ? (
        <section className="lectio-passo">
          <div className="lectio-domanda">
            <span className="lectio-etichetta">Seduta salvata</span>
            <p>
              Ignazio non fissa il passo: si va avanti quando si è trovato ciò che si cerca [4], e si torna
              dove si è sentito di più [62]. Che cosa fai alla prossima seduta?
            </p>
          </div>
          <div className="lectio-riga">
            <button className="lectio-btn vuoto" onClick={ripeti}>Ripeti questa tappa</button>
            {stato.corrente < TAPPE.length - 1 ? (
              <button className="lectio-btn" onClick={avanza}>
                Passa alla tappa {tappa.n + 1}: {TAPPE[stato.corrente + 1].titolo} →
              </button>
            ) : (
              <p className="lectio-nota">Sei alla fine del libro. Puoi ripetere qualunque tappa dal cammino.</p>
            )}
          </div>
        </section>
      ) : (
        <>
          <nav className="scala quattro" aria-label="Le parti della seduta">
            {PASSI.map((p, i) => (
              <button
                key={p.k}
                className={'gradino' + (fatto[p.k] ? ' fatto' : '')}
                aria-current={i === passo ? 'step' : undefined}
                onClick={() => vaiPasso(i)}
              >
                <b>{p.n}</b>
                <span>{p.t}</span>
              </button>
            ))}
          </nav>

          <section className="lectio-passo">
            {passo === 0 && (
              <>
                <p className="lectio-guida">{ADDIZIONE_INGRESSO} [75]</p>
                <div className="ignazio">
                  <span className="lectio-etichetta">Orazione preparatoria [46]</span>
                  <p>{ORAZIONE_PREPARATORIA}</p>
                </div>
                {tappa.storia ? (
                  <div className="ignazio">
                    <span className="lectio-etichetta">La storia</span>
                    <p>{tappa.storia}</p>
                  </div>
                ) : null}
                <div className="ignazio">
                  <span className="lectio-etichetta">Composizione di luogo</span>
                  <p>{tappa.luogo}</p>
                </div>
                <div className="ignazio grazia">
                  <span className="lectio-etichetta">La grazia da chiedere</span>
                  <p>{tappa.grazia}</p>
                  {tappa.graziaNota ? <small>{tappa.graziaNota}</small> : null}
                </div>
                {tappa.brano ? (
                  <p className="lectio-nota">
                    Il brano: <a href={tappa.brano.url} target="_blank" rel="noopener">{tappa.brano.rif} ↗</a>
                  </p>
                ) : null}
                <Nav />
              </>
            )}

            {passo === 1 && (
              <>
                <p className="lectio-guida">
                  Dove trovo ciò che cerco, lì mi fermo, senza ansia di passare oltre, finché mi basta [76].
                </p>
                <ol className="punti">
                  {tappa.punti.map((p, i) => <li key={i}>{p}</li>)}
                </ol>
                <div className="silenzio">
                  <div className="quadrante piccolo">
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
                        onClick={() => aggiorna({ minutes: m })}
                      >
                        {m === 60 ? 'un’ora' : `${m} min`}
                      </button>
                    ))}
                  </div>
                  {timer.attivo ? (
                    <button className="lectio-btn quieto" onClick={() => ferma(true, false)}>Termina</button>
                  ) : (
                    <button className="lectio-btn" onClick={inizia}>Inizia la preghiera</button>
                  )}
                  <p className="lectio-nota">
                    Ignazio chiede un’ora intera, e di non accorciarla nella desolazione [12]–[13].
                    {bozza.silenced ? ` Oggi: ${bozza.silenced} min.` : ''}
                  </p>
                </div>
                <label htmlFor="pc-note">Dove mi sono fermato, che cosa ho sentito</label>
                <textarea id="pc-note" value={bozza.note} onChange={campo('note')} />
                <Nav />
              </>
            )}

            {passo === 2 && (
              <>
                <div className="ignazio">
                  <span className="lectio-etichetta">Il colloquio</span>
                  <p>{tappa.colloquio}</p>
                </div>
                <label htmlFor="pc-coll">Le mie parole</label>
                <textarea id="pc-coll" className="alto" value={bozza.colloquio} onChange={campo('colloquio')} />
                <Nav />
              </>
            )}

            {passo === 3 && (
              <>
                <p className="lectio-guida">{ESAME_PREGHIERA} [77]</p>
                <div className="lectio-scelte sinistra" role="group" aria-label="Come è andata">
                  {STATI.map((s) => (
                    <button
                      key={s.k}
                      className="lectio-chip"
                      aria-pressed={bozza.stato === s.k}
                      onClick={() => aggiorna({ stato: bozza.stato === s.k ? '' : s.k })}
                    >
                      {s.t}
                    </button>
                  ))}
                </div>
                <label htmlFor="pc-esame">Come mi è andata, e perché</label>
                <textarea id="pc-esame" className="basso" value={bozza.esame} onChange={campo('esame')} />
                <div className="ignazio regola">
                  <span className="lectio-etichetta">
                    {regola.titolo} · regola {indiceRegola + 1} di {regola.testi.length}
                  </span>
                  <p>{regola.testi[indiceRegola]}</p>
                  <small>
                    {tappa.regole === 'prima'
                      ? 'Le regole della seconda settimana arriveranno quando sarai nella seconda settimana [9].'
                      : 'Ora valgono le regole di maggiore discernimento [10].'}
                  </small>
                </div>
                <div className="lectio-riga">
                  <button className="lectio-btn" onClick={salva}>Salva la seduta</button>
                </div>
                <Nav />
              </>
            )}
          </section>
        </>
      )}

      <div className="fregio" aria-hidden="true">❦</div>

      <section className="diario" aria-labelledby="diario-titolo">
        <h2 id="diario-titolo">Il tuo diario</h2>
        <div className="diario-cifre">
          <div><b>{fila}</b><span>giorni di fila</span></div>
          <div><b>{diario.length}</b><span>sedute</span></div>
          <div><b>{minutiTot}</b><span>minuti di preghiera</span></div>
        </div>
        <p className="lectio-nota">Il diario resta in questo browser, su questo dispositivo: nessuno, nemmeno il sito, lo legge.</p>
        {pronto && diario.length === 0 ? (
          <p className="diario-vuoto">
            Qui compariranno le tue sedute: la tappa, se c’è stata consolazione o desolazione, il colloquio
            e l’esame. Rileggerle è già discernimento [334].
          </p>
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
                    <strong>{s.titolo}</strong>
                    <small>
                      {[`tappa ${s.n}`, STATI.find((x) => x.k === s.stato)?.t, s.minutes ? s.minutes + ' min' : '']
                        .filter(Boolean)
                        .join(' · ')}
                    </small>
                  </span>
                </button>
                {aperta === s.id && (
                  <div className="diario-corpo">
                    {s.note && <p><span className="lectio-etichetta">Nei punti</span>{s.note}</p>}
                    {s.colloquio && <p><span className="lectio-etichetta">Colloquio</span>{s.colloquio}</p>}
                    {s.esame && <p><span className="lectio-etichetta">Esame</span>{s.esame}</p>}
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
