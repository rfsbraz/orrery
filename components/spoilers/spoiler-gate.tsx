"use client";

import { useT } from "@/components/i18n/provider";

import { useState } from "react";
import { useProgress } from "@/components/progress/provider";
import { isRevealed } from "@/lib/spoilers";

/**
 * Progressive spoiler disclosure (CONCEPT §9). Content behind a boundary is
 * shown plainly once the reader has read the boundary work; everyone else gets
 * a neutral shielded teaser with a deliberate reveal. Anonymous visitors are
 * always shielded (no progress data), never hard-blocked.
 */
export function SpoilerGate({
  spoilerAfter,
  boundaryTitle,
  children,
}: {
  spoilerAfter: string | null | undefined;
  /** Display title of the boundary work, for honest teaser copy. */
  boundaryTitle?: string;
  children: React.ReactNode;
}) {
  const t = useT();
  const ctx = useProgress();
  const [forced, setForced] = useState(false);

  const readSet = ctx?.ready ? ctx.readSet : null;
  if (!spoilerAfter || forced || isRevealed(spoilerAfter, readSet)) {
    return <>{children}</>;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2 rounded border border-dashed border-[var(--ink)]/25 bg-[var(--surface)] px-2 py-1 align-baseline">
      <span className="text-xs italic text-[var(--muted)]">
        {boundaryTitle
          ? t("spoiler.hiddenUntil", { work: boundaryTitle })
          : t("spoiler.hidden")}
      </span>
      <button
        onClick={() => setForced(true)}
        className="rounded border border-[var(--ink)]/20 font-medium uppercase tracking-wide text-[var(--ink)]/60 transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)] min-h-[40px] px-3 text-xs lg:min-h-0 lg:px-1.5 lg:py-0.5 lg:text-[10px]"
      >
        {t("spoiler.reveal")}
      </button>
    </span>
  );
}
