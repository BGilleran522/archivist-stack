import { PERSONA } from "@/config/calibration";
import type { RetrievedChunk } from "@/lib/rag";

// Assemble the persona's system prompt. The *voice* and *rules* live in
// calibration (product-specific); this module just frames them and grafts
// on the retrieved grounding. The anti-fabrication rule is a hard default
// because every product in the portfolio needed it.
export function buildSystemPrompt(): string {
  return [
    PERSONA.identity,
    "",
    "Ground every claim in the CONTEXT provided by the user message.",
    "Never invent facts, names, numbers, or history not present there.",
    PERSONA.style,
  ].join("\n");
}

export function formatGrounding(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "";
  return [
    "CONTEXT (the only ground truth you may use):",
    ...chunks.map((c) => `- ${c.content}`),
  ].join("\n");
}
