"use client";

import { useLocale } from "@/components/i18n/provider";
import { localePath } from "@/lib/i18n/config";
import { useT } from "@/components/i18n/provider";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadApprovedOrdersAction, voteAction } from "@/app/actions/orders";
import type { CommunityOrder } from "@/lib/orders/types";

/**
 * Community-submitted orders for a franchise, layered onto the static museum
 * page. Loads approved orders on mount and lets signed-in readers upvote.
 * Work titles come from canon (passed in), so no per-work DB lookup.
 */
export function CommunityOrders({
  franchiseSlug,
  workTitles,
}: {
  franchiseSlug: string;
  workTitles: Record<string, string>;
}) {
  const t = useT();
  const locale = useLocale();
  const [orders, setOrders] = useState<CommunityOrder[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadApprovedOrdersAction(franchiseSlug).then((o) => {
      setOrders(o);
      setReady(true);
    });
  }, [franchiseSlug]);

  async function toggleVote(id: string) {
    const cur = orders.find((o) => o.id === id);
    if (!cur) return;
    const next = !cur.votedByMe;
    setOrders((os) =>
      os.map((o) =>
        o.id === id ? { ...o, votedByMe: next, voteCount: o.voteCount + (next ? 1 : -1) } : o
      )
    );
    const res = await voteAction(id, next, franchiseSlug);
    if (!res.ok) {
      // revert on failure (e.g. not signed in)
      setOrders((os) =>
        os.map((o) =>
          o.id === id ? { ...o, votedByMe: cur.votedByMe, voteCount: cur.voteCount } : o
        )
      );
    }
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="text-xs font-medium uppercase tracking-widest text-[var(--ink)]/50">
          {t("community.orders")}
        </h3>
        <Link
          href={localePath(locale, `/f/${franchiseSlug}/orders/new`)}
          className="shrink-0 text-xs text-[var(--accent)] hover:underline"
        >
          {t("community.submit")}
        </Link>
      </div>

      {ready && orders.length === 0 ? (
        <p className="text-sm text-[var(--ink)]/45">
          {t("community.empty")}
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <details key={o.id} className="rounded-lg border border-[var(--ink)]/10 bg-[var(--surface)] p-4">
              <summary className="flex cursor-pointer items-center gap-3">
                <span className="flex-1 font-medium">
                  {o.name}{" "}
                  <span className="text-xs font-normal text-[var(--ink)]/45">
                    ({o.orderedWorkIds.length}) · by {o.authorName}
                  </span>
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleVote(o.id);
                  }}
                  aria-pressed={o.votedByMe}
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-xs ${
                    o.votedByMe
                      ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--ink)]"
                      : "border-[var(--ink)]/20 text-[var(--ink)]/60 hover:border-[var(--ink)]/40"
                  }`}
                >
                  ▲ {o.voteCount}
                </button>
              </summary>
              {o.rationale && (
                <p className="mt-2 whitespace-pre-line text-sm text-[var(--ink)]/65">{o.rationale}</p>
              )}
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-[var(--ink)]/80">
                {o.orderedWorkIds.map((id) => (
                  <li key={id}>
                    <a href={`#w-${id.split("/").pop()}`} className="hover:underline">
                      {workTitles[id] ?? id}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
