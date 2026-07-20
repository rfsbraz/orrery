import { describe, expect, it } from "vitest";
import { getAllBundles, getAuthor, getFranchise, listFranchises } from "./index";
import { listAuthorEntries } from "./authors";

// Translation overlays are the one place where a mistake passes CI and then
// renders nothing, so these assert against the real merged content rather
// than fixtures. If a translation stops reaching the page, this fails.

describe("translation overlays (pt-PT)", () => {
  it("translates work synopses", () => {
    const en = getFranchise("stephen-king")!;
    const pt = getFranchise("stephen-king", "pt-PT")!;
    const id = "stephen-king/carrie";
    const enSyn = en.works.find((w) => w.id === id)?.synopsis;
    const ptSyn = pt.works.find((w) => w.id === id)?.synopsis;
    expect(ptSyn).toBeTruthy();
    expect(ptSyn).not.toBe(enSyn);
  });

  it("translates era titles (the era plates)", () => {
    // Asserted structurally, not against a literal title: era titles are
    // curated prose that gets re-sourced, and pinning one here turns an
    // editorial improvement into a red build.
    const en = getFranchise("stephen-king")!;
    const pt = getFranchise("stephen-king", "pt-PT")!;
    const id = "the-golden-decade";
    const enTitle = en.eras.find((e) => e.id === id)?.title;
    const ptTitle = pt.eras.find((e) => e.id === id)?.title;
    expect(ptTitle).toBeTruthy();
    expect(ptTitle).not.toBe(enTitle);
  });

  it("translates author life events written as FLAT overlay entries", () => {
    // The shape that validated green but rendered nothing until fixed.
    const pt = getFranchise("stephen-king", "pt-PT")!;
    const born = pt.timeline.find((e) => e.id === "king-born-1947");
    expect(born?.title).not.toMatch(/^Born in/);
  });

  it("translates author life events written NESTED under the author", () => {
    const pt = getFranchise("joao-tordo", "pt-PT")!;
    const life = pt.timeline.filter((e) => e.scope === "author-life");
    expect(life.length).toBeGreaterThan(0);
    // At least one must differ from its English source.
    const en = getFranchise("joao-tordo")!;
    const enTitles = new Set(
      en.timeline.filter((e) => e.scope === "author-life").map((e) => e.title)
    );
    expect(life.some((e) => !enTitles.has(e.title))).toBe(true);
  });

  // Every entry point must honour the locale. The home page shipped English
  // franchise descriptions on /pt because listFranchises ignored it, and that
  // was the second time a surface silently bypassed translation.
  it("every content entry point honours the locale", () => {
    const enF = listFranchises().find((f) => f.id === "stephen-king");
    const ptF = listFranchises("pt-PT").find((f) => f.id === "stephen-king");
    expect(ptF?.description).toBeTruthy();
    expect(ptF?.description).not.toBe(enF?.description);

    const enA = getAuthor("stephen-king");
    const ptA = getAuthor("stephen-king", "pt-PT");
    expect(ptA?.bio).toBeTruthy();
    expect(ptA?.bio).not.toBe(enA?.bio);

    const enB = getAllBundles().find((b) => b.franchise.id === "stephen-king")!;
    const ptB = getAllBundles("pt-PT").find((b) => b.franchise.id === "stephen-king")!;
    expect(ptB.eras[0]?.title).not.toBe(enB.eras[0]?.title);

    const ptEntries = listAuthorEntries("pt-PT");
    const king = ptEntries.find((e) => e.author.id === "stephen-king")!;
    expect(king.franchises[0]?.description).not.toBe(enF?.description);
  });

  // Every prose-bearing collection on the bundle must be overlaid. This has
  // now been missed three times, one collection at a time (works, then the
  // home page's franchise list, then characters), so assert them together.
  it("every prose collection on a bundle is translated", () => {
    const en = getFranchise("stephen-king")!;
    const pt = getFranchise("stephen-king", "pt-PT")!;

    const differs = (a?: string, b?: string) => Boolean(a && b && a !== b);

    expect(differs(en.franchise.description, pt.franchise.description)).toBe(true);
    expect(differs(en.works[0]?.synopsis, pt.works[0]?.synopsis)).toBe(true);
    expect(differs(en.eras[0]?.title, pt.eras[0]?.title)).toBe(true);
    expect(differs(en.authors[0]?.bio, pt.authors[0]?.bio)).toBe(true);
    expect(differs(en.characters[0]?.description, pt.characters[0]?.description)).toBe(true);

    // orders: the derived default is generated in English by the engine, so
    // check a curated one.
    const enOrder = en.orders.find((o) => !o.derived);
    const ptOrder = pt.orders.find((o) => !o.derived);
    expect(differs(enOrder?.rationale, ptOrder?.rationale)).toBe(true);

    // aura events, including the shared global layer. Pick an event inside the
    // author's lifetime: global events are now filtered to the span the author
    // actually wrote in, so WWII is (correctly) absent from a 1947-born writer.
    const enGlobal = en.timeline.find((e) => e.id === "covid-19-pandemic-2020");
    const ptGlobal = pt.timeline.find((e) => e.id === "covid-19-pandemic-2020");
    expect(enGlobal, "global layer should reach this franchise").toBeTruthy();
    expect(differs(enGlobal?.title, ptGlobal?.title)).toBe(true);

    // startHere paths (nested prose, reached through the wizard)
    const enPath = en.franchise.startHere?.paths?.[0];
    const ptPath = pt.franchise.startHere?.paths?.[0];
    expect(differs(enPath?.title, ptPath?.title)).toBe(true);
  });

  it("editions are NOT overlaid (a published title is data, not prose)", () => {
    const en = getFranchise("stephen-king")!;
    const pt = getFranchise("stephen-king", "pt-PT")!;
    expect(pt.editions.map((e) => e.title)).toEqual(en.editions.map((e) => e.title));
  });

  it("leaves the base language untouched", () => {
    // The overlay must not leak into the base bundle: read English twice,
    // once before and once after a pt-PT read, and it must not have shifted.
    const before = getFranchise("stephen-king")!.eras.map((e) => e.title);
    getFranchise("stephen-king", "pt-PT");
    const after = getFranchise("stephen-king")!.eras.map((e) => e.title);
    expect(after).toEqual(before);
    expect(after.every((t) => Boolean(t))).toBe(true);
  });

  it("never translates a work title (that is edition data)", () => {
    const en = getFranchise("stephen-king")!;
    const pt = getFranchise("stephen-king", "pt-PT")!;
    for (const w of pt.works) {
      const base = en.works.find((b) => b.id === w.id);
      expect(w.title).toBe(base?.title);
    }
  });

  it("an untranslated franchise still renders in the base language", () => {
    // Partial coverage must degrade per field, never blank out.
    for (const slug of ["stephen-king", "discworld", "cosmere"]) {
      const pt = getFranchise(slug, "pt-PT")!;
      expect(pt.works.every((w) => Boolean(w.title))).toBe(true);
      expect(pt.franchise.description).toBeTruthy();
    }
  });
});
