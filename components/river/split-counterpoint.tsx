"use client";

import { useState } from "react";
import { SpoilerGate } from "../spoilers/spoiler-gate";
import { Sketch } from "../sketch";
import { EventMeta, EventProse, EventTitle, RailNode, eventAnchorId, imageSlots } from "./shared";
import type { EventCardProps } from "./shared";

/**
 * `split-counterpoint` - two simultaneous realities (LAYOUT.md). Two parallel
 * lanes for events in the SAME period, connected by a shared baseline/date -
 * private beside public, writing beside reception. They coexist; one is not
 * the resolution of the other (that's `diptych`).
 *
 * Honest limitation: `AuraEvent` carries one `title`/`description`, not one
 * per lane. LAYOUT.md's "each labelled" (PRIVATE / PUBLIC etc.) implies a
 * per-lane label and prose that the current schema has no field for. Until
 * content actually needs this organisation and that gap gets closed (most
 * likely a `lanes: [{ label, description }]` array on the event, or two
 * linked events sharing a date), this renders the two image slots side by
 * side under the shared title/date/prose, geometrically correct per the
 * desktop/mobile spec but without distinct per-lane labels or text. A real
 * wing entry will surface whether that's enough or whether the schema needs
 * to grow.
 *
 * Graceful degrade: same client-side onError collapse as `diptych` (see its
 * comment for why this can't be a server-side existence check).
 */
export function SplitCounterpoint({ event, scale = "seam", year, age, permalinkLabel, boundaryTitle }: EventCardProps) {
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
            // Two parallel lanes, a shared baseline rule running under both -
            // the "connected by a shared date" cue, since there is no
            // per-lane date to show individually.
            <div className="mt-4 flex gap-4 border-t border-[var(--accent)]/30 pt-3 max-lg:flex-col max-lg:gap-3">
              <div className="aspect-[4/5] flex-1 overflow-hidden rounded-lg bg-[var(--bg)]/40">
                <Sketch images={slots[0]} fit="cover" className="h-full w-full" />
              </div>
              {showSecond && (
                <div className="aspect-[4/5] flex-1 overflow-hidden rounded-lg bg-[var(--bg)]/40">
                  <Sketch
                    images={slots[1]}
                    fit="cover"
                    className="h-full w-full"
                    onError={() => setSecondFailed(true)}
                  />
                </div>
              )}
            </div>
          )}
        </SpoilerGate>
      </div>
    </li>
  );
}
