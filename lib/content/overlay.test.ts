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
    const pt = getFranchise("stephen-king", "pt-PT")!;
    expect(pt.eras.find((e) => e.id === "the-golden-decade")?.title).toBe("A Década de Ouro");
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

  it("leaves the base language untouched", () => {
    const en = getFranchise("stephen-king")!;
    expect(en.eras.find((e) => e.id === "the-golden-decade")?.title).toBe("The Golden Decade");
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
