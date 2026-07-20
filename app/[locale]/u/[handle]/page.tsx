import { localeFromSegment, localePath } from "@/lib/i18n/config";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllBundles, listAchievements } from "@/lib/content";
import { getProfileByHandle } from "@/lib/supabase/profiles";
import { getPublicProgress } from "@/lib/supabase/progress";
import { countApprovedOrdersBy } from "@/lib/supabase/orders";
import { Shelf } from "@/components/shelf";
import { CuratorCredit } from "@/components/curator-credit";

// RLS returns a profile only if public (or to its owner), so a private or
// missing handle 404s for everyone else - no separate visibility check needed.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) return { title: "Not found | Orrery" };
  const name = profile.displayName || `@${profile.handle}`;
  return { title: `${name} | Orrery`, description: `${name}'s reading, in context.` };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>;
}) {
  const { locale: localeSeg, handle } = await params;
  const locale = localeFromSegment(localeSeg === "en" ? undefined : localeSeg);
  const profile = await getProfileByHandle(handle);
  if (!profile) notFound();

  const bundles = getAllBundles();
  const [progress, approvedOrders] = await Promise.all([
    getPublicProgress(profile.id),
    countApprovedOrdersBy(profile.id),
  ]);
  const name = profile.displayName || `@${profile.handle}`;

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <Link href={localePath(locale, "/")} className="text-xs text-neutral-500 hover:text-neutral-300">
        ← Orrery
      </Link>
      <h1 className="display mt-4 text-3xl font-semibold text-neutral-100">{name}</h1>
      <p className="mt-1 text-sm text-neutral-500">@{profile.handle}</p>
      {profile.bio && <p className="mt-3 max-w-prose text-neutral-300">{profile.bio}</p>}
      <CuratorCredit isModerator={profile.isModerator} approvedOrders={approvedOrders} />

      <Shelf progress={progress} bundles={bundles} achievements={listAchievements()} owner={false} />
    </main>
  );
}
