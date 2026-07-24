import { SpoilerGate } from "../spoilers/spoiler-gate";
import { Sketch } from "../sketch";
import { EventMeta, EventProse, EventTitle, RailNode, eventAnchorId } from "./shared";
import type { EventCardProps } from "./shared";

/**
 * `layered-stack` - accumulation (LAYOUT.md). Several overlapping physical
 * artifacts (3-7) authored as ONE believable stack/desk-spread image, one
 * dominant top piece, prose in a separate clear zone. Quantity, versus
 * `artifact-spread`'s single document: years of correspondence, repeated
 * rejection, multiple editions.
 *
 * A single image slot (the pile is one composed asset, not N stacked `<img>`
 * elements) at half-to-two-thirds of the cell, `overflow-visible` by default
 * because LAYOUT.md's own desktop spec says pieces "may extend past the
 * image area" - that's not the `breakout` modifier, it's this
 * organisation's ordinary geometry, so the frame doesn't clip by default the
 * way most other organisations' cards do.
 *
 * Compatible modifiers: `breakout`, `pull-focus`, `fold-reveal`. `breakout`
 * is implemented (a slightly larger negative margin, the same treatment as
 * `beside`/`artifact-spread`/`medallion`); the other two are not and no-op.
 */
export function LayeredStack({
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
    <li id={eventAnchorId(event.id)} className={`group relative scroll-mt-24 ${rupture ? "my-9" : "my-6"}`}>
      <RailNode rupture={rupture} />
      <div className="overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--surface)]/60 p-5 max-lg:p-4">
        <SpoilerGate spoilerAfter={event.spoilerAfter} boundaryTitle={boundaryTitle}>
          <div className={`flex items-center gap-6 max-lg:flex-col max-lg:items-stretch max-lg:gap-3 ${side === "left" ? "lg:flex-row-reverse" : ""}`}>
            <div className="min-w-0 flex-1">
              <EventMeta event={event} year={year} age={age} permalinkLabel={permalinkLabel} />
              <EventTitle className={rupture ? "text-2xl" : "text-lg"}>{event.title}</EventTitle>
              <EventProse text={event.description} />
            </div>
            {illustrated && (
              <div className={`w-[58%] shrink-0 max-lg:w-full ${breakout ? "overflow-visible" : ""}`}>
                <Sketch
                  images={event.images}
                  className={`aspect-[4/3] w-full ${breakout ? (side === "left" ? "-ml-4" : "-mr-4") : ""}`}
                />
              </div>
            )}
          </div>
        </SpoilerGate>
      </div>
    </li>
  );
}
