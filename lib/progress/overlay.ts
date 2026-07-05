import type { Work } from "../content/types";
import type { ProgressEntry } from "./types";

// The personal timeline overlay (CONCEPT §5, the signature feature): overlay
// *when you read* each book against *when it was written*, and the gap between.
// "You read IT in 2019 - 33 years after it published."

export interface OverlayItem {
  work: Work;
  publishedYear: number;
  readYear: number | null;
  gapYears: number | null; // readYear - publishedYear
}

export interface PersonalOverlay {
  items: OverlayItem[]; // read works, oldest publication first
  readCount: number;
  datedCount: number;
  avgGapYears: number | null;
  earliestRead: OverlayItem | null; // read closest to (or before) publication
  latestGap: OverlayItem | null; // the longest wait
}

const yearOf = (v?: string | number) => {
  const m = String(v ?? "").match(/\d{4}/);
  return m ? Number(m[0]) : null;
};

export function buildPersonalOverlay(
  works: Work[],
  progress: ProgressEntry[]
): PersonalOverlay {
  const workById = new Map(works.map((w) => [w.id, w]));
  const reads = progress.filter((p) => p.status === "read" && workById.has(p.workId));

  const items: OverlayItem[] = reads
    .map((p) => {
      const work = workById.get(p.workId)!;
      const publishedYear = yearOf(work.published) ?? 0;
      const readYear = yearOf(p.dateRead);
      return {
        work,
        publishedYear,
        readYear,
        gapYears: readYear === null ? null : readYear - publishedYear,
      };
    })
    .sort((a, b) => a.publishedYear - b.publishedYear);

  const dated = items.filter((i) => i.gapYears !== null);
  const avgGapYears = dated.length
    ? Math.round(dated.reduce((s, i) => s + (i.gapYears ?? 0), 0) / dated.length)
    : null;

  const earliestRead = dated.length
    ? dated.reduce((min, i) => ((i.gapYears ?? 0) < (min.gapYears ?? 0) ? i : min))
    : null;
  const latestGap = dated.length
    ? dated.reduce((max, i) => ((i.gapYears ?? 0) > (max.gapYears ?? 0) ? i : max))
    : null;

  return {
    items,
    readCount: items.length,
    datedCount: dated.length,
    avgGapYears,
    earliestRead,
    latestGap,
  };
}

/** A human line for an overlay item, e.g. "read in 2019, 33 years after it published." */
export function overlayCaption(item: OverlayItem): string {
  if (item.readYear === null) return "read (date unknown)";
  const g = item.gapYears ?? 0;
  if (g <= 0) return `read in ${item.readYear}, the year it published`;
  if (g === 1) return `read in ${item.readYear}, a year after it published`;
  return `read in ${item.readYear}, ${g} years after it published`;
}
