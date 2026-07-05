import Link from "next/link";
import type { FranchiseBundle } from "@/lib/content/types";
import type { ProgressEntry } from "@/lib/progress/types";
import { buildPersonalOverlay, overlayCaption } from "@/lib/progress/overlay";
import { buildContext, evaluate } from "@/lib/achievements/evaluate";
import { ACHIEVEMENTS } from "@/lib/achievements/defs";

/**
 * The reader's shelf: stats, earned badges, the read-vs-written personal
 * overlay, and the "read, in context" list. Rendered for both the owner (/me)
 * and public visitors (/u/[handle]) - `owner` only changes the empty-state copy.
 */
export function Shelf({
  progress,
  bundles,
  owner,
}: {
  progress: ProgressEntry[];
  bundles: FranchiseBundle[];
  owner: boolean;
}) {
  const allWorks = bundles.flatMap((b) => b.works);
  const overlay = buildPersonalOverlay(allWorks, progress);
  const earnedIds = new Set(evaluate(ACHIEVEMENTS, buildContext(bundles, progress)));
  const reading = progress.filter((p) => p.status === "reading");
  const who = owner ? "you" : "they";
  const You = owner ? "You" : "They";

  return (
    <>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat n={overlay.readCount} label="read" />
        <Stat n={reading.length} label="reading" />
        <Stat n={earnedIds.size} label="badges" />
      </div>

      {overlay.datedCount > 0 && (
        <p className="mt-6 text-neutral-400">
          On average {who} read a book{" "}
          <span className="font-semibold text-neutral-100">{overlay.avgGapYears}</span> years after it
          was published.
          {overlay.latestGap && (
            <>
              {" "}
              {You === "You" ? "Your" : "Their"} longest wait:{" "}
              <span className="text-neutral-200">{overlay.latestGap.work.title}</span> —{" "}
              {overlayCaption(overlay.latestGap)}.
            </>
          )}
        </p>
      )}

      {earnedIds.size > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-neutral-500">Badges</h2>
          <div className="flex flex-wrap gap-3">
            {ACHIEVEMENTS.filter((a) => earnedIds.has(a.id)).map((a) => (
              <div
                key={a.id}
                title={a.description}
                className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-2"
              >
                <span className="text-lg">{a.icon}</span>
                <span className="text-sm font-medium text-neutral-200">{a.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-neutral-500">
          Read, in context
        </h2>
        {overlay.items.length === 0 ? (
          <p className="text-neutral-500">
            {owner ? (
              <>
                Nothing yet. Open a{" "}
                <Link href="/" className="underline">
                  franchise
                </Link>{" "}
                and mark a book read.
              </>
            ) : (
              "No reading logged yet."
            )}
          </p>
        ) : (
          <ol className="space-y-2">
            {overlay.items.map((i) => (
              <li
                key={i.work.id}
                className="flex items-baseline justify-between gap-4 border-b border-neutral-900 py-2"
              >
                <span className="text-neutral-200">{i.work.title}</span>
                <span className="shrink-0 text-sm text-neutral-500">{overlayCaption(i)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 text-center">
      <div className="display text-3xl font-semibold text-neutral-100">{n}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-neutral-500">{label}</div>
    </div>
  );
}
