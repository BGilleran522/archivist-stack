import type { SupabaseClient } from "@supabase/supabase-js";

// The universal ingestion shape shared by every product:
//   source -> normalize -> upsert(entity) -> record 'ingested' event
//
// An adapter only has to know how to (a) fetch raw records for a source
// and (b) normalize one raw record into a NormalizedRecord. The pipeline
// handles persistence, dedup keying, and event logging identically for
// all of them.

export interface NormalizedRecord {
  dedupeKey: string;               // stable id from the source
  title: string;
  kind?: string;
  metadata?: Record<string, unknown>;
}

export interface IngestAdapter {
  readonly name: string;
  fetch(config: Record<string, unknown>): Promise<unknown[]>;
  normalize(raw: unknown): NormalizedRecord | null;
}

export interface IngestResult {
  fetched: number;
  inserted: number;
  skipped: number;
}

export async function runIngest(
  sb: SupabaseClient,
  adapter: IngestAdapter,
  config: Record<string, unknown>,
): Promise<IngestResult> {
  const raw = await adapter.fetch(config);
  let inserted = 0, skipped = 0;

  for (const item of raw) {
    const rec = adapter.normalize(item);
    if (!rec) { skipped++; continue; }

    // Dedup on (kind, metadata->>dedupeKey). Adjust to a unique index
    // in your schema if you expect high volume.
    const { data: existing } = await sb
      .from("entities")
      .select("id")
      .eq("kind", rec.kind ?? adapter.name)
      .eq("metadata->>dedupeKey", rec.dedupeKey)
      .maybeSingle();
    if (existing) { skipped++; continue; }

    const { data: created, error } = await sb
      .from("entities")
      .insert({
        title: rec.title,
        kind: rec.kind ?? adapter.name,
        metadata: { ...(rec.metadata ?? {}), dedupeKey: rec.dedupeKey },
      })
      .select("id, user_id")
      .single();
    if (error || !created) { skipped++; continue; }

    await sb.from("entity_events").insert({
      entity_id: created.id,
      type: "ingested",
      body: `ingested via ${adapter.name}`,
    });
    inserted++;
  }
  return { fetched: raw.length, inserted, skipped };
}
