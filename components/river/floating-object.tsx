import { SpoilerGate } from "../spoilers/spoiler-gate";
import { Sketch } from "../sketch";
import { EventMeta, EventProse, EventTitle, RailNode, eventAnchorId } from "./shared";
import type { EventCardProps } from "./shared";

/**
 * `floating-object` - the aside on the page (LAYOUT.md). One small isolated
 * object placed directly on the editorial page - no card, no border, no
 * surface - with prose wrapping around it. A keepsake, a ticket, a torn note:
 * a minor beat that would be over-staged by a full card.
 *
 * "Text wraps" is implemented literally, with CSS `float`: the object floats
 * to `side` at a small width and the paragraph below runs its lines past it,
 * which is the one place in the river something actually wraps rather than
 * sitting in a flex row next to prose. Desktop gets the full float; mobile
 * keeps a (smaller) float too rather than promoting the object to a centred
 * block - LAYOUT.md is explicit that it stays "beside the first paragraph...
 * never enlarged".
 */
export function FloatingObject({ event, side = "right", year, age, permalinkLabel, boundaryTitle }: EventCardProps) {
  const illustrated = Boolean(event.images?.sketch);

  return (
    <li id={eventAnchorId(event.id)} className="group relative my-5 scroll-mt-24">
      <RailNode />
      <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--surface)]/60 p-5 max-lg:p-4">
        <SpoilerGate spoilerAfter={event.spoilerAfter} boundaryTitle={boundaryTitle}>
          {/* `overflow-hidden` on this wrapper clears the float so the card's
              bottom edge follows the taller of the object or the text,
              instead of collapsing under a floated child. */}
          <div className="overflow-hidden">
            {illustrated && (
              <Sketch
                images={event.images}
                className={`mb-2 w-[22%] shrink-0 max-lg:w-[30%] ${
                  side === "left" ? "float-left mr-4" : "float-right ml-4"
                }`}
              />
            )}
            <EventMeta event={event} year={year} age={age} permalinkLabel={permalinkLabel} />
            <EventTitle className="text-lg">{event.title}</EventTitle>
            <EventProse text={event.description} />
          </div>
        </SpoilerGate>
      </div>
    </li>
  );
}
