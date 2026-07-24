import { EventAnchor, eventAnchorId } from "../event-anchor";
import { Prose } from "../prose";
import { slotPath } from "@/lib/content/assets";
import type { AuraEvent, SketchImage } from "@/lib/content/types";

/**
 * The furniture every river organisation shares: the rail node, the date/age
 * line, the title and prose primitives, and the multi-image slot resolver.
 * Sixteen organisations lay these out differently (that variety is the whole
 * point of LAYOUT.md) but none of them should re-derive what the rail node
 * looks like or how an event's permalink anchor works - that was the failure
 * mode a single `RiverEventCard` never had a chance to repeat, and sixteen
 * copies of it would bring it back with interest.
 */

/** Props every organisation component accepts. `scale` is a holdover from the
 * seam/rupture emphasis a card used to carry on its own - impact still drives
 * spacing and, where it makes sense, title size, but the organisation itself
 * (not impact) now owns the shape of the cell. */
export interface EventCardProps {
  event: AuraEvent;
  scale?: "seam" | "rupture";
  /** Which side of the cell the illustration/emphasis sits on. Alternates
   * down the page (computed once, across the whole river, in river.tsx) so a
   * run of single-event years doesn't read as a column of identical rows. */
  side?: "left" | "right";
  /** Printed only when passed: ruptures get their year (they render outside
   * the layer's own year heading); texture events don't (they sit inside a
   * section that already shows the year once, above every event in it). */
  year?: number;
  /** Pre-formatted "aged 37" string, life events only. */
  age?: string | null;
  permalinkLabel?: string;
  boundaryTitle?: string;
}

/** The node on the rail and the short rule reaching from it to the cell.
 * Desktop only (the rail itself is `max-lg:hidden` - see river.tsx). A
 * rupture's node is larger and filled; `faint` (used by `interlude`, whose
 * spec calls for the rail to "pause, fade or go dotted across the gap") draws
 * the same node at a fraction of the opacity instead of inventing a second
 * rail treatment. */
export function RailNode({
  rupture = false,
  faint = false,
}: {
  rupture?: boolean;
  faint?: boolean;
}) {
  return (
    <span className={faint ? "opacity-30" : ""}>
      <span
        aria-hidden
        className={`absolute top-7 -translate-y-1/2 rounded-full border border-[var(--accent)]/70 ${
          rupture
            ? "-left-[1.4rem] h-3 w-3 bg-[var(--accent)]"
            : "-left-[1.15rem] h-2.5 w-2.5 bg-[var(--bg)]"
        } max-lg:hidden`}
      />
      <span
        aria-hidden
        className={`absolute top-7 -left-3 h-px w-3 bg-[var(--accent)]/40 max-lg:hidden ${
          faint ? "border-t border-dashed" : ""
        }`}
      />
    </span>
  );
}

/**
 * The mono year/age/permalink line. Year renders only when passed (see
 * `EventCardProps.year`); age renders whenever the event carries one,
 * regardless of organisation.
 */
export function EventMeta({
  event,
  year,
  age,
  permalinkLabel,
  className = "",
}: {
  event: AuraEvent;
  year?: number;
  age?: string | null;
  permalinkLabel?: string;
  className?: string;
}) {
  return (
    <p className={`font-mono text-xs tracking-wide text-[var(--accent)] ${className}`}>
      {year != null && year}
      {year != null && age && <span className="opacity-70"> · </span>}
      {age && <span className={year != null ? "opacity-70" : ""}>{age}</span>}
      <EventAnchor eventId={event.id} label={permalinkLabel ?? "Link to this event"} />
    </p>
  );
}

/** Regular weight throughout (see the note that used to live on
 * RiverEventCard: semibold everywhere meant weight distinguished nothing).
 * Size is each organisation's own call, passed in as `className`. */
export function EventTitle({
  children,
  className = "text-xl",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`display mt-1.5 font-normal leading-snug text-[var(--ink)] ${className}`}>
      {children}
    </h3>
  );
}

export function EventProse({
  text,
  className = "mt-2 text-sm",
}: {
  text?: string;
  className?: string;
}) {
  if (!text) return null;
  return (
    <Prose text={text} className={`prose-read block leading-relaxed text-[var(--ink)]/70 ${className}`} />
  );
}

export { eventAnchorId };

/**
 * Build the candidate list of an entry's image slots (LAYOUT.md
 * `images_required`): the primary sketch plus `<id>-2.webp`, `<id>-3.webp`,
 * ... up to `count`. This is deliberately NOT an existence check - river.tsx
 * is reachable from the "use client" river-view.tsx, so nothing downstream of
 * it can import `node:fs` the way components/portrait.tsx does for the same
 * question on the author page (a server-only page with no client wrapper).
 * Render each candidate through components/river/image-slot.tsx, which hides
 * itself on a 404 instead - the graceful degradation happens client-side,
 * per slot, rather than server-side, up front.
 */
export function imageSlots(images: SketchImage | undefined, count: number): SketchImage[] {
  const raw = images?.sketch;
  if (!raw) return [];
  const slots: SketchImage[] = [];
  for (let i = 1; i <= count; i++) {
    slots.push({ ...images, sketch: slotPath(raw, i) });
  }
  return slots;
}
