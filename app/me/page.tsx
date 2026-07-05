import Link from "next/link";
import type { Metadata } from "next";
import { getAllBundles } from "@/lib/content";
import { getCurrentUser } from "@/lib/supabase/server";
import { getMyProgress } from "@/lib/supabase/progress";
import { getMyProfile } from "@/lib/supabase/profiles";
import { Shelf } from "@/components/shelf";
import { ProfileEditor } from "@/components/profile/editor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My shelf | Orrery" };

export default async function MePage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="display text-2xl font-semibold text-neutral-100">Your shelf</h1>
        <p className="mt-2 text-neutral-400">Sign in to track your reading and see it in context.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white"
        >
          Sign in
        </Link>
      </main>
    );
  }

  const bundles = getAllBundles();
  const [progress, profile] = await Promise.all([getMyProgress(), getMyProfile()]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-300">
        ← Orrery
      </Link>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h1 className="display text-3xl font-semibold text-neutral-100">Your shelf</h1>
        <Link href="/import" className="shrink-0 text-sm text-neutral-400 underline hover:text-neutral-100">
          Import reading
        </Link>
      </div>

      <Shelf progress={progress} bundles={bundles} owner />

      <ProfileEditor initial={profile} />
    </main>
  );
}
