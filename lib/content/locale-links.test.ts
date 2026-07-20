import { describe, expect, it } from "vitest";
import { hrefFor, parseRefs } from "./refs";

// Inline references appear in every synopsis, bio and event description. An
// unprefixed href sent a Portuguese reader out of their own language on almost
// any click, and the proxy only redirected them back if they carried the locale
// cookie - so a reader arriving from a shared /pt link was bounced to English.
describe("inline reference links are locale aware", () => {
  it("prefixes work, author and franchise links for a non-default locale", () => {
    expect(hrefFor("work", "stephen-king/the-stand", "pt-PT")).toBe("/pt/f/stephen-king#w-the-stand");
    expect(hrefFor("author", "joao-tordo", "pt-PT")).toBe("/pt/author/joao-tordo");
    expect(hrefFor("franchise", "discworld", "pt-PT")).toBe("/pt/f/discworld");
  });

  it("leaves the default locale unprefixed", () => {
    expect(hrefFor("work", "stephen-king/the-stand", "en")).toBe("/f/stephen-king#w-the-stand");
    expect(hrefFor("franchise", "discworld")).toBe("/f/discworld");
  });

  it("keeps the anchor outside the locale prefix", () => {
    // The fragment must survive: it is what scrolls the reader to the work.
    const href = hrefFor("work", "cosmere/mistborn", "pt-PT");
    expect(href.startsWith("/pt/")).toBe(true);
    expect(href.endsWith("#w-mistborn")).toBe(true);
  });

  it("threads the locale through parsed prose", () => {
    const segs = parseRefs("read [[work:discworld/mort|Mort]] next", "pt-PT");
    const link = segs.find((s) => s.kind === "link");
    expect(link && "href" in link ? link.href : "").toBe("/pt/f/discworld#w-mort");
  });
});
