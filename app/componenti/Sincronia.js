'use client';

import { useEffect, useRef, useState } from 'react';
import {
  CAMPI_STATO, canonico, chiaviDa, cifra, codiceValido, componi, decifra, formattaCodice,
  normalizzaCodice, nuovoCodice, pulisci, scomponi, unisci,
} from '../../lib/sincronia';

// Il percorso resta in localStorage (funziona anche offline); con un codice personale
// una copia cifrata va anche sul server, per ritrovarla sugli altri dispositivi.
// Come si uniscono i dati: lib/sincronia.js.

export const CHIAVE_STATO = 'percorso-stato-v1';
export const CHIAVE_BOZZE = 'percorso-bozze-v1';
export const CHIAVE_DIARIO = 'percorso-diario-v1';
const CHIAVE_SYNC = 'percorso-sync-v1'; // { codice }
const CHIAVE_TEMPI = 'percorso-tempi-v1'; // quando è cambiato ogni campo
const CHIAVE_ELIMINATE = 'percorso-eliminate-v1'; // sedute eliminate

export function leggi(chiave, base) {
  try {
    const v = JSON.parse(localStorage.getItem(chiave) || 'null');
    return v ?? base;
  } catch {
    return base;
  }
}
export function scrivi(chiave, valore) {
  try {
    localStorage.setItem(chiave, JSON.stringify(valore));
    return true;
  } catch {
    return false;
  }
}

async function chiama(corpo) {
  const r = await fetch('/api/percorso', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
    cache: 'no-store',
  });
  if (r.status === 409) return null;
  if (r.status === 503) throw new Error('non-configurata');
  if (!r.ok) throw new Error(`http ${r.status}`);
  return r.json();
}

// applica(cambi, primo): riceve { stato?, bozze?, diario? } già uniti con quelli di qui;
// primo = prima sincronizzazione dopo l'apertura della pagina o dopo aver collegato il codice.
export function useSincronia({ pronto, stato, bozze, diario, applica }) {
  const [codice, setCodice] = useState('');
  const [esito, setEsito] = useState({ fase: 'spenta', quando: 0 });

  const tempi = useRef({});
  const eliminate = useRef({});
  const visti = useRef(null);
  const ora = useRef(null);
  ora.current = { stato, bozze, diario };
  const applicaRef = useRef(applica);
  applicaRef.current = applica;
  const attivo = useRef({ codice: '' });
  const primo = useRef(false);
  const sporco = useRef(false);
  const timer = useRef(null);
  const inVolo = useRef(false);
  const ancora = useRef(false);

  const locale = () => componi({ ...ora.current, tempi: tempi.current, eliminate: eliminate.current });

  function usa(c) {
    clearTimeout(timer.current);
    attivo.current = { codice: c };
    primo.current = true;
    scrivi(CHIAVE_SYNC, { codice: c });
    setCodice(c);
  }

  useEffect(() => {
    const s = leggi(CHIAVE_STATO, null);
    const b = leggi(CHIAVE_BOZZE, {});
    // Ciò che era già qui senza data (salvato prima della sincronizzazione) conta, ma come
    // il dato più vecchio. Il percorso mai iniziato (tappa 1, nessuna scelta) non conta.
    const t = leggi(CHIAVE_TEMPI, {});
    const iniziato = s && (s.raggiunta || s.corrente || s.ripeti);
    for (const k of CAMPI_STATO) if (iniziato && !t['stato.' + k]) t['stato.' + k] = 1;
    for (const id of Object.keys(b)) if (!t['bozza.' + id]) t['bozza.' + id] = 1;
    tempi.current = t;
    scrivi(CHIAVE_TEMPI, t);
    eliminate.current = leggi(CHIAVE_ELIMINATE, {});
    visti.current = { stato: s || { raggiunta: 0, corrente: 0 }, bozze: b };

    // Link «Copia il link»: il codice sta dopo il #, che il browser non manda mai al server.
    const dalLink = () => {
      if (!/codice=/.test(window.location.hash)) return null;
      const c = normalizzaCodice(window.location.hash);
      history.replaceState(null, '', window.location.pathname + window.location.search);
      return codiceValido(c) ? c : null;
    };
    const c = dalLink() || leggi(CHIAVE_SYNC, {})?.codice;
    if (codiceValido(c)) usa(c);
    const nuovoLink = () => {
      const c = dalLink();
      if (c && c !== attivo.current.codice) usa(c);
    };
    window.addEventListener('hashchange', nuovoLink);
    return () => {
      clearTimeout(timer.current);
      window.removeEventListener('hashchange', nuovoLink);
    };
  }, []);

  // Ogni modifica fatta qui prende l'ora: serve a decidere chi vince quando si uniscono i dati.
  useEffect(() => {
    if (!pronto || !visti.current) return;
    const prec = visti.current;
    const t = Date.now();
    let cambiato = false;
    for (const k of CAMPI_STATO) {
      if (canonico(prec.stato[k]) !== canonico(stato[k])) {
        tempi.current['stato.' + k] = t;
        cambiato = true;
      }
    }
    for (const id of new Set([...Object.keys(prec.bozze), ...Object.keys(bozze)])) {
      if (canonico(prec.bozze[id]) !== canonico(bozze[id])) {
        tempi.current['bozza.' + id] = t;
        cambiato = true;
      }
    }
    if (prec.diario && prec.diario !== diario) cambiato = true;
    visti.current = { stato, bozze, diario };
    if (cambiato) {
      scrivi(CHIAVE_TEMPI, tempi.current);
      programma(1500);
    }
  }, [pronto, stato, bozze, diario]);

  useEffect(() => {
    if (pronto && codice) sincronizza();
  }, [pronto, codice]);

  useEffect(() => {
    if (!codice) return;
    const visibile = () => {
      // tornando sulla pagina si prendono le novità; lasciandola si manda ciò che manca
      if (document.visibilityState === 'visible' || sporco.current) sincronizza();
    };
    document.addEventListener('visibilitychange', visibile);
    window.addEventListener('online', sincronizza);
    return () => {
      document.removeEventListener('visibilitychange', visibile);
      window.removeEventListener('online', sincronizza);
    };
  }, [codice]);

  function programma(ritardo) {
    if (!attivo.current.codice) return;
    sporco.current = true;
    clearTimeout(timer.current);
    timer.current = setTimeout(sincronizza, ritardo);
  }

  async function sincronizza() {
    const a = attivo.current;
    if (!a.codice) return;
    clearTimeout(timer.current);
    if (inVolo.current) {
      ancora.current = true;
      return;
    }
    inVolo.current = true;
    sporco.current = false;
    setEsito((e) => ({ ...e, fase: 'in-corso' }));
    try {
      if (!a.chiave) Object.assign(a, await chiaviDa(a.codice));
      let unito = null;
      // Legge, unisce, riscrive; se un altro dispositivo ha scritto nel frattempo, si ripete.
      for (let prova = 0; prova < 3 && !unito; prova++) {
        const letto = await chiama({ azione: 'leggi', id: a.id });
        const remoti = letto.cifrato ? await decifra(a.chiave, letto.cifrato) : null;
        const prossimo = unisci(locale(), remoti);
        if (letto.versione && canonico(prossimo) === canonico(pulisci(remoti))) unito = prossimo;
        else if (await chiama({ azione: 'scrivi', id: a.id, versione: letto.versione, cifrato: await cifra(a.chiave, prossimo) })) {
          unito = prossimo;
        }
      }
      if (!unito) throw new Error('conflitto');
      if (attivo.current !== a) return;
      ricevi(unito);
      setEsito({ fase: 'ok', quando: Date.now() });
    } catch (e) {
      if (attivo.current !== a) return;
      sporco.current = true;
      const fase = e.message === 'non-configurata' ? 'non-configurata' : navigator.onLine === false ? 'offline' : 'errore';
      setEsito((x) => ({ ...x, fase }));
      if (fase === 'errore') programma(60000);
      if (primo.current) {
        primo.current = false;
        applicaRef.current({}, true);
      }
    } finally {
      inVolo.current = false;
      if (ancora.current) {
        ancora.current = false;
        programma(300);
      }
    }
  }

  function ricevi(unito) {
    const o = ora.current;
    // Si unisce di nuovo con lo stato attuale: ciò che si è scritto durante l'attesa non va perso.
    const n = scomponi(unisci(locale(), unito));
    tempi.current = n.tempi;
    eliminate.current = n.eliminate;
    scrivi(CHIAVE_TEMPI, n.tempi);
    scrivi(CHIAVE_ELIMINATE, n.eliminate);
    const cambi = {};
    if (canonico(n.stato) !== canonico(o.stato)) cambi.stato = n.stato;
    if (canonico(n.bozze) !== canonico(o.bozze)) cambi.bozze = n.bozze;
    const ids = (d) => canonico(d.map((s) => s.id).sort());
    if (ids(n.diario) !== ids(o.diario)) cambi.diario = n.diario;
    visti.current = { stato: cambi.stato || o.stato, bozze: cambi.bozze || o.bozze, diario: cambi.diario || o.diario };
    const p = primo.current;
    primo.current = false;
    if (p || Object.keys(cambi).length) applicaRef.current(cambi, p);
  }

  return {
    codice,
    esito,
    sincronizza,
    // la prima sincronizzazione dopo l'apertura non è ancora arrivata
    inAttesa: () => primo.current,
    attiva: () => usa(nuovoCodice()),
    collega(testo) {
      const c = normalizzaCodice(testo);
      if (!codiceValido(c)) return false;
      usa(c);
      return true;
    },
    scollega() {
      clearTimeout(timer.current);
      attivo.current = { codice: '' };
      primo.current = false;
      try {
        localStorage.removeItem(CHIAVE_SYNC);
      } catch {}
      setCodice('');
      setEsito({ fase: 'spenta', quando: 0 });
    },
    eliminata(id) {
      eliminate.current[id] = Date.now();
      scrivi(CHIAVE_ELIMINATE, eliminate.current);
    },
    azzerato() {
      tempi.current.azzerato = Date.now();
      scrivi(CHIAVE_TEMPI, tempi.current);
      programma(1500);
    },
  };
}

function descrivi({ fase, quando }) {
  if (fase === 'in-corso') return 'sincronizzo…';
  if (fase === 'ok') return `sincronizzato alle ${new Date(quando).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
  if (fase === 'offline') return 'sei offline: sincronizzo appena torna la rete';
  if (fase === 'non-configurata') return 'non ancora attiva sul sito';
  if (fase === 'errore') return 'non riuscita, riprovo tra poco';
  return 'collegato';
}

export function Sincronia({ sync, dire }) {
  const [testo, setTesto] = useState('');
  const [conferma, setConferma] = useState(false);
  const { codice, esito } = sync;

  async function copia(valore, fatto) {
    try {
      await navigator.clipboard.writeText(valore);
      dire(fatto);
    } catch {
      dire('Non riesco a copiare: selezionalo e copialo a mano');
    }
  }

  function collega(e) {
    e.preventDefault();
    if (sync.collega(testo)) {
      setTesto('');
      dire('Dispositivo collegato: unisco i dati');
    } else {
      dire('Il codice non torna: sono 25 tra lettere e cifre');
    }
  }

  function scollega() {
    if (!conferma) return setConferma(true);
    sync.scollega();
    setConferma(false);
    dire('Questo dispositivo non si sincronizza più. Ciò che è qui resta.');
  }

  return (
    <details className="sincronia">
      <summary>
        Sincronizza su un altro dispositivo
        {codice ? <small>{descrivi(esito)}</small> : null}
      </summary>
      {codice ? (
        <div className="sincronia-corpo">
          <span className="lectio-etichetta">Il tuo codice personale</span>
          <p className="sincronia-codice">{formattaCodice(codice)}</p>
          <p className="lectio-nota">
            Sull’altro dispositivo apri questa pagina, tocca «Sincronizza su un altro dispositivo» e incolla il
            codice, oppure apri il link. Custodiscilo come una password: chi lo ha può leggere e cambiare il tuo
            diario. Se lo perdi, la copia sul server non si può più aprire; ciò che è in questo browser resta.
          </p>
          <div className="lectio-riga">
            <button className="lectio-btn vuoto" onClick={() => copia(formattaCodice(codice), 'Codice copiato')}>
              Copia il codice
            </button>
            <button
              className="lectio-btn vuoto"
              onClick={() => copia(`${window.location.origin}/percorso#codice=${formattaCodice(codice)}`, 'Link copiato')}
            >
              Copia il link
            </button>
            <button className="lectio-btn quieto" onClick={sync.sincronizza} disabled={esito.fase === 'in-corso'}>
              Sincronizza ora
            </button>
          </div>
          <div>
            <button className="lectio-btn pericolo" onClick={scollega}>
              {conferma ? 'Sicuro? Ciò che è qui resta. Tocca di nuovo' : 'Scollega questo dispositivo'}
            </button>
          </div>
        </div>
      ) : (
        <div className="sincronia-corpo">
          <p className="lectio-nota">
            Il percorso e il diario restano in questo browser. Per ritrovarli sul telefono o su un altro computer,
            crea un codice personale: con quel codice tutto viene cifrato qui, prima di partire, e custodito sul
            server del sito. Senza il codice nessuno, nemmeno il sito, può leggerlo.
          </p>
          <div className="lectio-riga">
            <button className="lectio-btn vuoto" onClick={sync.attiva}>Crea il mio codice</button>
          </div>
          <form className="sincronia-corpo" onSubmit={collega}>
            <label htmlFor="sinc-codice">Hai già un codice? Incollalo qui</label>
            <div className="lectio-riga">
              <input
                id="sinc-codice"
                value={testo}
                onChange={(e) => setTesto(e.target.value)}
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
              />
              <button className="lectio-btn quieto" type="submit" disabled={!testo.trim()}>Collega</button>
            </div>
          </form>
        </div>
      )}
    </details>
  );
}
