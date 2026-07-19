import { describe, expect, it } from "vitest";
import { diffOrders } from "./diff";

describe("diffOrders", () => {
  it("identical orders are one common segment, zero forks", () => {
    const d = diffOrders(["a", "b", "c"], ["a", "b", "c"]);
    expect(d.segments).toEqual([{ kind: "common", ids: ["a", "b", "c"] }]);
    expect(d.forks).toBe(0);
    expect(d.shared).toBe(3);
    expect(d.onlyA).toEqual([]);
    expect(d.onlyB).toEqual([]);
  });

  it("a swapped pair forks once around the shared spine", () => {
    const d = diffOrders(["a", "b", "c", "d"], ["a", "c", "b", "d"]);
    expect(d.forks).toBeGreaterThanOrEqual(1);
    expect(d.shared).toBeGreaterThanOrEqual(3);
    // Both sequences reconstruct from the segments.
    const rebuildA = d.segments.flatMap((s) => (s.kind === "common" ? s.ids : s.a));
    const rebuildB = d.segments.flatMap((s) => (s.kind === "common" ? s.ids : s.b));
    expect(rebuildA).toEqual(["a", "b", "c", "d"]);
    expect(rebuildB).toEqual(["a", "c", "b", "d"]);
  });

  it("works present in only one order land in onlyA/onlyB", () => {
    const d = diffOrders(["a", "x", "b"], ["a", "b", "y"]);
    expect(d.onlyA).toEqual(["x"]);
    expect(d.onlyB).toEqual(["y"]);
  });

  it("the prequel-placement case: same works, different position", () => {
    // publication order vs chronological-with-prequel-first
    const d = diffOrders(["one", "two", "three", "prequel"], ["prequel", "one", "two", "three"]);
    expect(d.onlyA).toEqual([]);
    expect(d.onlyB).toEqual([]);
    expect(d.shared).toBe(3);
    expect(d.forks).toBe(2); // the prequel appears in a fork at each end
  });

  it("disjoint orders are a single all-fork diff", () => {
    const d = diffOrders(["a", "b"], ["x", "y"]);
    expect(d.shared).toBe(0);
    expect(d.segments).toHaveLength(1);
    expect(d.segments[0]).toEqual({ kind: "fork", a: ["a", "b"], b: ["x", "y"] });
  });

  it("empty orders do not crash", () => {
    expect(diffOrders([], []).segments).toEqual([]);
    expect(diffOrders(["a"], []).segments).toEqual([{ kind: "fork", a: ["a"], b: [] }]);
  });
});
