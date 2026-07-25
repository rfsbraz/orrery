import { describe, expect, it } from "vitest";
import { capabilities } from "./capabilities";
import type { FranchiseBundle, ReadingOrder, Work } from "./types";

const work = (id: string, extra: Partial<Work> = {}): Work => ({
  id,
  title: id,
  authorIds: ["a"],
  published: 2000,
  canonTier: "core",
  ...extra,
});

const order = (id: string): ReadingOrder => ({
  id,
  name: id,
  type: "curated",
  source: "canon",
  orderedWorkIds: [],
});

/** A minimal sparse franchise: works only. */
function bundle(overrides: Partial<FranchiseBundle> = {}): FranchiseBundle {
  return {
    franchise: { id: "x", name: "X", kind: "author", authorIds: ["a"] },
    authors: [],
    works: [work("x/one")],
    eras: [],
    orders: [order("x/default")],
    timeline: [],
    editions: [],
    ...overrides,
  };
}

describe("capabilities", () => {
  it("a sparse works-only franchise activates almost nothing (but stays valid)", () => {
    const caps = capabilities(bundle());
    expect(caps).toEqual({
      river: false,
      wizard: false,
      companion: false,
      editions: false,
    });
  });

  it("aura events activate river and companion", () => {
    const caps = capabilities(
      bundle({
        timeline: [{ id: "e", date: 1999, title: "t", impact: "high", description: "" }],
      })
    );
    expect(caps.river).toBe(true);
    expect(caps.companion).toBe(true);
  });

  it("startHere paths activate the wizard", () => {
    const b = bundle();
    b.franchise.startHere = {
      paths: [{ id: "p", title: "P", orderId: "default" }],
    };
    expect(capabilities(b).wizard).toBe(true);
  });

  it("editions activate the editions capability", () => {
    expect(
      capabilities(bundle({ editions: [{ id: "x/one/ed", workId: "x/one" }] })).editions
    ).toBe(true);
  });

  it("explicit overrides beat auto-detection both ways", () => {
    const on = bundle();
    on.franchise.features = { river: "on", companion: "off" };
    expect(capabilities(on).river).toBe(true);
    expect(capabilities(on).companion).toBe(false);

    const off = bundle({
      timeline: [{ id: "e", date: 1999, title: "t", impact: "low", description: "" }],
    });
    off.franchise.features = { river: "off" };
    expect(capabilities(off).river).toBe(false);
  });

  it("boolean feature values work like on/off", () => {
    const b = bundle();
    b.franchise.features = { wizard: true, companion: false };
    expect(capabilities(b).wizard).toBe(true);
    expect(capabilities(b).companion).toBe(false);
  });
});
