import { SpoilerGate } from "../spoilers/spoiler-gate";
import { Sketch } from "../sketch";
import { Prose } from "../prose";
import { EventAnchor } from "../event-anchor";
import { RailNode, eventAnchorId } from "./shared";
import type { EventCardProps } from "./shared";

/**
 * `passage` - compressed time (LAYOUT.md). A shallow full-width band
 * bridging two larger entries: teaching years, ongoing work, research
 * periods, years that matter collectively rather than individually. Short
 * prose (1-3 sentences), a date RANGE rather than a single year - so unlike
 * every other organisation here, the meta line reads `event.dateRange`
 * (falling back to `event.date` for an entry that hasn't been given one)
 * instead of the numeric `year` the river passes down.
 *
 * Shallow deliberately: about a third the height of an ordinary card, wide
 * rather than tall, because the content it carries is compressed too.
 *
 * The art is a BAND, not a thumbnail. An earlier version put it in a 35%
 * column beside the prose, which is what every other side-by-side
 * organisation already does and left `passage` with no shape of its own -
 * and it wasted the wide 3:1/16:9 asset the spec asks the generator for by
 * squeezing it into a third of the width. The band spans the cell instead,
 * cropped to a fixed ratio so the cell stays shallow whatever aspect the
 * asset arrives at, and the progression reads left to right across it.
 *
 * The crop is deliberately SHALLOWER than the asset. LAYOUT.md asks the
 * generator for 3:1 or 16:9, but at full content width a true 3:1 is ~270px
 * tall - taller than an ordinary card's illustration, which is the opposite
 * of "about a third the height of an ordinary card". The band is cropped to
 * 5:1 instead, so a `passage` reads as a compressed strip between two proper
 * entries whichever of the two allowed aspects it was drawn at.
 *
 * Desktop and mobile differ in that ratio, not in the arrangement: 5:1 on a
 * wide viewport is a band, but the same 5:1 on a phone is 70px of sliver with
 * the motifs too small to read - exactly what the spec forbids ("not shrunk
 * to tiny"). Mobile crops less aggressively, so the band is taller relative
 * to its width and each motif keeps something like its drawn size.
 */
export function Passage({ event, permalinkLabel, boundaryTitle }: EventCardProps) {
  const illustrated = Boolean(event.images?.sketch);
  const range = event.dateRange ?? String(event.date);

  return (
    <li id={eventAnchorId(event.id)} className="group relative my-6 scroll-mt-24">
      <RailNode />
      <div className="overflow-hidden rounded-lg border border-[var(--ink)]/10 bg-[var(--surface)]/50">
        <SpoilerGate spoilerAfter={event.spoilerAfter} boundaryTitle={boundaryTitle}>
          <div className="flex flex-col">
            {illustrated && (
              <Sketch
                fit="cover"
                images={event.images}
                // `min-h-0` is load-bearing, not tidying. The band is a flex
                // item (the wrapper below is `flex flex-col`), and a flex item
                // gets `min-height: auto`, which resolves to its content's
                // min-content height - here the image's own intrinsic height
                // at this width. For a 3:1 asset in an 815px column that is
                // 272px, which beats the 163px the aspect-ratio asks for, so
                // the crop silently did nothing and the band rendered at the
                // asset's aspect instead of the organisation's.
                className="aspect-[5/1] w-full min-h-0 shrink-0 max-lg:aspect-[5/2]"
              />
            )}
            <div className="min-w-0 flex-1 px-4 py-3">
              <p className="font-mono text-xs tracking-wide text-[var(--accent)]">
                {range}
                <EventAnchor eventId={event.id} label={permalinkLabel ?? "Link to this event"} />
              </p>
              <p className="mt-0.5 text-sm text-[var(--ink)]/70">
                <span className="font-medium text-[var(--ink)]">{event.title}.</span>{" "}
                {event.description && <Prose text={event.description} className="inline" />}
              </p>
            </div>
          </div>
        </SpoilerGate>
      </div>
    </li>
  );
}
