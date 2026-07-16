-- Retrieval layer: chunk any text, embed it, search by cosine similarity.
-- Embedding dimension defaults to 1536 (OpenAI text-embedding-3-small /
-- many others). Change the vector size to match your embedding model.

create table chunks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  document_id  uuid references documents(id) on delete cascade,
  content      text not null,
  embedding    vector(1536),
  created_at   timestamptz not null default now()
);

create index on chunks (user_id);
-- Approximate NN index. Tune lists to your corpus size.
create index chunks_embedding_idx on chunks
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

alter table chunks enable row level security;
create policy "owner rw" on chunks
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Similarity search RPC, scoped to the calling user by RLS.
create or replace function match_chunks(
  query_embedding vector(1536),
  match_count int default 6,
  min_similarity float default 0.5
)
returns table (id uuid, content text, similarity float)
language sql stable as $$
  select c.id, c.content, 1 - (c.embedding <=> query_embedding) as similarity
  from chunks c
  where c.embedding is not null
    and 1 - (c.embedding <=> query_embedding) >= min_similarity
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
