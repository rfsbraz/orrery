import { describe, expect, it } from "vitest";
import { buildContext, evaluate } from "./evaluate";
import type { Achievement } from "./types";
import type { FranchiseBundle, Work } from "../content/types";
import type { ProgressEntry } from "../progress/types";

// orrery#168: a work naming `containedIn` has its own text reprinted whole
// inside another work in the same bundle. Before this, franchise_complete
// (and era_reader's count) required BOTH ids read to reach 100% - the same
// 49 poems, read once, counted as an unfinished franchise until read again
// under a second id.

function work(id: string, published: number, containedIn?: string): Work {
  return { id, title: id, authorIds: ["author"], published, canonTier: "core", containedIn };
}

function bundle(works: Work[]): FranchiseBundle {
  return {
    franchise: { id: "wing", name: "Wing", kind: "author", authorIds: ["author"] },
    authors: [],
    works,
    eras: [],
    orders: [],
    timeline: [],
    editions: [],
  };
}

const read = (workId: string): ProgressEntry => ({ workId, status: "read" });

const complete: Achievement = {
  id: "wing/complete",
  name: "Complete",
  description: "Read every work in the wing",
  icon: "🏆",
  tier: "gold",
  category: "completion",
  criteria: { kind: "franchise_complete", franchiseId: "wing" },
};

describe("franchise_complete and containedIn (orrery#168)", () => {
  it("does not require the contained work to also be marked read", () => {
    const b = bundle([
      work("wing/standalone-1925", 1925, "wing/collection-1946"),
      work("wing/collection-1946", 1946),
    ]);
    const ctx = buildContext([b], [read("wing/collection-1946")]);
    expect(evaluate([complete], ctx)).toContain("wing/complete");
  });

  it("still requires every OTHER work read", () => {
    const b = bundle([
      work("wing/standalone-1925", 1925, "wing/collection-1946"),
      work("wing/collection-1946", 1946),
      work("wing/unrelated-1930", 1930),
    ]);
    const ctx = buildContext([b], [read("wing/collection-1946")]);
    expect(evaluate([complete], ctx)).not.toContain("wing/complete");
    const ctxAll = buildContext([b], [read("wing/collection-1946"), read("wing/unrelated-1930")]);
    expect(evaluate([complete], ctxAll)).toContain("wing/complete");
  });

  it("marking the contained id itself read still resolves fine elsewhere (workById unfiltered)", () => {
    const b = bundle([
      work("wing/standalone-1925", 1925, "wing/collection-1946"),
      work("wing/collection-1946", 1946),
    ]);
    const ctx = buildContext([b], [read("wing/standalone-1925")]);
    expect(ctx.workById.get("wing/standalone-1925")?.published).toBe(1925);
    // Reading only the standalone does NOT complete the franchise - the
    // container is a real, separate work still unread.
    expect(evaluate([complete], ctx)).not.toContain("wing/complete");
  });

  it("unaffected when no work sets containedIn", () => {
    const b = bundle([work("wing/a", 2000), work("wing/b", 2001)]);
    const partial = buildContext([b], [read("wing/a")]);
    expect(evaluate([complete], partial)).not.toContain("wing/complete");
    const all = buildContext([b], [read("wing/a"), read("wing/b")]);
    expect(evaluate([complete], all)).toContain("wing/complete");
  });
});
