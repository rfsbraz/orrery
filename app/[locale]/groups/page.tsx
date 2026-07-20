import Link from "next/link";
import type { Metadata } from "next";
import { localeFromSegment, localePath } from "@/lib/i18n/config";
import { getAllBundles } from "@/lib/content";
import { getPublicGroups } from "@/lib/supabase/groups";
import { getCurrentUser } from "@/lib/supabase/server";
import { orderRefOptions } from "@/lib/groups/order-ref";
import { CreateGroupForm } from "@/components/groups/create-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Book clubs | Orrery" };

export default async function GroupsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale: localeSeg } = await props.params;
  const locale = localeFromSegment(localeSeg === "en" ? undefined : localeSeg);
  const [user, groups] = await Promise.all([getCurrentUser(), getPublicGroups()]);

  // Build the franchise + order options for the create form from canon.
  const franchises = getAllBundles(locale).map((b) => ({
    slug: b.franchise.id,
    name: b.franchise.name,
    orders: orderRefOptions(
      b.orders.filter((o) => !o.derived).map((o) => ({ id: o.id, name: o.name, orderedWorkIds: o.orderedWorkIds })),
      [] // community orders aren't needed for group creation; canon + default is enough
    ),
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <Link href={localePath(locale, "/")} className="text-xs text-neutral-500 hover:text-neutral-300">
        ← Orrery
      </Link>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h1 className="display text-3xl font-semibold text-neutral-100">Book clubs</h1>
      </div>
      <p className="mt-2 max-w-prose text-neutral-400">
        Read a franchise together. Pick an order, set a pace, and watch each other&apos;s progress on a
        shared board.
      </p>

      <div className="mt-8">
        {user ? (
          <CreateGroupForm franchises={franchises} />
        ) : (
          <Link href={localePath(locale, "/login")} className="text-sm text-neutral-400 underline hover:text-neutral-100">
            Sign in to start a book club →
          </Link>
        )}
      </div>

      <section className="mt-12">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-neutral-500">
          Public clubs
        </h2>
        {groups.length === 0 ? (
          <p className="text-neutral-500">No public clubs yet. Start the first one.</p>
        ) : (
          <ul className="space-y-3">
            {groups.map((g) => (
              <li key={g.id}>
                <Link
                  href={localePath(locale, `/g/${g.handle}`)}
                  className="block rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 hover:border-neutral-600"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="display text-lg font-semibold text-neutral-100">{g.name}</span>
                    <span className="shrink-0 text-xs text-neutral-500">
                      {g.memberCount} member{g.memberCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  {g.description && <p className="mt-1 text-sm text-neutral-400">{g.description}</p>}
                  <p className="mt-2 text-xs text-neutral-600">
                    {g.franchiseSlug}
                    {g.pace ? ` · ${g.pace}` : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
