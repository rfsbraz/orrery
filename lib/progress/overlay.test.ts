import { describe, it, expect } from "vitest";
import { getFranchise } from "../content";
import { buildPersonalOverlay, overlayCaption } from "./overlay";
import type { ProgressEntry } from "./types";

const king = getFranchise("stephen-king")!;
const read = (workId: string, dateRead?: string): ProgressEntry => ({ workId, status: "read", dateRead });

describe("personal timeline overlay", () => {
  it("computes gaps between publication and reading", () => {
    const o = buildPersonalOverlay(king.works, [
      read("stephen-king/it", "2019-06-01"), // IT published 1986 -> gap 33
      read("stephen-king/carrie", "1974-09-01"), // published 1974 -> gap 0
    ]);
    expect(o.readCount).toBe(2);
    const it = o.items.find((i) => i.work.id === "stephen-king/it")!;
    expect(it.gapYears).toBe(33);
    expect(o.items[0].work.id).toBe("stephen-king/carrie"); // sorted by publication
    expect(o.latestGap?.work.id).toBe("stephen-king/it");
    expect(o.earliestRead?.work.id).toBe("stephen-king/carrie");
  });

  it("handles reads with no date and averages only dated ones", () => {
    const o = buildPersonalOverlay(king.works, [
      read("stephen-king/it", "2019-06-01"), // gap 33
      read("stephen-king/misery"), // no date
    ]);
    expect(o.readCount).toBe(2);
    expect(o.datedCount).toBe(1);
    expect(o.avgGapYears).toBe(33);
  });

  it("ignores unread and unknown works", () => {
    const o = buildPersonalOverlay(king.works, [
      { workId: "stephen-king/it", status: "reading" },
      { workId: "not-a-franchise/ghost", status: "read", dateRead: "2020-01-01" },
    ]);
    expect(o.readCount).toBe(0);
  });

  it("captions the read-vs-written gap in plain language", () => {
    const o = buildPersonalOverlay(king.works, [read("stephen-king/it", "2019-06-01")]);
    expect(overlayCaption(o.items[0])).toBe("read in 2019, 33 years after it published");
    const same = buildPersonalOverlay(king.works, [read("stephen-king/carrie", "1974-01-01")]);
    expect(overlayCaption(same.items[0])).toBe("read in 1974, the year it published");
  });
});
