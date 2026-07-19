import { describe, expect, it } from "vitest";
import { buildYearRecap, recapHeadline } from "./recap";
import type { Era, FranchiseBundle, Work } from "../content/types";
import type { ProgressEntry } from "./types";

const work = (id: string, published: number): Work => ({
  id,
  title: id.split("/")[1],
  authorIds: ["a"],
  published,
  canonTier: "core",
});

function bundle(name: string, works: Work[], eras: Era[] = []): FranchiseBundle {
  return {
    franchise: { id: name, name, kind: "author", authorIds: [] },
    authors: [],
    works,
    eras,
    orders: [],
    timeline: [],
    characters: [],
    editions: [],
  };
}

const read = (workId: string, dateRead?: string): ProgressEntry => ({
  workId,
  status: "read",
  dateRead,
});

describe("buildYearRecap", () => {
  const bundles = [
    bundle("King", [work("king/it", 1986), work("king/misery", 1987), work("king/holly", 2023)], [
      { id: "golden", title: "The Golden Decade", period: "1980-1989" },
    ]),
    bundle("Tordo", [work("tordo/as-tres-vidas", 2008)]),
  ];

  it("collects only that year's finished books, with gaps and span", () => {
    const r = buildYearRecap(2024, bundles, [
      read("king/it", "2024-03-01"),
      read("tordo/as-tres-vidas", "2024-08-15"),
      read("king/misery", "2023-01-01"), // other year
      { workId: "king/holly", status: "reading", dateRead: "2024-05-05" }, // not finished
    ]);
    expect(r.books.map((b) => b.work.id)).toEqual(["king/it", "tordo/as-tres-vidas"]);
    expect(r.publicationSpan).toEqual({ from: 1986, to: 2008 });
    expect(r.books[0].gapYears).toBe(38);
    expect(r.longestGap?.work.id).toBe("king/it");
    expect(r.franchisesTouched).toEqual([
      { name: "King", count: 1 },
      { name: "Tordo", count: 1 },
    ]);
  });

  it("finds punctual reads and visited eras", () => {
    const r = buildYearRecap(2024, bundles, [read("king/holly", "2024-01-01"), read("king/it", "2024-02-02")]);
    // Holly (2023) read in 2024: one year after publication still counts as punctual.
    expect(r.punctualReads.map((b) => b.work.id)).toEqual(["king/holly"]);
    const r23 = buildYearRecap(2023, bundles, [read("king/holly", "2023-12-31")]);
    expect(r23.punctualReads.map((b) => b.work.id)).toEqual(["king/holly"]);
    expect(r.erasVisited).toEqual([{ franchiseName: "King", eraTitle: "The Golden Decade" }]);
  });

  it("undated or unknown works are ignored, empty years stay honest", () => {
    const r = buildYearRecap(2024, bundles, [read("king/it"), read("ghost/none", "2024-01-01")]);
    expect(r.books).toEqual([]);
    expect(recapHeadline(r)).toContain("No finished books");
  });

  it("headline mentions the writing span when it exists", () => {
    const r = buildYearRecap(2024, bundles, [
      read("king/it", "2024-03-01"),
      read("tordo/as-tres-vidas", "2024-08-15"),
    ]);
    expect(recapHeadline(r)).toBe("2 books in 2024, spanning 23 years of writing.");
  });
});
