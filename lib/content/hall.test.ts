import { describe, expect, it } from "vitest";
import { buildHall } from "./hall";
import type { AuraEvent, FranchiseBundle, Work } from "./types";

const work = (id: string, published: number): Work => ({
  id,
  title: id.split("/")[1],
  authorIds: ["a"],
  published,
  canonTier: "core",
});

const globalEvent = (id: string, date: number): AuraEvent => ({
  id,
  date,
  title: id,
  impact: "high",
  description: "",
  reach: "global",
});

function bundle(
  name: string,
  works: Work[],
  timeline: AuraEvent[] = [],
  features?: { hall?: "off" }
): FranchiseBundle {
  return {
    franchise: { id: name.toLowerCase(), name, kind: "author", authorIds: [], features },
    authors: [],
    works,
    eras: [],
    orders: [],
    timeline,
    characters: [],
    editions: [],
  };
}

describe("buildHall", () => {
  it("merges franchises year by year with global events, decade-grouped", () => {
    const hall = buildHall([
      bundle("King", [work("king/misery", 1987), work("king/it", 1986)], [globalEvent("chernobyl", 1986)]),
      bundle("Pratchett", [work("discworld/mort", 1987)]),
    ]);
    expect(hall.decades).toHaveLength(1);
    expect(hall.decades[0].label).toBe("1980s");
    const y1987 = hall.decades[0].years.find((y) => y.year === 1987)!;
    expect(y1987.entries.map((e) => e.franchiseName)).toEqual(["King", "Pratchett"]);
    const y1986 = hall.decades[0].years.find((y) => y.year === 1986)!;
    expect(y1986.events.map((e) => e.id)).toEqual(["chernobyl"]);
  });

  it("deduplicates shared global events across bundles", () => {
    const shared = globalEvent("moon", 1969);
    const hall = buildHall([
      bundle("A", [work("a/x", 1969)], [shared]),
      bundle("B", [work("b/y", 1969)], [shared]),
    ]);
    const y = hall.decades[0].years[0];
    expect(y.events).toHaveLength(1);
  });

  it("non-global events never join the hall", () => {
    const life: AuraEvent = { id: "life", date: 1987, title: "l", impact: "high", description: "" };
    const hall = buildHall([bundle("A", [work("a/x", 1987)], [life])]);
    expect(hall.decades[0].years[0].events).toEqual([]);
  });

  it("a franchise can opt out via features.hall", () => {
    const hall = buildHall([
      bundle("Shown", [work("shown/x", 2000)]),
      bundle("Hidden", [work("hidden/y", 2000)], [], { hall: "off" }),
    ]);
    expect(hall.franchiseNames).toEqual(["Shown"]);
    expect(hall.decades[0].years[0].entries.map((e) => e.franchiseName)).toEqual(["Shown"]);
  });

  it("degrades gracefully to a single wing", () => {
    const hall = buildHall([bundle("Solo", [work("solo/x", 1999)])]);
    expect(hall.franchiseNames).toEqual(["Solo"]);
    expect(hall.decades[0].years[0].entries[0].works[0].id).toBe("solo/x");
  });
});
