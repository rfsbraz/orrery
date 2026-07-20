import Link from "next/link";
import type { Metadata } from "next";
import { localeFromSegment, localePath } from "@/lib/i18n/config";
import { getAllBundles } from "@/lib/content";
import { getPendingOrders, isModerator } from "@/lib/supabase/orders";
import { getCurrentUser } from "@/lib/supabase/server";
import { ModerateActions } from "@/components/orders/moderate-actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Moderation | Orrery" };

export default async function ModeratePage(props: { params: Promise<{ locale: string }> }) {
  const { locale: localeSeg } = await props.params;
  const locale = localeFromSegment(localeSeg === "en" ? undefined : localeSeg);
  const user = await getCurrentUser();
  const mod = user ? await isModerator() : false;

  if (!mod) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="display text-2xl font-semibold text-neutral-100">Moderation</h1>
        <p className="mt-2 text-neutral-400">This queue is for moderators.</p>
        <Link href="/" className="mt-6 inline-block text-sm text-neutral-400 underline hover:text-neutral-100">
          ← Orrery
        </Link>
      </main>
    );
  }

  const pending = await getPendingOrders();
  const titles: Record<string, string> = {};
  for (const b of getAllBundles()) for (const w of b.works) titles[w.id] = w.title;

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <Link href={localePath(locale, "/")} className="text-xs text-neutral-500 hover:text-neutral-300">
        ← Orrery
      </Link>
      <h1 className="display mt-4 text-3xl font-semibold text-neutral-100">Moderation queue</h1>
      <p className="mt-2 text-neutral-400">
        {pending.length === 0
          ? "Nothing waiting. The queue is clear."
          : `${pending.length} submission${pending.length === 1 ? "" : "s"} awaiting review.`}
      </p>

      <div className="mt-8 space-y-5">
        {pending.map((o) => (
          <article key={o.id} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="display text-lg font-semibold text-neutral-100">{o.name}</h2>
              <span className="shrink-0 text-xs text-neutral-500">
                {o.franchiseSlug} · by {o.authorName}
              </span>
            </div>
            {o.rationale && <p className="mt-2 whitespace-pre-line text-sm text-neutral-400">{o.rationale}</p>}
            <ol className="mt-3 list-decimal space-y-0.5 pl-5 text-sm text-neutral-300">
              {o.orderedWorkIds.map((id) => (
                <li key={id}>{titles[id] ?? id}</li>
              ))}
            </ol>
            <div className="mt-4">
              <ModerateActions id={o.id} />
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
