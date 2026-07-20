import Link from "next/link";
import type { Metadata } from "next";
import { localeFromSegment, localePath } from "@/lib/i18n/config";
import { translator } from "@/lib/i18n/messages";
import { getAllBundles } from "@/lib/content";
import { buildHall } from "@/lib/content/hall";
import { Prose } from "@/components/prose";

export const metadata: Metadata = {
  title: "The Hall - every author, one timeline | Orrery",
  description:
    "One timeline across every franchise: what each author was writing, year by year, while the same world happened to all of them.",
};

/**
 * The cross-franchise hall. One year, every wing: "In 1987: King writes
 * Misery, Pratchett writes Mort." Decade rail on top for jumping; pure
 * document flow underneath. Grows richer with every franchise added and
 * degrades gracefully to a single wing.
 */
export default async function HallPage(props: { params: Promise<{ locale: string }> }) {
  const { locale: localeSeg } = await props.params;
  const locale = localeFromSegment(localeSeg === "en" ? undefined : localeSeg);
  const t = translator(locale);
  const hall = buildHall(getAllBundles(locale));

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Link href={localePath(locale, "/")} className="text-xs text-neutral-500 hover:text-neutral-300">
        ← Orrery
      </Link>
      <header className="mt-4 mb-10">
        <h1 className="display text-5xl font-semibold tracking-tight text-neutral-100">
          {t("hall.title")}
        </h1>
        <p className="prose-read mt-4 max-w-2xl text-neutral-400">
          {t("hall.lede")}
        </p>
        {hall.franchiseNames.length > 0 && (
          <p className="mt-3 text-xs uppercase tracking-widest text-neutral-500">
            {hall.franchiseNames.join(" · ")}
          </p>
        )}
      </header>

      {/* decade rail */}
      <nav
        aria-label={t("hall.decades")}
        className="sticky top-0 z-10 -mx-6 mb-10 flex flex-wrap gap-1.5 border-b border-neutral-800 bg-neutral-950/90 px-6 py-3 backdrop-blur"
      >
        {hall.decades.map((d) => (
          <a
            key={d.anchor}
            href={`#${d.anchor}`}
            className="rounded-full border border-neutral-800 px-2.5 py-0.5 font-mono text-xs text-neutral-400 hover:border-neutral-500 hover:text-neutral-100"
          >
            {d.label}
          </a>
        ))}
      </nav>

      <div className="space-y-14">
        {hall.decades.map((d) => (
          <section key={d.anchor} id={d.anchor} className="scroll-mt-16">
            <h2 className="display mb-6 text-2xl font-semibold text-neutral-200">{d.label}</h2>
            <ol className="space-y-6">
              {d.years.map((y) => (
                <li key={y.year} className="grid grid-cols-[64px_1fr] gap-4">
                  <span className="pt-0.5 font-mono text-sm text-neutral-500">{y.year}</span>
                  <div className="space-y-2.5">
                    {y.events.map((e) => (
                      <p key={e.id} className="text-xs text-neutral-500">
                        <span
                          className={
                            e.impact === "high" ? "font-medium text-neutral-300" : undefined
                          }
                        >
                          {e.title}.
                        </span>{" "}
                        {e.impact === "high" && e.description && (
                          <Prose text={e.description} className="inline" />
                        )}
                      </p>
                    ))}
                    {y.entries.map((entry) => (
                      <p key={entry.franchiseId} className="text-sm leading-relaxed">
                        <Link
                          href={localePath(locale, `/f/${entry.franchiseId}`)}
                          className="mr-2 rounded bg-neutral-800/80 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-300 hover:bg-neutral-700"
                        >
                          {entry.franchiseName}
                        </Link>
                        {entry.works.map((w, i) => (
                          <span key={w.id} className="text-neutral-200">
                            {i > 0 && <span className="text-neutral-500"> · </span>}
                            <Link
                              href={localePath(locale, `/f/${entry.franchiseId}#w-${w.id.split("/").pop()}`)}
                              className="hover:underline"
                            >
                              {w.title}
                            </Link>
                          </span>
                        ))}
                      </p>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </main>
  );
}
