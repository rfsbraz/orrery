import { describe, expect, it } from "vitest";
import { rankPaths } from "./match";
import type { StartHerePath } from "../content/types";

const paths: StartHerePath[] = [
  {
    id: "essentials",
    title: "The essentials",
    workIds: ["f/a"],
    fit: { experience: ["new"], commitment: ["taste"] },
  },
  {
    id: "big-arc",
    title: "The great thread",
    orderId: "f/thread",
    fit: { experience: ["new", "returning"], commitment: ["arc"] },
  },
  {
    id: "everything",
    title: "All of it",
    orderId: "default",
    fit: { experience: ["completionist"], commitment: ["complete"] },
  },
];

describe("rankPaths", () => {
  it("a new taste reader gets the essentials", () => {
    const r = rankPaths(paths, { experience: "new", commitment: "taste" });
    expect(r[0].path.id).toBe("essentials");
    expect(r[0].score).toBe(4);
    expect(r[0].reasons.length).toBe(2);
  });

  it("a completionist gets the complete path", () => {
    const r = rankPaths(paths, { experience: "completionist", commitment: "complete" });
    expect(r[0].path.id).toBe("everything");
  });

  it("partial matches still rank sensibly (arc beats taste for arc readers)", () => {
    const r = rankPaths(paths, { experience: "returning", commitment: "arc" });
    expect(r[0].path.id).toBe("big-arc");
  });

  it("untagged paths are soft universal fits, losing to exact matches", () => {
    const withUniversal = [...paths, { id: "any", title: "Any", orderId: "default" }];
    const r = rankPaths(withUniversal, { experience: "new", commitment: "taste" });
    expect(r[0].path.id).toBe("essentials"); // 4 beats universal 2
    expect(r.find((x) => x.path.id === "any")?.score).toBe(2);
  });

  it("ties keep curator order", () => {
    const tied: StartHerePath[] = [
      { id: "first", title: "First", workIds: ["f/a"] },
      { id: "second", title: "Second", workIds: ["f/b"] },
    ];
    const r = rankPaths(tied, { experience: "new", commitment: "taste" });
    expect(r.map((x) => x.path.id)).toEqual(["first", "second"]);
  });

  it("every path is always returned (alternatives stay reachable)", () => {
    const r = rankPaths(paths, { experience: "new", commitment: "taste" });
    expect(r).toHaveLength(paths.length);
  });
});
