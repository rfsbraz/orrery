import { Prose } from "./prose";
import { Cover } from "./cover";
import { FindACopy } from "./find-a-copy";
import { ProgressControl } from "./progress/control";
import { CompanionPanel } from "./companion/panel";
import { SpoilerGate } from "./spoilers/spoiler-gate";
import { signatureLine, type SignatureKind } from "@/lib/theme";
import { EventAnchor, eventAnchorId } from "./event-anchor";
import { Sketch } from "./sketch";
import { ageAt, formatAge } from "@/lib/age";
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
  enteringLabel = "entering",
  permalinkLabel = "Link to this event",
  authorBorn,
  agedTemplate = "aged {age}",
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
  /** Localised label above an era plate title ("entering" / "a entrar em"). */
  enteringLabel?: string;
  /** Localised accessible name for an event's permalink. */
  permalinkLabel?: string;
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

  return (
    <div>
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
            // The era plate: an unmistakable "you are entering a new era"
            // threshold. Full-bleed, generous air, double rule - structural
            // rather than loud, so it reads as a chapter break in the strata
            // without competing with the ruptures (which are inverted).
            <header className="relative -mx-6 mt-16 mb-4 overflow-hidden border-y border-[var(--accent)]/35 bg-[var(--accent)]/[0.06] px-6 py-9 first:mt-0">
              {/* The era's own sketch, behind the plate. Masked to dissolve at
                  every edge so it reads as the paper the title sits on rather
                  than a picture with a border. */}
              <Sketch
                images={l.era.images}
                variant="plate"
                className="absolute inset-0 h-full w-full opacity-[0.55]"
              />
              <div className="relative flex items-center gap-3">
                <span aria-hidden className="h-px flex-1 bg-[var(--accent)]/30" />
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--accent)]">
                  {enteringLabel}
                </p>
                <span aria-hidden className="h-px flex-1 bg-[var(--accent)]/30" />
              </div>
              <h2 className="relative display mt-3 text-center text-3xl font-semibold tracking-tight">
                {l.era.title}
              </h2>
              <p className="relative mt-1 text-center font-mono text-xs text-[var(--muted)]">
                {l.era.period}
              </p>
              {l.era.themes && l.era.themes.length > 0 && (
                <p className="relative mt-2.5 text-center text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                  {l.era.themes.join(" · ")}
                </p>
              )}
              {l.era.description && (
                <Prose
                  text={l.era.description}
                  className="prose-read relative mx-auto mt-3 block max-w-xl text-center text-sm text-[var(--ink)]/70"
                />
              )}
            </header>
          )}

          {/* ruptures: full-bleed inverted bands */}
          {l.ruptures.map((e) => (
            <div
              key={e.id}
              id={eventAnchorId(e.id)}
              className="group -mx-6 my-8 scroll-mt-24 bg-[var(--ink)] px-6 py-10 text-[var(--bg)]"
            >
              <SpoilerGate
                spoilerAfter={e.spoilerAfter}
                boundaryTitle={workTitles[e.spoilerAfter ?? ""]}
              >
                <p className="font-mono text-xs text-[var(--accent)]">
                  {l.year}
                  {ageFor(e) && (
                    <span className="opacity-70"> · {agedTemplate.replace("{age}", ageFor(e)!)}</span>
                  )}
                  <EventAnchor eventId={e.id} label={permalinkLabel} className="text-[var(--accent)]" />
                </p>
                <p className="display mt-1.5 max-w-2xl text-2xl font-semibold leading-snug">
                  {e.title}
                </p>
                {e.description && (
                  <Prose
                    text={e.description}
                    className="prose-read mt-2 block max-w-xl text-sm opacity-75"
                  />
                )}
                <Sketch
                  images={e.images}
                  tint={e.reach === "global"}
                  className="mt-5 h-40 w-full max-w-2xl max-lg:h-32"
                />
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
                          </p>
                          {w.synopsis && (
                            <Prose
                              text={w.synopsis}
                              className="prose-read mt-1 line-clamp-2 block text-xs text-[var(--ink)]/65 max-lg:line-clamp-3 max-lg:text-[14px] max-lg:leading-relaxed"
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
                <ul className="mt-3 space-y-3 overflow-visible border-l-2 border-[var(--ink)]/15 pl-3">
                  {l.texture.map((e) => {
                    // An illustrated event earns a card: the drawn paper needs
                    // room and its own air, and it carries the year and title
                    // as a heading rather than as a run-in. Events without art
                    // stay compact seams, so a wing with no sketches yet is
                    // unchanged rather than full of empty boxes.
                    const illustrated = Boolean(e.images?.sketch);
                    return (
                    <li
                      key={e.id}
                      id={eventAnchorId(e.id)}
                      className={
                        illustrated
                          ? "group -ml-3 scroll-mt-24 rounded-xl border border-[var(--ink)]/10 bg-[var(--surface)]/50 p-5 max-lg:p-4"
                          : "group scroll-mt-24 text-xs leading-relaxed text-[var(--ink)]/55 max-lg:text-[14px]"
                      }
                    >
                      <SpoilerGate
                        spoilerAfter={e.spoilerAfter}
                        boundaryTitle={workTitles[e.spoilerAfter ?? ""]}
                      >
                        {illustrated ? (
                          <div className="flex items-start gap-5 max-lg:flex-col max-lg:gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="font-mono text-xs text-[var(--accent)]">
                                {l.year}
                                {ageFor(e) && (
                                  <span className="text-[var(--muted)]">
                                    {" "}
                                    · {agedTemplate.replace("{age}", ageFor(e)!)}
                                  </span>
                                )}
                                <EventAnchor eventId={e.id} label={permalinkLabel} />
                              </p>
                              <p className="display mt-1 text-xl font-semibold leading-snug text-[var(--ink)]">
                                {e.title}
                              </p>
                              {e.description && (
                                <Prose
                                  text={e.description}
                                  className="prose-read mt-2 block text-sm leading-relaxed text-[var(--ink)]/60"
                                />
                              )}
                            </div>
                            {/* -mb-8 lets the objects drawn breaking the paper's
                                lower edge spill past the card, which is what
                                makes it sit ON the page instead of inside it. */}
                            <Sketch
                              images={e.images}
                              tint={e.reach === "global"}
                              className="-mb-8 w-[46%] shrink-0 max-lg:w-full"
                            />
                          </div>
                        ) : (
                          <>
                            <span className="font-medium text-[var(--ink)]/70">{e.title}.</span>{" "}
                            {e.description && <Prose text={e.description} className="inline" />}
                            {ageFor(e) && (
                              <span className="ml-1 font-mono text-[0.9em] text-[var(--muted)]">
                                ({agedTemplate.replace("{age}", ageFor(e)!)})
                              </span>
                            )}
                            <EventAnchor eventId={e.id} label={permalinkLabel} />
                          </>
                        )}
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
