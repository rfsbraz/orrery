import type { Edition, Work } from "./types";

// The editions layer (CONCEPT §4: "Work vs Edition is the gotcha that bites
// if you skip it"). Works power orders; editions power buying and covers.
// Edition data is curated and verified-only (never guessed ISBNs), so this
// layer is built to be sparse: everything falls back gracefully - search
// links and OpenLibrary covers - when a work has no edition on file.

/** Preferred shop language per storefront country (fallback: English). */
const COUNTRY_LANGUAGE: Record<string, string> = {
  PT: "pt",
  BR: "pt",
  ES: "es",
  FR: "fr",
  DE: "de",
  IT: "it",
};

/**
 * The edition to surface for a work: the reader's *locale* wins (it is an
 * explicit choice), then the country's shop language, then English, then the
 * most recent (most likely in print). Null when the work has no editions.
 *
 * Locale matching is region-aware on purpose: pt-PT and pt-BR are different
 * translations with different titles and ISBNs, so an exact match scores
 * highest and a same-language-different-region edition scores below English
 * rather than being treated as equivalent.
 */
export function pickEdition(
  workId: string,
  editions: Edition[],
  country?: string,
  locale?: string
): Edition | null {
  const candidates = editions.filter((e) => e.workId === workId);
  if (candidates.length === 0) return null;
  const shopLang = COUNTRY_LANGUAGE[(country ?? "").toUpperCase()] ?? "en";
  const base = (tag?: string) => (tag ?? "").split("-")[0].toLowerCase();

  const score = (e: Edition) => {
    let rank = 0;
    if (locale && e.language === locale) rank = 4; // exact locale (pt-PT)
    else if (base(e.language) === base(shopLang) && e.language === shopLang) rank = 3;
    else if (e.language === "en" || base(e.language) === "en") rank = 2;
    else if (locale && base(e.language) === base(locale)) rank = 1; // pt-BR for a pt-PT reader
    return rank * 10_000 + (e.year ?? 0);
  };
  return [...candidates].sort((a, b) => score(b) - score(a))[0];
}

/**
 * Cover URL for a work, most-verified first: a cover curated for this exact
 * edition, then the work's curated cover, then guesses derived from the
 * edition ISBN and the work's OpenLibrary id. Null when nothing resolves - the
 * museum renders text-first, never a broken image.
 *
 * The curated work cover outranks the ISBN guess deliberately. `work.images`
 * is written by the visual-metadata pass, where a curator fetched the URL and
 * looked at the image; `/b/isbn/<isbn>` is a URL nobody has ever loaded, and
 * OpenLibrary holds no cover for most non-anglophone ISBNs. Preferring the
 * guess meant a Portuguese reader got a dead image where a verified cover was
 * sitting unused in the content - and it stayed dead, because the fallback
 * tile is wired to the img's onError, which never fires for an image that
 * already failed before hydration on a statically rendered page.
 */
export function coverFor(work: Work, edition?: Edition | null): string | null {
  if (edition?.coverUrl) return edition.coverUrl;
  if (work.images?.cover) return work.images.cover;
  if (edition?.isbn13) return `https://covers.openlibrary.org/b/isbn/${edition.isbn13}-M.jpg`;
  const olid = work.externalIds?.openLibrary;
  if (olid) return `https://covers.openlibrary.org/b/olid/${olid}-M.jpg`;
  return null;
}

/** ISBN-13 (978-prefixed) to ISBN-10, for retailers that key on ISBN-10. */
export function isbn13to10(isbn13: string): string | null {
  const digits = isbn13.replace(/[^0-9]/g, "");
  if (digits.length !== 13 || !digits.startsWith("978")) return null;
  const core = digits.slice(3, 12);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += (10 - i) * Number(core[i]);
  const check = (11 - (sum % 11)) % 11;
  return core + (check === 10 ? "X" : String(check));
}
