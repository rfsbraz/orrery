import Link from "next/link";
import { Contribute } from "@/components/contribute";
import type { Metadata } from "next";
import { localeFromSegment, localePath } from "@/lib/i18n/config";
import { translator } from "@/lib/i18n/messages";
import { listAuthorEntries } from "@/lib/content/authors";
import { getAllBundles } from "@/lib/content";
import { stripRefs } from "@/lib/content/refs";
import { OrbitalField } from "@/components/orbital-field";
import { Portrait } from "@/components/portrait";
import { ProgressProvider } from "@/components/progress/provider";
import { ContinueReading, type WorkRef } from "@/components/home/continue-reading";

export const metadata: Metadata = {
  title: "Orrery - reading journeys in context",
  description:
    "Follow an author or franchise through its reading orders on a timeline of the life, world, and cultural events that shaped each book.",
};

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const { locale: localeSeg } = await props.params;
  const locale = localeFromSegment(localeSeg === "en" ? undefined : localeSeg);
  const t = translator(locale);
  const authors = listAuthorEntries(locale);

  // Everything the mobile home's personal and series strips need, computed at
  // build time. The work lookup ships compact (title/slug/name per id) so the
  // continue-reading card can resolve whatever ids progress holds.
  const bundles = getAllBundles(locale);
  const workRefs: Record<string, WorkRef> = {};
  for (const b of bundles) {
    for (const w of b.works) {
      workRefs[w.id] = { t: w.title, s: b.franchise.id, f: b.franchise.name };
    }
  }
  // The largest named threads across the catalogue - real, derived, honest.
  const series = bundles
    .flatMap((b) => {
      const counts = new Map<string, number>();
      for (const w of b.works) {
        if (w.subseries) counts.set(w.subseries, (counts.get(w.subseries) ?? 0) + 1);
      }
      return [...counts.entries()].map(([name, count]) => ({
        name,
        count,
        slug: b.franchise.id,
        franchise: b.franchise.name,
      }));
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    // max-lg:min-w-0: the body is a flex column, so without it the author
    // carousel's intrinsic width propagates through min-width:auto and forces
    // this block to its max-width on a phone.
    <main className="mx-auto w-full max-w-4xl px-6 py-16 max-lg:min-w-0 max-lg:py-8">
      <header className="mb-14 max-lg:mb-8">
        {/* Mobile masthead: the instrument itself - the orbital field behind
            the wordmark. Desktop keeps its typographic opening below. */}
        <div className="relative -mx-6 mb-2 h-44 overflow-hidden lg:hidden">
          <OrbitalField seed="orrery" className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-x-6 bottom-3">
            <p className="display text-4xl font-semibold tracking-tight text-neutral-100">
              Orrery
            </p>
            <p className="mt-1 max-w-[26ch] text-sm leading-snug text-neutral-400">
              {t("home.tagline")}
            </p>
          </div>
        </div>

        <div className="relative max-lg:hidden">
          {/* The instrument sits quietly in the header's empty right side -
              the same signature the phone leads with, at desktop restraint. */}
          <OrbitalField
            seed="orrery"
            className="absolute -right-10 -top-10 h-[130%] w-1/2 opacity-60"
          />
          <div className="relative">
            <p className="mb-3 text-sm uppercase tracking-[0.2em] text-neutral-500">Orrery</p>
            <h1 className="display text-5xl font-semibold tracking-tight text-neutral-100 sm:text-6xl">
              {t("home.tagline")}
            </h1>
            <p className="prose-read mt-5 max-w-2xl text-lg text-neutral-400">
              {t("home.lede")}
            </p>
          </div>
        </div>
      </header>

      <ProgressProvider>
        <ContinueReading works={workRefs} />
      </ProgressProvider>

      <section>
        <div className="mb-5 flex items-baseline justify-between max-lg:mb-3">
          <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            {t("home.authors")}
          </h2>
        </div>

        {/* Mobile: a shelf of engraved plates you thumb through. */}
        <div className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden">
          {authors.map((entry) => (
            <Link
              key={entry.author.id}
              href={localePath(locale, entry.href)}
              className="w-36 shrink-0 snap-start rounded-2xl border border-neutral-800 bg-neutral-900/60 p-2.5"
            >
              <Portrait
                author={entry.author}
                showCredit={false}
                className="w-full"
                plateClassName="aspect-[3/4] rounded-xl"
              />
              <p className="display mt-2.5 truncate text-[15px] font-semibold leading-tight text-neutral-100">
                {entry.author.name}
              </p>
              {entry.franchises.some((f) => f.name !== entry.author.name) ? (
                <p className="mt-0.5 truncate text-[11px] uppercase tracking-wide text-neutral-500">
                  {entry.franchises
                    .filter((f) => f.name !== entry.author.name)
                    .map((f) => f.name)
                    .join(" · ")}
                </p>
              ) : (
                <p className="mt-0.5 text-[11px] text-neutral-500">
                  {entry.franchises.length > 0 &&
                    `${bundles.find((b) => b.franchise.id === entry.franchises[0].id)?.works.length ?? ""} ${t("franchise.works")}`}
                </p>
              )}
            </Link>
          ))}
        </div>

        {/* Desktop: unchanged. */}
        <div className="hidden gap-4 lg:grid lg:grid-cols-2">
          {authors.map((entry) => (
            <Link
              key={entry.author.id}
              href={localePath(locale, entry.href)}
              className="group flex gap-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-5 transition-colors hover:border-neutral-600"
            >
              <div className="min-w-0 flex-1">
                <h3 className="display text-xl font-semibold text-neutral-100 group-hover:text-white">
                  {entry.author.name}
                </h3>
                {/* The universe is context under the name, not the headline -
                    and only when it says something the name does not. */}
                {entry.franchises.some((f) => f.name !== entry.author.name) && (
                  <p className="mt-0.5 text-xs uppercase tracking-wide text-neutral-500">
                    {entry.franchises
                      .filter((f) => f.name !== entry.author.name)
                      .map((f) => f.name)
                      .join(" · ")}
                  </p>
                )}
                {entry.franchises[0]?.description && (
                  <p className="mt-1.5 line-clamp-2 text-sm text-neutral-400">
                    {stripRefs(entry.franchises[0].description)}
                  </p>
                )}
              </div>
              {entry.author.images?.portrait && (
                <Portrait
                  author={entry.author}
                  showCredit={false}
                  className="w-14 shrink-0 self-start"
                  plateClassName="aspect-[3/4] rounded-lg"
                />
              )}
            </Link>
          ))}
        </div>
        {authors.length === 0 && <p className="text-neutral-500">{t("home.empty")}</p>}
      </section>

      {/* Mobile: the biggest named threads in the catalogue, straight from
          subseries data - a reader-recognisable door into each wing. */}
      {series.length > 0 && (
        <section className="mt-10 lg:hidden">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            {t("home.series")}
          </h2>
          <div className="flex flex-col gap-2">
            {series.map((s) => (
              <Link
                key={`${s.slug}/${s.name}`}
                href={localePath(locale, `/f/${s.slug}`)}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 px-4 py-3.5"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-medium text-neutral-100">
                    {s.name}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-neutral-500">
                    {s.franchise}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-xs text-neutral-500">
                  {s.count} {t("home.seriesBooks")}
                  <span aria-hidden className="ml-2 text-neutral-600">›</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Contribute locale={locale} compact />
    </main>
  );
}
