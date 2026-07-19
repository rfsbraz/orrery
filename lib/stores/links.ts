// Per-country "where to buy/find" links for a work. With a curated edition
// (verified ISBN) the links go to the exact book; otherwise they fall back to
// search URLs (title + author) plus the OpenLibrary work page when we have
// its OLID. Affiliate tags slot into AFFILIATE_TAGS once the referral
// programs are confirmed - see CONCEPT §10/§12.

import { isbn13to10 } from "../content/editions";

export interface StoreLink {
  label: string;
  url: string;
  /** True when the link targets the exact edition rather than a search. */
  exact?: boolean;
}

export interface StoreLinkInput {
  title: string;
  author?: string;
  openLibraryId?: string;
  /** Verified ISBN-13 of the edition to buy (editions.yaml, never guessed). */
  isbn13?: string;
}

// Per-retailer affiliate tags, filled as programs are approved. Keeping the
// seam explicit means turning monetization on is config, not a refactor.
const AFFILIATE_TAGS: { amazon?: Record<string, string>; bookshopOrg?: string } = {
  // amazon: { es: "tag-es-21", co_uk: "tag-uk-21" },
  // bookshopOrg: "shop-id",
};

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

function amazon(country: StoreCountry, input: StoreLinkInput, query: string): StoreLink {
  const tld = AMAZON_TLD[country];
  const tag = AFFILIATE_TAGS.amazon?.[tld.replace(".", "_")];
  const suffix = tag ? `?tag=${tag}` : "";
  // Amazon keys book pages on ISBN-10; an exact /dp/ link beats any search.
  const isbn10 = input.isbn13 ? isbn13to10(input.isbn13) : null;
  if (isbn10) {
    return { label: "Amazon", url: `https://www.amazon.${tld}/dp/${isbn10}${suffix}`, exact: true };
  }
  return { label: "Amazon", url: `https://www.amazon.${tld}/s?k=${query}${tag ? `&tag=${tag}` : ""}` };
}

// Country-specific retailers beyond Amazon. Search endpoints we're confident
// about; with a verified ISBN the search *is* exact (retailers resolve ISBN
// queries to the product page), marked accordingly.
const EXTRA: Partial<
  Record<StoreCountry, (input: StoreLinkInput, query: string) => StoreLink[]>
> = {
  US: (input, query) => [bookshop("bookshop.org", input, query)],
  GB: (input, query) => [
    bookshop("uk.bookshop.org", input, query),
    {
      label: "Waterstones",
      url: `https://www.waterstones.com/books/search/term/${input.isbn13 ?? query}`,
      exact: Boolean(input.isbn13),
    },
  ],
  PT: (input, query) => [
    {
      label: "Wook",
      url: `https://www.wook.pt/pesquisa?keyword=${input.isbn13 ?? query}`,
      exact: Boolean(input.isbn13),
    },
    {
      label: "Bertrand",
      url: `https://www.bertrand.pt/pesquisa/${input.isbn13 ?? query}`,
      exact: Boolean(input.isbn13),
    },
  ],
  ES: (input, query) => [
    {
      label: "Casa del Libro",
      url: `https://www.casadellibro.com/busqueda-generica?busqueda=${input.isbn13 ?? query}`,
      exact: Boolean(input.isbn13),
    },
  ],
};

function bookshop(host: string, input: StoreLinkInput, query: string): StoreLink {
  const aff = AFFILIATE_TAGS.bookshopOrg;
  if (input.isbn13 && aff) {
    return { label: "Bookshop.org", url: `https://${host}/a/${aff}/${input.isbn13}`, exact: true };
  }
  return {
    label: "Bookshop.org",
    url: `https://${host}/search?keywords=${input.isbn13 ?? query}`,
    exact: Boolean(input.isbn13),
  };
}

/**
 * Build the ordered list of store links for a work in a given country.
 * Exact-edition links when a verified ISBN is on file, searches otherwise;
 * always ends with universal fallbacks so there's somewhere to go for any book.
 */
export function storeLinks(input: StoreLinkInput, country?: string): StoreLink[] {
  const query = q(input);
  const links: StoreLink[] = [];
  const cc = (country ?? "").toUpperCase() as StoreCountry;

  if (cc in AMAZON_TLD) {
    links.push(amazon(cc, input, query));
    links.push(...(EXTRA[cc]?.(input, query) ?? []));
  }

  // Universal: exact catalog page when known, else a catalog search.
  links.push({
    label: "OpenLibrary",
    url: input.openLibraryId
      ? `https://openlibrary.org/works/${input.openLibraryId}`
      : `https://openlibrary.org/search?q=${query}`,
    exact: Boolean(input.openLibraryId),
  });
  links.push({ label: "Google Books", url: `https://www.google.com/search?tbm=bks&q=${query}` });

  return links;
}
