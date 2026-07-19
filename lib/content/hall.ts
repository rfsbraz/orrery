import type { AuraEvent, FranchiseBundle } from "./types";
import { eventYear } from "./index";
import { capabilities } from "./capabilities";

// The cross-franchise hall: one timeline, every wing of the museum. Pick a
// year and see what each franchise's author was writing while the same world
// happened to all of them. Only reach-global events join (author-life noise
// stays in its own wing); franchises can opt out via features.hall.

export interface HallEntry {
  franchiseId: string;
  franchiseName: string;
  works: { id: string; title: string }[];
}

export interface HallYear {
  year: number;
  entries: HallEntry[]; // franchises that published this year
  events: AuraEvent[]; // global events of the year
}

export interface HallDecade {
  label: string; // "1980s"
  anchor: string; // "y1980"
  years: HallYear[];
}

export interface Hall {
  decades: HallDecade[];
  franchiseNames: string[]; // wings represented, alphabetical
}

export function buildHall(bundles: FranchiseBundle[]): Hall {
  const wings = bundles.filter((b) => capabilities(b).hall);

  const byYear = new Map<number, HallYear>();
  const yearOf = (y: number): HallYear => {
    let hy = byYear.get(y);
    if (!hy) {
      hy = { year: y, entries: [], events: [] };
      byYear.set(y, hy);
    }
    return hy;
  };

  for (const b of wings) {
    const perYear = new Map<number, { id: string; title: string }[]>();
    for (const w of b.works) {
      const list = perYear.get(w.published) ?? [];
      list.push({ id: w.id, title: w.title });
      perYear.set(w.published, list);
    }
    for (const [year, works] of perYear) {
      yearOf(year).entries.push({
        franchiseId: b.franchise.id,
        franchiseName: b.franchise.name,
        works,
      });
    }
  }

  // Global events once each (bundles share the same global file; dedup by id).
  const seenEvents = new Set<string>();
  for (const b of wings) {
    for (const e of b.timeline) {
      if (e.reach !== "global" || seenEvents.has(e.id)) continue;
      seenEvents.add(e.id);
      yearOf(eventYear(e)).events.push(e);
    }
  }

  const years = [...byYear.values()]
    .filter((y) => y.year > 0)
    .sort((a, b) => a.year - b.year);
  for (const y of years) {
    y.entries.sort((a, b) => a.franchiseName.localeCompare(b.franchiseName));
  }

  const decades = new Map<number, HallYear[]>();
  for (const y of years) {
    const d = Math.floor(y.year / 10) * 10;
    const list = decades.get(d) ?? [];
    list.push(y);
    decades.set(d, list);
  }

  return {
    decades: [...decades.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([d, ys]) => ({ label: `${d}s`, anchor: `y${d}`, years: ys })),
    franchiseNames: wings.map((b) => b.franchise.name).sort((a, b) => a.localeCompare(b)),
  };
}
