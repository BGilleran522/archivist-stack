import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExtractedFact } from "./fact-extract";

export interface PersonaMemory {
  user_id: string;
  facts: Array<ExtractedFact & { created_at: string; source?: string }>;
  updated_at: string;
}

export async function loadMemory(sb: SupabaseClient, userId: string) {
  const { data } = await sb
    .from("persona_memory")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return (data ?? null) as PersonaMemory | null;
}

// Append new facts, skipping ones that duplicate an existing statement.
export async function appendFacts(
  sb: SupabaseClient,
  userId: string,
  facts: ExtractedFact[],
  source?: string,
) {
  const existing = await loadMemory(sb, userId);
  const seen = new Set(
    (existing?.facts ?? []).map((f) => f.statement.toLowerCase()),
  );
  const fresh = facts
    .filter((f) => !seen.has(f.statement.toLowerCase()))
    .map((f) => ({ ...f, created_at: new Date().toISOString(), source }));
  if (fresh.length === 0) return;
  const merged = [...(existing?.facts ?? []), ...fresh];
  await sb.from("persona_memory").upsert(
    { user_id: userId, facts: merged, updated_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );
}

export function formatMemoryForPrompt(mem: PersonaMemory | null): string {
  if (!mem || mem.facts.length === 0) return "";
  const lines = mem.facts.slice(-8).map((f) => `- ${f.statement}`);
  return ["KNOWN ABOUT THIS USER:", ...lines].join("\n");
}
