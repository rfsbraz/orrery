import { Prose } from "./prose";
import { SpoilerGate } from "./spoilers/spoiler-gate";
import { EventAnchor, eventAnchorId } from "./event-anchor";
import { Sketch } from "./sketch";
import type { AuraEvent } from "@/lib/content/types";

/**
 * One illustrated moment on the river: the rail node, the connector, the card.
 *
 * Seams and ruptures render through this same component, which is the point.
 * A rupture used to be a full-bleed band in the wing's INK colour, inverted out
 * of the page, and it was the worst decision in the visual system. Measured on
 * the Palahniuk wing: the band sits at luminance 233 and its rupture sketches
 * averaged 217 - sixteen points of separation out of 255, against ~190 on the
 * dark card. The art the reader was meant to stop at was the least visible art
 * on the page, and any wing whose art direction called for a pale line was
 * punished for having one.
 *
 * So hierarchy comes from SCALE now, not from colour: same card, same palette,
 * a rupture just gets the full column, a taller illustration, more air and a
 * larger title. One surface means one specification for the artwork, which is
 * what lets a sketch be drawn once and be correct everywhere.
 *
 * See orrery-content docs/VISUAL.md §4-impact and §5a.
 */
export function RiverEventCard({
  event,
  scale = "seam",
  side = "right",
  year,
  age,
  permalinkLabel,
  boundaryTitle,
}: {
  event: AuraEvent;
  /** `rupture` is an `impact: high` moment: same card, more room. */
  scale?: "seam" | "rupture";
  /** Which side of the card the illustration sits on. Alternates down the page. */
  side?: "left" | "right";
  /** Printed only on a rupture, which renders outside the layer's year heading. */
  year?: number;
  /** Pre-formatted "aged 37" string, life events only. */
  age?: string | null;
  permalinkLabel?: string;
  boundaryTitle?: string;
}) {
  // EventAnchor's label is its accessible name, so it is required rather than
  // optional there. The river always passes a localised one; this keeps the
  // fallback in one place instead of at each call site.
  const anchorLabel = permalinkLabel ?? "Link to this event";
  const rupture = scale === "rupture";
  const illustrated = Boolean(event.images?.sketch);

  return (
    <li
      id={eventAnchorId(event.id)}
      className={`group relative scroll-mt-24 ${rupture ? "my-9" : "my-5"}`}
    >
      {/* The node on the rail, and the short rule reaching from it to the card.
          The connector is doing real work: without it a card is a slab floating
          near a line, and the eye has to infer the attachment. With it the card
          is visibly hung off the timeline at a point in time. A rupture's node
          is larger and filled, which is the only place impact touches the
          furniture rather than the type. */}
      <span
        aria-hidden
        className={`absolute top-7 -translate-y-1/2 rounded-full border border-[var(--accent)]/70 ${
          rupture
            ? "-left-[1.4rem] h-3 w-3 bg-[var(--accent)]"
            : "-left-[1.15rem] h-2.5 w-2.5 bg-[var(--bg)]"
        } max-lg:hidden`}
      />
      <span
        aria-hidden
        className="absolute top-7 -left-3 h-px w-3 bg-[var(--accent)]/40 max-lg:hidden"
      />

      <div
        className={`overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--surface)]/60 ${
          rupture ? "p-7 max-lg:p-5" : "p-5 max-lg:p-4"
        }`}
      >
        <SpoilerGate spoilerAfter={event.spoilerAfter} boundaryTitle={boundaryTitle}>
          <div
            className={`flex items-center gap-6 max-lg:flex-col max-lg:items-stretch max-lg:gap-3 ${
              side === "left" ? "lg:flex-row-reverse" : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs tracking-wide text-[var(--accent)]">
                {/* A seam sits under its layer's year heading and would be
                    repeating it; a rupture renders on its own and has nothing
                    above it. */}
                {rupture && year}
                {rupture && age && <span className="opacity-70"> · </span>}
                {age && <span className={rupture ? "opacity-70" : ""}>{age}</span>}
                <EventAnchor eventId={event.id} label={anchorLabel} />
              </p>

              {/* Regular weight, deliberately. Every display heading in the
                  river was semibold, which meant weight carried no hierarchy at
                  all - only size separated an era from a rupture from a seam -
                  and a semibold serif at 30px reads as an interface label
                  rather than as editorial type. Weight is now reserved for the
                  small mono furniture, where it buys legibility. */}
              <h3
                className={`display mt-1.5 font-normal leading-snug text-[var(--ink)] ${
                  rupture ? "text-3xl max-lg:text-2xl" : "text-xl"
                }`}
              >
                {event.title}
              </h3>

              {event.description && (
                <Prose
                  text={event.description}
                  className={`prose-read block leading-relaxed text-[var(--ink)]/70 ${
                    rupture ? "mt-3 text-[15px]" : "mt-2 text-sm"
                  }`}
                />
              )}
            </div>

            {illustrated && (
              /* The negative margins pull the illustration out to the card's
                 own edges, so the drawing bleeds into the corner instead of
                 sitting in a padded box with a polite gap around it. The card
                 clips it; the artwork dissolves before it gets there anyway
                 (VISUAL.md §5a), so the two edges never meet.

                 A rupture takes ~45% and a seam ~32%: that ratio, plus the
                 taller box, is where the impact hierarchy actually lives now. */
              <Sketch
                images={event.images}
                tint={event.reach === "global"}
                className={
                  rupture
                    ? "-my-7 w-[45%] shrink-0 self-stretch max-lg:-mx-5 max-lg:-mb-5 max-lg:mt-0 max-lg:h-56 max-lg:w-auto " +
                      (side === "left" ? "-ml-7" : "-mr-7")
                    : "-my-5 w-[32%] shrink-0 self-stretch max-lg:-mx-4 max-lg:-mb-4 max-lg:mt-0 max-lg:h-40 max-lg:w-auto " +
                      (side === "left" ? "-ml-5" : "-mr-5")
                }
              />
            )}
          </div>
        </SpoilerGate>
      </div>
    </li>
  );
}
