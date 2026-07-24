import { SpoilerGate } from "../spoilers/spoiler-gate";
import { Sketch } from "../sketch";
import { EventMeta, EventProse, EventTitle, RailNode, eventAnchorId } from "./shared";
import type { EventCardProps } from "./shared";

/**
 * `immersion` - the total stop (LAYOUT.md). The artwork IS the background;
 * prose sits over it inside a quiet zone the artwork was authored to leave
 * for it (~35-45% of the frame, low detail). This is the one or two biggest
 * ruptures in a life - a death, sudden fame, catastrophe - capped hard in the
 * rotation budget, never the everyday card.
 *
 * The quiet zone is an authoring convention, not something the app can
 * detect from pixels: we anchor the text block to `side` (left/right) and add
 * our own scrim (a gradient toward the anchored edge) so the prose stays
 * legible even before every wing's art has been drawn against this spec.
 * Once assets exist we can revisit whether the scrim is still earning its
 * keep or just duplicating what the artwork already does.
 *
 * `object-cover`, no plate mask: unlike `chapter-gate`, this image is not
 * meant to dissolve at the frame - it is a solid, total surface the reader is
 * inside of.
 */
export function Immersion({
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
  const leftAnchored = side === "left";

  return (
    <li id={eventAnchorId(event.id)} className="group relative my-12 scroll-mt-24">
      <RailNode rupture={rupture} />

      <div className="relative overflow-hidden rounded-xl border border-[var(--ink)]/10">
        {illustrated && (
          <Sketch images={event.images} fit="cover" className="absolute inset-0 h-full w-full" />
        )}
        {/* The scrim: a gradient toward the anchored edge, dark enough that
            light or busy art still leaves the prose readable. */}
        <div
          aria-hidden
          className={`absolute inset-0 from-[var(--bg)]/90 via-[var(--bg)]/40 to-transparent ${
            leftAnchored ? "bg-gradient-to-r" : "bg-gradient-to-l"
          }`}
        />
        <SpoilerGate spoilerAfter={event.spoilerAfter} boundaryTitle={boundaryTitle}>
          <div
            className={`relative flex min-h-72 items-end p-7 max-lg:min-h-56 max-lg:p-5 ${
              leftAnchored ? "justify-start" : "justify-end"
            }`}
          >
            <div className="max-w-md">
              <EventMeta event={event} year={year} age={age} permalinkLabel={permalinkLabel} />
              <EventTitle className="text-3xl max-lg:text-2xl">{event.title}</EventTitle>
              <EventProse text={event.description} className="mt-3 text-[15px]" />
            </div>
          </div>
        </SpoilerGate>
      </div>
    </li>
  );
}
