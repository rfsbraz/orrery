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
import { RiverView } from "@/components/river-view";
import { Contribute } from "@/components/contribute";
import { FranchiseNav } from "@/components/franchise-nav";
import { ProgressProvider } from "@/components/progress/provider";
import { CommunityOrders } from "@/components/orders/community-orders";
import { OrbitalField } from "@/components/orbital-field";
import { Portrait } from "@/components/portrait";

export function generateStaticParams() {
  return listFranchiseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeSeg, slug } = await props.params;
  const locale = localeFromSegment(localeSeg === "en" ? undefined : localeSeg);
  const t = translator(locale);
  const b = getFranchise(slug, locale);
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
  const b = getFranchise(slug, locale);
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
  const authorNames = new Map(b.authors.map((a) => [a.id, a.name]));

  // Authors whose bio is worth showing here: the ones this franchise is
  // actually about, and only where the bio says something the franchise
  // description does not already say. Co-authors and collaborators reached
  // through withAuthorIds keep their own page and stay off this header.
  const bios = b.authors
    .filter((a) => a.bio && a.bio.trim() !== (b.franchise.description ?? "").trim())
    .map((a) => ({ id: a.id, name: a.name, bio: a.bio as string, born: a.born, died: a.died }));
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

        <header className="relative mt-4 mb-10 max-lg:mt-2">
          {/* Desktop inherits the phone's instrument, at header scale: the
              field behind the title's empty right side, the plate upon it.
              Both absolute, so the existing type never reflows. */}
          <div className="pointer-events-none absolute -right-6 -top-8 hidden h-[120%] w-1/2 overflow-hidden lg:block">
            <OrbitalField seed={slug} className="h-full w-full opacity-50" />
          </div>
          {(() => {
            const heroAuthor = b.authors.find((a) => a.images?.portrait);
            return heroAuthor ? (
              <Portrait
                author={heroAuthor}
                className="absolute right-0 top-0 hidden w-40 lg:block"
                plateClassName="aspect-[4/5] rounded-2xl border border-[var(--accent)]/20"
              />
            ) : null;
          })()}
          {/* Mobile hero: the author as an engraved plate over their own
              orbital field, with the numbers a reader orients by and the two
              doors they actually use. Desktop keeps the typographic header. */}
          <div className="relative -mx-6 mb-5 overflow-hidden lg:hidden">
            <OrbitalField
              seed={slug}
              className="absolute inset-0 h-full w-full opacity-80"
            />
            <div className="relative px-6 pt-4">
              {(() => {
                const heroAuthor =
                  b.authors.find((a) => a.images?.portrait) ?? b.authors[0];
                return heroAuthor ? (
                  <Portrait
                    author={heroAuthor}
                    className="mx-auto w-56"
                    plateClassName="aspect-[4/5] rounded-2xl border border-[var(--accent)]/20"
                  />
                ) : null;
              })()}
              <h1 className="display mt-4 text-4xl font-semibold leading-[1.05] tracking-tight">
                {b.franchise.name}
              </h1>
              <p className="mt-2 font-mono text-xs text-[var(--muted)]">
                {new Set(b.works.map((w) => w.subseries).filter(Boolean)).size > 0 && (
                  <>
                    {new Set(b.works.map((w) => w.subseries).filter(Boolean)).size}{" "}
                    {t("franchise.seriesCount")} ·{" "}
                  </>
                )}
                {b.works.length} {t("franchise.works")}
              </p>
              <div className="mt-4 flex gap-2.5">
                {caps.wizard && (
                  <Link
                    href={localePath(locale, `/f/${slug}/start`)}
                    className="flex-1 rounded-xl bg-[var(--accent)] px-4 py-3 text-center text-sm font-semibold text-[var(--bg)]"
                  >
                    {t("nav.whereToStart")}
                  </Link>
                )}
                <a
                  href="#walk"
                  className="flex-1 rounded-xl border border-[var(--ink)]/20 px-4 py-3 text-center text-sm font-medium text-[var(--ink)]"
                >
                  {t("franchise.readingOrders")}
                </a>
              </div>
              {b.authors.length === 1 && (
                <p className="mt-3">
                  <Link
                    href={localePath(locale, `/author/${b.authors[0].id}`)}
                    className="text-xs text-[var(--muted)] underline decoration-[var(--accent)]/40 underline-offset-2"
                  >
                    {b.authors[0].name} →
                  </Link>
                </p>
              )}
            </div>
          </div>

          <h1 className="display text-5xl font-semibold tracking-tight max-lg:hidden">{b.franchise.name}</h1>
          {b.franchise.description && (
            <Prose
              text={b.franchise.description}
              className="prose-read mt-3 block max-w-2xl text-lg text-[var(--ink)]/80"
            />
          )}
          {/* On mobile the hero already carries the counts and (for a single
              author) the author link, so this line only survives there when
              it still says something new: several authors to link. */}
          <p className={`mt-4 text-sm text-[var(--muted)]${b.authors.length === 1 ? " max-lg:hidden" : ""}`}>
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

          {/* The biography belongs on the page a reader actually lands on. The
              home page lists authors, so this IS the author page; making
              someone click through to /author/<id> to find out who they are
              buries the one thing that frames everything below it.
              Suppressed when the franchise description already carries the
              same prose, which happens on single-author wings. */}
          {bios.length > 0 && (
            <div className="mt-6 max-w-2xl border-l-2 border-[var(--accent)]/25 pl-4">
              {bios.map(({ id, name, bio, born, died }) => (
                <div key={id} className="mt-3 first:mt-0">
                  {bios.length > 1 && (
                    <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--accent)]/80">
                      {name}
                    </p>
                  )}
                  {(born || died) && (
                    <p className="font-mono text-xs text-[var(--muted)]">
                      {String(born ?? "").slice(0, 4)}
                      {died ? ` - ${String(died).slice(0, 4)}` : born ? " -" : ""}
                    </p>
                  )}
                  <Prose
                    text={bio}
                    className="prose-read mt-1 block text-[15px] leading-relaxed text-[var(--ink)]/75"
                  />
                </div>
              ))}
            </div>
          )}
          <FranchiseNav slug={slug} caps={caps} locale={locale} />
        </header>

        <section id="walk">
          <ProgressProvider>
            <RiverView
              layers={layers}
              orders={b.orders}
              series={series}
              covers={covers}
              workTitles={workTitles}
              localTitles={localTitles}
              companions={companions}
              authorNames={authorNames}
              isbns={isbns}
              signature={signatureOf(b.theme)}
              allWorkIds={b.works.map((w) => w.id)}
              enteringLabel={t("franchise.entering")}
            />
          </ProgressProvider>
          <CommunityOrders franchiseSlug={slug} workTitles={workTitles} />
        </section>

        <Contribute locale={locale} franchiseName={b.franchise.name} />

      </main>
    </div>
  );
}
