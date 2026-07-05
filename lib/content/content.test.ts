import { describe, it, expect } from "vitest";
import { getFranchise, listFranchiseSlugs, getAuthor } from "./index";
import { parseRefs, stripRefs, hrefFor } from "./refs";

describe("reference parser", () => {
  it("parses a work link with display text", () => {
    const segs = parseRefs("read [[work:stephen-king/the-stand|The Stand]] first");
    expect(segs).toHaveLength(3);
    expect(segs[1]).toMatchObject({
      kind: "link",
      type: "work",
      id: "stephen-king/the-stand",
      text: "The Stand",
      href: "/f/stephen-king#w-the-stand",
    });
  });

  it("falls back to the slug when no display text", () => {
    const [seg] = parseRefs("[[author:peter-straub]]");
    expect(seg).toMatchObject({ kind: "link", text: "peter-straub", href: "/author/peter-straub" });
  });

  it("leaves plain prose untouched and strips to text", () => {
    expect(parseRefs("just words")).toEqual([{ kind: "text", text: "just words" }]);
    expect(stripRefs("read [[work:stephen-king/it|IT]] now")).toBe("read IT now");
  });

  it("routes each entity type", () => {
    expect(hrefFor("work", "stephen-king/carrie")).toBe("/f/stephen-king#w-carrie");
    expect(hrefFor("author", "stephen-king")).toBe("/author/stephen-king");
    expect(hrefFor("franchise", "stephen-king")).toBe("/f/stephen-king");
  });
});

describe("Stephen King canon (loaded from the submodule)", () => {
  const king = getFranchise("stephen-king");

  it("loads the franchise", () => {
    expect(listFranchiseSlugs()).toContain("stephen-king");
    expect(king?.franchise.name).toBe("Stephen King");
    expect(king!.works.length).toBeGreaterThanOrEqual(70);
  });

  it("derives a default order that is complete and chronological", () => {
    const def = king!.orders[0];
    expect(def.derived).toBe(true);
    expect(def.orderedWorkIds).toHaveLength(king!.works.length); // ALL works
    const years = def.orderedWorkIds.map(
      (id) => king!.works.find((w) => w.id === id)!.published
    );
    expect([...years]).toEqual([...years].sort((a, b) => a - b)); // ascending
    expect(king!.works.find((w) => w.id === def.orderedWorkIds[0])!.title).toBe("Carrie");
  });

  it("keeps the curated Dark Tower order after the default", () => {
    expect(king!.orders.some((o) => o.id === "stephen-king/dark-tower-connected")).toBe(true);
    expect(king!.orders[0].derived).toBe(true);
  });

  it("every order references a real work", () => {
    const ids = new Set(king!.works.map((w) => w.id));
    for (const o of king!.orders) {
      for (const wid of o.orderedWorkIds) expect(ids.has(wid)).toBe(true);
    }
  });

  it("resolves authors, including the global collaborator entities", () => {
    expect(king!.authors.map((a) => a.id)).toContain("stephen-king");
    expect(getAuthor("peter-straub")?.name).toBe("Peter Straub");
    // Bachman books carry publishedAs, not a separate author
    const rage = king!.works.find((w) => w.id === "stephen-king/rage");
    expect(rage?.publishedAs).toBe("Richard Bachman");
  });

  it("builds a timeline with author-life events, sorted", () => {
    expect(king!.timeline.length).toBeGreaterThan(5);
    const years = king!.timeline.map((e) => Number(String(e.date).slice(0, 4)));
    expect([...years]).toEqual([...years].sort((a, b) => a - b));
    expect(king!.timeline.some((e) => e.id === "king-van-accident-1999")).toBe(true);
  });

  it("carries enrichment (OpenLibrary IDs) through", () => {
    const carrie = king!.works.find((w) => w.id === "stephen-king/carrie");
    expect(carrie?.externalIds?.openLibrary).toMatch(/^OL\d+W$/);
  });
});
