import type { SupabaseClient } from "@supabase/supabase-js";
import { chunk } from "./chunker";
import { embedder } from "./embeddings";

// Call after a document's extracted_text lands: chunk -> embed -> store.
// Idempotency (delete old chunks for the doc first) is left to the caller
// so you can choose replace vs. append semantics per product.
export async function indexDocument(
  sb: SupabaseClient,
  documentId: string,
  text: string,
) {
  const parts = chunk(text);
  if (parts.length === 0) return;
  const vectors = await embedder.embed(parts);
  const rows = parts.map((content, i) => ({
    document_id: documentId,
    content,
    embedding: vectors[i],
  }));
  const { error } = await sb.from("chunks").insert(rows);
  if (error) throw error;
}
