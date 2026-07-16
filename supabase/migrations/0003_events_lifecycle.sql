-- Append-only event timeline for entities. Nothing is ever updated in
-- place here; state changes are recorded as events. This is the spine
-- that powers history, audit, and "what happened to this thing" views.

create type entity_event_type as enum (
  'status_change', 'note', 'ingested', 'system'
);

create table entity_events (
  id           uuid primary key default gen_random_uuid(),
  entity_id    uuid not null references entities(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  type         entity_event_type not null,
  body         text,
  -- For status_change events: {"from": "...", "to": "..."}
  detail       jsonb not null default '{}'::jsonb,
  occurred_at  timestamptz not null default now()
);

create index on entity_events (entity_id, occurred_at desc);

alter table entity_events enable row level security;
create policy "owner rw" on entity_events
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Record a status_change event automatically whenever status moves.
create or replace function log_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    insert into entity_events (entity_id, user_id, type, detail)
    values (new.id, new.user_id, 'status_change',
            jsonb_build_object('from', old.status, 'to', new.status));
  end if;
  new.updated_at := now();
  return new;
end $$;

create trigger entities_status_change
  before update on entities
  for each row execute function log_status_change();
