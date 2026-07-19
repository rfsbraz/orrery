import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFranchise, listFranchiseSlugs } from "@/lib/content";
import { capabilities } from "@/lib/content/capabilities";
import { buildArcModel, characterThreads } from "@/lib/content/connections";
import { themeVars } from "@/lib/theme";
import { ArcMap } from "@/components/connections/arc-map";
import { CharacterThreads } from "@/components/connections/character-threads";
import { ProgressProvider } from "@/components/progress/provider";

export function generateStaticParams() {
  return listFranchiseSlugs()
    .filter((slug) => {
      const b = getFranchise(slug);
      return b ? capabilities(b).connections : false;
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
    title: `${b.franchise.name} - connections | Orrery`,
    description: `How the ${b.franchise.name} works connect: crossovers, sequels, and the characters that thread them together.`,
  };
}

export default async function ConnectionsPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const b = getFranchise(slug);
  if (!b || !capabilities(b).connections) notFound();

  const model = buildArcModel(b.works);
  const threads = characterThreads(b.characters, b.works);
  const workTitles = new Map(b.works.map((w) => [w.id, w.title]));

  return (
    <div
      data-franchise={slug}
      style={themeVars(b.theme)}
      className="min-h-screen bg-[var(--bg)] text-[var(--ink)]"
    >
      <main className="mx-auto max-w-3xl px-6 py-14">
        <Link href={`/f/${slug}`} className="text-xs text-[var(--ink)]/50 hover:text-[var(--ink)]">
          ← {b.franchise.name}
        </Link>
        <header className="mt-4 mb-10">
          <h1 className="display text-4xl font-semibold tracking-tight">Connections</h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--ink)]/65">
            The tissue between the books: crossovers, sequels across threads,
            shared cosmology - and the figures who walk between them. Reveals
            stay hidden until you have read your way to them.
          </p>
        </header>

        <ProgressProvider>
          {model.nodes.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-[var(--ink)]/50">
                The map
              </h2>
              <div className="rounded-lg border border-[var(--ink)]/10 bg-[var(--surface)] p-4">
                <ArcMap model={model} />
              </div>
              <p className="mt-2 text-[11px] text-[var(--muted)]">
                Works with at least one declared connection, in publication order.
                An arc&apos;s reach shows how far back a book leans.
              </p>
            </section>
          )}

          {threads.length > 0 && (
            <section>
              <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-[var(--ink)]/50">
                The travellers
              </h2>
              <CharacterThreads threads={threads} workTitles={workTitles} />
            </section>
          )}
        </ProgressProvider>
      </main>
    </div>
  );
}
