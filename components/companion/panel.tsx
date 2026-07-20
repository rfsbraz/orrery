"use client";

import { useT } from "@/components/i18n/provider";

import { useProgress } from "@/components/progress/provider";
import { SpoilerGate } from "@/components/spoilers/spoiler-gate";
import type { CompanionData } from "@/lib/progress/companion";

/**
 * The reading companion (CONCEPT §5): appears on a work's card only while the
 * reader has it marked "Reading". A glance, not a second museum - the aura
 * around the book, its era, its place in the walk, and what connects here.
 * Signed-out readers never see it (no progress, no companion).
 */
export function CompanionPanel({
  data,
  workTitles,
}: {
  data: CompanionData;
  workTitles: Record<string, string>;
}) {
  const t = useT();
  const ctx = useProgress();
  if (!ctx || !ctx.ready || !ctx.authed) return null;
  if (ctx.get(data.workId) !== "reading") return null;

  return (
    <aside
      aria-label="Reading companion"
      className="mt-3 rounded-md border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-3.5"
    >
      <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--accent)]">
        {t("companion.whileYouRead")}
      </p>

      <p className="mt-1.5 text-xs text-[var(--ink)]/70">
        {t("companion.position", { n: data.position.index, total: data.position.total })}
        {data.eraTitle && (
          <>
            {" "}
            · the <span className="font-medium text-[var(--ink)]/85">{data.eraTitle}</span>{" "}
            {data.eraPeriod && (
              <span className="font-mono text-[10px] text-[var(--muted)]">
                ({data.eraPeriod})
              </span>
            )}
          </>
        )}
      </p>

      {data.events.length > 0 && (
        <ul className="mt-2.5 space-y-1.5">
          {data.events.map((e) => (
            <li key={e.id} className="text-xs leading-relaxed text-[var(--ink)]/70">
              <SpoilerGate spoilerAfter={e.spoilerAfter} boundaryTitle={workTitles[e.spoilerAfter ?? ""]}>
                <span className="font-mono text-[10px] text-[var(--muted)]">{e.year}</span>{" "}
                <span
                  className={
                    e.impact === "high"
                      ? "font-medium text-[var(--ink)]/90"
                      : "text-[var(--ink)]/80"
                  }
                >
                  {e.title}.
                </span>{" "}
                {e.description && <span>{e.description}</span>}
              </SpoilerGate>
            </li>
          ))}
        </ul>
      )}

      {data.connections.length > 0 && (
        <p className="mt-2.5 text-xs text-[var(--ink)]/60">
          {t("companion.connectsTo")}{" "}
          {data.connections.map((c, i) => (
            <span key={c.id}>
              {i > 0 && ", "}
              <a
                href={`#w-${c.id.split("/").pop()}`}
                className="underline decoration-[var(--accent)]/40 underline-offset-2 hover:decoration-[var(--accent)]"
              >
                {c.title}
              </a>{" "}
              <span className="font-mono text-[10px] text-[var(--muted)]">({c.year})</span>
            </span>
          ))}
          .
        </p>
      )}
    </aside>
  );
}
