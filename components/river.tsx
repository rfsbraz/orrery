import { Prose } from "./prose";
import { SpoilerGate } from "./spoilers/spoiler-gate";
import { signatureLine, type SignatureKind } from "@/lib/theme";
import { EventAnchor, eventAnchorId } from "./event-anchor";
import { RiverEventCard } from "./river/dispatcher";
import { WorkCard } from "./river/work-card";
import { Gutter, LEAP_YEARS } from "./river/gutter";
import { ChapterGate } from "./river/chapter-gate";
import { ageAt, formatAge } from "@/lib/age";
import type { RiverLayer, SeriesEntry } from "@/lib/content/river";
import type { WorkFormat } from "@/lib/content/types";

/** English fallback for `formatLabels` when no translator reaches this far
 * (e.g. a bare render in tests). Real pages always pass the translated set
 * from `lib/i18n/messages.ts` (`work.format.*`). Exported so every consumer
 * of `WorkContext.formatLabels` (River, Timeline) shares one literal instead
 * of each keeping its own copy to drift out of sync with `WorkFormat`. */
export const DEFAULT_FORMAT_LABELS: Record<Exclude<WorkFormat, "novel">, string> = {
  novella: "Novella",
  "short-story": "Short story",
  "short-story-collection": "Short story collection",
  poem: "Poem",
  "poetry-collection": "Poetry collection",
  essay: "Essay",
  "essay-collection": "Essay collection",
  memoir: "Memoir",
  nonfiction: "Nonfiction",
  reference: "Reference",
  screenplay: "Screenplay",
  play: "Stage play",
  "tv-series": "TV series",
  "graphic-novel": "Graphic novel",
  "picture-book": "Picture book",
  anthology: "Anthology",
};

/** English fallback for `authorRoleLabels`, same reasoning as
 * `DEFAULT_FORMAT_LABELS` above. `author` and `co-author` need no label here:
 * `author` is the silent default, and full co-authorship already reaches the
 * reader via `withAuthorIds` (see `coAuthors` on `WorkContext`). */
export const DEFAULT_AUTHOR_ROLE_LABELS: Record<"contributor" | "editor", string> = {
  contributor: "Contributor",
  editor: "Editor",
};

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
  authorHrefs,
  withCoAuthorPrefix,
  isbns,
  readUrls,
  localTitles,
  orderPositions,
  enteringLabel = "entering",
  permalinkLabel = "Link to this event",
  forthcomingLabel = "Forthcoming",
  formatLabels = DEFAULT_FORMAT_LABELS,
  authorRoleLabels = DEFAULT_AUTHOR_ROLE_LABELS,
  contributionTitleTemplate = "“{title}”",
  publishedAsTemplate = "as {name}",
  authorBorn,
  agedTemplate = "aged {age}",
  elapsedTemplate = "{n} years",
}: {
  layers: RiverLayer[];
  series: Map<string, SeriesEntry>;
  covers: Record<string, string>;
  workTitles: Record<string, string>;
  /** Author display names, for store-link queries and a work's co-author
   * credit line. */
  authorNames?: Map<string, string>;
  /** `/author/<id>` per id in `authorNames`, so a co-author credit can link
   * to their own page (which redirects to their own wing, if they have one). */
  authorHrefs?: Map<string, string>;
  /** Localised "with" prefix before a work's withAuthorIds credit line. */
  withCoAuthorPrefix?: string;
  /** Verified buy-ISBNs per work (editions capability). */
  isbns?: Record<string, string | undefined>;
  /** A complete, free, legally-hosted text per work, where one is on file
   * (editions.yaml `readUrl` - Project Gutenberg, Standard Ebooks, ...). */
  readUrls?: Record<string, string | null | undefined>;
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
  /** Localised badges for a work's `format` when it isn't an ordinary novel
   * (orrery-content docs/SCHEMA.md). This is the badge that replaced raw
   * `canonTier` on the card - see `components/river/work-card.tsx`. */
  formatLabels?: Record<Exclude<WorkFormat, "novel">, string>;
  /** Localised badges for a work's `authorRole` when this author didn't write
   * the whole thing (a story in an anthology, a book only edited) - the
   * false claim `authorRole` exists to prevent (orrery-content docs/SCHEMA.md,
   * "authorRole and canonTier"). */
  authorRoleLabels?: Record<"contributor" | "editor", string>;
  /** Localised "“{title}”" template for the specific piece a
   * contributor/editor is credited for, when `contributionTitle` is set. */
  contributionTitleTemplate?: string;
  /** Localised "as {name}" template for a work published under a pseudonym.
   * A template string, not a function - a function prop crossing the
   * server/client boundary breaks static export ("Functions cannot be
   * passed directly to Client Components", found in CI 2026-08-01). */
  publishedAsTemplate?: string;
  /** Localised "{n} years", printed in the gutter across a leap in time. */
  elapsedTemplate?: string;
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
      {layers.map((l, i) => {
        // The interval to the previous stratum, derived from the years the
        // content already carries (components/river/gutter.tsx). Layers only
        // exist for years that have something in them, so consecutive layers
        // can be a decade apart and used to look one year apart.
        const gap = i > 0 ? l.year - layers[i - 1].year : 0;
        const leap = gap >= LEAP_YEARS;
        return (
        <div key={l.year}>
          {leap && <Gutter years={gap} label={elapsedTemplate.replace("{n}", String(gap))} />}
          {l.decadeStart && (
            // A decade opening straight after a gutter does not need its own
            // full top margin as well: the silence has already made the space,
            // and stacking both tears the page in half. The gutter is what
            // gives way nowhere - shrinking IT would shrink the longest
            // silences most, which is backwards (see gutter.tsx).
            <div
              className={`relative border-t-2 border-[var(--accent)]/70 first:mt-0 ${
                leap ? "mt-2" : "mt-14"
              }`}
            >
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
                // Mixed widths on purpose (components/river/work-card.tsx): a
                // `hero` takes the full row, a `standard` half of one, and a
                // run of `compact` apocrypha stacks as a list. `flex-wrap`
                // already lays that out; nothing here needs to know which
                // treatment a work got.
                <div className="flex flex-wrap gap-3">
                  {l.works.map((w) => (
                    <WorkCard
                      key={w.id}
                      w={w}
                      ctx={{
                        entry: series.get(w.id),
                        cover: covers[w.id],
                        localTitle: localTitles?.[w.id],
                        orderPosition: orderPositions?.get(w.id),
                        forthcomingLabel,
                        formatLabels,
                        authorRoleLabels,
                        contributionTitleTemplate,
                        publishedAsTemplate,
                        authorName: authorNames?.get(w.authorIds[0]),
                        coAuthors: (w.withAuthorIds ?? []).flatMap((id) => {
                          const name = authorNames?.get(id);
                          return name ? [{ name, href: authorHrefs?.get(id) }] : [];
                        }),
                        withCoAuthorPrefix,
                        isbn13: isbns?.[w.id],
                        readUrl: readUrls?.[w.id],
                      }}
                    />
                  ))}
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
        );
      })}
    </div>
  );
}
