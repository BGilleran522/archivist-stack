-- The core entity table. Rename `entities` to your domain noun (customers,
-- applications, sets, ...) or keep it generic and tag with `kind`.
--
-- Every product in the portfolio has exactly this shape: an owned record
-- with a freeform metadata bag and a lifecycle status. The status enum is
-- defined per-product; a neutral default ships here.

create type entity_status as enum (
  'new', 'active', 'blocked', 'done', 'archived'
);

create table entities (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null default 'default',
  title       text not null,
  status      entity_status not null default 'new',
  -- Domain-specific fields live here until you promote them to columns.
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index on entities (user_id, kind);
create index on entities (user_id, status);

alter table entities enable row level security;
create policy "owner rw" on entities
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
