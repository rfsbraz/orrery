import { Prose } from "./prose";
import { impactStyles } from "@/lib/theme";
import type { AuraEvent, Work } from "@/lib/content/types";

function yearOf(e: AuraEvent): number {
  const m = String(e.date ?? e.dateRange ?? "").match(/\d{4}/);
  return m ? Number(m[0]) : 0;
}

type Item =
  | { kind: "work"; year: number; work: Work }
  | { kind: "event"; year: number; event: AuraEvent };

/** The aura: works and the events around them, interwoven in chronological order. */
export function Timeline({ works, events }: { works: Work[]; events: AuraEvent[] }) {
  const items: Item[] = [
    ...works.map((w) => ({ kind: "work" as const, year: w.published, work: w })),
    ...events.map((e) => ({ kind: "event" as const, year: yearOf(e), event: e })),
  ].sort((a, b) => a.year - b.year || (a.kind === "event" ? -1 : 1));

  return (
    <ol className="relative space-y-6 border-l border-[var(--ink)]/15 pl-6">
      {items.map((item, i) =>
        item.kind === "work" ? (
          <li key={`w-${item.work.id}`} id={`w-${item.work.id.split("/").pop()}`}>
            <div className="absolute -ml-[1.72rem] mt-1.5 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
            <div className="rounded-lg border border-[var(--ink)]/10 bg-[var(--surface)] p-4">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="font-mono text-xs text-[var(--ink)]/50">{item.year}</span>
                <h3 className="text-base font-semibold text-[var(--ink)]">{item.work.title}</h3>
                {item.work.subseries && (
                  <span className="rounded bg-[var(--accent)]/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[var(--ink)]/70">
                    {item.work.subseries}
                  </span>
                )}
                {item.work.publishedAs && (
                  <span className="text-[11px] italic text-[var(--ink)]/50">
                    as {item.work.publishedAs}
                  </span>
                )}
                {item.work.canonTier !== "core" && (
                  <span className="text-[10px] uppercase tracking-wide text-[var(--ink)]/40">
                    {item.work.canonTier}
                  </span>
                )}
              </div>
              {item.work.synopsis && (
                <Prose
                  text={item.work.synopsis}
                  className="mt-1.5 block text-sm text-[var(--ink)]/70"
                />
              )}
            </div>
          </li>
        ) : (
          <li key={`e-${item.event.id}-${i}`} className="pl-1">
            <div
              className={`absolute -ml-[1.63rem] mt-2 h-1.5 w-1.5 rounded-full ${
                item.event.impact === "high" ? "bg-[var(--accent)]" : "bg-[var(--ink)]/30"
              }`}
            />
            <div className={`border-l-2 pl-3 ${impactStyles[item.event.impact] ?? ""}`}>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[11px] text-[var(--ink)]/40">{item.year}</span>
                <span className="text-sm font-medium text-[var(--ink)]/90">
                  {item.event.title}
                </span>
                {item.event.scope && item.event.scope !== "author-life" && (
                  <span className="text-[10px] uppercase tracking-wide text-[var(--ink)]/40">
                    {item.event.scope}
                  </span>
                )}
              </div>
              {item.event.description && (
                <Prose
                  text={item.event.description}
                  className="mt-0.5 block text-xs text-[var(--ink)]/55"
                />
              )}
            </div>
          </li>
        )
      )}
    </ol>
  );
}
