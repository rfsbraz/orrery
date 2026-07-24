import { SpoilerGate } from "../spoilers/spoiler-gate";
import { Prose } from "../prose";
import { EventMeta, EventProse, RailNode, eventAnchorId } from "./shared";
import type { EventCardProps } from "./shared";

/**
 * `epigraph` - the author's own words (LAYOUT.md). The one organisation with
 * no artwork at all: the quotation IS the illustration, set large and given
 * air, with the attribution beneath it.
 *
 * It exists because the other organisations all assume an image, and a
 * literary biography leans constantly on quotation - a line from the work, a
 * sentence from an interview, an epigraph the author chose for a book. Before
 * this, that material could only arrive as ordinary prose inside a `beside`
 * card, which flattened the most quotable thing on the page into the same
 * shape as everything else.
 *
 * Two things follow from "no artwork", and both are the point rather than a
 * limitation:
 *
 * - It is the only organisation that costs nothing to generate, so a wing can
 *   afford it freely (LAYOUT.md's rotation budget caps it anyway, for
 *   rhythm's sake, not for cost).
 * - It gives the river a genuinely different KIND of beat. The other fourteen
 *   vary the shape of a picture; this one removes the picture. A page of
 *   varied illustrated cells still reads as a page of cells - dropping to
 *   plain type for one entry is the rest we could not otherwise write.
 *
 * So it deliberately renders with no card: no border, no surface fill, no
 * padding box. It is a hole in the run of cards, not another card. The rail
 * node still marks it, because it is still a dated moment on the timeline.
 */
export function Epigraph({ event, year, age, permalinkLabel, boundaryTitle }: EventCardProps) {
  // The quotation. Falls back to the description so an entry authored as an
  // epigraph before its `quote` was written still renders as SOMETHING rather
  // than an empty band - the validator over in orrery-content is the place
  // that insists on the field, not this.
  const quote = event.quote ?? event.description;
  if (!quote) return null;
  const gloss = event.quote ? event.description : undefined;

  return (
    <li id={eventAnchorId(event.id)} className="group relative my-12 scroll-mt-24 max-lg:my-9">
      <RailNode faint />
      <SpoilerGate spoilerAfter={event.spoilerAfter} boundaryTitle={boundaryTitle}>
        <figure className="mx-auto max-w-2xl px-8 text-center max-lg:px-2">
          <span
            aria-hidden
            className="display block text-5xl leading-none text-[var(--accent)]/35 max-lg:text-4xl"
          >
            &ldquo;
          </span>
          <blockquote className="display mt-1 text-2xl font-normal leading-snug text-balance text-[var(--ink)]/90 max-lg:text-xl">
            <Prose text={quote} />
          </blockquote>
          <figcaption className="mt-4">
            <span
              aria-hidden
              className="mx-auto mb-3 block h-px w-10 bg-[var(--accent)]/40"
            />
            <span className="text-sm text-[var(--ink)]/60">{event.title}</span>
            <EventMeta
              event={event}
              year={year}
              age={age}
              permalinkLabel={permalinkLabel}
              className="mt-1"
            />
          </figcaption>
          {gloss && <EventProse text={gloss} className="mt-3 text-sm" />}
        </figure>
      </SpoilerGate>
    </li>
  );
}
