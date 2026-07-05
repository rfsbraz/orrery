import { describe, it, expect } from "vitest";
import { getFranchise } from "../content";
import { ACHIEVEMENTS } from "./defs";
import { buildContext, evaluate, eraYears } from "./evaluate";
import type { ProgressEntry } from "../progress/types";

const king = getFranchise("stephen-king")!;
const read = (workId: string, dateRead?: string): ProgressEntry => ({ workId, status: "read", dateRead });

function earnedFrom(progress: ProgressEntry[]): string[] {
  return evaluate(ACHIEVEMENTS, buildContext([king], progress));
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
    expect(earnedFrom(nine)).not.toContain("king-devotee");
    const ten = king.works.slice(0, 10).map((w) => read(w.id));
    expect(earnedFrom(ten)).toContain("king-devotee");
  });

  it("awards the Golden Decade era badge at 5 works from 1980-1989", () => {
    const eighties = king.works.filter((w) => w.published >= 1980 && w.published <= 1989).slice(0, 5);
    expect(eighties.length).toBe(5);
    expect(earnedFrom(eighties.map((w) => read(w.id)))).toContain("king-golden-decade");
  });

  it("awards Pilgrim of the Beam only when the Dark Tower order is complete", () => {
    const order = king.orders.find((o) => o.id === "stephen-king/dark-tower-connected")!;
    const partial = order.orderedWorkIds.slice(0, -1).map((id) => read(id));
    expect(earnedFrom(partial)).not.toContain("dark-tower-pilgrim");
    const complete = order.orderedWorkIds.map((id) => read(id));
    expect(earnedFrom(complete)).toContain("dark-tower-pilgrim");
  });

  it("awards Constant Reader only when every King work is read", () => {
    const allButOne = king.works.slice(1).map((w) => read(w.id));
    expect(earnedFrom(allButOne)).not.toContain("king-constant-reader");
    const all = king.works.map((w) => read(w.id));
    expect(earnedFrom(all)).toContain("king-constant-reader");
  });
});
