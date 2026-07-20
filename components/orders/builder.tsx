"use client";

import { useT } from "@/components/i18n/provider";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createOrderAction } from "@/app/actions/orders";
import { ORDER_NAME_MAX } from "@/lib/orders/types";

interface WorkLite {
  id: string;
  title: string;
  published: number;
}

/**
 * Build a community reading order: name + rationale, then pick works from the
 * canon and arrange them. The picked list is the order (top = read first).
 */
export function OrderBuilder({ franchiseSlug, works }: { franchiseSlug: string; works: WorkLite[] }) {
  const t = useT();
  const router = useRouter();
  const byId = useMemo(() => new Map(works.map((w) => [w.id, w])), [works]);
  const [name, setName] = useState("");
  const [rationale, setRationale] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pickedSet = new Set(picked);
  const available = works.filter(
    (w) => !pickedSet.has(w.id) && w.title.toLowerCase().includes(filter.toLowerCase())
  );

  const add = (id: string) => setPicked((p) => [...p, id]);
  const remove = (id: string) => setPicked((p) => p.filter((x) => x !== id));
  const move = (i: number, dir: -1 | 1) =>
    setPicked((p) => {
      const j = i + dir;
      if (j < 0 || j >= p.length) return p;
      const next = [...p];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  async function submit() {
    setError(null);
    setBusy(true);
    const res = await createOrderAction({
      franchiseSlug,
      name,
      rationale: rationale || null,
      orderedWorkIds: picked,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Could not submit.");
      return;
    }
    router.push(`/f/${franchiseSlug}`);
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="space-y-3">
        <label className="block">
          <span className="text-sm text-neutral-400">{t("orders.orderName")}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, ORDER_NAME_MAX))}
            placeholder="e.g. Ideal first-time run"
            className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600"
          />
        </label>
        <label className="block">
          <span className="text-sm text-neutral-400">Why this order? (optional)</span>
          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            rows={3}
            placeholder="What makes this a good path through the franchise?"
            className="mt-1 w-full resize-none rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-neutral-600"
          />
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* The order being built */}
        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            Your order ({picked.length})
          </h2>
          {picked.length === 0 ? (
            <p className="rounded-lg border border-dashed border-neutral-800 p-4 text-sm text-neutral-600">
              Add books from the list to build your order.
            </p>
          ) : (
            <ol className="space-y-1.5">
              {picked.map((id, i) => (
                <li
                  key={id}
                  className="flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-2"
                >
                  <span className="w-5 shrink-0 text-right font-mono text-xs text-neutral-600">{i + 1}</span>
                  <span className="flex-1 truncate text-sm text-neutral-200">{byId.get(id)?.title}</span>
                  <div className="flex shrink-0 items-center gap-1 text-neutral-500">
                    <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="px-1 hover:text-neutral-200 disabled:opacity-30">↑</button>
                    <button onClick={() => move(i, 1)} disabled={i === picked.length - 1} aria-label="Move down" className="px-1 hover:text-neutral-200 disabled:opacity-30">↓</button>
                    <button onClick={() => remove(id)} aria-label="Remove" className="px-1 hover:text-red-400">✕</button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* The canon to pick from */}
        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            Add books ({available.length})
          </h2>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter…"
            className="mb-2 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-100 outline-none focus:border-neutral-600"
          />
          <ul className="max-h-80 space-y-1 overflow-y-auto pr-1">
            {available.map((w) => (
              <li key={w.id}>
                <button
                  onClick={() => add(w.id)}
                  className="flex w-full items-baseline justify-between gap-3 rounded-md px-3 py-1.5 text-left text-sm text-neutral-300 hover:bg-neutral-900"
                >
                  <span className="truncate">{w.title}</span>
                  <span className="shrink-0 font-mono text-xs text-neutral-600">{w.published}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={busy || !name.trim() || picked.length === 0}
          className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white disabled:opacity-50"
        >
          {busy ? "Submitting…" : "Submit for review"}
        </button>
        <span className="text-xs text-neutral-600">A moderator will review it before it goes public.</span>
      </div>
    </div>
  );
}
