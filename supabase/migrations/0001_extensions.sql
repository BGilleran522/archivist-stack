-- Extensions used across the stack.
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "vector";      -- embeddings (pgvector)
