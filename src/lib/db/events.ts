import type { SupabaseClient } from "@supabase/supabase-js";

export interface EntityEvent {
  id: string;
  entity_id: string;
  type: "status_change" | "note" | "ingested" | "system";
  body: string | null;
  detail: Record<string, unknown>;
  occurred_at: string;
}

export async function timeline(sb: SupabaseClient, entityId: string) {
  const { data, error } = await sb
    .from("entity_events")
    .select("*")
    .eq("entity_id", entityId)
    .order("occurred_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as EntityEvent[];
}

export async function addNote(sb: SupabaseClient, entityId: string, body: string) {
  const { error } = await sb.from("entity_events").insert({
    entity_id: entityId, type: "note", body,
  });
  if (error) throw error;
}
