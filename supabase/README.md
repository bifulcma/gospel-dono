# Sincronizzazione del percorso (Supabase)

La pagina `/percorso` salva tutto nel browser (localStorage), come prima: funziona anche offline.
Se vuoi ritrovare tappa, bozze e diario su un altro dispositivo, crei un **codice personale**:
il browser cifra i dati con quel codice e ne manda una copia al server. Il server (e Supabase)
vede solo testo illeggibile: senza il codice nessuno può leggerlo.

Si usa il progetto Supabase già esistente di **esercizi-ignaziani** (una tabella in più: `percorso_sync`).

## Da fare una volta

1. **Crea la tabella**
   - Apri [supabase.com/dashboard](https://supabase.com/dashboard) → progetto di esercizi-ignaziani
   - Menu a sinistra **SQL Editor** → **New query**
   - Incolla tutto il file `supabase/migrations/20261022120000_percorso_sync.sql` → **Run**
   - Deve dire *Success. No rows returned*.

2. **Metti le chiavi su Vercel** (progetto `gospel-dono`)
   - [vercel.com](https://vercel.com) → `gospel-dono` → **Settings** → **Environment Variables**
   - Aggiungi, ambiente **Production** (e Preview se vuoi provarlo prima):
     - `SUPABASE_URL` → lo stesso valore di esercizi-ignaziani (es. `https://xxxx.supabase.co`)
     - `SUPABASE_SERVICE_KEY` → la **service_role** key dello stesso progetto
       (Supabase → Project Settings → API Keys → `service_role` / secret). Va solo su Vercel, mai nel codice.
   - Poi **Deployments** → ultimo deploy → **Redeploy** (le variabili valgono dal deploy successivo).

3. **Usalo**
   - Sul dispositivo dove hai già il percorso: `/percorso` → in fondo «Sincronizza su un altro dispositivo» →
     **Crea il mio codice**. Il tuo percorso attuale viene caricato subito.
   - Salva il codice in un posto sicuro (es. gestore password): se lo perdi, la copia sul server non si apre più.
   - Sull'altro dispositivo: stessa sezione → incolla il codice → **Collega** (oppure apri il link copiato).

## Come funziona

- `app/api/percorso/route.js`: unico punto che parla con Supabase, con la service role key (solo lato server).
- `lib/sincronia.js`: codice personale, cifratura (Web Crypto, AES-GCM) e unione dei dati.
- `app/componenti/Sincronia.js`: sincronizzazione automatica (dopo ogni modifica, quando riapri la pagina,
  quando torna la rete) e la sezione con il codice.
- Unione: per ogni campo vince la modifica più recente; le sedute del diario si sommano, quelle eliminate
  non ricompaiono; la tappa raggiunta non torna indietro, se non con «Ricomincia il percorso».
- Sicurezza: tabella con RLS attiva e **nessuna policy** (Supabase lo segnala come avviso informativo:
  è voluto). Nel database l'identificativo è un hash, i dati sono cifrati.
