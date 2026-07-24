import { SpoilerGate } from "../spoilers/spoiler-gate";
import { Sketch } from "../sketch";
import { EventMeta, EventProse, EventTitle, RailNode, eventAnchorId } from "./shared";
import type { EventCardProps } from "./shared";

/**
 * `marginalia` - the footnote (LAYOUT.md). A predominantly textual entry with
 * a tiny transparent vignette (8-15%) tucked in the outer margin, near the
 * gutter/rail - minor honours, brief appearances, side projects. The
 * smallest-footprint organisation on purpose: this is the one place the
 * image is allowed to feel like an afterthought, because the moment is one.
 *
 * The river's rail lives in the left gutter (`lg:pl-8` on the column - see
 * river.tsx), so "the outer margin, near the gutter" is a negative left
 * margin pulling the vignette partway into that padding on desktop. On
 * mobile there is no gutter to borrow, so the vignette sits beside the
 * date/title line instead - small throughout, never promoted to a centred
 * illustration on either breakpoint.
 */
export function Marginalia({ event, year, age, permalinkLabel, boundaryTitle }: EventCardProps) {
  const illustrated = Boolean(event.images?.sketch);

  return (
    <li id={eventAnchorId(event.id)} className="group relative my-4 scroll-mt-24">
      <RailNode />
      <div className="rounded-lg border border-[var(--ink)]/10 bg-[var(--surface)]/50 py-3 pl-5 pr-4 max-lg:pl-4">
        <SpoilerGate spoilerAfter={event.spoilerAfter} boundaryTitle={boundaryTitle}>
          <div className="flex items-start gap-3">
            {illustrated && (
              <Sketch
                images={event.images}
                className="-ml-8 hidden w-12 shrink-0 self-start lg:block"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                {illustrated && (
                  <Sketch images={event.images} className="mt-0.5 h-8 w-8 shrink-0 lg:hidden" />
                )}
                <div className="min-w-0 flex-1">
                  <EventMeta event={event} year={year} age={age} permalinkLabel={permalinkLabel} />
                  <EventTitle className="text-sm font-medium">{event.title}</EventTitle>
                </div>
              </div>
              <EventProse text={event.description} className="mt-1 text-xs" />
            </div>
          </div>
        </SpoilerGate>
      </div>
    </li>
  );
}
