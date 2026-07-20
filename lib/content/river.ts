import type { AuraEvent, Era, FranchiseBundle, Work } from "./types";
import { eventYear } from "./index";

// The River (CONCEPT §5): the aura/context browse - the soul of the product.
// This module shapes a franchise bundle into the River's render model: era
// sections, each carrying its years of works and events, with high-impact
// events promoted to full-width anchors. Pure and unit-testable; the visual
// treatment lives in components/river.tsx.

export interface RiverItem {
  kind: "work" | "event" | "anchor"; // anchor = high-impact event, full-width
  year: number;
  work?: Work;
  event?: AuraEvent;
}

export interface RiverSection {
  era: Era | null; // null = items outside any declared era
  startYear: number;
  items: RiverItem[];
}

/** Parse an era's period ("1974-1979", "1980s", "1974") into a year span. */
export function eraSpan(era: Era): [number, number] {
  const years = String(era.period ?? "").match(/\d{4}/g);
  if (!years || years.length === 0) return [0, 0];
  const start = Number(years[0]);
  if (years.length > 1) return [start, Number(years[years.length - 1])];
  if (/\d{4}s/.test(era.period)) return [start, start + 9];
  return [start, start];
}

function toItem(kind: "work", year: number, work: Work): RiverItem;
function toItem(kind: "event" | "anchor", year: number, event: AuraEvent): RiverItem;
function toItem(kind: RiverItem["kind"], year: number, payload: Work | AuraEvent): RiverItem {
  return kind === "work"
    ? { kind, year, work: payload as Work }
    : { kind, year, event: payload as AuraEvent };
}

/**
 * Build the River: items in chronological flow, sectioned by era. Events land
 * in the era their year falls into; works the same. Items before the first or
 * after the last era attach to the nearest one, so the walk has no orphans
 * (unless the franchise declares no eras at all, which yields one section).
 */
export function buildRiver(b: FranchiseBundle): RiverSection[] {
  const items: RiverItem[] = [
    ...b.works.map((w) => toItem("work", w.published, w)),
    ...b.timeline.map((e) =>
      toItem(e.impact === "high" ? "anchor" : "event", eventYear(e), e)
    ),
  ].sort(
    (a, b) => a.year - b.year || rank(a) - rank(b)
  );

  const eras = [...b.eras].sort((a, z) => eraSpan(a)[0] - eraSpan(z)[0]);
  if (eras.length === 0) {
    return [{ era: null, startYear: items[0]?.year ?? 0, items }];
  }

  const sections: RiverSection[] = eras.map((era) => ({
    era,
    startYear: eraSpan(era)[0],
    items: [],
  }));

  for (const item of items) {
    sections[sectionIndexFor(item.year, eras)].items.push(item);
  }
  return sections.filter((s) => s.items.length > 0);
}

/** Events read before the works of the same year: context first, then the book. */
function rank(i: RiverItem): number {
  return i.kind === "work" ? 1 : 0;
}

function sectionIndexFor(year: number, eras: Era[]): number {
  for (let i = 0; i < eras.length; i++) {
    const [start, end] = eraSpan(eras[i]);
    if (year >= start && year <= end) return i;
  }
  // Outside all spans: attach to the nearest era by start/end distance.
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < eras.length; i++) {
    const [start, end] = eraSpan(eras[i]);
    const dist = year < start ? start - year : year > end ? year - end : 0;
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}
