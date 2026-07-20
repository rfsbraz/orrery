// Locale configuration. Locales are BCP-47 with region where region matters
// for books (pt-PT and pt-BR are different translations, different titles,
// different ISBNs - see orrery-content docs/SCHEMA.md).
//
// URL shape: the default locale is unprefixed (/f/discworld) so existing links
// and SEO equity survive; other locales are prefixed (/pt/f/discworld). The
// proxy rewrites unprefixed paths onto the default locale internally.

export const LOCALES = ["en", "pt-PT"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** URL segment for a locale; the default locale has none. */
export const LOCALE_SEGMENT: Record<Locale, string> = {
  en: "",
  "pt-PT": "pt",
};

/** Human name, in its own language (for the switcher). */
export const LOCALE_NAME: Record<Locale, string> = {
  en: "English",
  "pt-PT": "Português",
};

/** `hreflang` value for the alternates map. */
export const LOCALE_HREFLANG: Record<Locale, string> = {
  en: "en",
  "pt-PT": "pt-PT",
};

const BY_SEGMENT = new Map<string, Locale>(
  LOCALES.map((l) => [LOCALE_SEGMENT[l] || "_default", l])
);

export function localeFromSegment(segment: string | undefined): Locale {
  return BY_SEGMENT.get(segment ?? "_default") ?? DEFAULT_LOCALE;
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Prefix a path for a locale: ("pt-PT", "/f/x") -> "/pt/f/x". */
export function localePath(locale: Locale, path: string): string {
  const seg = LOCALE_SEGMENT[locale];
  if (!seg) return path;
  return `/${seg}${path === "/" ? "" : path}`;
}

/**
 * The languages a reader accepts, best first, from an Accept-Language header.
 * Used only to *suggest* a locale, never to force one (a reader who chose a
 * locale by URL keeps it).
 */
export function preferredLocale(acceptLanguage: string | null): Locale | null {
  if (!acceptLanguage) return null;
  const tags = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of tags) {
    // exact region match first (pt-pt), then the bare language (pt -> pt-PT)
    const exact = LOCALES.find((l) => l.toLowerCase() === tag);
    if (exact) return exact;
    const base = tag.split("-")[0];
    const byBase = LOCALES.find((l) => l.toLowerCase().split("-")[0] === base);
    if (byBase) return byBase;
  }
  return null;
}
