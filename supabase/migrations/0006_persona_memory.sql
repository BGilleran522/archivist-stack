-- The AI persona's memory: derived aggregates + confidence-scored facts.
--
-- `facts` is a jsonb array of extracted long-term insights. Aggregates
-- (whatever your product computes about a user) live in dedicated columns.
-- The example ships one generic aggregate; add your own.

create table persona_memory (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  -- Example derived aggregate. Replace/extend per product.
  activity_score  numeric,
  -- Extracted facts: [{ "type","statement","confidence","source","created_at" }]
  facts       jsonb not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table persona_memory enable row level security;
create policy "owner rw" on persona_memory
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Conversations the persona has had, summarized for future grounding.
create table conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  summary     text not null,
  topics      text[] not null default '{}',
  created_at  timestamptz not null default now()
);

create index on conversations (user_id, created_at desc);

alter table conversations enable row level security;
create policy "owner rw" on conversations
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
