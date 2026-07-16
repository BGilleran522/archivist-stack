import { describe, it, expect } from "vitest";
import { parseFacts, stripFences } from "./fact-extract";

const TYPES = ["preference", "habit", "goal"] as const;

describe("parseFacts", () => {
  it("keeps valid high-confidence facts", () => {
    const raw = JSON.stringify({
      memories: [{ type: "preference", statement: "likes concise answers", confidence: 0.9, reason: "said so" }],
    });
    expect(parseFacts(raw, TYPES)).toHaveLength(1);
  });

  it("drops facts below the confidence floor", () => {
    const raw = JSON.stringify({
      memories: [{ type: "goal", statement: "maybe wants X", confidence: 0.4, reason: "hedged" }],
    });
    expect(parseFacts(raw, TYPES)).toHaveLength(0);
  });

  it("rejects unknown types and over-long statements", () => {
    const raw = JSON.stringify({
      memories: [
        { type: "nonsense", statement: "x", confidence: 0.9, reason: "" },
        { type: "habit", statement: "a".repeat(200), confidence: 0.9, reason: "" },
      ],
    });
    expect(parseFacts(raw, TYPES)).toHaveLength(0);
  });

  it("survives code fences and junk", () => {
    expect(stripFences("```json\n{}\n```")).toBe("{}");
    expect(parseFacts("not json", TYPES)).toEqual([]);
  });
});
