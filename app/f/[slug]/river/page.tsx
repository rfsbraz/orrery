import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFranchise, listFranchiseSlugs } from "@/lib/content";
import { capabilities } from "@/lib/content/capabilities";
import { buildRiver } from "@/lib/content/river";
import { stripRefs } from "@/lib/content/refs";
import { signatureOf, themeVars } from "@/lib/theme";
import { River } from "@/components/river";
import { ProgressProvider } from "@/components/progress/provider";

// The River view: only franchises whose content activates the capability get
// this page built (the framework seam - no half-empty rivers).
export function generateStaticParams() {
  return listFranchiseSlugs()
    .filter((slug) => {
      const b = getFranchise(slug);
      return b ? capabilities(b).river : false;
    })
    .map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const b = getFranchise(slug);
  if (!b) return {};
  return {
    title: `${b.franchise.name} - the River | Orrery`,
    description:
      stripRefs(b.franchise.description) ||
      `Walk ${b.franchise.name} in the context it was written in.`,
  };
}

export default async function RiverPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const b = getFranchise(slug);
  if (!b || !capabilities(b).river) notFound();

  const sections = buildRiver(b);
  const workTitles = new Map(b.works.map((w) => [w.id, w.title]));

  return (
    <div
      data-franchise={slug}
      style={themeVars(b.theme)}
      className="min-h-screen bg-[var(--bg)] text-[var(--ink)]"
    >
      <main className="mx-auto max-w-4xl px-6 py-14">
        <Link href={`/f/${slug}`} className="text-xs text-[var(--ink)]/50 hover:text-[var(--ink)]">
          ← {b.franchise.name}
        </Link>
        <header className="mt-4 mb-14">
          <h1 className="display text-4xl font-semibold tracking-tight">The River</h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--ink)]/65">
            The whole body of work in the weather it was written in - the life, the
            world, the culture around each book. Walk it slowly.
          </p>
        </header>
        <ProgressProvider>
          <River sections={sections} workTitles={workTitles} signature={signatureOf(b.theme)} />
        </ProgressProvider>
      </main>
    </div>
  );
}
