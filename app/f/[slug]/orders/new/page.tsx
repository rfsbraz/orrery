import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFranchise } from "@/lib/content";
import { getCurrentUser } from "@/lib/supabase/server";
import { OrderBuilder } from "@/components/orders/builder";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const b = getFranchise(slug);
  return { title: b ? `Submit an order - ${b.franchise.name} | Orrery` : "Orrery" };
}

export default async function NewOrderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = getFranchise(slug);
  if (!b) notFound();

  const user = await getCurrentUser();
  if (!user) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="display text-2xl font-semibold text-neutral-100">Submit a reading order</h1>
        <p className="mt-2 text-neutral-400">Sign in to propose an order for {b.franchise.name}.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white"
        >
          Sign in
        </Link>
      </main>
    );
  }

  const works = b.works
    .map((w) => ({ id: w.id, title: w.title, published: w.published }))
    .sort((a, b) => a.published - b.published);

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <Link href={`/f/${slug}`} className="text-xs text-neutral-500 hover:text-neutral-300">
        ← {b.franchise.name}
      </Link>
      <h1 className="display mt-4 text-3xl font-semibold text-neutral-100">Submit a reading order</h1>
      <p className="mt-2 max-w-prose text-neutral-400">
        Propose your own way through {b.franchise.name}. Add the books in the order you&apos;d read them
        and say why. Submissions are reviewed before they appear publicly.
      </p>
      <OrderBuilder franchiseSlug={slug} works={works} />
    </main>
  );
}
