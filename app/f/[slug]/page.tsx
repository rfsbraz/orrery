import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFranchise, listFranchiseSlugs } from "@/lib/content";
import { stripRefs } from "@/lib/content/refs";
import { themeVars } from "@/lib/theme";
import { Prose } from "@/components/prose";
import { Timeline } from "@/components/timeline";

export function generateStaticParams() {
  return listFranchiseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const b = getFranchise(slug);
  if (!b) return {};
  return {
    title: `${b.franchise.name} - reading order & timeline | Orrery`,
    description: stripRefs(b.franchise.description) || `Reading orders and timeline for ${b.franchise.name}.`,
  };
}

export default async function FranchisePage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const b = getFranchise(slug);
  if (!b) notFound();

  const workTitle = (id: string) => b.works.find((w) => w.id === id)?.title ?? id;
  const curated = b.orders.filter((o) => !o.derived);

  return (
    <div
      data-franchise={slug}
      style={themeVars(b.theme)}
      className="min-h-screen bg-[var(--bg)] text-[var(--ink)]"
    >
      <main className="mx-auto max-w-3xl px-6 py-14">
        <Link href="/" className="text-xs text-[var(--ink)]/50 hover:text-[var(--ink)]">
          ← Orrery
        </Link>

        <header className="mt-4 mb-10">
          <h1 className="text-4xl font-bold tracking-tight">{b.franchise.name}</h1>
          {b.franchise.description && (
            <Prose text={b.franchise.description} className="mt-3 block text-lg text-[var(--ink)]/75" />
          )}
          <p className="mt-4 text-sm text-[var(--ink)]/50">
            {b.works.length} works ·{" "}
            {b.authors.map((a, i) => (
              <span key={a.id}>
                {i > 0 && ", "}
                <Link href={`/author/${a.id}`} className="underline decoration-[var(--accent)]/40 underline-offset-2">
                  {a.name}
                </Link>
              </span>
            ))}
          </p>
        </header>

        {b.eras.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-[var(--ink)]/50">
              Eras
            </h2>
            <div className="space-y-3">
              {b.eras.map((e) => (
                <div key={e.id} className="rounded-lg border border-[var(--ink)]/10 bg-[var(--surface)] p-4">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-semibold">{e.title}</h3>
                    <span className="font-mono text-xs text-[var(--ink)]/40">{e.period}</span>
                  </div>
                  {e.description && (
                    <Prose text={e.description} className="mt-1 block text-sm text-[var(--ink)]/65" />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-12">
          <h2 className="mb-1 text-xs font-medium uppercase tracking-widest text-[var(--ink)]/50">
            Reading orders
          </h2>
          <p className="mb-4 text-sm text-[var(--ink)]/60">
            The <strong>default</strong> is every work in publication order - the timeline below.
            {curated.length > 0 && " Curated alternatives:"}
          </p>
          <div className="space-y-4">
            {curated.map((o) => (
              <details key={o.id} className="rounded-lg border border-[var(--ink)]/10 bg-[var(--surface)] p-4">
                <summary className="cursor-pointer font-medium">
                  {o.name}{" "}
                  <span className="text-xs font-normal text-[var(--ink)]/45">
                    ({o.orderedWorkIds.length})
                  </span>
                </summary>
                {o.rationale && (
                  <Prose text={o.rationale} className="mt-2 block text-sm text-[var(--ink)]/65" />
                )}
                <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-[var(--ink)]/80">
                  {o.orderedWorkIds.map((id) => (
                    <li key={id}>
                      <a href={`#w-${id.split("/").pop()}`} className="hover:underline">
                        {workTitle(id)}
                      </a>
                    </li>
                  ))}
                </ol>
                {o.debated && o.debated.length > 0 && (
                  <ul className="mt-3 space-y-1 text-xs text-[var(--ink)]/45">
                    {o.debated.map((d, i) => (
                      <li key={i}>· {d}</li>
                    ))}
                  </ul>
                )}
              </details>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-5 text-xs font-medium uppercase tracking-widest text-[var(--ink)]/50">
            The timeline
          </h2>
          <Timeline works={b.works} events={b.timeline} />
        </section>
      </main>
    </div>
  );
}
