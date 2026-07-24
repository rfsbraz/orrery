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
 */
export function Passage({ event, permalinkLabel, boundaryTitle }: EventCardProps) {
  const illustrated = Boolean(event.images?.sketch);
  const range = event.dateRange ?? String(event.date);

  return (
    <li id={eventAnchorId(event.id)} className="group relative my-6 scroll-mt-24">
      <RailNode />
      <div className="overflow-hidden rounded-lg border border-[var(--ink)]/10 bg-[var(--surface)]/50">
        <SpoilerGate spoilerAfter={event.spoilerAfter} boundaryTitle={boundaryTitle}>
          <div className="flex items-center gap-4 max-lg:flex-col max-lg:items-stretch">
            {illustrated && (
              <Sketch fit="cover" images={event.images} className="h-20 w-full shrink-0 lg:w-[35%]" />
            )}
            <div className="min-w-0 flex-1 py-3 pr-4 max-lg:px-4 max-lg:pb-3 max-lg:pt-0">
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
