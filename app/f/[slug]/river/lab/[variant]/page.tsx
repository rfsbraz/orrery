import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFranchise, listFranchiseSlugs } from "@/lib/content";
import { capabilities } from "@/lib/content/capabilities";
import { coverFor, pickEdition } from "@/lib/content/editions";
import { signatureOf, themeVars } from "@/lib/theme";
import { ProgressProvider } from "@/components/progress/provider";
import { ListProgress } from "@/components/progress/list-progress";
import { BeamConcept } from "@/components/river-lab/beam";
import { MarginConcept } from "@/components/river-lab/margin";
import { StrataConcept } from "@/components/river-lab/strata";
import type { LabProps } from "@/components/river-lab/shared";

// The river lab: three competing renderings of the same vertical walk, on the
// same real data, so the concept choice is made by scrolling, not imagining.
// Temporary by design - the winner replaces /f/<slug>/river and the lab goes.

const VARIANTS = {
  beam: {
    title: "The Beam",
    blurb:
      "One continuous spine down the center; works alternate sides, texture notes sit opposite, and high-impact events interrupt the line itself. A single thread you follow downriver.",
    component: BeamConcept,
  },
  margin: {
    title: "The Margin",
    blurb:
      "An annotated critical edition: books own a wide reading column with big covers; the world happens in a narrow margin of scholar's notes; high-impact events break the page as chapter plates.",
    component: MarginConcept,
  },
  strata: {
    title: "The Strata",
    blurb:
      "Time as sediment: each year is a full-width layer with a ghosted numeral, decades cut heavy rules with sticky markers, and high-impact events rupture the page as inverted bands.",
    component: StrataConcept,
  },
} as const;

type VariantKey = keyof typeof VARIANTS;

export function generateStaticParams() {
  return listFranchiseSlugs()
    .filter((slug) => {
      const b = getFranchise(slug);
      return b ? capabilities(b).river : false;
    })
    .flatMap((slug) => Object.keys(VARIANTS).map((variant) => ({ slug, variant })));
}

export const dynamicParams = false;

export async function generateMetadata(props: {
  params: Promise<{ slug: string; variant: string }>;
}): Promise<Metadata> {
  const { slug, variant } = await props.params;
  const b = getFranchise(slug);
  const v = VARIANTS[variant as VariantKey];
  if (!b || !v) return {};
  return { title: `${b.franchise.name} - River lab: ${v.title} | Orrery` };
}

export default async function RiverLabPage(props: {
  params: Promise<{ slug: string; variant: string }>;
}) {
  const { slug, variant } = await props.params;
  const b = getFranchise(slug);
  const v = VARIANTS[variant as VariantKey];
  if (!b || !v || !capabilities(b).river) notFound();

  const covers: Record<string, string> = {};
  for (const w of b.works) {
    const cover = coverFor(w, pickEdition(w.id, b.editions));
    if (cover) covers[w.id] = cover;
  }

  const labProps: LabProps = {
    works: b.works,
    events: b.timeline,
    eras: b.eras,
    covers,
    workTitles: Object.fromEntries(b.works.map((w) => [w.id, w.title])),
  };

  const Concept = v.component;

  return (
    <div
      data-franchise={slug}
      style={themeVars(b.theme)}
      className="min-h-screen bg-[var(--bg)] text-[var(--ink)]"
    >
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link href={`/f/${slug}`} className="text-xs text-[var(--ink)]/50 hover:text-[var(--ink)]">
            ← {b.franchise.name}
          </Link>
          <nav aria-label="River concepts" className="flex gap-1.5">
            {(Object.keys(VARIANTS) as VariantKey[]).map((key) => (
              <Link
                key={key}
                href={`/f/${slug}/river/lab/${key}`}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  key === variant
                    ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--ink)]"
                    : "border-[var(--ink)]/15 text-[var(--ink)]/55 hover:border-[var(--ink)]/40 hover:text-[var(--ink)]"
                }`}
              >
                {VARIANTS[key].title}
              </Link>
            ))}
          </nav>
        </div>

        <header className="mb-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--muted)]">
            River lab · concept
          </p>
          <h1 className="display mt-1 text-4xl font-semibold tracking-tight">{v.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--ink)]/65">{v.blurb}</p>
        </header>

        <ProgressProvider>
          <ListProgress workIds={b.works.map((w) => w.id)} />
          <div className="pt-8">
            <Concept {...labProps} signature={signatureOf(b.theme)} />
          </div>
        </ProgressProvider>
      </main>
    </div>
  );
}
