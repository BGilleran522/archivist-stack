-- Documents/assets attached to the user or an entity. `extracted_text`
-- is what the RAG layer chunks and embeds.

create table documents (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  entity_id      uuid references entities(id) on delete set null,
  label          text not null,
  storage_path   text,
  mime           text,
  extracted_text text,
  created_at     timestamptz not null default now()
);

create index on documents (user_id);

alter table documents enable row level security;
create policy "owner rw" on documents
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
