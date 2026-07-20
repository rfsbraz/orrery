"use client";

import { useEffect, useMemo, useState } from "react";
import { useT } from "@/components/i18n/provider";
import { Prose } from "@/components/prose";
import type { ReadingOrder } from "@/lib/content/types";

/**
 * The order selector: a quiet control above the walk that decides WHICH order
 * the strata view is showing. Orders are not a highlighted list on the author
 * page any more - they are a lens you put on the same walk.
 *
 * Selecting a curated order scopes the walk to that order's works and numbers
 * each one by its position in it. Time stays the spine (that is the point of
 * the strata), so eras and ruptures keep their meaning; the order tells you
 * WHAT to read and in what sequence, the strata tells you WHEN it happened.
 *
 * The choice lives in the URL hash so a specific reading is shareable while
 * the page itself stays static.
 */
export function OrderSelector({
  orders,
  onChange,
}: {
  orders: ReadingOrder[];
  /** Called with the selected order's work IDs (null = the full walk). */
  onChange: (selection: { id: string; workIds: string[] } | null) => void;
}) {
  const t = useT();
  const [selected, setSelected] = useState<string>("");

  const byId = useMemo(() => new Map(orders.map((o) => [o.id, o])), [orders]);
  const derived = orders.find((o) => o.derived);
  const curated = orders.filter((o) => !o.derived);

  // One-time hydration read: the hash is client-only, so we start empty
  // (matching SSR) and adopt a shared selection after mount. Same pattern as
  // the country picker in find-a-copy.tsx.
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1)).get("order");
    if (!hash || !byId.has(hash)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(hash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const order = selected ? byId.get(selected) : null;
    onChange(order && !order.derived ? { id: order.id, workIds: order.orderedWorkIds } : null);
    const hash = selected ? `#order=${encodeURIComponent(selected)}` : "";
    window.history.replaceState(null, "", window.location.pathname + hash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  if (curated.length === 0) return null;
  const current = selected ? byId.get(selected) : undefined;

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2.5">
        <label
          htmlFor="order-select"
          className="text-[10px] font-medium uppercase tracking-widest text-[var(--muted)]"
        >
          {t("orders.reading")}
        </label>
        <select
          id="order-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="min-w-0 max-w-full rounded border border-[var(--ink)]/20 bg-[var(--surface)] px-2 py-1 text-sm text-[var(--ink)]"
        >
          <option value="">
            {derived?.name ?? t("orders.chronological")}
          </option>
          {curated.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name} ({o.orderedWorkIds.length})
            </option>
          ))}
        </select>
      </div>

      {current && !current.derived && (
        <div className="mt-2.5 rounded-md border border-[var(--ink)]/10 bg-[var(--surface)] p-3">
          {current.rationale && (
            <Prose
              text={current.rationale}
              className="prose-read block text-xs text-[var(--ink)]/70"
            />
          )}
          {current.debated && current.debated.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-[11px] text-[var(--muted)]">
                {t("orders.debated")}
              </summary>
              <ul className="mt-1.5 space-y-1 text-[11px] text-[var(--ink)]/55">
                {current.debated.map((d, i) => (
                  <li key={i}>· {d}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
