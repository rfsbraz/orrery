import Link from "next/link";
import type { Metadata } from "next";
import { localeFromSegment, localePath } from "@/lib/i18n/config";
import { getAllBundles, listAchievements } from "@/lib/content";
import { getCurrentUser } from "@/lib/supabase/server";
import { getMyProgress } from "@/lib/supabase/progress";
import { getMyProfile } from "@/lib/supabase/profiles";
import { countApprovedOrdersBy } from "@/lib/supabase/orders";
import { Shelf } from "@/components/shelf";
import { ProfileEditor } from "@/components/profile/editor";
import { CuratorCredit } from "@/components/curator-credit";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My shelf | Orrery" };

export default async function MePage(props: { params: Promise<{ locale: string }> }) {
  const { locale: localeSeg } = await props.params;
  const locale = localeFromSegment(localeSeg === "en" ? undefined : localeSeg);
  const user = await getCurrentUser();
  if (!user) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="display text-2xl font-semibold text-neutral-100">Your shelf</h1>
        <p className="mt-2 text-neutral-400">Sign in to track your reading and see it in context.</p>
        <Link
          href={localePath(locale, "/login")}
          className="mt-6 inline-block rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white"
        >
          Sign in
        </Link>
      </main>
    );
  }

  const bundles = getAllBundles(locale);
  const [progress, profile, approvedOrders] = await Promise.all([
    getMyProgress(),
    getMyProfile(),
    countApprovedOrdersBy(user.id),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <Link href={localePath(locale, "/")} className="text-xs text-neutral-500 hover:text-neutral-300">
        ← Orrery
      </Link>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h1 className="display text-3xl font-semibold text-neutral-100">Your shelf</h1>
        <div className="flex shrink-0 items-center gap-4 text-sm">
          {profile?.isModerator && (
            <Link href={localePath(locale, "/moderate")} className="text-amber-400/90 hover:text-amber-300">
              Moderate
            </Link>
          )}
          <Link
            href={`/me/recap/${new Date().getFullYear()}`}
            className="text-neutral-400 underline hover:text-neutral-100"
          >
            Year in reading
          </Link>
          <Link href={localePath(locale, "/import")} className="text-neutral-400 underline hover:text-neutral-100">
            Import reading
          </Link>
        </div>
      </div>

      {profile && (
        <CuratorCredit isModerator={profile.isModerator} approvedOrders={approvedOrders} />
      )}

      <Shelf progress={progress} bundles={bundles} achievements={listAchievements()} owner />

      <ProfileEditor initial={profile} />
    </main>
  );
}
