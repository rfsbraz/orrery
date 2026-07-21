"use client";

import Link from "next/link";
import { useProgress } from "@/components/progress/provider";
import { useT, useLocale } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n/config";

/** What the server knows about a work, compact enough to ship to the client. */
export interface WorkRef {
  /** Work title (localised where a published edition exists). */
  t: string;
  /** Franchise slug. */
  s: string;
  /** Franchise display name. */
  f: string;
}

/**
 * The "continue reading" card on the mobile home: the books the reader has
 * marked as reading, each linking back into its franchise walk. Renders
 * nothing while progress loads and nothing when there is nothing in
 * progress - an empty home stays a browse, not a nag.
 */
export function ContinueReading({ works }: { works: Record<string, WorkRef> }) {
  const progress = useProgress();
  const t = useT();
  const locale = useLocale();
  if (!progress || !progress.ready) return null;
  const current = progress.reading
    .map((id) => ({ id, ref: works[id] }))
    .filter((x): x is { id: string; ref: WorkRef } => Boolean(x.ref))
    .slice(0, 3);
  if (current.length === 0) return null;

  return (
    <section className="mb-10 lg:hidden">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
        {t("home.continueReading")}
      </h2>
      <div className="flex flex-col gap-2.5">
        {current.map(({ id, ref }) => (
          <Link
            key={id}
            href={localePath(locale, `/f/${ref.s}`)}
            className="group flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4"
          >
            <span
              aria-hidden
              className="h-10 w-1 shrink-0 rounded-full bg-gradient-to-b from-neutral-400 to-transparent"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-medium text-neutral-100">
                {ref.t}
              </span>
              <span className="mt-0.5 block text-xs text-neutral-500">{ref.f}</span>
            </span>
            <span aria-hidden className="text-neutral-600 transition-transform group-active:translate-x-0.5">
              ›
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
