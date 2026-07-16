-- Ingestion sources. Each source is polled/pushed by an adapter that
-- normalizes external records into entities + an 'ingested' event.

create table ingest_sources (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  adapter       text not null,          -- e.g. 'rss', 'barcode', 'transcript'
  config        jsonb not null default '{}'::jsonb,
  enabled       boolean not null default true,
  last_run_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index on ingest_sources (user_id, enabled);

alter table ingest_sources enable row level security;
create policy "owner rw" on ingest_sources
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
