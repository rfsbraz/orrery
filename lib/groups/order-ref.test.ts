import { describe, it, expect } from "vitest";
import { resolveOrderRef, orderRefOptions } from "./order-ref";

const works = [
  { id: "f/c", published: 1977 },
  { id: "f/a", published: 1974 },
  { id: "f/b", published: 1975 },
];
const curated = [{ id: "reading", name: "Best first read", orderedWorkIds: ["f/b", "f/a"] }];
const community = [{ id: "u1", name: "My run", orderedWorkIds: ["f/c"] }];

describe("resolveOrderRef", () => {
  it("derives the default as all works in publication order", () => {
    const r = resolveOrderRef("canon:default", works, curated, community);
    expect(r.workIds).toEqual(["f/a", "f/b", "f/c"]);
    expect(r.label).toMatch(/publication order/);
  });

  it("resolves a curated order by id", () => {
    const r = resolveOrderRef("canon:reading", works, curated, community);
    expect(r.workIds).toEqual(["f/b", "f/a"]);
    expect(r.label).toBe("Best first read");
  });

  it("resolves a community order and tags it", () => {
    const r = resolveOrderRef("community:u1", works, curated, community);
    expect(r.workIds).toEqual(["f/c"]);
    expect(r.label).toContain("(community)");
  });

  it("falls back to the default for a stale/unknown ref", () => {
    const r = resolveOrderRef("community:gone", works, curated, community);
    expect(r.workIds).toEqual(["f/a", "f/b", "f/c"]);
  });
});

describe("orderRefOptions", () => {
  it("lists default + curated + community", () => {
    const opts = orderRefOptions(curated, community);
    expect(opts.map((o) => o.value)).toEqual(["canon:default", "canon:reading", "community:u1"]);
  });
});
