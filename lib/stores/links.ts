// Per-country "where to buy/find" links for a work. v1 uses search URLs
// (title + author) plus the exact OpenLibrary work page when we have its OLID.
// Affiliate tags and country-specialty retailers (e.g. Wook/Bertrand for PT)
// slot in later once the referral programs are confirmed - see CONCEPT §12.

export interface StoreLink {
  label: string;
  url: string;
}

export interface StoreLinkInput {
  title: string;
  author?: string;
  openLibraryId?: string;
}

// Supported storefront countries (ISO-3166-1 alpha-2). "" / unknown -> universal.
export type StoreCountry = "PT" | "ES" | "GB" | "US" | "FR" | "DE" | "BR" | "IT";

const AMAZON_TLD: Record<StoreCountry, string> = {
  PT: "es", // no Amazon.pt; Portugal ships from Amazon.es
  ES: "es",
  GB: "co.uk",
  US: "com",
  FR: "fr",
  DE: "de",
  BR: "com.br",
  IT: "it",
};

const q = (i: StoreLinkInput) => encodeURIComponent([i.title, i.author].filter(Boolean).join(" "));

function amazon(country: StoreCountry, query: string): StoreLink {
  return { label: "Amazon", url: `https://www.amazon.${AMAZON_TLD[country]}/s?k=${query}` };
}

// Country-specific retailers beyond Amazon. Kept to search endpoints we're
// confident about; expand per market as affiliate programs are confirmed.
const EXTRA: Partial<Record<StoreCountry, (query: string) => StoreLink[]>> = {
  US: (query) => [{ label: "Bookshop.org", url: `https://bookshop.org/search?keywords=${query}` }],
  GB: (query) => [
    { label: "Bookshop.org", url: `https://uk.bookshop.org/search?keywords=${query}` },
    { label: "Waterstones", url: `https://www.waterstones.com/books/search/term/${query}` },
  ],
};

/**
 * Build the ordered list of store links for a work in a given country.
 * Always ends with universal fallbacks so there's somewhere to go for any book.
 */
export function storeLinks(input: StoreLinkInput, country?: string): StoreLink[] {
  const query = q(input);
  const links: StoreLink[] = [];
  const cc = (country ?? "").toUpperCase() as StoreCountry;

  if (cc in AMAZON_TLD) {
    links.push(amazon(cc, query));
    links.push(...(EXTRA[cc]?.(query) ?? []));
  }

  // Universal: exact catalog page when known, else a catalog search.
  links.push({
    label: "OpenLibrary",
    url: input.openLibraryId
      ? `https://openlibrary.org/works/${input.openLibraryId}`
      : `https://openlibrary.org/search?q=${query}`,
  });
  links.push({ label: "Google Books", url: `https://www.google.com/search?tbm=bks&q=${query}` });

  return links;
}
