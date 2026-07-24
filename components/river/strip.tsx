import { SpoilerGate } from "../spoilers/spoiler-gate";
import { Sketch } from "../sketch";
import { EventMeta, EventProse, EventTitle, RailNode, eventAnchorId } from "./shared";
import type { EventCardProps } from "./shared";

/**
 * `strip` - the sequence (LAYOUT.md). A short wide band of 5-12 repeated
 * modular units, readable left to right - serialisation, weekly instalments,
 * drafts, production stages. Authored as one wide composed image (the
 * whole-image ruling in LAYOUT.md), not assembled from per-unit assets, so
 * there is exactly one image slot here regardless of how many units it
 * depicts.
 *
 * The desktop/mobile difference LAYOUT.md asks for is specifically about NOT
 * shrinking the units to illegibility on a narrow viewport: rather than
 * scaling the wide image down to fit (which is what a plain `w-full` would
 * do), the mobile rendering holds the image at a fixed minimum width inside
 * a horizontally scrolling container, so each unit stays the size it was
 * drawn at and the reader scrolls sideways through the sequence - the same
 * "next unit partially cropped" affordance the spec calls for falls out of
 * that for free (the scroll container's edge crops whatever comes next).
 */
export function Strip({ event, scale = "seam", year, age, permalinkLabel, boundaryTitle }: EventCardProps) {
  const rupture = scale === "rupture";
  const illustrated = Boolean(event.images?.sketch);

  return (
    <li id={eventAnchorId(event.id)} className={`group relative scroll-mt-24 ${rupture ? "my-9" : "my-6"}`}>
      <RailNode rupture={rupture} />
      <div className="overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--surface)]/60 p-5 max-lg:p-4">
        <SpoilerGate spoilerAfter={event.spoilerAfter} boundaryTitle={boundaryTitle}>
          <EventMeta event={event} year={year} age={age} permalinkLabel={permalinkLabel} />
          <EventTitle className={rupture ? "text-2xl" : "text-lg"}>{event.title}</EventTitle>
          <EventProse text={event.description} />

          {illustrated && (
            <div className="mt-4 max-lg:-mx-4 max-lg:overflow-x-auto max-lg:px-4">
              <Sketch
                images={event.images}
                className="h-24 w-full max-lg:h-20 max-lg:w-auto max-lg:min-w-[150%]"
              />
            </div>
          )}
        </SpoilerGate>
      </div>
    </li>
  );
}
