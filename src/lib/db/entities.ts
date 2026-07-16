import type { SupabaseClient } from "@supabase/supabase-js";

export interface Entity {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export async function listEntities(sb: SupabaseClient, kind?: string) {
  let q = sb.from("entities").select("*").order("updated_at", { ascending: false });
  if (kind) q = q.eq("kind", kind);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Entity[];
}

export async function createEntity(
  sb: SupabaseClient,
  input: Pick<Entity, "title"> & Partial<Pick<Entity, "kind" | "status" | "metadata">>,
) {
  const { data, error } = await sb.from("entities").insert(input).select().single();
  if (error) throw error;
  return data as Entity;
}
