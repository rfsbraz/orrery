import { describe, expect, it } from "vitest";
import { getFranchise } from "./index";
import { listFranchiseSlugs } from "./index";

// A global event renders on a wing if and only if that wing names it in
// `globalEvents.include`. Silence means absent.
//
// Two real defects sit behind these tests. First, `reach: global` was read as
// "every franchise renders this", so Joao Tordo (born 1975) opened his page in
// 1910 and walked a reader through both world wars. That was fixed with a
// lifetime default. Second, the lifetime default was itself wrong in the other
// direction: adding an event to global.yaml retroactively opted in every wing
// already curated, and `portugal-bailout-2011` rendered on Stephen King,
// Pratchett, Sanderson, Robert Jordan and Palahniuk until someone noticed.
describe("global event relevance", () => {
  it("renders nothing a wing has not explicitly claimed", () => {
    const slugs = listFranchiseSlugs();
    expect(slugs.length, "no wings loaded - the sweep would be vacuously green").toBeGreaterThan(5);
    for (const slug of slugs) {
      const b = getFranchise(slug);
      expect(b, `no wing '${slug}'`).toBeTruthy();
      if (!b) continue;
      const claimed = new Set(b.franchise.globalEvents?.include ?? []);
      for (const e of b.timeline) {
        if (e.reach !== "global") continue;
        expect(
          claimed.has(e.id),
          `${slug}: ${e.id} renders but is not in globalEvents.include`
        ).toBe(true);
      }
    }
  });

  it("keeps a Portugal-specific event off wings with no connection to it", () => {
    // The regression that motivated opt-in. These five were each ruled on
    // BEFORE the bailout existed, so no exclude entry could have saved them.
    for (const slug of [
      "stephen-king",
      "terry-pratchett",
      "brandon-sanderson",
      "robert-jordan",
      "chuck-palahniuk",
    ]) {
      const b = getFranchise(slug);
      expect(b, `no wing '${slug}' - was it renamed?`).toBeTruthy();
      if (!b) continue;
      const ids = b.timeline.map((e) => e.id);
      expect(ids, `${slug} should not carry the Portuguese bailout`).not.toContain(
        "portugal-bailout-2011"
      );
    }
  });

  it("does render an event a wing claims, including one before the author's birth", () => {
    const b = getFranchise("joao-tordo");
    expect(b).toBeTruthy();
    const ids = b!.timeline.map((e) => e.id);
    // Tordo claims the Carnation Revolution (1974, sixteen months before he was
    // born): it ended the censorship regime his whole generation writes after.
    expect(ids).toContain("carnation-revolution-1974");
    expect(ids).toContain("portugal-bailout-2011");
    // The original defect must stay fixed.
    expect(ids).not.toContain("world-war-i-1914");
    expect(ids).not.toContain("world-war-ii-1939");
  });

  it("keeps both world wars for an author who claims them", () => {
    const c = getFranchise("agatha-christie");
    expect(c).toBeTruthy();
    const ids = c!.timeline.map((e) => e.id);
    expect(ids).toContain("world-war-i-1914");
    expect(ids).toContain("world-war-ii-1939");
  });

  it("renders no global events at all for a wing that claims none", () => {
    // Gillian Flynn considered all ten and kept none. Under opt-in that is
    // simply an empty include list, and the page must show no global events.
    const b = getFranchise("gillian-flynn");
    expect(b).toBeTruthy();
    const globals = b!.timeline.filter((e) => e.reach === "global");
    expect(globals).toHaveLength(0);
  });
});
