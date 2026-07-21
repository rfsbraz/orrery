import { redirect, notFound } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import { localeFromSegment, localePath } from "@/lib/i18n/config";
import { getAuthor, listFranchises, getAllBundles } from "@/lib/content";

/**
 * The standalone author page is gone: a wing IS an author, so the biography,
 * dates and pen names live on the wing itself, and the life events are already
 * woven into its timeline in the years they happened. A separate page repeated
 * both and split one subject across two URLs.
 *
 * The route survives as a redirect rather than a 404 because `[[author:id]]`
 * references throughout the content resolve here, and so do links people have
 * already shared. Ids are permanent; a URL built on one should be too.
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

/** The wing that best represents an author: their own, else one they wrote in. */
function wingFor(id: string): string | null {
  const own = listFranchises().find((f) => (f.authorIds ?? [])[0] === id);
  if (own) return own.id;
  // Collaborators have no wing of their own, and they are not in a franchise's
  // `authorIds` either - they are named on the individual work they co-wrote
  // (`withAuthorIds`). Send them to the shelf that actually carries it, which
  // is where a reader following [[author:neil-gaiman]] wants to land.
  for (const b of getAllBundles()) {
    if (b.works.some((w) => (w.withAuthorIds ?? []).includes(id) || w.authorIds.includes(id))) {
      return b.franchise.id;
    }
  }
  return null;
}

export default async function AuthorRedirect(props: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: localeSeg, id } = await props.params;
  const locale = localeFromSegment(localeSeg === "en" ? undefined : localeSeg);
  if (!getAuthor(id)) notFound();
  const slug = wingFor(id);
  redirect(localePath(locale, slug ? `/f/${slug}` : "/"));
}
