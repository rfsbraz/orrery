"use client";

import { useT } from "@/components/i18n/provider";

import { useEffect, useMemo, useState } from "react";
import { diffOrders } from "@/lib/orders/diff";
import { Prose } from "@/components/prose";
import type { ReadingOrder } from "@/lib/content/types";

/**
 * Side-by-side comparison of two reading orders: the shared spine renders
 * once down the middle, divergences fork into two columns with each order's
 * placement. Selection is client state, synced to the URL hash so a specific
 * comparison is shareable while the page stays fully static.
 */
export function OrderCompare({
  orders,
  workTitles,
}: {
  orders: ReadingOrder[];
  workTitles: Record<string, string>;
}) {
  const t = useT();
  const [aId, setAId] = useState(orders[0]?.id ?? "");
  const [bId, setBId] = useState(orders[1]?.id ?? "");

  // Restore a shared comparison from the hash (#a=<id>&b=<id>), then keep it synced.
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const ha = params.get("a");
    const hb = params.get("b");
    if (ha && orders.some((o) => o.id === ha)) setAId(ha);
    if (hb && orders.some((o) => o.id === hb)) setBId(hb);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!aId || !bId) return;
    const hash = `a=${encodeURIComponent(aId)}&b=${encodeURIComponent(bId)}`;
    window.history.replaceState(null, "", `#${hash}`);
  }, [aId, bId]);

  const a = orders.find((o) => o.id === aId);
  const b = orders.find((o) => o.id === bId);
  const diff = useMemo(
    () => (a && b ? diffOrders(a.orderedWorkIds, b.orderedWorkIds) : null),
    [a, b]
  );

  const title = (id: string) => workTitles[id] ?? id;
  const select = (value: string, onChange: (v: string) => void, label: string) => (
    <label className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--muted)]">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-[var(--ink)]/20 bg-[var(--surface)] px-2 py-1.5 text-sm text-[var(--ink)]"
      >
        {orders.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </label>
  );

  if (orders.length < 2) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-4">
        {select(aId, setAId, t("compare.orderA"))}
        {select(bId, setBId, t("compare.orderB"))}
      </div>

      {a && b && diff && (
        <>
          <p className="mt-4 text-sm text-[var(--ink)]/65">
            {diff.forks === 0 ? (
              <>{t("compare.agree")}</>
            ) : (
              <>
                {t("compare.sharedSpine", { n: diff.shared })} · {diff.forks}{" "}
                {diff.forks === 1 ? t("compare.divergence") : t("compare.divergences")}
                {diff.onlyA.length > 0 && <> · {t("compare.onlyInA", { n: diff.onlyA.length })}</>}
                {diff.onlyB.length > 0 && <> · {t("compare.onlyInB", { n: diff.onlyB.length })}</>}
              </>
            )}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-4 max-md:grid-cols-1">
            {[a, b].map((o, idx) => (
              <div key={o.id} className="rounded-lg border border-[var(--ink)]/10 bg-[var(--surface)] p-3">
                <p className="text-xs font-medium text-[var(--ink)]/80">
                  <span className="mr-1.5 inline-block rounded bg-[var(--accent)]/15 px-1.5 py-0.5 font-mono text-[10px]">
                    {idx === 0 ? "A" : "B"}
                  </span>
                  {o.name}
                </p>
                {o.rationale && (
                  <Prose text={o.rationale} className="prose-read mt-1.5 block text-xs text-[var(--ink)]/60" />
                )}
              </div>
            ))}
          </div>

          <ol className="mt-6 space-y-1">
            {diff.segments.map((seg, si) =>
              seg.kind === "common" ? (
                <li key={si}>
                  <ol className="space-y-1">
                    {seg.ids.map((id) => (
                      <li
                        key={id}
                        className="mx-auto w-full max-w-md rounded border border-[var(--ink)]/10 bg-[var(--surface)] px-3 py-1.5 text-center text-sm text-[var(--ink)]/85"
                      >
                        {title(id)}
                      </li>
                    ))}
                  </ol>
                </li>
              ) : (
                <li key={si} className="py-1.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-dashed border-[var(--accent)]/40 p-2">
                      {seg.a.length === 0 ? (
                        <p className="px-1 py-0.5 text-center text-xs italic text-[var(--muted)]">
                          {t("compare.continues", { side: "A" })}
                        </p>
                      ) : (
                        <ol className="space-y-1">
                          {seg.a.map((id) => (
                            <li key={id} className="rounded bg-[var(--accent)]/8 px-2 py-1 text-xs text-[var(--ink)]/80">
                              {title(id)}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                    <div className="rounded-lg border border-dashed border-[var(--accent)]/40 p-2">
                      {seg.b.length === 0 ? (
                        <p className="px-1 py-0.5 text-center text-xs italic text-[var(--muted)]">
                          {t("compare.continues", { side: "B" })}
                        </p>
                      ) : (
                        <ol className="space-y-1">
                          {seg.b.map((id) => (
                            <li key={id} className="rounded bg-[var(--accent)]/8 px-2 py-1 text-xs text-[var(--ink)]/80">
                              {title(id)}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  </div>
                </li>
              )
            )}
          </ol>

          {(a.debated?.length || b.debated?.length) ? (
            <div className="mt-6 rounded-lg border border-[var(--ink)]/10 bg-[var(--surface)] p-4">
              <h3 className="text-xs font-medium uppercase tracking-widest text-[var(--ink)]/50">
                {t("compare.theDebate")}
              </h3>
              <ul className="mt-2 space-y-1.5 text-xs text-[var(--ink)]/65">
                {[...(a.debated ?? []), ...(b.debated ?? [])].map((d, i) => (
                  <li key={i}>· {d}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
