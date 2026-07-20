import { describe, expect, it } from "vitest";
import { buildRiver, eraSpan } from "./river";
import type { AuraEvent, Era, FranchiseBundle, Work } from "./types";

const work = (id: string, published: number): Work => ({
  id,
  title: id,
  authorIds: ["a"],
  published,
  canonTier: "core",
});

const event = (id: string, date: number, impact: AuraEvent["impact"]): AuraEvent => ({
  id,
  date,
  title: id,
  impact,
  description: "",
});

const era = (id: string, period: string): Era => ({ id, title: id, period });

function bundle(works: Work[], events: AuraEvent[], eras: Era[]): FranchiseBundle {
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
  it("parses ranges, decades, and single years", () => {
    expect(eraSpan(era("a", "1974-1979"))).toEqual([1974, 1979]);
    expect(eraSpan(era("b", "1980s"))).toEqual([1980, 1989]);
    expect(eraSpan(era("c", "1999"))).toEqual([1999, 1999]);
  });
});

describe("buildRiver", () => {
  it("promotes high-impact events to anchors and keeps the rest as texture", () => {
    const [section] = buildRiver(
      bundle([work("x/w", 1980)], [event("big", 1979, "high"), event("small", 1981, "low")], [])
    );
    expect(section.items.map((i) => i.kind)).toEqual(["anchor", "work", "event"]);
  });

  it("sections by era and attaches out-of-span years to the nearest era", () => {
    const sections = buildRiver(
      bundle(
        [work("x/early", 1960), work("x/mid", 1976), work("x/late", 1999)],
        [],
        [era("seventies", "1974-1979"), era("nineties", "1990-1999")]
      )
    );
    expect(sections).toHaveLength(2);
    // 1960 is closest to the seventies era start
    expect(sections[0].items.map((i) => i.work?.id)).toEqual(["x/early", "x/mid"]);
    expect(sections[1].items.map((i) => i.work?.id)).toEqual(["x/late"]);
  });

  it("a franchise with no eras yields a single unlabeled section", () => {
    const sections = buildRiver(bundle([work("x/w", 2000)], [event("e", 2001, "med")], []));
    expect(sections).toHaveLength(1);
    expect(sections[0].era).toBeNull();
    expect(sections[0].items).toHaveLength(2);
  });

  it("events precede works within the same year (context first)", () => {
    const [section] = buildRiver(
      bundle([work("x/w", 1986)], [event("e", 1986, "low")], [])
    );
    expect(section.items.map((i) => i.kind)).toEqual(["event", "work"]);
  });
});
