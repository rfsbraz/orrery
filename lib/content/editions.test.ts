import { describe, expect, it } from "vitest";
import { coverFor, isbn13to10, pickEdition } from "./editions";
import type { Edition, Work } from "./types";

const ed = (id: string, workId: string, extra: Partial<Edition> = {}): Edition => ({
  id,
  workId,
  ...extra,
});

describe("pickEdition", () => {
  const editions = [
    ed("f/w/pt", "f/w", { language: "pt", year: 2010, isbn13: "9780000000002" }),
    ed("f/w/en-old", "f/w", { language: "en", year: 2000, isbn13: "9780000000019" }),
    ed("f/w/en-new", "f/w", { language: "en", year: 2020, isbn13: "9780000000026" }),
    ed("f/other/x", "f/other", { language: "en" }),
  ];

  it("prefers the country's language, then recency", () => {
    expect(pickEdition("f/w", editions, "PT")?.id).toBe("f/w/pt");
    expect(pickEdition("f/w", editions, "US")?.id).toBe("f/w/en-new");
    expect(pickEdition("f/w", editions)?.id).toBe("f/w/en-new");
  });

  it("returns null when the work has no editions", () => {
    expect(pickEdition("f/none", editions)).toBeNull();
  });
});

describe("coverFor", () => {
  const work = (olid?: string): Work => ({
    id: "f/w",
    title: "W",
    authorIds: ["a"],
    published: 2000,
    canonTier: "core",
    externalIds: olid ? { openLibrary: olid } : undefined,
  });

  it("curated cover beats ISBN beats work OLID beats null", () => {
    expect(coverFor(work("OL1W"), ed("e", "f/w", { coverUrl: "https://x/c.jpg" }))).toBe(
      "https://x/c.jpg"
    );
    expect(coverFor(work("OL1W"), ed("e", "f/w", { isbn13: "9780307743664" }))).toBe(
      "https://covers.openlibrary.org/b/isbn/9780307743664-M.jpg"
    );
    expect(coverFor(work("OL1W"), null)).toBe("https://covers.openlibrary.org/b/olid/OL1W-M.jpg");
    expect(coverFor(work(), null)).toBeNull();
  });
});

describe("isbn13to10", () => {
  it("converts 978 ISBNs with correct check digits", () => {
    // Weighted sum of core 030774365 is 178; 178 mod 11 = 2 -> check digit 9.
    expect(isbn13to10("9780307743657")).toBe("0307743659");
    // Core 000000006 sums to 12; 12 mod 11 = 1 -> check digit 10 -> "X".
    expect(isbn13to10("9780000000064")).toBe("000000006X");
  });

  it("rejects non-978 and malformed input", () => {
    expect(isbn13to10("9790000000000")).toBeNull();
    expect(isbn13to10("12345")).toBeNull();
  });
});
