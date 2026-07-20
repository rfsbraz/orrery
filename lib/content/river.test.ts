import { describe, expect, it } from "vitest";
import { buildRiver, eraSpan, subseriesEntries } from "./river";
import type { AuraEvent, Era, FranchiseBundle, Work } from "./types";

const work = (id: string, published: number, subseries?: string): Work => ({
  id,
  title: id.split("/")[1],
  authorIds: ["a"],
  published,
  canonTier: "core",
  subseries,
});

const event = (id: string, date: number, impact: AuraEvent["impact"]): AuraEvent => ({
  id,
  date,
  title: id,
  impact,
  description: "",
});

const era = (id: string, period: string): Era => ({ id, title: id, period });

function bundle(works: Work[], events: AuraEvent[] = [], eras: Era[] = []): FranchiseBundle {
  return {
    franchise: { id: "x", name: "X", kind: "author", authorIds: [] },
    authors: [],
    works,
    eras,
    orders: [],
    timeline: events,
    characters: [],
    editions: [],
  };
}

describe("eraSpan", () => {
  it("parses ranges, decades, single years, and open-ended eras", () => {
    expect(eraSpan(era("a", "1974-1979"))).toEqual([1974, 1979]);
    expect(eraSpan(era("b", "1980s"))).toEqual([1980, 1989]);
    expect(eraSpan(era("c", "1999"))).toEqual([1999, 1999]);
    expect(eraSpan(era("d", "2020-present"))).toEqual([2020, 9999]);
  });
});

describe("buildRiver (strata layers)", () => {
  it("one layer per year, chronological, splitting ruptures from texture", () => {
    const layers = buildRiver(
      bundle(
        [work("x/a", 1980), work("x/b", 1980), work("x/c", 1990)],
        [event("big", 1980, "high"), event("small", 1980, "low")]
      )
    );
    expect(layers.map((l) => l.year)).toEqual([1980, 1990]);
    expect(layers[0].works.map((w) => w.id)).toEqual(["x/a", "x/b"]);
    expect(layers[0].ruptures.map((e) => e.id)).toEqual(["big"]);
    expect(layers[0].texture.map((e) => e.id)).toEqual(["small"]);
  });

  it("marks decade boundaries for the decade rules", () => {
    const layers = buildRiver(
      bundle([work("x/a", 1979), work("x/b", 1980), work("x/c", 1985)])
    );
    expect(layers.map((l) => l.decadeStart)).toEqual([true, true, false]);
  });

  it("assigns eras and marks the first layer of each", () => {
    const layers = buildRiver(
      bundle(
        [work("x/a", 1975), work("x/b", 1977), work("x/c", 1985)],
        [],
        [era("seventies", "1974-1979"), era("eighties", "1980-1989")]
      )
    );
    expect(layers.map((l) => l.era?.id)).toEqual(["seventies", "seventies", "eighties"]);
    expect(layers.map((l) => l.eraStart)).toEqual([true, false, true]);
  });

  it("a franchise with no eras still walks (no era markers)", () => {
    const layers = buildRiver(bundle([work("x/a", 2000)], [event("e", 2001, "med")]));
    expect(layers).toHaveLength(2);
    expect(layers.every((l) => l.era === null && !l.eraStart)).toBe(true);
  });

  it("a year with only an event still gets its layer", () => {
    const layers = buildRiver(bundle([work("x/a", 1990)], [event("e", 1995, "high")]));
    expect(layers.map((l) => l.year)).toEqual([1990, 1995]);
    expect(layers[1].works).toEqual([]);
    expect(layers[1].ruptures).toHaveLength(1);
  });
});

describe("subseriesEntries", () => {
  it("numbers each series by publication, ignoring standalones", () => {
    const works = [
      work("x/tower-2", 1987, "The Dark Tower"),
      work("x/standalone", 1985),
      work("x/tower-1", 1982, "The Dark Tower"),
      work("x/other-1", 1990, "Other"),
    ];
    const entries = subseriesEntries(works);
    expect(entries.get("x/tower-1")).toEqual({ name: "The Dark Tower", n: 1, total: 2 });
    expect(entries.get("x/tower-2")).toEqual({ name: "The Dark Tower", n: 2, total: 2 });
    expect(entries.get("x/other-1")).toEqual({ name: "Other", n: 1, total: 1 });
    expect(entries.has("x/standalone")).toBe(false);
  });
});
