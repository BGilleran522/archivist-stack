import Anthropic from "@anthropic-ai/sdk";
import { AI } from "@/config/calibration";

// Single choke point for model calls (the "ai-router" pattern from the
// products: never `new Anthropic()` in a route, never a hardcoded model
// string outside calibration). Swap providers here without touching
// callers.
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface CallArgs {
  task: keyof typeof AI.tasks;
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
}

export async function callAI(args: CallArgs): Promise<{ text: string }> {
  const model = AI.tasks[args.task] ?? AI.defaultModel;
  const res = await client.messages.create({
    model,
    system: args.system,
    max_tokens: args.maxTokens ?? 512,
    messages: args.messages.map((m) => ({ role: m.role, content: m.content })),
  });
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  return { text };
}
