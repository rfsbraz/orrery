import { describe, expect, it } from "vitest";
import { companionFor } from "./companion";
import type { AuraEvent, Era, FranchiseBundle, Work } from "../content/types";

const work = (id: string, published: number, connections?: string[]): Work => ({
  id,
  title: id.split("/")[1],
  authorIds: ["a"],
  published,
  canonTier: "core",
  connections,
});

const event = (
  id: string,
  date: number,
  impact: AuraEvent["impact"],
  spoilerAfter?: string
): AuraEvent => ({ id, date, title: id, impact, description: "", spoilerAfter });

function bundle(works: Work[], events: AuraEvent[] = [], eras: Era[] = []): FranchiseBundle {
  return {
    franchise: { id: "f", name: "F", kind: "author", authorIds: [] },
    authors: [],
    works,
    eras,
    orders: [],
    timeline: events,
    characters: [],
    editions: [],
  };
}

describe("companionFor", () => {
  it("selects aura events within the window, anchors first, capped, chronological", () => {
    const b = bundle(
      [work("f/x", 1990)],
      [
        event("far", 1980, "high"), // outside window
        event("near-low", 1991, "low"),
        event("near-high", 1989, "high"),
        event("l2", 1990, "low"),
        event("l3", 1992, "low"),
        event("l4", 1988, "low"),
      ]
    );
    const c = companionFor(b.works[0], b);
    expect(c.events.length).toBeLessThanOrEqual(4);
    expect(c.events.map((e) => e.id)).toContain("near-high");
    expect(c.events.map((e) => e.id)).not.toContain("far");
    // chronological presentation
    const years = c.events.map((e) => e.year);
    expect([...years].sort((a, b) => a - b)).toEqual(years);
  });

  it("keeps spoiler boundaries on companion events", () => {
    const b = bundle([work("f/x", 1990)], [event("s", 1990, "high", "f/x")]);
    expect(companionFor(b.works[0], b).events[0].spoilerAfter).toBe("f/x");
  });

  it("finds the era and the publication-order position", () => {
    const b = bundle(
      [work("f/a", 1980), work("f/b", 1985), work("f/c", 1990)],
      [],
      [{ id: "e", title: "The Middle Years", period: "1983-1987" }]
    );
    const c = companionFor(b.works[1], b);
    expect(c.eraTitle).toBe("The Middle Years");
    expect(c.position).toEqual({ index: 2, total: 3 });
  });

  it("collects connections in both directions, chronological", () => {
    const b = bundle([
      work("f/early", 1970),
      work("f/mid", 1980, ["f/early"]),
      work("f/late", 1990, ["f/mid"]),
    ]);
    const c = companionFor(b.works[1], b); // f/mid
    expect(c.connections.map((x) => x.id)).toEqual(["f/early", "f/late"]);
  });

  it("a sparse franchise yields a quiet companion (no era, no events, no links)", () => {
    const b = bundle([work("f/only", 2000)]);
    const c = companionFor(b.works[0], b);
    expect(c.events).toEqual([]);
    expect(c.eraTitle).toBeUndefined();
    expect(c.connections).toEqual([]);
    expect(c.position).toEqual({ index: 1, total: 1 });
  });
});
