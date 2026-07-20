import type { AuraEvent, FranchiseBundle, Work } from "../content/types";
import { eventYear } from "../content";
import { stripRefs } from "../content/refs";
import { eraSpan } from "../content/river";

// Reading companion mode (CONCEPT §5 retention loop): when a book is being
// read, its card becomes a companion - the spoiler-safe slice of the aura
// around it, the era it belongs to, where it sits in the walk, and what
// connects here. Pure selectors; the client panel decides when to show.

export interface CompanionEvent {
  id: string;
  year: number;
  title: string;
  description?: string;
  impact: AuraEvent["impact"];
  spoilerAfter: string | null;
}

export interface CompanionData {
  workId: string;
  eraTitle?: string;
  eraPeriod?: string;
  /** Aura events within the window around publication, anchors first. */
  events: CompanionEvent[];
  /** 1-based position in the derived publication order. */
  position: { index: number; total: number };
  /** Connected works (both directions), chronological. */
  connections: { id: string; title: string; year: number }[];
}

/** Years around publication considered "the weather this was written in". */
const WINDOW = 2;
/** Cap so the companion stays a glance, not a second museum. */
const MAX_EVENTS = 4;

const IMPACT_RANK = { high: 0, med: 1, low: 2 } as const;

export function companionFor(work: Work, b: FranchiseBundle): CompanionData {
  const year = work.published;

  const events = b.timeline
    .map((e) => ({ e, y: eventYear(e) }))
    .filter(({ y }) => Math.abs(y - year) <= WINDOW)
    .sort(
      (a, z) =>
        IMPACT_RANK[a.e.impact] - IMPACT_RANK[z.e.impact] ||
        Math.abs(a.y - year) - Math.abs(z.y - year)
    )
    .slice(0, MAX_EVENTS)
    .sort((a, z) => a.y - z.y)
    .map(({ e, y }) => ({
      id: e.id,
      year: y,
      title: e.title,
      // Plain text for the client panel; inline refs would render as markup.
      description: stripRefs(e.description),
      impact: e.impact,
      spoilerAfter: e.spoilerAfter ?? null,
    }));

  const era = b.eras.find((er) => {
    const [start, end] = eraSpan(er);
    return year >= start && year <= end;
  });

  const byYear = [...b.works].sort(
    (a, z) => a.published - z.published || a.id.localeCompare(z.id)
  );
  const index = byYear.findIndex((w) => w.id === work.id) + 1;

  const titleById = new Map(b.works.map((w) => [w.id, w]));
  const outbound = (work.connections ?? []).filter((id) => titleById.has(id));
  const inbound = b.works
    .filter((w) => (w.connections ?? []).includes(work.id))
    .map((w) => w.id);
  const connections = [...new Set([...outbound, ...inbound])]
    .map((id) => {
      const w = titleById.get(id)!;
      return { id, title: w.title, year: w.published };
    })
    .sort((a, z) => a.year - z.year);

  return {
    workId: work.id,
    eraTitle: era?.title,
    eraPeriod: era?.period,
    events,
    position: { index, total: byYear.length },
    connections,
  };
}
