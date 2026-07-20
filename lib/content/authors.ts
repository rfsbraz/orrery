import type { Author, Franchise } from "./types";
import { getAuthor, listFranchises } from "./index";

// The home page is organised by AUTHOR, not by universe: a reader looks for
// "Terry Pratchett", not "Discworld". A franchise is then the body of work the
// author is being read through, shown as context rather than as the headline.
//
// An author can head more than one franchise (a distinct-brand pen name gets
// its own, per the content schema), so this groups rather than assuming 1:1.

export interface AuthorEntry {
  author: Author;
  /** Franchises this author heads (their own body of work). */
  franchises: Franchise[];
  /** Franchises where they are a co-author rather than the primary. */
  alsoIn: Franchise[];
  /** Where the card links: the author's single franchise, or their page. */
  href: string;
}

/**
 * Every author with a body of work to walk, sorted by surname-ish (last token
 * of the name), which is how a reader scans a shelf.
 */
export function listAuthorEntries(locale?: string): AuthorEntry[] {
  const franchises = listFranchises(locale);
  const primary = new Map<string, Franchise[]>();
  const secondary = new Map<string, Franchise[]>();

  for (const f of franchises) {
    const [head, ...rest] = f.authorIds;
    if (head) {
      primary.set(head, [...(primary.get(head) ?? []), f]);
    }
    for (const id of rest) {
      secondary.set(id, [...(secondary.get(id) ?? []), f]);
    }
  }

  const entries: AuthorEntry[] = [];
  for (const [authorId, own] of primary) {
    const author = getAuthor(authorId, locale);
    if (!author) continue;
    entries.push({
      author,
      franchises: own,
      alsoIn: (secondary.get(authorId) ?? []).filter(
        (f) => !own.some((o) => o.id === f.id)
      ),
      // One franchise (the common case) links straight into the walk; several
      // means the author page is the right landing spot.
      href: own.length === 1 ? `/f/${own[0].id}` : `/author/${author.id}`,
    });
  }

  return entries.sort((a, b) => surname(a.author.name).localeCompare(surname(b.author.name)));
}

function surname(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] ?? name;
}
