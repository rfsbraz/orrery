import { SpoilerGate } from "../spoilers/spoiler-gate";
import { Sketch } from "../sketch";
import { EventMeta, EventProse, EventTitle, RailNode, eventAnchorId } from "./shared";
import type { EventCardProps } from "./shared";

/**
 * `mosaic` - public noise (LAYOUT.md). 4-9 unequal fragments in one
 * irregular editorial field, one dominant, composed as a SINGLE image (the
 * whole-image ruling) - sudden fame, controversy, press response, award
 * season, adaptations, many voices at once.
 *
 * "The collage stays one composed image; fragments are not split into
 * cards" is the one instruction most likely to be gotten wrong here, since
 * every instinct from the rest of this file is to break things into
 * sub-elements - so this component renders exactly one `<Sketch>`, at a
 * broader field (~55%) than `beside`'s illustration, beside the text on
 * desktop and beneath it (never split) on mobile.
 *
 * Compatible modifiers: `pull-focus`, `anchor-with-satellites`. Neither is
 * implemented; both no-op.
 */
export function Mosaic({ event, scale = "seam", side = "right", year, age, permalinkLabel, boundaryTitle }: EventCardProps) {
  const rupture = scale === "rupture";
  const illustrated = Boolean(event.images?.sketch);

  return (
    <li id={eventAnchorId(event.id)} className={`group relative scroll-mt-24 ${rupture ? "my-9" : "my-6"}`}>
      <RailNode rupture={rupture} />
      <div className="overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--surface)]/60 p-5 max-lg:p-4">
        <SpoilerGate spoilerAfter={event.spoilerAfter} boundaryTitle={boundaryTitle}>
          <div className={`flex items-center gap-6 max-lg:flex-col max-lg:items-stretch max-lg:gap-4 ${side === "left" ? "lg:flex-row-reverse" : ""}`}>
            <div className="min-w-0 flex-1">
              <EventMeta event={event} year={year} age={age} permalinkLabel={permalinkLabel} />
              <EventTitle className={rupture ? "text-2xl" : "text-lg"}>{event.title}</EventTitle>
              <EventProse text={event.description} />
            </div>
            {illustrated && (
              <Sketch images={event.images} className="aspect-[3/2] w-[55%] shrink-0 max-lg:w-full" />
            )}
          </div>
        </SpoilerGate>
      </div>
    </li>
  );
}
