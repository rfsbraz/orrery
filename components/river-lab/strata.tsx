import { Prose } from "@/components/prose";
import { SpoilerGate } from "@/components/spoilers/spoiler-gate";
import { Cover } from "./cover";
import { groupByYear, type LabProps } from "./shared";

/**
 * CONCEPT 3 - THE STRATA
 * Time as sediment: the page is a core sample and you scroll down through
 * it. Every year is a full-width layer; a ghosted year numeral sits huge
 * behind each layer's content; decades cut heavy rules with a sticky decade
 * marker riding the left edge. Works stack as cover-led cards inside their
 * layer; texture events are thin interbedded seams. High-impact events are
 * ruptures: full-bleed inverted bands that break the stratigraphy the way
 * the event broke the life. The feeling: depth - how far down you've read.
 */
export function StrataConcept(props: LabProps) {
  const groups = groupByYear(props);

  return (
    <div>
      {groups.map((g) => (
        <div key={g.year}>
          {g.decadeStart && (
            <div className="relative mt-14 border-t-2 border-[var(--accent)]/70 first:mt-0">
              <span className="sticky top-3 z-10 -ml-1 inline-block rounded bg-[var(--accent)] px-2 py-0.5 font-mono text-[11px] font-semibold text-[var(--bg)]">
                {Math.floor(g.year / 10) * 10}s
              </span>
            </div>
          )}

          {g.eraStart && g.era && (
            <p className="mt-6 mb-2 text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]/90">
              {g.era.title} <span className="text-[var(--muted)]">· {g.era.period}</span>
            </p>
          )}

          {/* ruptures: full-bleed inverted bands */}
          {g.anchors.map((e) => (
            <div key={e.id} className="-mx-6 my-8 bg-[var(--ink)] px-6 py-10 text-[var(--bg)]">
              <SpoilerGate spoilerAfter={e.spoilerAfter} boundaryTitle={props.workTitles[e.spoilerAfter ?? ""]}>
                <p className="font-mono text-xs text-[var(--accent)]">{g.year} · rupture</p>
                <p className="display mt-1.5 max-w-2xl text-2xl font-semibold leading-snug">
                  {e.title}
                </p>
                {e.description && (
                  <Prose text={e.description} className="prose-read mt-2 block max-w-xl text-sm opacity-75" />
                )}
              </SpoilerGate>
            </div>
          ))}

          {(g.works.length > 0 || g.texture.length > 0) && (
            <section className="relative overflow-hidden border-t border-[var(--ink)]/8 py-5">
              {/* ghosted year numeral behind the layer */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-2 -top-4 select-none font-mono text-[92px] font-bold leading-none text-[var(--ink)]/[0.05]"
              >
                {g.year}
              </span>

              <p className="mb-3 font-mono text-xs text-[var(--muted)]">{g.year}</p>

              {g.works.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {g.works.map((w) => {
                    const cover = props.covers[w.id];
                    return (
                      <article
                        key={w.id}
                        className="flex w-[calc(50%-0.375rem)] gap-3 rounded-md border border-[var(--ink)]/10 bg-[var(--surface)] p-3 max-md:w-full"
                      >
                        <Cover src={cover} title={w.title} year={w.published} className="h-[76px] w-[50px]" />
                        <div className="min-w-0">
                          <h3 className="display text-[15px] font-semibold leading-tight">{w.title}</h3>
                          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                            {w.subseries ?? (w.publishedAs ? `as ${w.publishedAs}` : "")}
                          </p>
                          {w.synopsis && (
                            <Prose text={w.synopsis} className="prose-read mt-1 line-clamp-2 block text-xs text-[var(--ink)]/65" />
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {g.texture.length > 0 && (
                <ul className="mt-3 space-y-1 border-l-2 border-[var(--ink)]/15 pl-3">
                  {g.texture.map((e) => (
                    <li key={e.id} className="text-xs leading-relaxed text-[var(--ink)]/55">
                      <SpoilerGate spoilerAfter={e.spoilerAfter} boundaryTitle={props.workTitles[e.spoilerAfter ?? ""]}>
                        <span className="font-medium text-[var(--ink)]/70">{e.title}.</span>{" "}
                        {e.description && <Prose text={e.description} className="inline" />}
                      </SpoilerGate>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      ))}
    </div>
  );
}
