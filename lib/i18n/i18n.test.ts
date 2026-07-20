import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  LOCALES,
  localeFromSegment,
  localePath,
  preferredLocale,
} from "./config";
import { messages, translate } from "./messages";

describe("locale routing", () => {
  it("the default locale is unprefixed; others are prefixed", () => {
    expect(localePath("en", "/f/discworld")).toBe("/f/discworld");
    expect(localePath("pt-PT", "/f/discworld")).toBe("/pt/f/discworld");
    expect(localePath("pt-PT", "/")).toBe("/pt");
  });

  it("maps URL segments back to locales, defaulting safely", () => {
    expect(localeFromSegment("pt")).toBe("pt-PT");
    expect(localeFromSegment(undefined)).toBe(DEFAULT_LOCALE);
    expect(localeFromSegment("klingon")).toBe(DEFAULT_LOCALE);
  });
});

describe("Accept-Language negotiation", () => {
  it("prefers an exact region match, then the bare language", () => {
    expect(preferredLocale("pt-PT,pt;q=0.9,en;q=0.8")).toBe("pt-PT");
    expect(preferredLocale("pt,en;q=0.5")).toBe("pt-PT");
    expect(preferredLocale("en-GB,en;q=0.9")).toBe("en");
  });

  it("returns null when nothing matches, so we never guess", () => {
    expect(preferredLocale("ja,ko;q=0.9")).toBeNull();
    expect(preferredLocale(null)).toBeNull();
  });

  it("a Brazilian reader resolves to Portuguese rather than English", () => {
    // pt-BR is not a supported locale, but the bare language still matches;
    // editions stay region-strict (a pt-BR book is never shown as pt-PT).
    expect(preferredLocale("pt-BR,pt;q=0.9")).toBe("pt-PT");
  });
});

describe("messages", () => {
  it("every locale defines every key the default locale defines", () => {
    const base = Object.keys(messages[DEFAULT_LOCALE]).sort();
    for (const locale of LOCALES) {
      const keys = Object.keys(messages[locale]).sort();
      expect({ locale, keys }).toEqual({ locale, keys: base });
    }
  });

  it("interpolates placeholders", () => {
    expect(translate("en", "progress.ofRead", { total: 48 })).toBe("of 48 read");
    expect(translate("pt-PT", "progress.ofRead", { total: 48 })).toBe("de 48 lidos");
  });

  it("falls back per key rather than breaking the page", () => {
    // A key missing from a locale resolves through the default locale.
    const partial = "does.not.exist" as never;
    expect(translate("pt-PT", partial)).toBe("does.not.exist");
  });

  it("no Portuguese string was left as its English source", () => {
    // Catches a catalog entry that was copied but never translated.
    const en = messages.en as Record<string, string>;
    const pt = messages["pt-PT"] as Record<string, string>;
    // Legitimately identical in both languages (a brand, a loanword, a letter).
    const SAME_BY_DESIGN = ["nav.back", "compare.orderA", "compare.orderB", "auth.email"];
    const untranslated = Object.keys(en).filter(
      (k) => en[k] === pt[k] && !SAME_BY_DESIGN.includes(k)
    );
    expect(untranslated).toEqual([]);
  });
});
