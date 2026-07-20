"use client";

import { useT } from "@/components/i18n/provider";

import { useProgress } from "./provider";
import type { ReadStatus } from "@/lib/progress/types";

// Mobile gets a real touch target (44px is the accessibility floor); the
// md: values restore the original desktop sizing exactly.
const chip =
  "rounded border font-medium transition-colors min-h-[44px] px-4 text-sm " +
  "md:min-h-0 md:px-2 md:py-0.5 md:text-[11px]";

/** Per-work Reading / Read toggles. Signed-out readers track locally (guest mode). */
export function ProgressControl({ workId }: { workId: string }) {
  const t = useT();
  const ctx = useProgress();
  if (!ctx || !ctx.ready) return null;
  const status = ctx.get(workId);

  const toggle = (target: ReadStatus) =>
    ctx.set(workId, status === target ? "unread" : target);

  const on = (s: ReadStatus) =>
    status === s
      ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--ink)]"
      : "border-[var(--ink)]/20 text-[var(--ink)]/50 hover:text-[var(--ink)]/80";

  return (
    <div className="mt-2.5 flex gap-1.5">
      <button className={`${chip} ${on("reading")}`} onClick={() => toggle("reading")}>
        {t("progress.reading")}
      </button>
      <button className={`${chip} ${on("read")}`} onClick={() => toggle("read")}>
        {status === "read" ? t("progress.readDone") : t("progress.read")}
      </button>
    </div>
  );
}
