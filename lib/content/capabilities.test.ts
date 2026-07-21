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
    characters: [],
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
      connections: false,
      companion: false,
      hall: true,
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

  it("connections activate via work links or characters", () => {
    expect(
      capabilities(bundle({ works: [work("x/one", { connections: ["x/two"] })] })).connections
    ).toBe(true);
    expect(
      capabilities(
        bundle({ characters: [{ id: "x/c", name: "C", appearsIn: [] }] })
      ).connections
    ).toBe(true);
  });

  it("editions activate the editions capability", () => {
    expect(
      capabilities(bundle({ editions: [{ id: "x/one/ed", workId: "x/one" }] })).editions
    ).toBe(true);
  });

  it("explicit overrides beat auto-detection both ways", () => {
    const on = bundle();
    on.franchise.features = { river: "on", hall: "off" };
    expect(capabilities(on).river).toBe(true);
    expect(capabilities(on).hall).toBe(false);

    const off = bundle({
      timeline: [{ id: "e", date: 1999, title: "t", impact: "low", description: "" }],
    });
    off.franchise.features = { river: "off" };
    expect(capabilities(off).river).toBe(false);
  });

  it("boolean feature values work like on/off", () => {
    const b = bundle();
    b.franchise.features = { wizard: true, hall: false };
    expect(capabilities(b).wizard).toBe(true);
    expect(capabilities(b).hall).toBe(false);
  });
});
