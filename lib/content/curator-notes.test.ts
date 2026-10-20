import { describe, it, expect } from "vitest";
import { getFranchise, getAuthor, listFranchiseSlugs, withoutNote } from "./index";

// orrery#106: curator notes name the spoilers a synopsis withholds. They must
// not leave the content layer, because whatever a page hands to a client
// component ships in its HTML and RSC payload. scripts/spoiler-check.mjs
// checks the built page itself; this pins the loader that feeds it.
describe("curator notes stay in the content layer", () => {
  it("withoutNote drops only the note", () => {
    const work = { id: "made-up/book", title: "Made Up", note: "the twin did it" };
    expect(withoutNote(work)).toEqual({ id: "made-up/book", title: "Made Up" });
    expect(work.note).toBe("the twin did it");
  });

  for (const locale of ["en", "pt"]) {
    it(`no wing hands out a note on works, eras, events or editions (${locale})`, () => {
      const leaks: string[] = [];
      for (const slug of listFranchiseSlugs()) {
        const b = getFranchise(slug, locale)!;
        for (const [kind, list] of Object.entries({
          work: b.works,
          era: b.eras,
          event: b.timeline,
          edition: b.editions,
        })) {
          for (const item of list as { id?: string }[]) {
            if ("note" in item) leaks.push(`${slug} ${kind} ${item.id}`);
          }
        }
        for (const a of b.authors) {
          for (const e of getAuthor(a.id, locale)?.lifeEvents ?? []) {
            if ("note" in e) leaks.push(`${a.id} life event ${e.id}`);
          }
        }
      }
      expect(leaks).toEqual([]);
    });
  }

  it("keeps the notes readers are meant to see", () => {
    const pseudonymNotes = listFranchiseSlugs()
      .flatMap((slug) => getFranchise(slug)!.authors)
      .flatMap((a) => a.pseudonyms ?? [])
      .filter((p) => p.note);
    expect(pseudonymNotes.length).toBeGreaterThan(0);
  });
});
