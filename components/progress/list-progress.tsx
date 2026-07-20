"use client";

import { useT } from "@/components/i18n/provider";

import { useProgress } from "./provider";

/**
 * Overall progress over a list of works: "12 of 77 read" with a thin bar.
 * Sticky-friendly; renders for guests (local progress) and signed-in readers
 * alike, and stays silent until progress has loaded (no 0-flash).
 */
export function ListProgress({ workIds }: { workIds: string[] }) {
  const t = useT();
  const ctx = useProgress();
  if (!ctx || !ctx.ready) return null;

  const read = workIds.filter((id) => ctx.get(id) === "read").length;
  const reading = workIds.filter((id) => ctx.get(id) === "reading").length;
  const pct = workIds.length > 0 ? (read / workIds.length) * 100 : 0;

  return (
    <div className="sticky top-0 z-20 -mx-6 border-b border-[var(--ink)]/10 bg-[var(--bg)]/95 px-6 py-2.5 backdrop-blur pr-28 lg:pr-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs text-[var(--ink)]/70">
          <span className="font-mono font-semibold text-[var(--ink)]">{read}</span>
          <span className="text-[var(--muted)]"> {t("progress.ofRead", { total: workIds.length })}</span>
          {reading > 0 && (
            <span className="ml-2 text-[var(--muted)]">· {t("progress.inProgress", { n: reading })}</span>
          )}
        </p>
        <p className="font-mono text-[10px] text-[var(--muted)]">{Math.round(pct)}%</p>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--ink)]/10">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {ctx.guest && (
        <p className="mt-1 text-[10px] text-[var(--muted)]/70">
          {t("progress.guestNote")}
        </p>
      )}
    </div>
  );
}
