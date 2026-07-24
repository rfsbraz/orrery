import { SpoilerGate } from "../spoilers/spoiler-gate";
import { Sketch } from "../sketch";
import { EventMeta, EventProse, EventTitle, RailNode, eventAnchorId } from "./shared";
import type { EventCardProps } from "./shared";

/**
 * `medallion` - the keepsake, the one round shape (LAYOUT.md). A circular
 * vignette with a restrained frame (rim/seal/mount), spacious around it so
 * the round form interrupts the river's otherwise entirely rectangular
 * rhythm - honours, memorials, membership, legacy.
 *
 * The circular crop is applied here, at render time, with `rounded-full` +
 * `object-cover` on a square box: the art itself is composed for it (subject
 * centred, safe margin - VISUAL.md), so the app just needs to not fight that
 * composition with its own crop, which a plain `object-contain` square would.
 *
 * Compatible modifier: `breakout` - a detail (a ribbon end, a chain) escaping
 * the medallion's own rim - real here via `overflow-visible` on the frame.
 * `pull-focus` and `anchor-with-satellites` are also listed compatible but
 * not implemented; they no-op.
 */
export function Medallion({ event, year, age, permalinkLabel, boundaryTitle }: EventCardProps) {
  const illustrated = Boolean(event.images?.sketch);
  const breakout = event.modifier === "breakout";

  return (
    <li id={eventAnchorId(event.id)} className="group relative my-7 scroll-mt-24">
      <RailNode />
      <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--surface)]/60 p-6 max-lg:p-4">
        <SpoilerGate spoilerAfter={event.spoilerAfter} boundaryTitle={boundaryTitle}>
          <div className="flex flex-col items-center text-center">
            {illustrated && (
              <div
                className={`relative aspect-square w-[28%] max-lg:w-[38%] ${
                  breakout ? "overflow-visible" : "overflow-hidden"
                } rounded-full border-2 border-[var(--accent)]/50 shadow-sm`}
              >
                <Sketch images={event.images} fit="cover" className="h-full w-full rounded-full" />
              </div>
            )}
            <div className="mt-3 max-w-sm">
              <EventMeta event={event} year={year} age={age} permalinkLabel={permalinkLabel} />
              <EventTitle className="text-lg">{event.title}</EventTitle>
              <EventProse text={event.description} className="mt-1.5 text-sm" />
            </div>
          </div>
        </SpoilerGate>
      </div>
    </li>
  );
}
