"use client";

import { useState } from "react";
import { SpoilerGate } from "../spoilers/spoiler-gate";
import { Sketch } from "../sketch";
import { EventMeta, EventProse, EventTitle, RailNode, eventAnchorId, imageSlots } from "./shared";
import type { EventCardProps } from "./shared";

/**
 * `diptych` - two states (LAYOUT.md). Two related panels of equal or
 * deliberately contrasting weight, a small connector between them, one
 * shared title/prose introducing the relationship. Genuine before/after:
 * rejected then rewritten, flop then cult, private then public.
 *
 * Defaults to `imagesRequired: 2` (diptych's own default, not the generic
 * schema default of 1 - an entry only needs to say `imagesRequired` when it
 * wants something other than what its organisation implies).
 *
 * Graceful degrade: the art pipeline and the content PR that wires an event
 * up to `diptych` don't necessarily land in the same commit, so the second
 * panel isn't assumed to exist just because `imagesRequired: 2` was set. It
 * and its connector collapse together if that asset 404s ("use client" +
 * `onError`, tracked here rather than server-side, because river.tsx is
 * reachable from the "use client" river-view.tsx and nothing downstream of
 * it can import `node:fs` the way components/portrait.tsx does for the
 * equivalent question on the author page). A diptych down to one drawn panel
 * renders as a `beside` with extra whitespace, not a broken layout.
 *
 * Compatible modifiers: `breakout`, `pull-focus` and `fold-reveal` are all
 * listed compatible in LAYOUT.md; none are implemented on this organisation
 * yet (they no-op) - the two-panel geometry needs its own take on each,
 * which is real content to design against rather than guess at.
 */
export function Diptych({ event, scale = "seam", year, age, permalinkLabel, boundaryTitle }: EventCardProps) {
  const rupture = scale === "rupture";
  const slots = imageSlots(event.images, event.imagesRequired ?? 2);
  const [secondFailed, setSecondFailed] = useState(false);
  const showSecond = slots.length > 1 && !secondFailed;

  return (
    <li id={eventAnchorId(event.id)} className={`group relative scroll-mt-24 ${rupture ? "my-9" : "my-6"}`}>
      <RailNode rupture={rupture} />
      <div className="overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--surface)]/60 p-5 max-lg:p-4">
        <SpoilerGate spoilerAfter={event.spoilerAfter} boundaryTitle={boundaryTitle}>
          <EventMeta event={event} year={year} age={age} permalinkLabel={permalinkLabel} />
          <EventTitle className={rupture ? "text-2xl" : "text-lg"}>{event.title}</EventTitle>
          <EventProse text={event.description} />

          {slots.length > 0 && (
            <div className="mt-4 flex items-stretch gap-0 max-lg:flex-col max-lg:gap-3">
              <div className="aspect-square flex-1 overflow-hidden rounded-lg bg-[var(--bg)]/40">
                <Sketch images={slots[0]} fit="cover" className="h-full w-full" />
              </div>
              {showSecond && (
                <>
                  {/* The connector: a short rule desktop-side (the seam the two
                      panels relate across), a short vertical rule on mobile
                      (the panels are stacked, sequence preserved). */}
                  <div aria-hidden className="my-auto h-px w-6 shrink-0 bg-[var(--accent)]/40 max-lg:mx-auto max-lg:h-6 max-lg:w-px" />
                  <div className="aspect-square flex-1 overflow-hidden rounded-lg bg-[var(--bg)]/40">
                    <Sketch
                      images={slots[1]}
                      fit="cover"
                      className="h-full w-full"
                      onError={() => setSecondFailed(true)}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </SpoilerGate>
      </div>
    </li>
  );
}
