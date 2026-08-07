import { describe, expect, it } from "vitest";
import { creditedAppearances, getAllBundles, getFranchise } from "./index";
import type { FranchiseBundle, Work } from "./types";

// A work lives in exactly one wing's bibliography (no duplication into a
// collaborator's own wing), but a reader clicking a co-author's name should
// still be able to find the book from the collaborator's own side. This is
// the discovery query both surfaces use: the standalone co-author page (for
// someone with no wing of their own) and, now, a wing owner's own page (for
// "who else did I write with, and where does that live").

function work(id: string, authorIds: string[], withAuthorIds?: string[]): Work {
  return { id, title: id, authorIds, withAuthorIds, published: 2000, canonTier: "core" };
}

function bundle(id: string, name: string, works: Work[]): FranchiseBundle {
  return {
    franchise: { id, name, kind: "author", authorIds: works[0]?.authorIds ?? [id] },
    authors: [],
    works,
    eras: [],
    orders: [],
    timeline: [],
    editions: [],
  };
}

describe("creditedAppearances", () => {
  const patterson = bundle("james-patterson", "James Patterson", [
    work("james-patterson/along-came-a-spider", ["james-patterson"]),
    work("james-patterson/the-president-is-missing", ["james-patterson"], ["bill-clinton"]),
  ]);
  const clinton = bundle("bill-clinton", "Bill Clinton", [
    work("bill-clinton/my-life", ["bill-clinton"]),
  ]);
  const bundles = [patterson, clinton];

  it("finds a work where the person is the primary author", () => {
    const found = creditedAppearances(["james-patterson"], bundles);
    expect(found.map((a) => a.work.id)).toContain("james-patterson/along-came-a-spider");
  });

  it("finds a work where the person is only a co-author (withAuthorIds)", () => {
    const found = creditedAppearances(["bill-clinton"], bundles);
    const ids = found.map((a) => a.work.id);
    expect(ids).toContain("bill-clinton/my-life");
    expect(ids).toContain("james-patterson/the-president-is-missing");
  });

  it("names the franchise the work actually lives on, not the queried person's own", () => {
    const found = creditedAppearances(["bill-clinton"], bundles).find(
      (a) => a.work.id === "james-patterson/the-president-is-missing"
    );
    expect(found?.franchiseId).toBe("james-patterson");
    expect(found?.franchiseName).toBe("James Patterson");
  });

  it("excludeFranchiseId omits that wing's own shelf - the 'where ELSE' query", () => {
    const found = creditedAppearances(["james-patterson"], bundles, "james-patterson");
    expect(found).toEqual([]);
  });

  it("excludeFranchiseId still finds the co-written work on the OTHER wing", () => {
    const found = creditedAppearances(["bill-clinton"], bundles, "bill-clinton");
    expect(found.map((a) => a.work.id)).toEqual(["james-patterson/the-president-is-missing"]);
  });

  it("returns nothing for a person credited nowhere", () => {
    expect(creditedAppearances(["nobody"], bundles)).toEqual([]);
  });

  it("accepts multiple author ids at once (a multi-author wing's own page)", () => {
    const found = creditedAppearances(["james-patterson", "bill-clinton"], bundles);
    expect(found.length).toBe(3);
  });
});

// Real content, not fixtures: Brandon Sanderson finished Robert Jordan's
// Wheel of Time from his notes, credited via withAuthorIds on three books
// that live on the robert-jordan wing. Sanderson also owns his own wing
// (content/authors/brandon-sanderson.yaml + franchises/brandon-sanderson/),
// which is exactly the case this feature exists for: before it, those three
// books were invisible from Sanderson's own wing page - only reachable via
// Jordan's shelf or Sanderson's bio prose.
describe("creditedAppearances against real content (orrery#178)", () => {
  const all = getAllBundles();

  it("finds the Wheel of Time finale books from Sanderson's side", () => {
    const found = creditedAppearances(["brandon-sanderson"], all, "brandon-sanderson");
    const ids = found.map((a) => a.work.id);
    expect(ids).toContain("robert-jordan/the-gathering-storm");
    expect(ids).toContain("robert-jordan/towers-of-midnight");
    expect(ids).toContain("robert-jordan/a-memory-of-light");
    // Every one of them is credited to the wing they actually live on.
    expect(found.every((a) => a.franchiseId === "robert-jordan")).toBe(true);
  });

  it("excludeFranchiseId keeps Sanderson's own wing off his own appearances list", () => {
    const found = creditedAppearances(["brandon-sanderson"], all, "brandon-sanderson");
    expect(found.some((a) => a.franchiseId === "brandon-sanderson")).toBe(false);
  });

  it("the same three books carry withAuthorIds on the robert-jordan wing itself", () => {
    const jordan = getFranchise("robert-jordan")!;
    const coWritten = jordan.works.filter((w) => (w.withAuthorIds ?? []).includes("brandon-sanderson"));
    expect(coWritten.length).toBe(3);
  });
});
