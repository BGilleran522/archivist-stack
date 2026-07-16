import type { SupabaseClient } from "@supabase/supabase-js";
import { embedder } from "./embeddings";

export interface RetrievedChunk {
  id: string;
  content: string;
  similarity: number;
}

// Embed the query, then let Postgres/pgvector do the search (RLS scopes
// results to the caller). Returns [] on any failure so retrieval is
// never user-visible as an error.
export async function retrieve(
  sb: SupabaseClient,
  query: string,
  opts: { matchCount?: number; minSimilarity?: number } = {},
): Promise<RetrievedChunk[]> {
  try {
    const [vec] = await embedder.embed([query]);
    const { data, error } = await sb.rpc("match_chunks", {
      query_embedding: vec,
      match_count: opts.matchCount ?? 6,
      min_similarity: opts.minSimilarity ?? 0.5,
    });
    if (error) return [];
    return (data ?? []) as RetrievedChunk[];
  } catch {
    return [];
  }
}
