import { describe, expect, it } from "vitest";
import { buildArcModel, characterThreads, connectionEdges } from "./connections";
import type { Character, Work } from "./types";

const work = (id: string, published: number, connections?: string[]): Work => ({
  id,
  title: id.split("/")[1],
  authorIds: ["a"],
  published,
  canonTier: "core",
  connections,
});

describe("connectionEdges", () => {
  it("collects edges and drops unknown/self targets", () => {
    const edges = connectionEdges([
      work("f/a", 1980),
      work("f/b", 1990, ["f/a", "f/ghost", "f/b"]),
    ]);
    expect(edges).toEqual([{ from: "f/b", to: "f/a" }]);
  });

  it("deduplicates regardless of orientation", () => {
    const edges = connectionEdges([
      work("f/a", 1980, ["f/b"]),
      work("f/b", 1990, ["f/a"]),
    ]);
    expect(edges).toHaveLength(1);
  });
});

describe("buildArcModel", () => {
  it("only participating works appear, chronologically, with i<j arcs", () => {
    const model = buildArcModel([
      work("f/loner", 1975),
      work("f/late", 2000, ["f/early"]),
      work("f/early", 1980),
    ]);
    expect(model.nodes.map((n) => n.id)).toEqual(["f/early", "f/late"]);
    expect(model.arcs).toEqual([{ i: 0, j: 1 }]);
  });

  it("no connections yields an empty map (capability stays off upstream)", () => {
    const model = buildArcModel([work("f/a", 1980), work("f/b", 1990)]);
    expect(model.nodes).toEqual([]);
    expect(model.arcs).toEqual([]);
  });
});

describe("characterThreads", () => {
  const char = (id: string, appearsIn: Character["appearsIn"]): Character => ({
    id,
    name: id,
    appearsIn,
  });

  it("resolves appearances chronologically and keeps spoiler boundaries", () => {
    const works = [work("f/a", 1980), work("f/b", 1990)];
    const threads = characterThreads(
      [
        char("f/x", [
          { workId: "f/b", spoilerAfter: "f/b" },
          { workId: "f/a" },
        ]),
      ],
      works
    );
    expect(threads[0].appearances.map((a) => a.workId)).toEqual(["f/a", "f/b"]);
    expect(threads[0].appearances[1].spoilerAfter).toBe("f/b");
  });

  it("drops characters whose appearances do not resolve", () => {
    const threads = characterThreads(
      [char("f/x", [{ workId: "f/ghost" }])],
      [work("f/a", 1980)]
    );
    expect(threads).toEqual([]);
  });
});
