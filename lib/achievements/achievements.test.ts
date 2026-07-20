import { describe, it, expect } from "vitest";
import { getFranchise, listAchievements } from "../content";
import { buildContext, evaluate, eraYears } from "./evaluate";
import type { ProgressEntry } from "../progress/types";

const king = getFranchise("stephen-king")!;
const read = (workId: string, dateRead?: string): ProgressEntry => ({ workId, status: "read", dateRead });

function earnedFrom(progress: ProgressEntry[]): string[] {
  return evaluate(listAchievements(), buildContext([king], progress));
}

describe("eraYears", () => {
  it("parses closed and open-ended eras", () => {
    expect(eraYears("1980-1989")).toEqual([1980, 1989]);
    expect(eraYears("2020-present")).toEqual([2020, 9999]);
  });
});

describe("achievements evaluation", () => {
  it("awards nothing for no progress", () => {
    expect(earnedFrom([])).toEqual([]);
  });

  it("awards First Steps on the first read", () => {
    expect(earnedFrom([read("stephen-king/carrie")])).toContain("first-steps");
  });

  it("awards First-Edition Soul for reading near publication", () => {
    // Carrie published 1974; read 1975 = within 1 year
    expect(earnedFrom([read("stephen-king/carrie", "1975-03-01")])).toContain("first-edition-soul");
    // ...but not if read decades later
    expect(earnedFrom([read("stephen-king/carrie", "2010-01-01")])).not.toContain("first-edition-soul");
  });

  it("awards Devotee at 10 King works, not before", () => {
    const nine = king.works.slice(0, 9).map((w) => read(w.id));
    expect(earnedFrom(nine)).not.toContain("stephen-king/devotee");
    const ten = king.works.slice(0, 10).map((w) => read(w.id));
    expect(earnedFrom(ten)).toContain("stephen-king/devotee");
  });

  it("awards the era badge at 5 works from inside that era", () => {
    // Derived from the era itself rather than hardcoded years: curation
    // re-sources era boundaries (this span moved from 1980-1989 to 1981-1989)
    // and that must not read as a regression in the rules engine.
    const era = king.eras.find((e) => e.id === "the-golden-decade")!;
    const [start, end] = eraYears(era.period);
    const inEra = king.works.filter((w) => w.published >= start && w.published <= end).slice(0, 5);
    expect(inEra.length).toBe(5);
    expect(earnedFrom(inEra.map((w) => read(w.id)))).toContain("stephen-king/golden-decade");
  });

  it("awards Pilgrim of the Beam only when the Dark Tower order is complete", () => {
    const order = king.orders.find((o) => o.id === "stephen-king/dark-tower-connected")!;
    const partial = order.orderedWorkIds.slice(0, -1).map((id) => read(id));
    expect(earnedFrom(partial)).not.toContain("stephen-king/pilgrim-of-the-beam");
    const complete = order.orderedWorkIds.map((id) => read(id));
    expect(earnedFrom(complete)).toContain("stephen-king/pilgrim-of-the-beam");
  });

  it("awards Constant Reader only when every King work is read", () => {
    const allButOne = king.works.slice(1).map((w) => read(w.id));
    expect(earnedFrom(allButOne)).not.toContain("stephen-king/constant-reader");
    const all = king.works.map((w) => read(w.id));
    expect(earnedFrom(all)).toContain("stephen-king/constant-reader");
  });
});
