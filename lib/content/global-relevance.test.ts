import { describe, expect, it } from "vitest";
import { getFranchise } from "./index";
import { eventYear } from "./index";

// Regression guard for a real defect: `reach: global` was read as "every
// franchise renders this", so Joao Tordo (born 1975) opened his page in 1910
// and walked the reader through both world wars before his first novel.
describe("global event relevance", () => {
  it("keeps events that predate the author off the timeline", () => {
    const b = getFranchise("joao-tordo");
    expect(b).toBeTruthy();
    const years = b!.timeline.map(eventYear);
    expect(Math.min(...years)).toBeGreaterThanOrEqual(1975);
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

  it("no franchise renders an event from before its author was born", () => {
    for (const slug of ["joao-tordo", "stephen-king", "discworld", "cosmere", "wheel-of-time"]) {
      const b = getFranchise(slug);
      if (!b) continue;
      const born = Math.min(
        ...b.authors
          .map((a) => Number(String(a.born ?? "").match(/\d{4}/)?.[0] ?? NaN))
          .filter((n) => !Number.isNaN(n))
      );
      if (!Number.isFinite(born)) continue;
      for (const e of b.timeline) {
        expect(eventYear(e), `${slug}: ${e.id}`).toBeGreaterThanOrEqual(born);
      }
    }
  });
});
