import { translator } from "@/lib/i18n/messages";
import { localeFromSegment, localePath } from "@/lib/i18n/config";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFranchise } from "@/lib/content";
import { getCurrentUser } from "@/lib/supabase/server";
import {
  getGroupByHandle,
  getGroupMembers,
  amIMember,
  getGroupProgressBoard,
} from "@/lib/supabase/groups";
import { resolveOrderRef } from "@/lib/groups/order-ref";
import { Membership } from "@/components/groups/membership";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const g = await getGroupByHandle(handle);
  return { title: g ? `${g.name} | Orrery` : "Not found | Orrery" };
}

export default async function GroupPage({ params }: { params: Promise<{ locale: string; handle: string }> }) {
  const { locale: localeSeg, handle } = await params;
  const locale = localeFromSegment(localeSeg === "en" ? undefined : localeSeg);
  const t = translator(locale);
  const group = await getGroupByHandle(handle);
  if (!group) notFound();

  const [user, members, isMember] = await Promise.all([
    getCurrentUser(),
    getGroupMembers(group.id),
    amIMember(group.id),
  ]);
  const isOwner = user?.id === group.ownerId;

  // Resolve the club's order to a work list + a human label from canon.
  const bundle = getFranchise(group.franchiseSlug);
  const curated =
    bundle?.orders
      .filter((o) => !o.derived)
      .map((o) => ({ id: o.id, name: o.name, orderedWorkIds: o.orderedWorkIds })) ?? [];
  const works = bundle?.works.map((w) => ({ id: w.id, published: w.published })) ?? [];
  const resolved = resolveOrderRef(group.orderRef, works, curated, []);
  const titles = new Map((bundle?.works ?? []).map((w) => [w.id, w.title]));

  const board = await getGroupProgressBoard(members, resolved.workIds);

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <Link href={localePath(locale, "/groups")} className="text-xs text-neutral-500 hover:text-neutral-300">
        ← {t("groups.title")}
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="display text-3xl font-semibold text-neutral-100">{group.name}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            @{group.handle} · {members.length} member{members.length === 1 ? "" : "s"}
            {group.pace ? ` · ${group.pace}` : ""}
          </p>
        </div>
        <Membership
          groupId={group.id}
          handle={group.handle}
          isMember={isMember}
          isOwner={isOwner}
          authed={!!user}
        />
      </div>

      {group.description && <p className="mt-4 max-w-prose text-neutral-300">{group.description}</p>}

      <p className="mt-4 text-sm text-neutral-400">
        Reading{" "}
        {bundle ? (
          <Link href={localePath(locale, `/f/${group.franchiseSlug}`)} className="text-neutral-200 underline">
            {bundle.franchise.name}
          </Link>
        ) : (
          group.franchiseSlug
        )}{" "}
        · <span className="text-neutral-300">{resolved.label}</span> ({resolved.workIds.length} books)
      </p>

      {/* Shared progress board */}
      <section className="mt-10">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-neutral-500">{t("groups.progressBoard")}</h2>
        {!isMember ? (
          <p className="text-sm text-neutral-500">Join the club to see the shared progress board.</p>
        ) : (
          <ul className="space-y-2">
            {board.map((row) => {
              const pct = row.total > 0 ? Math.round((row.read / row.total) * 100) : 0;
              return (
                <li key={row.userId} className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className={row.isMe ? "font-medium text-neutral-100" : "text-neutral-300"}>
                      {row.name}
                      {row.isMe && <span className="ml-1 text-xs text-neutral-500">(you)</span>}
                    </span>
                    <span className="shrink-0 text-neutral-500">
                      {row.read}/{row.total}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-800">
                    <div className="h-full rounded-full bg-neutral-300" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* The reading list */}
      <section className="mt-10">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-neutral-500">{t("groups.theList")}</h2>
        <ol className="list-decimal space-y-1 pl-6 text-sm text-neutral-300">
          {resolved.workIds.map((id) => (
            <li key={id}>
              {bundle ? (
                <Link href={localePath(locale, `/f/${group.franchiseSlug}#w-${id.split("/").pop()}`)} className="hover:underline">
                  {titles.get(id) ?? id}
                </Link>
              ) : (
                (titles.get(id) ?? id)
              )}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
