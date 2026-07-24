import { Prose } from "./prose";
import { Cover } from "./cover";
import { FindACopy } from "./find-a-copy";
import { ProgressControl } from "./progress/control";
import { SpoilerGate } from "./spoilers/spoiler-gate";
import { signatureLine, type SignatureKind } from "@/lib/theme";
import { EventAnchor, eventAnchorId } from "./event-anchor";
import { RiverEventCard } from "./river/dispatcher";
import { ChapterGate } from "./river/chapter-gate";
import { ageAt, formatAge } from "@/lib/age";
import type { RiverLayer, SeriesEntry } from "@/lib/content/river";

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
  authorNames,
  isbns,
  localTitles,
  orderPositions,
  enteringLabel = "entering",
  permalinkLabel = "Link to this event",
  forthcomingLabel = "Forthcoming",
  authorBorn,
  agedTemplate = "aged {age}",
}: {
  layers: RiverLayer[];
  series: Map<string, SeriesEntry>;
  covers: Record<string, string>;
  workTitles: Record<string, string>;
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
  /** Localised label above an era plate title ("entering" / "a entrar em"). */
  enteringLabel?: string;
  /** Localised accessible name for an event's permalink. */
  permalinkLabel?: string;
  /** Localised badge for a work that is announced but not published yet. */
  forthcomingLabel?: string;
  /** Birth date per author id, for showing their age at a life event. */
  authorBorn?: Map<string, string | number>;
  /** Localised "aged {age}" template. */
  agedTemplate?: string;
}) {
  // A life event carries the age its author was at the time; nothing else does.
  // Franchise and global events belong to the world, not to a lifespan.
  const ageFor = (e: { scope?: string; authorId?: string; date?: string | number }) => {
    if (e.scope !== "author-life" || !e.authorId) return null;
    const born = authorBorn?.get(e.authorId);
    return born ? formatAge(ageAt(born, e.date)) : null;
  };

  // Illustrated events alternate sides down the page. The counter has to run
  // across layers, not within one: most years carry a single event, so a
  // per-layer index would leave every card on the same side and the sequence
  // would read as a column of identical rows - the monotony this is here to
  // break.
  //
  // Ruptures are in the walk now. They used to be excluded, because a rupture
  // was a centred band with no side to alternate; as a card it has one, and
  // leaving it out both froze it on the right and put a phase break in the
  // alternation every time one appeared.
  const sideOf = new Map<string, "left" | "right">();
  let illustratedSoFar = 0;
  for (const l of layers) {
    for (const e of [...l.ruptures, ...l.texture]) {
      if (e.images?.sketch) {
        sideOf.set(e.id, illustratedSoFar % 2 === 0 ? "right" : "left");
        illustratedSoFar += 1;
      }
    }
  }

  return (
    // The rail: one continuous line down the whole river, with a node per
    // illustrated moment (drawn by RiverEventCard) and a short rule reaching
    // across to each card. Previously the only vertical lines were per-section
    // - a signature stripe inside each year and a border on the seam list - so
    // the page had several short rules at different offsets and no single
    // through-line. Time is the spine of this view; it should look like one.
    //
    // Desktop only. On a phone the column is the full width and a rail would
    // eat 10% of it to say something the vertical order already says.
    <div className="relative lg:pl-8">
      {/* The rail wears the wing's signature element. That element is a design-law
          feature (one per wing: beam, thread or rule), and it used to be drawn as
          a short stripe inside every year's works section - so a wing's signature
          appeared a dozen times as disconnected fragments, none of them long
          enough to read as the thing it names. One continuous line through the
          whole river is what a signature was always meant to be. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute left-0 top-2 bottom-2 max-lg:hidden ${signatureLine[signature]}`}
      />
      {layers.map((l) => (
        <div key={l.year}>
          {l.decadeStart && (
            <div className="relative mt-14 border-t-2 border-[var(--accent)]/70 first:mt-0">
              <span className="sticky top-16 z-10 -ml-1 inline-block rounded bg-[var(--accent)] px-2 py-0.5 font-mono text-[11px] font-semibold text-[var(--bg)] lg:top-3">
                {Math.floor(l.year / 10) * 10}s
              </span>
            </div>
          )}

          {l.eraStart && l.era && (
            // `chapter-gate`, the era-plate slot in the layout grammar
            // (LAYOUT.md) - one per era, folded in from what used to be
            // inline JSX here. See components/river/chapter-gate.tsx.
            <ChapterGate era={l.era} enteringLabel={enteringLabel} />
          )}

          {/* ruptures: the same card, at scale (see RiverEventCard) */}
          {l.ruptures.length > 0 && (
            <ul>
              {l.ruptures.map((e) => (
                <RiverEventCard
                  key={e.id}
                  event={e}
                  scale="rupture"
                  side={sideOf.get(e.id) ?? "right"}
                  year={l.year}
                  age={ageFor(e) ? agedTemplate.replace("{age}", ageFor(e)!) : null}
                  permalinkLabel={permalinkLabel}
                  boundaryTitle={workTitles[e.spoilerAfter ?? ""]}
                />
              ))}
            </ul>
          )}

          {(l.works.length > 0 || l.texture.length > 0) && (
            <section className="relative overflow-hidden border-t border-[var(--ink)]/8 py-5">
              {/* The signature stripe that used to sit here is now the river's
                  one continuous rail (above). Two vertical lines 32px apart
                  read as an indent, not as structure. */}
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
                        className="relative flex w-[calc(50%-0.375rem)] scroll-mt-20 gap-3 rounded-md border border-[var(--ink)]/10 bg-[var(--surface)] p-3 max-lg:w-full max-lg:rounded-2xl"
                      >
                        {orderPositions?.has(w.id) && (
                          // Desktop: same checklist language as the phone,
                          // in the same corner the old pill occupied - no
                          // layout shift, just the circle.
                          <span
                            aria-hidden
                            className="absolute -left-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--accent)]/60 bg-[var(--bg)] font-mono text-[11px] font-semibold text-[var(--accent)] max-lg:hidden"
                          >
                            {orderPositions.get(w.id)}
                          </span>
                        )}
                        {orderPositions?.has(w.id) && (
                          // Mobile: the order reads as a numbered checklist -
                          // the position is a real sequence, so it earns a
                          // real marker.
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center self-start rounded-full border border-[var(--accent)]/50 font-mono text-xs font-semibold text-[var(--accent)] lg:hidden">
                            {orderPositions.get(w.id)}
                          </span>
                        )}
                        <Cover
                          src={covers[w.id]}
                          title={w.title}
                          year={w.published}
                          className="h-[76px] w-[50px] max-lg:h-[104px] max-lg:w-[68px]"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="display text-[15px] font-semibold leading-tight max-lg:text-[17px]">
                            {localTitles?.[w.id] ?? w.title}
                          </h3>
                          {localTitles?.[w.id] && localTitles[w.id] !== w.title && (
                            // The original title stays visible: a reader
                            // searching or discussing needs both.
                            <p className="mt-0.5 text-[11px] italic text-[var(--muted)] max-lg:text-[13px]">
                              {w.title}
                            </p>
                          )}
                          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)] max-lg:mt-1 max-lg:text-[12px]">
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
                            {/* An announced book is in its year like any
                                other, so it needs to say plainly that it is
                                not out - otherwise the page states a
                                publication that has not happened. */}
                            {w.forthcoming && (
                              <span className="ml-2 rounded border border-[var(--accent)]/40 px-1 py-px normal-case text-[var(--accent)]">
                                {forthcomingLabel}
                              </span>
                            )}
                          </p>
                          {w.synopsis && (
                            <Prose
                              text={w.synopsis}
                              className="prose-read mt-1 line-clamp-2 block text-xs text-[var(--ink)]/65 max-lg:line-clamp-3 max-lg:text-[14px] max-lg:leading-relaxed"
                            />
                          )}
                          <ProgressControl workId={w.id} />
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
                // No border-l here any more: the river's own rail is the
                // vertical line, and a second one three pixels away read as an
                // indent rather than as structure.
                <ul className="mt-3 space-y-3 overflow-visible">
                  {l.texture.map((e) => {
                    // An illustrated event earns a card: the drawn paper needs
                    // room and its own air, and it carries the year and title
                    // as a heading rather than as a run-in. Events without art
                    // stay compact seams, so a wing with no sketches yet is
                    // unchanged rather than full of empty boxes.
                    const illustrated = Boolean(e.images?.sketch);
                    if (illustrated) {
                      return (
                        <RiverEventCard
                          key={e.id}
                          event={e}
                          side={sideOf.get(e.id) ?? "right"}
                          age={ageFor(e) ? agedTemplate.replace("{age}", ageFor(e)!) : null}
                          permalinkLabel={permalinkLabel}
                          boundaryTitle={workTitles[e.spoilerAfter ?? ""]}
                        />
                      );
                    }
                    return (
                    <li
                      key={e.id}
                      id={eventAnchorId(e.id)}
                      className="group scroll-mt-24 text-xs leading-relaxed text-[var(--ink)]/70 max-lg:text-[14px]"
                    >
                      <SpoilerGate
                        spoilerAfter={e.spoilerAfter}
                        boundaryTitle={workTitles[e.spoilerAfter ?? ""]}
                      >
                        <span className="font-medium text-[var(--ink)]">{e.title}.</span>{" "}
                        {e.description && <Prose text={e.description} className="inline" />}
                        {ageFor(e) && (
                          <span className="ml-1 font-mono text-[0.9em] text-[var(--muted)]">
                            ({agedTemplate.replace("{age}", ageFor(e)!)})
                          </span>
                        )}
                        <EventAnchor eventId={e.id} label={permalinkLabel} />
                      </SpoilerGate>
                    </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}
        </div>
      ))}
    </div>
  );
}
