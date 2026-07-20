import { describe, expect, it } from "vitest";
import { gate, isRevealed, shieldCopy } from "./index";

describe("spoiler engine", () => {
  it("no boundary means always revealed", () => {
    expect(isRevealed(null, null)).toBe(true);
    expect(isRevealed(undefined, new Set())).toBe(true);
  });

  it("anonymous readers (no progress) are shielded", () => {
    expect(isRevealed("f/boundary", null)).toBe(false);
  });

  it("revealed only once the boundary work is read", () => {
    expect(isRevealed("f/boundary", new Set(["f/other"]))).toBe(false);
    expect(isRevealed("f/boundary", new Set(["f/boundary"]))).toBe(true);
  });

  it("gate partitions a mixed list", () => {
    const items = [
      { id: "a", spoilerAfter: null },
      { id: "b", spoilerAfter: "f/boundary" },
      { id: "c" },
    ];
    const gated = gate(items, new Set(["f/x"]));
    expect(gated.map((g) => g.revealed)).toEqual([true, false, true]);
    expect(gated[1].spoilerAfter).toBe("f/boundary");
  });

  it("teaser copy never names the hidden content", () => {
    expect(shieldCopy("The Boundary Book")).toContain("The Boundary Book");
    expect(shieldCopy()).toBe("Hidden to protect a reveal");
  });
});
