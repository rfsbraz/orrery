import type { AuraEvent, Era, FranchiseBundle, Work } from "./types";
import { eventYear } from "./index";

// The River (CONCEPT §5): the atmospheric context browse - the soul of the
// product. The render model is "strata": time as sediment. Every year is a
// layer you descend through, carrying that year's works and the events around
// them; decades cut heavy rules; high-impact events are ruptures that break
// the stratigraphy the way the event broke the life.
//
// Pure and unit-testable; the visual treatment lives in components/river.tsx.

export interface RiverLayer {
  year: number;
  works: Work[];
  /** low/med events: interbedded texture. */
  texture: AuraEvent[];
  /** high-impact events: ruptures that break the page. */
  ruptures: AuraEvent[];
  era: Era | null;
  /** First layer of a new era - render the era's introduction. */
  eraStart: boolean;
  /** First layer of a new decade - cut the decade rule. */
  decadeStart: boolean;
}

/** Parse an era's period ("1974-1979", "1980s", "2020-present", "1974"). */
export function eraSpan(era: Era): [number, number] {
  const raw = String(era.period ?? "");
  if (/present|now/i.test(raw)) {
    const start = Number(raw.match(/\d{4}/)?.[0] ?? 0);
    return [start, 9999];
  }
  const years = raw.match(/\d{4}/g);
  if (!years || years.length === 0) return [0, 0];
  const start = Number(years[0]);
  if (years.length > 1) return [start, Number(years[years.length - 1])];
  if (/\d{4}s/.test(raw)) return [start, start + 9];
  return [start, start];
}

/**
 * Build the River's layers: one per year that has anything in it, in
 * chronological order, annotated with era and decade boundaries. A franchise
 * with no eras simply never sets eraStart - the walk still works.
 */
export function buildRiver(b: FranchiseBundle): RiverLayer[] {
  const layers = new Map<number, RiverLayer>();
  const layerFor = (year: number): RiverLayer => {
    let l = layers.get(year);
    if (!l) {
      l = {
        year,
        works: [],
        texture: [],
        ruptures: [],
        era: null,
        eraStart: false,
        decadeStart: false,
      };
      layers.set(year, l);
    }
    return l;
  };

  for (const w of b.works) layerFor(w.published).works.push(w);
  for (const e of b.timeline) {
    const l = layerFor(eventYear(e));
    (e.impact === "high" ? l.ruptures : l.texture).push(e);
  }

  const sorted = [...layers.values()]
    .filter((l) => l.year > 0)
    .sort((a, z) => a.year - z.year);

  for (const l of sorted) l.works.sort((a, z) => a.id.localeCompare(z.id));

  const eras = [...b.eras].sort((a, z) => eraSpan(a)[0] - eraSpan(z)[0]);
  let prevEra: string | null = null;
  let prevDecade: number | null = null;
  for (const l of sorted) {
    l.era =
      eras.find((era) => {
        const [start, end] = eraSpan(era);
        return l.year >= start && l.year <= end;
      }) ?? null;
    l.eraStart = l.era !== null && l.era.id !== prevEra;
    if (l.era) prevEra = l.era.id;
    const decade = Math.floor(l.year / 10) * 10;
    l.decadeStart = decade !== prevDecade;
    prevDecade = decade;
  }

  return sorted;
}

export interface SeriesEntry {
  name: string;
  n: number; // 1-based position within the subseries, by publication
  total: number;
}

/**
 * Per-work series membership: "The Dark Tower · #3 of 8". Derived from each
 * work's `subseries` (content), never a lookup table in app code, so it stays
 * correct as a franchise's bibliography grows.
 */
export function subseriesEntries(works: Work[]): Map<string, SeriesEntry> {
  const bySeries = new Map<string, Work[]>();
  for (const w of works) {
    if (!w.subseries) continue;
    const list = bySeries.get(w.subseries) ?? [];
    list.push(w);
    bySeries.set(w.subseries, list);
  }
  const out = new Map<string, SeriesEntry>();
  for (const [name, list] of bySeries) {
    list.sort((a, z) => a.published - z.published || a.id.localeCompare(z.id));
    list.forEach((w, i) => out.set(w.id, { name, n: i + 1, total: list.length }));
  }
  return out;
}
