import type { AuraEvent, Era, Work } from "@/lib/content/types";
import { eventYear } from "@/lib/content";
import { eraSpan } from "@/lib/content/river";

// Shared shaping for the river lab concepts: the same data, three renderings.
// Each concept file owns its visual language; this module only prepares
// year-grouped material so the concepts stay purely presentational.

export interface LabProps {
  works: Work[];
  events: AuraEvent[];
  eras: Era[];
  covers: Record<string, string>;
  workTitles: Record<string, string>;
}

export interface YearGroup {
  year: number;
  works: Work[];
  /** low/med events - texture. */
  texture: AuraEvent[];
  /** high-impact events - anchors. */
  anchors: AuraEvent[];
  era: Era | null;
  /** True on the first group of a new era (render the era introduction). */
  eraStart: boolean;
  /** True on the first group of a new decade. */
  decadeStart: boolean;
}

export function groupByYear(props: LabProps): YearGroup[] {
  const years = new Map<number, YearGroup>();
  const get = (year: number): YearGroup => {
    let g = years.get(year);
    if (!g) {
      g = { year, works: [], texture: [], anchors: [], era: null, eraStart: false, decadeStart: false };
      years.set(year, g);
    }
    return g;
  };

  for (const w of props.works) get(w.published).works.push(w);
  for (const e of props.events) {
    const g = get(eventYear(e));
    (e.impact === "high" ? g.anchors : g.texture).push(e);
  }

  const sorted = [...years.values()]
    .filter((g) => g.year > 0)
    .sort((a, b) => a.year - b.year);

  const eras = [...props.eras].sort((a, b) => eraSpan(a)[0] - eraSpan(b)[0]);
  let prevEra: string | null = null;
  let prevDecade: number | null = null;
  for (const g of sorted) {
    g.era =
      eras.find((er) => {
        const [start, end] = eraSpan(er);
        return g.year >= start && g.year <= end;
      }) ?? null;
    g.eraStart = (g.era?.id ?? null) !== prevEra && g.era !== null;
    prevEra = g.era?.id ?? prevEra;
    const decade = Math.floor(g.year / 10) * 10;
    g.decadeStart = decade !== prevDecade;
    prevDecade = decade;
  }
  return sorted;
}
