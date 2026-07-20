import { describe, expect, it } from "vitest";
import { getAuthor, getFranchise } from "./index";
import { buildRiver } from "./river";

// Overlays carry prose only. A translation must never cost a page its
// structure, which is exactly what happened: nested overlay values were being
// copied wholesale over the base, so anything a translator did not restate was
// silently destroyed on every non-default locale.
describe("translation preserves structure", () => {
  it("keeps lifeEvent dates in a translated locale", () => {
    const en = getAuthor("joao-tordo")!;
    const pt = getAuthor("joao-tordo", "pt-PT")!;
    expect(pt.lifeEvents?.length).toBe(en.lifeEvents?.length);
    for (const e of pt.lifeEvents ?? []) {
      expect(e.date ?? e.dateRange, `${e.id} lost its date in pt-PT`).toBeTruthy();
    }
  });

  it("still shows author life events on a translated timeline", () => {
    // The visible symptom: undated events resolve to year 0, and buildRiver
    // drops year-0 layers, so they vanished from the Portuguese walk.
    const count = (loc?: string) =>
      buildRiver(getFranchise("joao-tordo", loc)!)
        .flatMap((l) => [...l.texture, ...l.ruptures])
        .filter((e) => e.id.startsWith("tordo-")).length;
    expect(count("pt-PT")).toBe(count());
    expect(count("pt-PT")).toBeGreaterThan(0);
  });

  it("keeps startHere paths pointing somewhere in a translated locale", () => {
    const en = getFranchise("stephen-king")!.franchise.startHere?.paths ?? [];
    const pt = getFranchise("stephen-king", "pt-PT")!.franchise.startHere?.paths ?? [];
    expect(pt.length).toBe(en.length);
    for (const p of pt) {
      const target = (p.workIds?.length ?? 0) > 0 || Boolean(p.orderId);
      expect(target, `startHere path ${p.id} leads nowhere in pt-PT`).toBe(true);
      expect(p.fit, `startHere path ${p.id} lost its fit tags in pt-PT`).toBeTruthy();
    }
  });

  it("translates the prose it is supposed to translate", () => {
    // The inverse guard: skipping non-scalars must not stop real translation.
    const en = getAuthor("joao-tordo")!;
    const pt = getAuthor("joao-tordo", "pt-PT")!;
    expect(pt.bio).not.toBe(en.bio);
    const enFirst = en.lifeEvents?.[0];
    const ptFirst = pt.lifeEvents?.find((e) => e.id === enFirst?.id);
    expect(ptFirst?.title).not.toBe(enFirst?.title);
  });
});
