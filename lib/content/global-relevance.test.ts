import { describe, expect, it } from "vitest";
import { getFranchise } from "./index";
import { eventYear } from "./index";

// Regression guard for a real defect: `reach: global` was read as "every
// franchise renders this", so Joao Tordo (born 1975) opened his page in 1910
// and walked the reader through both world wars before his first novel.
//
// The lifetime span is the DEFAULT, not an absolute law. A franchise may claim
// an earlier event through `globalEvents.include` when the author demonstrably
// writes out of it, so these tests assert the default holds *and* that the
// override works, rather than asserting nobody ever predates their author.
describe("global event relevance", () => {
  /** First four-digit year in a born/died value. */
  const yearOf = (v: unknown) => {
    const m = String(v ?? "").match(/\d{4}/);
    return m ? Number(m[0]) : null;
  };

  it("keeps un-claimed events that predate the author off the timeline", () => {
    const b = getFranchise("joao-tordo");
    expect(b).toBeTruthy();
    const ids = b!.timeline.map((e) => e.id);
    // Born 1975: the world wars are the original defect and must stay gone.
    expect(ids).not.toContain("world-war-i-1914");
    expect(ids).not.toContain("world-war-ii-1939");
  });

  it("honours an explicit include for an event before the author's birth", () => {
    const b = getFranchise("joao-tordo")!;
    const ids = b.timeline.map((e) => e.id);
    // Tordo claims the Carnation Revolution (1974, sixteen months before he was
    // born): it ended the censorship regime his whole generation writes after.
    // This is the designed exception, so it must actually reach the timeline.
    expect(ids).toContain("carnation-revolution-1974");
  });

  it("still gives an author the events of their own lifetime", () => {
    const king = getFranchise("stephen-king");
    const ids = king!.timeline.map((e) => e.id);
    // King was born 1947; COVID (2020) is squarely in his working life.
    expect(ids).toContain("covid-19-pandemic-2020");
  });

  it("keeps both world wars for an author who lived through them", () => {
    const c = getFranchise("agatha-christie");
    expect(c).toBeTruthy();
    const ids = c!.timeline.map((e) => e.id);
    // Christie was born 1890 and published across both wars.
    expect(ids).toContain("world-war-i-1914");
    expect(ids).toContain("world-war-ii-1939");
  });

  it("only renders a pre-birth event where the franchise explicitly claimed it", () => {
    for (const slug of ["joao-tordo", "stephen-king", "discworld", "cosmere", "wheel-of-time"]) {
      const b = getFranchise(slug);
      if (!b) continue;
      const births = b.authors.map((a) => yearOf(a.born)).filter((n): n is number => n !== null);
      if (births.length === 0) continue;
      const born = Math.min(...births);
      const claimed = new Set(b.franchise.globalEvents?.include ?? []);
      for (const e of b.timeline) {
        if (eventYear(e) >= born) continue;
        // Anything earlier has to be a deliberate content decision, never a
        // leak: that distinction is the whole point of the filter.
        expect(claimed.has(e.id), `${slug}: ${e.id} predates ${born} and is not in globalEvents.include`).toBe(true);
      }
    }
  });
});
