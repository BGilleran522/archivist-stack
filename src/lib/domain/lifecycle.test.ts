import { describe, it, expect } from "vitest";
import { Lifecycle, defaultLifecycle } from "./lifecycle";

describe("Lifecycle", () => {
  it("allows declared transitions", () => {
    expect(defaultLifecycle.can("new", "active")).toBe(true);
    expect(defaultLifecycle.can("active", "done")).toBe(true);
  });

  it("blocks undeclared transitions", () => {
    expect(defaultLifecycle.can("new", "done")).toBe(false);
    expect(() => defaultLifecycle.assert("done", "active")).toThrow(/illegal/);
  });

  it("treats a no-op transition as legal", () => {
    expect(defaultLifecycle.assert("active", "active")).toBe("active");
  });

  it("identifies terminal states", () => {
    expect(defaultLifecycle.isTerminal("archived")).toBe(true);
    expect(defaultLifecycle.isTerminal("new")).toBe(false);
  });

  it("is generic over custom state sets", () => {
    const lc = new Lifecycle<"a" | "b">({ a: ["b"], b: [] }, "a");
    expect(lc.can("a", "b")).toBe(true);
    expect(lc.isTerminal("b")).toBe(true);
  });
});
