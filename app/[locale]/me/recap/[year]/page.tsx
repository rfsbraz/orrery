import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { localeFromSegment, localePath } from "@/lib/i18n/config";
import { getAllBundles } from "@/lib/content";
import { getCurrentUser } from "@/lib/supabase/server";
import { getMyProgress } from "@/lib/supabase/progress";
import { buildYearRecap, recapHeadline } from "@/lib/progress/recap";
import { overlayCaption } from "@/lib/progress/overlay";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Year in reading | Orrery" };

export default async function RecapPage(props: { params: Promise<{ locale: string; year: string }> }) {
  const { locale: localeSeg, year: raw } = await props.params;
  const locale = localeFromSegment(localeSeg === "en" ? undefined : localeSeg);
  const year = Number(raw);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) notFound();

  const user = await getCurrentUser();
  if (!user) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="display text-2xl font-semibold text-neutral-100">Year in reading</h1>
        <p className="mt-2 text-neutral-400">Sign in to see your year in context.</p>
        <Link
          href={localePath(locale, "/login")}
          className="mt-6 inline-block rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white"
        >
          Sign in
        </Link>
      </main>
    );
  }

  const recap = buildYearRecap(year, getAllBundles(), await getMyProgress());

  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <Link href={localePath(locale, "/me")} className="text-xs text-neutral-500 hover:text-neutral-300">
        ← Your shelf
      </Link>

      <header className="mt-4 mb-10">
        <p className="font-mono text-xs tracking-[0.3em] text-neutral-500">{year}</p>
        <h1 className="display mt-1 text-4xl font-semibold text-neutral-100">
          Your year in reading
        </h1>
        <p className="mt-3 text-lg text-neutral-300">{recapHeadline(recap)}</p>
        <div className="mt-3 flex gap-3 text-xs">
          {[year - 1, year + 1].map((y) => (
            <Link key={y} href={`/me/recap/${y}`} className="text-neutral-500 underline hover:text-neutral-300">
              {y}
            </Link>
          ))}
        </div>
      </header>

      {recap.books.length > 0 && (
        <>
          <section className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="books" value={String(recap.books.length)} />
            <Stat
              label="franchises"
              value={String(recap.franchisesTouched.length)}
            />
            {recap.avgGapYears !== null && (
              <Stat label="avg years behind" value={String(recap.avgGapYears)} />
            )}
            {recap.publicationSpan && (
              <Stat
                label="writing years crossed"
                value={String(recap.publicationSpan.to - recap.publicationSpan.from + 1)}
              />
            )}
          </section>

          {(recap.longestGap || recap.punctualReads.length > 0) && (
            <section className="mb-10 space-y-2 text-sm text-neutral-300">
              {recap.longestGap && recap.longestGap.gapYears !== null && recap.longestGap.gapYears > 0 && (
                <p>
                  Longest wait closed:{" "}
                  <span className="font-medium text-neutral-100">
                    {recap.longestGap.work.title}
                  </span>{" "}
                  - read {recap.longestGap.gapYears} years after it published.
                </p>
              )}
              {recap.punctualReads.length > 0 && (
                <p>
                  Read close to publication:{" "}
                  {recap.punctualReads.map((b, i) => (
                    <span key={b.work.id} className="font-medium text-neutral-100">
                      {i > 0 && ", "}
                      {b.work.title}
                    </span>
                  ))}
                  .
                </p>
              )}
              {recap.erasVisited.length > 0 && (
                <p>
                  Eras visited:{" "}
                  {recap.erasVisited.map((e, i) => (
                    <span key={`${e.franchiseName}-${e.eraTitle}`}>
                      {i > 0 && " · "}
                      {e.eraTitle}{" "}
                      <span className="text-neutral-500">({e.franchiseName})</span>
                    </span>
                  ))}
                </p>
              )}
            </section>
          )}

          <section>
            <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-neutral-500">
              The books, oldest writing first
            </h2>
            <ol className="space-y-3">
              {recap.books.map((b) => (
                <li
                  key={b.work.id}
                  className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4"
                >
                  <div className="flex flex-wrap items-baseline gap-x-2.5">
                    <span className="font-mono text-xs text-neutral-500">
                      {b.work.published}
                    </span>
                    <span className="display text-base font-semibold text-neutral-100">
                      {b.work.title}
                    </span>
                    <span className="text-xs text-neutral-500">{b.franchiseName}</span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-400">
                    {overlayCaption({
                      work: b.work,
                      publishedYear: b.work.published,
                      readYear: b.readYear,
                      gapYears: b.gapYears,
                    })}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4 text-center">
      <p className="display text-3xl font-semibold text-neutral-100">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-widest text-neutral-500">{label}</p>
    </div>
  );
}
