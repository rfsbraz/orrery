import { describe, expect, it } from "vitest";
import { mergeHeteronyms, mergePseudonyms } from "./index";
import type { Heteronym, Pseudonym } from "./types";

// mergePseudonyms and mergeHeteronyms fix orrery#170: withAuthorTranslations
// used to run `pseudonyms` and `heteronyms` through the generic `merge()`,
// which only copies scalars and a small allowlist of prose arrays. Neither
// field is scalar and neither was on the allowlist, so a fully-translated
// overlay entry for either one was silently discarded - it validated, it
// counted as covered in i18n_coverage.py, and it never reached a reader.
// No real content translates either field yet (pseudonym notes are
// deliberately left untranslated catalogue-wide as a workaround for this
// exact bug; heteronyms is new and untranslatable until this lands), so
// these are unit tests against constructed fixtures rather than the
// real-content style the rest of this suite uses - see overlay.test.ts's
// own comment for why that style is otherwise preferred here.

describe("mergePseudonyms (orrery#170)", () => {
  const base: Pseudonym[] = [
    { name: "Richard Bachman", note: "Used 1977-1985; retired when identified." },
  ];

  it("translates note, matched by name", () => {
    const merged = mergePseudonyms(base, [
      { name: "Richard Bachman", note: "Usado entre 1977 e 1985." },
    ]);
    expect(merged?.[0].note).toBe("Usado entre 1977 e 1985.");
  });

  it("never lets the overlay change name - it is the join key, not content", () => {
    const merged = mergePseudonyms(base, [
      { name: "A Different Name", note: "Isto nunca deveria aparecer." },
    ]);
    // No entry in the overlay matches "Richard Bachman" by name, so the base
    // pseudonym is untouched - a mismatched name must never rename it.
    expect(merged?.[0].name).toBe("Richard Bachman");
    expect(merged?.[0].note).toBe(base[0].note);
  });

  it("falls back to the base note when untranslated", () => {
    const merged = mergePseudonyms(base, [{ name: "Richard Bachman" }]);
    expect(merged?.[0].note).toBe(base[0].note);
  });

  it("an empty-string note means not-yet-translated, same rule as merge()", () => {
    const merged = mergePseudonyms(base, [{ name: "Richard Bachman", note: "" }]);
    expect(merged?.[0].note).toBe(base[0].note);
  });

  it("passes through unchanged with no overlay", () => {
    expect(mergePseudonyms(base, undefined)).toBe(base);
  });

  it("handles a franchise with multiple pseudonyms independently", () => {
    const multi: Pseudonym[] = [
      { name: "Richard Bachman", note: "EN note one." },
      { name: "The Bill Hodges name", note: "EN note two." },
    ];
    const merged = mergePseudonyms(multi, [
      { name: "The Bill Hodges name", note: "Nota PT dois." },
    ]);
    expect(merged?.[0].note).toBe("EN note one.");
    expect(merged?.[1].note).toBe("Nota PT dois.");
  });
});

describe("mergeHeteronyms (orrery#170)", () => {
  const base: Heteronym[] = [
    {
      id: "alberto-caeiro",
      name: "Alberto Caeiro",
      authored: true,
      born: "1889-04-16",
      bio: "The shepherd poet.",
      lifeEvents: [
        {
          id: "caeiro-death-1915",
          date: "1915",
          title: "Caeiro dies of tuberculosis (an authored death)",
          impact: "high",
          description: "No real person died.",
        },
      ],
    },
    {
      id: "ricardo-reis",
      name: "Ricardo Reis",
      authored: true,
      bio: "The classicist.",
      lifeEvents: [],
    },
  ];

  it("translates a heteronym's bio, matched by id", () => {
    const merged = mergeHeteronyms(base, {
      heteronyms: [{ id: "alberto-caeiro", bio: "O poeta pastor." }],
    });
    expect(merged?.[0].bio).toBe("O poeta pastor.");
    // Untranslated fields fall back to the base, per-field, same as merge().
    expect(merged?.[0].name).toBe("Alberto Caeiro");
    expect(merged?.[0].born).toBe("1889-04-16");
    expect(merged?.[0].authored).toBe(true);
  });

  it("translates a heteronym's own nested lifeEvents, matched by id", () => {
    const merged = mergeHeteronyms(base, {
      heteronyms: [
        {
          id: "alberto-caeiro",
          lifeEvents: [
            {
              id: "caeiro-death-1915",
              title: "Caeiro morre de tuberculose (uma morte autoral)",
              description: "Nenhuma pessoa real morreu.",
            },
          ],
        },
      ],
    });
    const event = merged?.[0].lifeEvents?.[0];
    expect(event?.title).toBe("Caeiro morre de tuberculose (uma morte autoral)");
    expect(event?.description).toBe("Nenhuma pessoa real morreu.");
    // date and impact are structure, not prose - never touched by the overlay.
    expect(event?.date).toBe("1915");
    expect(event?.impact).toBe("high");
  });

  it("leaves a heteronym with no overlay entry untouched", () => {
    const merged = mergeHeteronyms(base, {
      heteronyms: [{ id: "alberto-caeiro", bio: "O poeta pastor." }],
    });
    expect(merged?.[1]).toEqual(base[1]);
  });

  it("leaves an empty lifeEvents list alone when the overlay has none", () => {
    const merged = mergeHeteronyms(base, {
      heteronyms: [{ id: "ricardo-reis", bio: "O classicista." }],
    });
    expect(merged?.[1].lifeEvents).toEqual([]);
  });

  it("passes through unchanged with no heteronyms key in the overlay entry", () => {
    expect(mergeHeteronyms(base, { bio: "irrelevant here" })).toBe(base);
    expect(mergeHeteronyms(base, undefined)).toBe(base);
  });
});
