import type { FranchiseBundle, Work } from "../content/types";
import type { ProgressEntry } from "./types";
import { eraSpan } from "../content/river";

// The year-in-reading recap: the personal overlay (CONCEPT §5's signature)
// folded into one shareable year. Built entirely from real progress rows -
// nothing padded, nothing invented; a quiet year yields a quiet recap.

export interface RecapBook {
  work: Work;
  franchiseName: string;
  readYear: number;
  gapYears: number | null; // readYear - published
}

export interface YearRecap {
  year: number;
  books: RecapBook[]; // read that year, by publication year
  franchisesTouched: { name: string; count: number }[]; // most-read first
  /** Span of publication years covered ("your reading crossed 41 years"). */
  publicationSpan: { from: number; to: number } | null;
  avgGapYears: number | null;
  /** The longest wait: the book read furthest from its publication. */
  longestGap: RecapBook | null;
  /** Read within a year of publication. */
  punctualReads: RecapBook[];
  /** Era titles the year's reading visited, per franchise. */
  erasVisited: { franchiseName: string; eraTitle: string }[];
}

const yearOf = (v?: string | number) => {
  const m = String(v ?? "").match(/\d{4}/);
  return m ? Number(m[0]) : null;
};

export function buildYearRecap(
  year: number,
  bundles: FranchiseBundle[],
  progress: ProgressEntry[]
): YearRecap {
  const workIndex = new Map<string, { work: Work; bundle: FranchiseBundle }>();
  for (const b of bundles) {
    for (const w of b.works) workIndex.set(w.id, { work: w, bundle: b });
  }

  const books: RecapBook[] = progress
    .filter((p) => p.status === "read" && yearOf(p.dateRead) === year)
    .flatMap((p) => {
      const hit = workIndex.get(p.workId);
      if (!hit) return [];
      return [
        {
          work: hit.work,
          franchiseName: hit.bundle.franchise.name,
          readYear: year,
          gapYears: year - hit.work.published,
        },
      ];
    })
    .sort((a, b) => a.work.published - b.work.published);

  const byFranchise = new Map<string, number>();
  for (const b of books) {
    byFranchise.set(b.franchiseName, (byFranchise.get(b.franchiseName) ?? 0) + 1);
  }
  const franchisesTouched = [...byFranchise.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const pubs = books.map((b) => b.work.published);
  const publicationSpan =
    pubs.length > 0 ? { from: Math.min(...pubs), to: Math.max(...pubs) } : null;

  const gaps = books.filter((b) => b.gapYears !== null) as (RecapBook & {
    gapYears: number;
  })[];
  const avgGapYears = gaps.length
    ? Math.round(gaps.reduce((s, b) => s + b.gapYears, 0) / gaps.length)
    : null;
  const longestGap = gaps.length
    ? gaps.reduce((max, b) => (b.gapYears > max.gapYears ? b : max))
    : null;
  const punctualReads = gaps.filter((b) => b.gapYears <= 1 && b.gapYears >= 0);

  const erasVisited: YearRecap["erasVisited"] = [];
  for (const b of bundles) {
    const readPubYears = books
      .filter((bk) => bk.franchiseName === b.franchise.name)
      .map((bk) => bk.work.published);
    if (readPubYears.length === 0) continue;
    for (const era of b.eras) {
      const [start, end] = eraSpan(era);
      if (readPubYears.some((y) => y >= start && y <= end)) {
        erasVisited.push({ franchiseName: b.franchise.name, eraTitle: era.title });
      }
    }
  }

  return {
    year,
    books,
    franchisesTouched,
    publicationSpan,
    avgGapYears,
    longestGap,
    punctualReads,
    erasVisited,
  };
}

/** The one-line headline for the card. Honest at any volume. */
export function recapHeadline(r: YearRecap): string {
  if (r.books.length === 0) return `No finished books logged for ${r.year}.`;
  const span =
    r.publicationSpan && r.publicationSpan.to > r.publicationSpan.from
      ? `, spanning ${r.publicationSpan.to - r.publicationSpan.from + 1} years of writing`
      : "";
  const n = r.books.length;
  return `${n} ${n === 1 ? "book" : "books"} in ${r.year}${span}.`;
}
