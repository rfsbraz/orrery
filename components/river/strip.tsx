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
 * The strip is sized by WIDTH only, never by height. An earlier version set a
 * fixed `h-24` and let `object-contain` do the rest, which pillarboxed a
 * perfectly spec-compliant 4:1 asset: a 700px-wide box 96px tall is 7:1, so a
 * 4:1 drawing was fitted by its height down to ~380px and centred in a sea of
 * empty card. The asset already carries the aspect the spec asked for - the
 * app's only job is to give it the full content width and let its own
 * proportions set the height.
 *
 * The desktop/mobile difference LAYOUT.md asks for is specifically about NOT
 * shrinking the units to illegibility on a narrow viewport: rather than
 * scaling the wide image down to fit (which is what a plain `w-full` would
 * do), the mobile rendering holds the image WIDER than its container inside a
 * horizontally scrolling box, so each unit stays legible and the reader
 * scrolls sideways through the sequence - the same "next unit partially
 * cropped" affordance the spec calls for falls out of that for free (the
 * scroll container's edge crops whatever comes next).
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
              <Sketch images={event.images} className="w-full max-lg:w-[160%] max-lg:max-w-none" />
            </div>
          )}
        </SpoilerGate>
      </div>
    </li>
  );
}
