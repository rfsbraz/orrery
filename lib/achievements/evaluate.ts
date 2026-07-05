import type { Achievement, Criteria } from "./types";
import type { ProgressEntry } from "../progress/types";
import type { Era, FranchiseBundle, Work } from "../content/types";

export interface AchievementContext {
  readWorkIds: Set<string>;
  workById: Map<string, Work>;
  worksByFranchise: Map<string, Work[]>;
  orderById: Map<string, { orderedWorkIds: string[] }>;
  erasByFranchise: Map<string, Era[]>;
  progressByWork: Map<string, ProgressEntry>;
}

const franchiseOf = (workId: string) => workId.split("/")[0];
const yearOf = (v?: string | number) => {
  const m = String(v ?? "").match(/\d{4}/);
  return m ? Number(m[0]) : NaN;
};

/** [start, end] years for an era period like "1980-1989" or "2020-present". */
export function eraYears(period: string): [number, number] {
  const [a, b] = period.split("-").map((s) => s.trim());
  const start = yearOf(a);
  const end = /present|now/i.test(b ?? "") ? 9999 : yearOf(b) || start;
  return [start, end];
}

export function buildContext(
  bundles: FranchiseBundle[],
  progress: ProgressEntry[]
): AchievementContext {
  const workById = new Map<string, Work>();
  const worksByFranchise = new Map<string, Work[]>();
  const orderById = new Map<string, { orderedWorkIds: string[] }>();
  const erasByFranchise = new Map<string, Era[]>();

  for (const b of bundles) {
    worksByFranchise.set(b.franchise.id, b.works);
    erasByFranchise.set(b.franchise.id, b.eras);
    for (const w of b.works) workById.set(w.id, w);
    for (const o of b.orders) orderById.set(o.id, { orderedWorkIds: o.orderedWorkIds });
  }

  const progressByWork = new Map(progress.map((p) => [p.workId, p]));
  const readWorkIds = new Set(progress.filter((p) => p.status === "read").map((p) => p.workId));

  return { readWorkIds, workById, worksByFranchise, orderById, erasByFranchise, progressByWork };
}

function meets(c: Criteria, ctx: AchievementContext): boolean {
  switch (c.kind) {
    case "read_count": {
      let read = [...ctx.readWorkIds];
      if (c.franchiseId) read = read.filter((id) => franchiseOf(id) === c.franchiseId);
      return read.length >= c.count;
    }
    case "franchise_complete": {
      const works = ctx.worksByFranchise.get(c.franchiseId) ?? [];
      return works.length > 0 && works.every((w) => ctx.readWorkIds.has(w.id));
    }
    case "order_complete": {
      const order = ctx.orderById.get(c.orderId);
      return !!order && order.orderedWorkIds.length > 0 && order.orderedWorkIds.every((id) => ctx.readWorkIds.has(id));
    }
    case "punctual_read": {
      for (const id of ctx.readWorkIds) {
        const p = ctx.progressByWork.get(id);
        const w = ctx.workById.get(id);
        if (!p?.dateRead || !w) continue;
        const diff = yearOf(p.dateRead) - yearOf(w.published);
        if (Number.isFinite(diff) && diff >= 0 && diff <= c.withinYears) return true;
      }
      return false;
    }
    case "era_reader": {
      const eras = ctx.erasByFranchise.get(c.franchiseId) ?? [];
      const era = eras.find((e) => e.id === c.eraId);
      if (!era?.period) return false;
      const [start, end] = eraYears(era.period);
      const works = ctx.worksByFranchise.get(c.franchiseId) ?? [];
      const inEra = works.filter((w) => {
        const y = yearOf(w.published);
        return y >= start && y <= end && ctx.readWorkIds.has(w.id);
      });
      return inEra.length >= c.count;
    }
  }
}

/** Return the ids of achievements the user has earned. */
export function evaluate(defs: Achievement[], ctx: AchievementContext): string[] {
  return defs.filter((d) => meets(d.criteria, ctx)).map((d) => d.id);
}
