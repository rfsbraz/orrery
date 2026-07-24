import { SpoilerGate } from "../spoilers/spoiler-gate";
import { Sketch } from "../sketch";
import { EventMeta, EventTitle, RailNode, eventAnchorId } from "./shared";
import type { EventCardProps } from "./shared";

/**
 * `interlude` - the pause (LAYOUT.md). Deliberately sparse: one date, one
 * short line, an optional faint trace, far more empty space than its
 * neighbours - grief, disappearance, creative silence, unknown years. The
 * emptiness IS the device, so this deliberately does not reuse the bordered
 * "card" surface every other organisation draws: a box around an absence
 * contradicts the point.
 *
 * The rail's node renders `faint` here (LAYOUT.md: "the rail may pause, fade
 * or go dotted across the gap") rather than at its usual weight - the one
 * organisation-specific rail treatment implemented; the others still draw
 * the ordinary node.
 *
 * No card border, no illustration surface even when an image exists: an
 * `interlude` image (per the spec, "barely-present subject") sits at low
 * opacity with no frame, because a framed picture reads as content and this
 * organisation's entire job is to read as its absence.
 */
export function Interlude({ event, year, age, permalinkLabel, boundaryTitle }: EventCardProps) {
  const illustrated = Boolean(event.images?.sketch);

  return (
    <li
      id={eventAnchorId(event.id)}
      className="group relative my-16 flex min-h-56 scroll-mt-24 items-center max-lg:min-h-40"
    >
      <RailNode faint />
      <SpoilerGate spoilerAfter={event.spoilerAfter} boundaryTitle={boundaryTitle}>
        <div className="ml-[12%] max-w-xs max-lg:ml-0">
          {illustrated && (
            <Sketch images={event.images} className="mb-3 h-20 w-20 opacity-40 grayscale" />
          )}
          <EventMeta event={event} year={year} age={age} permalinkLabel={permalinkLabel} />
          <EventTitle className="mt-1 text-base italic text-[var(--ink)]/70">{event.title}</EventTitle>
        </div>
      </SpoilerGate>
    </li>
  );
}
