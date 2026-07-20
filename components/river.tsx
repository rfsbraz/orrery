import { Prose } from "./prose";
import { Cover } from "./cover";
import { FindACopy } from "./find-a-copy";
import { ProgressControl } from "./progress/control";
import { CompanionPanel } from "./companion/panel";
import { SpoilerGate } from "./spoilers/spoiler-gate";
import { signatureLine, type SignatureKind } from "@/lib/theme";
import type { RiverLayer, SeriesEntry } from "@/lib/content/river";
import type { CompanionData } from "@/lib/progress/companion";

/**
 * The River: the atmospheric context browse (CONCEPT §5 - "the soul of the
 * product"), rendered as strata. Time is sediment and you descend through it:
 * every year is a layer with its ghosted numeral, decades cut heavy rules with
 * a sticky marker, works sit as cover-led cards inside their layer, low-impact
 * events are thin interbedded seams, and high-impact events are RUPTURES -
 * full-bleed inverted bands that break the stratigraphy the way the event
 * broke the life. Depth is the point: you feel how far down you have read.
 *
 * Pure document flow - no scroll-jacking, nothing for reduced-motion to undo.
 */
export function River({
  layers,
  series,
  covers,
  workTitles,
  signature = "thread",
  companions,
  authorNames,
  isbns,
  localTitles,
  orderPositions,
}: {
  layers: RiverLayer[];
  series: Map<string, SeriesEntry>;
  covers: Record<string, string>;
  workTitles: Record<string, string>;
  /** Per-work companion data; present only when the capability is active. */
  companions?: Record<string, CompanionData>;
  /** Author display names, for store-link queries. */
  authorNames?: Map<string, string>;
  /** Verified buy-ISBNs per work (editions capability). */
  isbns?: Record<string, string | undefined>;
  /** Published title in the reader's language, where such an edition exists. */
  localTitles?: Record<string, string>;
  /** 1-based position per work within the selected reading order. */
  orderPositions?: Map<string, number>;
  /** The franchise's signature element, from its theme.yaml. */
  signature?: SignatureKind;
}) {
  return (
    <div>
      {layers.map((l) => (
        <div key={l.year}>
          {l.decadeStart && (
            <div className="relative mt-14 border-t-2 border-[var(--accent)]/70 first:mt-0">
              <span className="sticky top-3 z-10 -ml-1 inline-block rounded bg-[var(--accent)] px-2 py-0.5 font-mono text-[11px] font-semibold text-[var(--bg)]">
                {Math.floor(l.year / 10) * 10}s
              </span>
            </div>
          )}

          {l.eraStart && l.era && (
            // The era plate: an unmistakable "you are entering a new era"
            // threshold. Full-bleed, generous air, double rule - structural
            // rather than loud, so it reads as a chapter break in the strata
            // without competing with the ruptures (which are inverted).
            <header className="-mx-6 mt-16 mb-4 border-y border-[var(--accent)]/35 bg-[var(--accent)]/[0.06] px-6 py-9 first:mt-0">
              <div className="flex items-center gap-3">
                <span aria-hidden className="h-px flex-1 bg-[var(--accent)]/30" />
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--accent)]">
                  entering
                </p>
                <span aria-hidden className="h-px flex-1 bg-[var(--accent)]/30" />
              </div>
              <h2 className="display mt-3 text-center text-3xl font-semibold tracking-tight">
                {l.era.title}
              </h2>
              <p className="mt-1 text-center font-mono text-xs text-[var(--muted)]">
                {l.era.period}
              </p>
              {l.era.themes && l.era.themes.length > 0 && (
                <p className="mt-2.5 text-center text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                  {l.era.themes.join(" · ")}
                </p>
              )}
              {l.era.description && (
                <Prose
                  text={l.era.description}
                  className="prose-read mx-auto mt-3 block max-w-xl text-center text-sm text-[var(--ink)]/70"
                />
              )}
            </header>
          )}

          {/* ruptures: full-bleed inverted bands */}
          {l.ruptures.map((e) => (
            <div key={e.id} className="-mx-6 my-8 bg-[var(--ink)] px-6 py-10 text-[var(--bg)]">
              <SpoilerGate
                spoilerAfter={e.spoilerAfter}
                boundaryTitle={workTitles[e.spoilerAfter ?? ""]}
              >
                <p className="font-mono text-xs text-[var(--accent)]">{l.year}</p>
                <p className="display mt-1.5 max-w-2xl text-2xl font-semibold leading-snug">
                  {e.title}
                </p>
                {e.description && (
                  <Prose
                    text={e.description}
                    className="prose-read mt-2 block max-w-xl text-sm opacity-75"
                  />
                )}
              </SpoilerGate>
            </div>
          ))}

          {(l.works.length > 0 || l.texture.length > 0) && (
            <section className="relative overflow-hidden border-t border-[var(--ink)]/8 py-5 pl-4">
              {/* the franchise signature threads the layers together */}
              <span
                aria-hidden
                className={`pointer-events-none absolute left-0 top-0 bottom-0 ${signatureLine[signature]}`}
              />
              {/* ghosted year numeral behind the layer */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-2 -top-4 select-none font-mono text-[92px] font-bold leading-none text-[var(--ink)]/[0.05]"
              >
                {l.year}
              </span>

              <p className="mb-3 font-mono text-xs text-[var(--muted)]">{l.year}</p>

              {l.works.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {l.works.map((w) => {
                    const entry = series.get(w.id);
                    return (
                      <article
                        key={w.id}
                        id={`w-${w.id.split("/").pop()}`}
                        className="relative flex w-[calc(50%-0.375rem)] scroll-mt-20 gap-3 rounded-md border border-[var(--ink)]/10 bg-[var(--surface)] p-3 max-md:w-full"
                      >
                        {orderPositions?.has(w.id) && (
                          <span
                            aria-hidden
                            className="absolute -left-3 -top-2 rounded-full bg-[var(--accent)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--bg)]"
                          >
                            {orderPositions.get(w.id)}
                          </span>
                        )}
                        <Cover
                          src={covers[w.id]}
                          title={w.title}
                          year={w.published}
                          className="h-[76px] w-[50px]"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="display text-[15px] font-semibold leading-tight">
                            {localTitles?.[w.id] ?? w.title}
                          </h3>
                          {localTitles?.[w.id] && localTitles[w.id] !== w.title && (
                            // The original title stays visible: a reader
                            // searching or discussing needs both.
                            <p className="mt-0.5 text-[11px] italic text-[var(--muted)]">
                              {w.title}
                            </p>
                          )}
                          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                            {entry && (
                              <span className="text-[var(--accent)]/90">
                                {entry.name} · #{entry.n} of {entry.total}
                              </span>
                            )}
                            {w.publishedAs && (
                              <span className={entry ? "ml-2 italic normal-case" : "italic normal-case"}>
                                as {w.publishedAs}
                              </span>
                            )}
                            {w.canonTier !== "core" && (
                              <span className="ml-2 text-[var(--muted)]/70">{w.canonTier}</span>
                            )}
                          </p>
                          {w.synopsis && (
                            <Prose
                              text={w.synopsis}
                              className="prose-read mt-1 line-clamp-2 block text-xs text-[var(--ink)]/65"
                            />
                          )}
                          <ProgressControl workId={w.id} />
                          {companions?.[w.id] && (
                            <CompanionPanel data={companions[w.id]} workTitles={workTitles} />
                          )}
                          <FindACopy
                            title={w.title}
                            author={authorNames?.get(w.authorIds[0])}
                            openLibraryId={w.externalIds?.openLibrary}
                            isbn13={isbns?.[w.id]}
                          />
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {l.texture.length > 0 && (
                <ul className="mt-3 space-y-1 border-l-2 border-[var(--ink)]/15 pl-3">
                  {l.texture.map((e) => (
                    <li key={e.id} className="text-xs leading-relaxed text-[var(--ink)]/55">
                      <SpoilerGate
                        spoilerAfter={e.spoilerAfter}
                        boundaryTitle={workTitles[e.spoilerAfter ?? ""]}
                      >
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
