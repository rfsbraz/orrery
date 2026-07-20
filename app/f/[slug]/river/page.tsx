import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFranchise, listFranchiseSlugs } from "@/lib/content";
import { capabilities } from "@/lib/content/capabilities";
import { buildRiver, subseriesEntries } from "@/lib/content/river";
import { coverFor, pickEdition } from "@/lib/content/editions";
import { stripRefs } from "@/lib/content/refs";
import { signatureOf, themeVars } from "@/lib/theme";
import { River } from "@/components/river";
import { ProgressProvider } from "@/components/progress/provider";
import { ListProgress } from "@/components/progress/list-progress";

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

  const layers = buildRiver(b);
  const series = subseriesEntries(b.works);
  const workTitles = Object.fromEntries(b.works.map((w) => [w.id, w.title]));

  const useEditions = capabilities(b).editions;
  const covers: Record<string, string> = {};
  for (const w of b.works) {
    const cover = coverFor(w, useEditions ? pickEdition(w.id, b.editions) : null);
    if (cover) covers[w.id] = cover;
  }

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
        <header className="mt-4 mb-8">
          <h1 className="display text-4xl font-semibold tracking-tight">The River</h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--ink)]/65">
            The whole body of work in the weather it was written in - the life, the
            world, the culture around each book. Walk it slowly.
          </p>
        </header>
        <ProgressProvider>
          <ListProgress workIds={b.works.map((w) => w.id)} />
          <div className="pt-6">
            <River
              layers={layers}
              series={series}
              covers={covers}
              workTitles={workTitles}
              signature={signatureOf(b.theme)}
            />
          </div>
        </ProgressProvider>
      </main>
    </div>
  );
}
