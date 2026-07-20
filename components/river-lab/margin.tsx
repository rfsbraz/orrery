import { Prose } from "@/components/prose";
import { SpoilerGate } from "@/components/spoilers/spoiler-gate";
import { Cover } from "./cover";
import { groupByYear, type LabProps } from "./shared";

/**
 * CONCEPT 2 - THE MARGIN
 * An annotated critical edition. The books own a wide, generous reading
 * column - big covers, big titles, room to breathe. The world happens in the
 * margin: a narrow right-hand rail of small annotations (the texture events),
 * set beside the year they belong to, like a scholar's notes. High-impact
 * events refuse the margin: they break the page as full-bleed chapter plates.
 * Era changes are typographic part-titles, as in a printed collected edition.
 * The feeling: reading a beautiful book about the books.
 */
export function MarginConcept(props: LabProps) {
  const groups = groupByYear(props);

  return (
    <div className="space-y-0">
      {groups.map((g) => (
        <section key={g.year}>
          {g.eraStart && g.era && (
            <header className="mt-20 mb-12 border-t-2 border-[var(--accent)]/60 pt-8 first:mt-0">
              <p className="font-mono text-[11px] tracking-[0.35em] text-[var(--muted)]">
                PART · {g.era.period}
              </p>
              <h2 className="display mt-2 text-4xl font-semibold tracking-tight">{g.era.title}</h2>
              {g.era.description && (
                <Prose text={g.era.description} className="prose-read mt-3 block max-w-xl text-sm text-[var(--ink)]/65" />
              )}
            </header>
          )}

          {/* chapter plates: high-impact events break the page */}
          {g.anchors.map((e) => (
            <figure
              key={e.id}
              className="-mx-6 my-14 bg-[var(--surface)] px-6 py-12 text-center shadow-[inset_0_1px_0_var(--tw-shadow-color),inset_0_-1px_0_var(--tw-shadow-color)] shadow-[var(--accent)]/25"
            >
              <SpoilerGate spoilerAfter={e.spoilerAfter} boundaryTitle={props.workTitles[e.spoilerAfter ?? ""]}>
                <figcaption className="font-mono text-xs text-[var(--accent)]">{g.year}</figcaption>
                <p className="display mx-auto mt-2 max-w-xl text-2xl font-semibold leading-snug">
                  {e.title}
                </p>
                {e.description && (
                  <Prose text={e.description} className="prose-read mx-auto mt-3 block max-w-lg text-sm text-[var(--ink)]/70" />
                )}
              </SpoilerGate>
            </figure>
          ))}

          <div className="grid grid-cols-[1fr_200px] gap-x-10 max-md:grid-cols-1">
            {/* the reading column */}
            <div className="space-y-8 py-3">
              {g.works.map((w) => {
                const cover = props.covers[w.id];
                return (
                  <article key={w.id} className="flex gap-5">
                    <Cover src={cover} title={w.title} year={w.published} className="h-[132px] w-[88px]" />
                    <div className="min-w-0 pt-1">
                      <p className="font-mono text-[11px] text-[var(--muted)]">
                        {w.published}
                        {w.subseries && <span className="ml-2 uppercase tracking-wider">{w.subseries}</span>}
                        {w.publishedAs && <span className="ml-2 italic normal-case">as {w.publishedAs}</span>}
                      </p>
                      <h3 className="display mt-1 text-2xl font-semibold leading-tight">{w.title}</h3>
                      {w.synopsis && (
                        <Prose text={w.synopsis} className="prose-read mt-2 block max-w-md text-sm leading-relaxed text-[var(--ink)]/75" />
                      )}
                    </div>
                  </article>
                );
              })}
              {g.works.length === 0 && g.texture.length > 0 && (
                <p className="py-1 font-mono text-[11px] text-[var(--muted)]/60">{g.year} - no new book</p>
              )}
            </div>

            {/* the margin */}
            <aside className="space-y-4 border-l border-[var(--ink)]/10 pl-5 pt-4 max-md:border-l-0 max-md:pl-0">
              {g.texture.map((e) => (
                <p key={e.id} className="text-[11.5px] leading-relaxed text-[var(--ink)]/55">
                  <SpoilerGate spoilerAfter={e.spoilerAfter} boundaryTitle={props.workTitles[e.spoilerAfter ?? ""]}>
                    <span className="mr-1.5 font-mono text-[10px] text-[var(--accent)]/80">{g.year}</span>
                    <span className="font-medium text-[var(--ink)]/70">{e.title}.</span>{" "}
                    {e.description && <Prose text={e.description} className="inline" />}
                  </SpoilerGate>
                </p>
              ))}
            </aside>
          </div>
        </section>
      ))}
    </div>
  );
}
