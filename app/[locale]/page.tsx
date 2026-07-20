import Link from "next/link";
import { Contribute } from "@/components/contribute";
import type { Metadata } from "next";
import { localeFromSegment, localePath } from "@/lib/i18n/config";
import { translator } from "@/lib/i18n/messages";
import { listAuthorEntries } from "@/lib/content/authors";
import { stripRefs } from "@/lib/content/refs";

export const metadata: Metadata = {
  title: "Orrery - reading journeys in context",
  description:
    "Follow an author or franchise through its reading orders on a timeline of the life, world, and cultural events that shaped each book.",
};

export default async function Home(props: { params: Promise<{ locale: string }> }) {
  const { locale: localeSeg } = await props.params;
  const locale = localeFromSegment(localeSeg === "en" ? undefined : localeSeg);
  const t = translator(locale);
  const authors = listAuthorEntries();
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-14">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-neutral-500">Orrery</p>
        <h1 className="display text-5xl font-semibold tracking-tight text-neutral-100 sm:text-6xl">
          {t("home.tagline")}
        </h1>
        <p className="prose-read mt-5 max-w-2xl text-lg text-neutral-400">
          {t("home.lede")}
        </p>
      </header>

      <section>
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            {t("home.authors")}
          </h2>
          <Link
            href={localePath(locale, "/hall")}
            className="text-xs text-neutral-400 underline decoration-neutral-700 underline-offset-2 hover:text-neutral-100"
          >
            {t("home.hallLink")}
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {authors.map((entry) => (
            <Link
              key={entry.author.id}
              href={localePath(locale, entry.href)}
              className="group rounded-lg border border-neutral-800 bg-neutral-900/40 p-5 transition-colors hover:border-neutral-600"
            >
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
            </Link>
          ))}
          {authors.length === 0 && <p className="text-neutral-500">{t("home.empty")}</p>}
        </div>
      </section>

      <Contribute locale={locale} compact />
    </main>
  );
}
