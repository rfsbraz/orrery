import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { localeFromSegment, localePath } from "@/lib/i18n/config";
import { translator } from "@/lib/i18n/messages";
import { getFranchise, listFranchiseSlugs, getAllBundles, creditedAppearances, getAuthor } from "@/lib/content";
import { capabilities } from "@/lib/content/capabilities";
import { coverFor, freeReadUrl, pickEdition } from "@/lib/content/editions";
import { WorkTitlesProvider } from "@/components/i18n/provider";
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
import { AboutTheAuthor } from "@/components/about-the-author";

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
  // Covers resolve from curated editions or OpenLibrary IDs; buy-ISBNs only
  // from curated editions (the editions capability). Text-first when neither.
  const isbns: Record<string, string | undefined> = {};
  const readUrls: Record<string, string | null | undefined> = {};
  const layers = buildRiver(b);
  const series = subseriesEntries(b.works);
  const covers: Record<string, string> = {};
  const localTitles: Record<string, string> = {};
  for (const w of b.works) {
    const edition = caps.editions ? pickEdition(w.id, b.editions, undefined, locale) : null;
    const cover = coverFor(w, edition);
    if (cover) covers[w.id] = cover;
    if (edition?.isbn13) isbns[w.id] = edition.isbn13;
    // A free full text is looked up independently of the picked buy-edition:
    // the best edition to purchase and the best edition to read for free are
    // not necessarily the same one.
    if (caps.editions) {
      const readUrl = freeReadUrl(w.id, b.editions, locale);
      if (readUrl) readUrls[w.id] = readUrl;
    }
    // A published title in the reader's language (never an invented one).
    if (edition?.title && edition.language === locale) localTitles[w.id] = edition.title;
  }
  const authorNames = new Map(b.authors.map((a) => [a.id, a.name]));
  // A co-author reached via withAuthorIds is rarely one of THIS wing's own
  // authors (b.authors) - they're credited on one book, not the wing's
  // throughline - so their name has to be resolved from the global registry
  // the same way a bare id would be. Built once, over the union of every
  // work's withAuthorIds, rather than a lookup per card.
  const coAuthorIds = new Set(b.works.flatMap((w) => w.withAuthorIds ?? []));
  for (const id of coAuthorIds) {
    if (!authorNames.has(id)) {
      const a = getAuthor(id, locale);
      if (a) authorNames.set(id, a.name);
    }
  }
  // Every id in authorNames gets a link to its own page - `/author/<id>`
  // redirects straight to a wing-owner's own wing (app/[locale]/author/[id]/
  // page.tsx), so clicking a co-author's name here already lands wherever
  // their own work actually lives, with no branching needed at this call site.
  const authorHrefs = new Map(
    [...authorNames.keys()].map((id) => [id, localePath(locale, `/author/${id}`)])
  );

  // Authors whose bio is worth showing here: the ones this franchise is
  // actually about, and only where the bio says something the franchise
  // description does not already say. Co-authors and collaborators reached
  // through withAuthorIds keep their own page and stay off this header.
  const bios = b.authors
    .filter((a) => a.bio && a.bio.trim() !== (b.franchise.description ?? "").trim())
    .map((a) => ({
      id: a.id,
      name: a.name,
      bio: a.bio as string,
      born: a.born,
      died: a.died,
      pseudonyms: a.pseudonyms,
    }));
  const workTitles = Object.fromEntries(b.works.map((w) => [w.id, w.title]));

  // Where ELSE this wing's own author(s) turn up: a work co-written with
  // someone else lives on exactly one wing's shelf (franchise-research's own
  // scoping rule), so a collaboration credited via withAuthorIds never
  // duplicates onto this wing - it stays visible from here as a link back to
  // wherever it actually lives, the same "who else did I write with" query
  // the standalone co-author page already runs, just from the wing-owner
  // side of it for once (orrery#178).
  const guestAppearances = creditedAppearances(
    b.authors.map((a) => a.id),
    getAllBundles(locale),
    slug
  );

  return (
    <WorkTitlesProvider titles={workTitles}>
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
            {b.authors.map((a) => a.name).join(", ")}
          </p>

          <AboutTheAuthor
            bios={bios}
            label={t("author.about")}
            alsoWroteAs={(name) => t("author.alsoWroteAs", { name })}
            agedAtDeath={(age) => t("author.aged", { age })}
            agedTemplate={t("author.aged", { age: "{age}" })}
          />

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
              authorNames={authorNames}
              authorHrefs={authorHrefs}
              withCoAuthorPrefix={t("work.withCoAuthorPrefix")}
              isbns={isbns}
              readUrls={readUrls}
              signature={signatureOf(b.theme)}
              allWorkIds={b.works.map((w) => w.id)}
              enteringLabel={t("franchise.entering")}
              permalinkLabel={t("event.permalink")}
              forthcomingLabel={t("work.forthcoming")}
              formatLabels={{
                novella: t("work.format.novella"),
                "short-story": t("work.format.short-story"),
                "short-story-collection": t("work.format.short-story-collection"),
                poem: t("work.format.poem"),
                "poetry-collection": t("work.format.poetry-collection"),
                essay: t("work.format.essay"),
                "essay-collection": t("work.format.essay-collection"),
                memoir: t("work.format.memoir"),
                nonfiction: t("work.format.nonfiction"),
                reference: t("work.format.reference"),
                screenplay: t("work.format.screenplay"),
                play: t("work.format.play"),
                "tv-series": t("work.format.tv-series"),
                "graphic-novel": t("work.format.graphic-novel"),
                "picture-book": t("work.format.picture-book"),
                anthology: t("work.format.anthology"),
              }}
              authorRoleLabels={{
                contributor: t("work.authorRole.contributor"),
                editor: t("work.authorRole.editor"),
              }}
              contributionTitleTemplate={t("work.contributionTitle", { title: "{title}" })}
              publishedAsTemplate={t("work.publishedAs", { name: "{name}" })}
              authorBorn={new Map(b.authors.filter((a) => a.born).map((a) => [a.id, a.born!]))}
              agedTemplate={t("event.aged", { age: "{age}" })}
              elapsedTemplate={t("event.elapsed", { n: "{n}" })}
            />
          </ProgressProvider>
          <CommunityOrders franchiseSlug={slug} workTitles={workTitles} />
        </section>

        {guestAppearances.length > 0 && (
          <section className="mt-10 border-t border-[var(--ink)]/10 pt-8">
            <h2 className="display text-lg font-semibold">{t("franchise.alsoAppearsIn")}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {guestAppearances.map(({ work, franchiseId, franchiseName }) => (
                <li key={work.id}>
                  <Link
                    href={localePath(locale, `/f/${franchiseId}#w-${work.id.split("/").pop()}`)}
                    className="text-[var(--ink)]/85 underline-offset-2 hover:underline"
                  >
                    {work.title}
                  </Link>
                  <span className="text-[var(--muted)]">
                    {" "}
                    · {work.published} · {franchiseName}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <Contribute locale={locale} franchiseName={b.franchise.name} />

      </main>
    </div>
    </WorkTitlesProvider>
  );
}
