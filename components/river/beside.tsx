import { SpoilerGate } from "../spoilers/spoiler-gate";
import { Sketch } from "../sketch";
import { EventMeta, EventProse, EventTitle, RailNode, eventAnchorId } from "./shared";
import type { EventCardProps } from "./shared";

/**
 * `beside` - the workhorse (LAYOUT.md). Prose one side, one illustration the
 * other, ~45/55, alternating side down the page. This used to be the ONLY
 * river card; it is now one of sixteen, but it is still most of a wing, so it
 * keeps the tuning (and the history) the original `RiverEventCard` earned.
 *
 * Seams and ruptures render through this same component, which is the point.
 * A rupture used to be a full-bleed band in the wing's INK colour, inverted
 * out of the page, and it was the worst decision in the visual system.
 * Measured on the Palahniuk wing: the band sits at luminance 233 and its
 * rupture sketches averaged 217 - sixteen points of separation out of 255,
 * against ~190 on the dark card. The art the reader was meant to stop at was
 * the least visible art on the page, and any wing whose art direction called
 * for a pale line was punished for having one.
 *
 * So hierarchy comes from SCALE now, not from colour: same card, same
 * palette, a rupture just gets the full column, a taller illustration, more
 * air and a larger title. See orrery-content docs/VISUAL.md §4-impact and §5a.
 *
 * Compatible modifier: `breakout` - the illustration's negative margins
 * already pull it to the card's edge; breakout pushes past that edge instead
 * of stopping at it, so the drawing visibly spills over the card's own
 * border. The other four modifiers (`pull-focus`, `fold-reveal`,
 * `anchor-with-satellites`, `branch`) are not implemented here; an event
 * carrying one renders exactly as it would with none, which is the safe
 * no-op the schema promises rather than a rendering error.
 */
export function Beside({
  event,
  scale = "seam",
  side = "right",
  year,
  age,
  permalinkLabel,
  boundaryTitle,
}: EventCardProps) {
  const rupture = scale === "rupture";
  const illustrated = Boolean(event.images?.sketch);
  const breakout = event.modifier === "breakout";

  return (
    <li
      id={eventAnchorId(event.id)}
      className={`group relative scroll-mt-24 ${rupture ? "my-9" : "my-5"}`}
    >
      <RailNode rupture={rupture} />

      <div
        className={`rounded-xl border border-[var(--ink)]/10 bg-[var(--surface)]/60 ${
          breakout ? "overflow-visible" : "overflow-hidden"
        } ${rupture ? "p-7 max-lg:p-5" : "p-5 max-lg:p-4"}`}
      >
        <SpoilerGate spoilerAfter={event.spoilerAfter} boundaryTitle={boundaryTitle}>
          <div
            className={`flex items-center gap-6 max-lg:flex-col max-lg:items-stretch max-lg:gap-3 ${
              side === "left" ? "lg:flex-row-reverse" : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <EventMeta event={event} year={rupture ? year : undefined} age={age} permalinkLabel={permalinkLabel} />
              <EventTitle className={rupture ? "text-3xl max-lg:text-2xl" : "text-xl"}>
                {event.title}
              </EventTitle>
              {event.description && (
                <EventProse text={event.description} className={rupture ? "mt-3 text-[15px]" : "mt-2 text-sm"} />
              )}
            </div>

            {illustrated && (
              <>
                {/* Desktop: a side column. The negative margins pull the
                    illustration out to the card's own edges, so the drawing
                    bleeds into the corner instead of sitting in a padded box
                    with a polite gap around it. A `breakout` modifier goes one
                    step further, spilling PAST that edge - which is why its
                    branch also switches the card to `overflow-visible` above.
                    Hidden on mobile, where a 32%-wide column would shrink the
                    art to a thumbnail. */}
                <Sketch
                  images={event.images}
                  tint={event.reach === "global"}
                  className={`hidden self-stretch shrink-0 lg:block ${
                    rupture
                      ? `-my-7 w-[45%] ${side === "left" ? (breakout ? "-ml-10" : "-ml-7") : breakout ? "-mr-10" : "-mr-7"}`
                      : `-my-5 w-[32%] ${side === "left" ? (breakout ? "-ml-8" : "-ml-5") : breakout ? "-mr-8" : "-mr-5"}`
                  }`}
                />
                {/* Mobile: full width at the art's OWN aspect (LAYOUT.md,
                    "art second at its own aspect"). `fit="native"` lets a
                    square or portrait asset set its own height instead of
                    being letterboxed into a fixed-height strip and floating
                    in side margins, which is what a shared fixed `h-40`
                    produced. `beside` is the restrained cell, so the art fills
                    the card's content width and keeps its padding as a frame,
                    rather than bleeding to the border the way the desktop
                    column and the louder organisations do. */}
                <Sketch
                  images={event.images}
                  tint={event.reach === "global"}
                  fit="native"
                  className="mt-3 w-full lg:hidden"
                />
              </>
            )}
          </div>
        </SpoilerGate>
      </div>
    </li>
  );
}
