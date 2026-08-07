import { describe, expect, it } from "vitest";
import { deriveDefaultOrder } from "./index";
import type { Work } from "./types";

// orrery#168: Fernando Pessoa's O Guardador de Rebanhos (1925 magazine
// appearance) is deliberately, correctly catalogued as its own work AND as
// the first third of Poemas de Alberto Caeiro (1946, the collection that
// reprints it in full). Real, separately-dated, separately-sourced works -
// but deriveDefaultOrder used to be a flat sort with no dedup, so a reader
// walking the default order read the same 49 poems twice, six volumes and 21
// years apart, with nothing telling them so. `containedIn` fixes the ORDER
// without touching the bibliography: both ids remain real works, only the
// derived linear walk skips the one whose text lives on inside the other.

function work(id: string, published: number, containedIn?: string): Work {
  return {
    id,
    title: id,
    authorIds: ["author"],
    published,
    canonTier: "core",
    containedIn,
  };
}

describe("deriveDefaultOrder and containedIn (orrery#168)", () => {
  it("skips a work that names containedIn", () => {
    const works = [
      work("wing/standalone-1925", 1925, "wing/collection-1946"),
      work("wing/collection-1946", 1946),
      work("wing/unrelated-1930", 1930),
    ];
    const order = deriveDefaultOrder("wing", works);
    expect(order.orderedWorkIds).not.toContain("wing/standalone-1925");
    expect(order.orderedWorkIds).toEqual(["wing/unrelated-1930", "wing/collection-1946"]);
  });

  it("keeps the container itself in the default order", () => {
    const works = [
      work("wing/standalone-1925", 1925, "wing/collection-1946"),
      work("wing/collection-1946", 1946),
    ];
    const order = deriveDefaultOrder("wing", works);
    expect(order.orderedWorkIds).toContain("wing/collection-1946");
  });

  it("changes nothing when no work sets containedIn", () => {
    const works = [work("wing/a", 2000), work("wing/b", 2001)];
    const order = deriveDefaultOrder("wing", works);
    expect(order.orderedWorkIds).toEqual(["wing/a", "wing/b"]);
  });

  it("sorts strictly by publication year among the works that remain", () => {
    const works = [
      work("wing/c", 2010),
      work("wing/skip", 1990, "wing/c"),
      work("wing/a", 1980),
      work("wing/b", 2000),
    ];
    const order = deriveDefaultOrder("wing", works);
    expect(order.orderedWorkIds).toEqual(["wing/a", "wing/b", "wing/c"]);
  });
});
