import { MEMORY } from "@/config/calibration";

// Turn a conversation into durable, confidence-scored facts. The prompt
// and the min-confidence floor come from calibration; parsing/validation
// is generic and lives here so it\'s unit-testable with no model calls.

export interface ExtractedFact {
  type: string;
  statement: string;
  confidence: number;
  reason: string;
}

export function parseFacts(raw: string, validTypes: readonly string[]): ExtractedFact[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripFences(raw));
  } catch {
    return [];
  }
  const memories = (parsed as { memories?: unknown })?.memories;
  if (!Array.isArray(memories)) return [];

  const out: ExtractedFact[] = [];
  for (const m of memories) {
    if (!m || typeof m !== "object") continue;
    const r = m as Record<string, unknown>;
    const type = typeof r.type === "string" ? r.type.trim() : "";
    const statement = typeof r.statement === "string" ? r.statement.trim() : "";
    const confidence = typeof r.confidence === "number" ? r.confidence : 0;
    const reason = typeof r.reason === "string" ? r.reason.trim() : "";
    if (!validTypes.includes(type)) continue;
    if (!statement || statement.length > 80) continue;
    if (confidence < MEMORY.minConfidence) continue;   // drop hedged guesses
    out.push({ type, statement, confidence, reason });
    if (out.length >= MEMORY.maxPerExtraction) break;   // cap flood
  }
  return out;
}

export function stripFences(raw: string): string {
  const t = raw.trim();
  if (!t.startsWith("```")) return t;
  return t.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "").trim();
}
