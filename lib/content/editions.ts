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
 * The edition to buy in a given country: language match first, then the most
 * recent (most likely in print). Null when the work has no editions on file.
 */
export function pickEdition(
  workId: string,
  editions: Edition[],
  country?: string
): Edition | null {
  const candidates = editions.filter((e) => e.workId === workId);
  if (candidates.length === 0) return null;
  const lang = COUNTRY_LANGUAGE[(country ?? "").toUpperCase()] ?? "en";
  const score = (e: Edition) =>
    (e.language === lang ? 2 : e.language === "en" ? 1 : 0) * 10_000 + (e.year ?? 0);
  return [...candidates].sort((a, b) => score(b) - score(a))[0];
}

/**
 * Cover URL for a work: curated edition cover first, then the edition ISBN via
 * OpenLibrary's covers API, then the work-level OpenLibrary ID. Null when
 * nothing resolves - the museum renders text-first, never a broken image.
 */
export function coverFor(work: Work, edition?: Edition | null): string | null {
  if (edition?.coverUrl) return edition.coverUrl;
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
