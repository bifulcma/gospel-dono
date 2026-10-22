-- gospel-dono · pagina /percorso: copia di sicurezza del percorso degli Esercizi,
-- per ritrovarlo su altri dispositivi.
--
-- Il browser cifra tutto (AES-GCM) con il codice personale prima di inviarlo:
-- qui finisce solo testo illeggibile. "id" è l'hash SHA-256 di un identificatore
-- derivato dal codice: né il codice né il diario arrivano mai al database.
--
-- Accesso solo dal server del sito (route /api/percorso, con la service role key).
-- RLS attiva e nessuna policy: con le chiavi pubbliche (anon / authenticated)
-- non si legge né si scrive nessuna riga.

create table if not exists public.percorso_sync (
  id            text primary key check (id ~ '^[0-9a-f]{64}$'),
  cifrato       text not null check (length(cifrato) <= 3500000),
  versione      integer not null default 1 check (versione > 0),
  creato_il     timestamptz not null default now(),
  aggiornato_il timestamptz not null default now()
);

alter table public.percorso_sync enable row level security;

revoke all on table public.percorso_sync from anon, authenticated;
grant select, insert, update, delete on table public.percorso_sync to service_role;

comment on table public.percorso_sync is
  'gospel-dono /percorso: diario cifrato nel browser con il codice personale. Solo service role (via /api/percorso).';
