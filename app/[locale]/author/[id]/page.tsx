import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import { localeFromSegment, localePath } from "@/lib/i18n/config";
import { translator } from "@/lib/i18n/messages";
import { getAuthor, listFranchises, getAllBundles, creditedAppearances } from "@/lib/content";
import { AboutTheAuthorBody } from "@/components/about-the-author";
import { Prose } from "@/components/prose";

/**
 * Two kinds of author need two different pages.
 *
 * **An author who owns a wing redirects to it.** A wing IS an author: the
 * biography, dates and pen names live on the wing itself, and the life events
 * are woven into its timeline in the years they happened. A separate page
 * repeated both and split one subject across two URLs.
 *
 * **A co-author gets a real page here.** They own no wing, and the wing that
 * carries the book they co-wrote deliberately keeps them off its header, so
 * redirecting used to land them somewhere that never mentions them. This is
 * where they exist.
 *
 * That page is allowed to be nearly empty. A name, dates and the shelves they
 * appear on is a truthful page for someone nobody has researched yet, and its
 * emptiness is what makes the missing work visible. Their life events render
 * HERE, unlike a wing owner's, because this is their only home.
 */

function authorIds(): string[] {
  const dir = path.join(process.cwd(), "orrery-content", "content", "authors");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".yaml"))
    .map((f) => f.replace(/\.yaml$/, ""));
}

export function generateStaticParams() {
  return authorIds().map((id) => ({ id }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  // These are real destinations now, so they need their own title: without it
  // every author page shares the site title in the tab, in search results and
  // in a shared link.
  const { locale: localeSeg, id } = await props.params;
  const locale = localeFromSegment(localeSeg === "en" ? undefined : localeSeg);
  const author = getAuthor(id, locale);
  if (!author) return {};
  return {
    title: author.name,
    description: author.bio ? author.bio.replace(/\[\[[^|\]]*\|?([^\]]*)\]\]/g, "$1").slice(0, 155) : undefined,
  };
}

/** The wing this author OWNS, or null if they have only ever co-written. */
function ownWing(id: string): string | null {
  const own = listFranchises().find((f) => (f.authorIds ?? []).includes(id));
  return own ? own.id : null;
}

export default async function AuthorPage(props: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: localeSeg, id } = await props.params;
  const locale = localeFromSegment(localeSeg === "en" ? undefined : localeSeg);
  const author = getAuthor(id, locale);
  if (!author) notFound();

  const owned = ownWing(id);
  if (owned) redirect(localePath(locale, `/f/${owned}`));

  const t = translator(locale);
  // Every work this person is named on, and the wing whose shelf carries it.
  const appearances = creditedAppearances([id], getAllBundles(locale)).map((a) => ({
    work: a.work,
    slug: a.franchiseId,
    wing: a.franchiseName,
  }));

  const life = [...(author.lifeEvents ?? [])].sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="display text-3xl font-semibold tracking-tight">{author.name}</h1>

      <div className="mt-4">
        <AboutTheAuthorBody
          bios={[
            {
              id: author.id,
              name: author.name,
              bio: author.bio ?? "",
              born: author.born,
              died: author.died,
              pseudonyms: author.pseudonyms,
            },
          ]}
          alsoWroteAs={(name) => t("author.alsoWroteAs", { name })}
          agedAtDeath={(age) => t("author.aged", { age })}
          agedTemplate={t("author.aged", { age: "{age}" })}
        />
      </div>

      {life.length > 0 && (
        // A wing owner's life events belong in their timeline, in their years.
        // A co-author has no timeline, so they are listed here or nowhere.
        <section className="mt-10 border-t border-[var(--ink)]/10 pt-8">
          <ul className="space-y-5">
            {life.map((e) => (
              <li key={e.id} className="text-sm">
                <span className="font-mono text-xs text-[var(--accent)]">
                  {String(e.date).slice(0, 4)}
                </span>
                <p className="display mt-0.5 text-base font-semibold">{e.title}</p>
                {e.description && (
                  <Prose
                    text={e.description}
                    className="prose-read mt-1 block text-[var(--ink)]/65"
                  />
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {appearances.length > 0 && (
        <section className="mt-10 border-t border-[var(--ink)]/10 pt-8">
          <ul className="space-y-2 text-sm">
            {appearances.map(({ work, slug, wing }) => (
              <li key={work.id}>
                <Link
                  href={localePath(locale, `/f/${slug}#w-${work.id.split("/").pop()}`)}
                  className="text-[var(--ink)]/85 underline-offset-2 hover:underline"
                >
                  {work.title}
                </Link>
                <span className="text-[var(--muted)]">
                  {" "}
                  · {work.published} · {wing}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
