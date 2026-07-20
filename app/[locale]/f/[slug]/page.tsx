import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { localeFromSegment, localePath } from "@/lib/i18n/config";
import { translator } from "@/lib/i18n/messages";
import { getFranchise, listFranchiseSlugs } from "@/lib/content";
import { capabilities } from "@/lib/content/capabilities";
import { companionFor } from "@/lib/progress/companion";
import { coverFor, pickEdition } from "@/lib/content/editions";
import { stripRefs } from "@/lib/content/refs";
import { signatureOf, themeVars } from "@/lib/theme";
import { buildRiver, subseriesEntries } from "@/lib/content/river";
import { Prose } from "@/components/prose";
import { River } from "@/components/river";
import { ListProgress } from "@/components/progress/list-progress";
import { FranchiseNav } from "@/components/franchise-nav";
import { ProgressProvider } from "@/components/progress/provider";
import { CommunityOrders } from "@/components/orders/community-orders";

export function generateStaticParams() {
  return listFranchiseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeSeg, slug } = await props.params;
  const locale = localeFromSegment(localeSeg === "en" ? undefined : localeSeg);
  const t = translator(locale);
  const b = getFranchise(slug);
  if (!b) return {};
  return {
    title: t("meta.franchise", { name: b.franchise.name }),
    description: stripRefs(b.franchise.description) || `Reading orders and timeline for ${b.franchise.name}.`,
  };
}

export default async function FranchisePage(props: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeSeg, slug } = await props.params;
  const locale = localeFromSegment(localeSeg === "en" ? undefined : localeSeg);
  const t = translator(locale);
  const b = getFranchise(slug);
  if (!b) notFound();

  const caps = capabilities(b);
  const companions = caps.companion
    ? Object.fromEntries(b.works.map((w) => [w.id, companionFor(w, b)]))
    : undefined;
  // Covers resolve from curated editions or OpenLibrary IDs; buy-ISBNs only
  // from curated editions (the editions capability). Text-first when neither.
  const isbns: Record<string, string | undefined> = {};
  const layers = buildRiver(b);
  const series = subseriesEntries(b.works);
  const covers: Record<string, string> = {};
  const localTitles: Record<string, string> = {};
  for (const w of b.works) {
    const edition = caps.editions ? pickEdition(w.id, b.editions, undefined, locale) : null;
    const cover = coverFor(w, edition);
    if (cover) covers[w.id] = cover;
    if (edition?.isbn13) isbns[w.id] = edition.isbn13;
    // A published title in the reader's language (never an invented one).
    if (edition?.title && edition.language === locale) localTitles[w.id] = edition.title;
  }
  const workTitle = (id: string) => b.works.find((w) => w.id === id)?.title ?? id;
  const curated = b.orders.filter((o) => !o.derived);
  const authorNames = new Map(b.authors.map((a) => [a.id, a.name]));
  const workTitles = Object.fromEntries(b.works.map((w) => [w.id, w.title]));

  return (
    <div
      data-franchise={slug}
      style={themeVars(b.theme)}
      className="min-h-screen bg-[var(--bg)] text-[var(--ink)]"
    >
      <main className="mx-auto max-w-4xl px-6 py-14">
        <Link href={localePath(locale, "/")} className="text-xs text-[var(--ink)]/50 hover:text-[var(--ink)]">
          ← Orrery
        </Link>

        <header className="mt-4 mb-10">
          <h1 className="display text-5xl font-semibold tracking-tight">{b.franchise.name}</h1>
          {b.franchise.description && (
            <Prose
              text={b.franchise.description}
              className="prose-read mt-3 block max-w-2xl text-lg text-[var(--ink)]/80"
            />
          )}
          <p className="mt-4 text-sm text-[var(--muted)]">
            {b.works.length} {t("franchise.works")} ·{" "}
            {b.authors.map((a, i) => (
              <span key={a.id}>
                {i > 0 && ", "}
                <Link href={localePath(locale, `/author/${a.id}`)} className="underline decoration-[var(--accent)]/40 underline-offset-2">
                  {a.name}
                </Link>
              </span>
            ))}
          </p>
          <FranchiseNav slug={slug} caps={caps} locale={locale} />
        </header>

        <section className="mb-12">
          <h2 className="mb-1 text-xs font-medium uppercase tracking-widest text-[var(--ink)]/50">
            {t("franchise.readingOrders")}
          </h2>
          <p className="mb-4 text-sm text-[var(--ink)]/60">
            {t("franchise.walkBlurb")}
            {curated.length > 0 && ` ${t("franchise.curatedAlternatives")}`}
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

          <CommunityOrders franchiseSlug={slug} workTitles={workTitles} />
        </section>

        <section>
          <ProgressProvider>
            <ListProgress workIds={b.works.map((w) => w.id)} />
            <div className="pt-6">
              <River
                layers={layers}
                series={series}
                covers={covers}
                workTitles={workTitles}
                signature={signatureOf(b.theme)}
                localTitles={localTitles}
                companions={companions}
                authorNames={authorNames}
                isbns={isbns}
              />
            </div>
          </ProgressProvider>
        </section>

      </main>
    </div>
  );
}
