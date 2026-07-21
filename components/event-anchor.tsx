/**
 * Permalinks for aura events.
 *
 * Works have been linkable since the timeline existed (`#w-<slug>`); events
 * were not, so there was no way to point anyone at the one fact on the page
 * worth pointing at. Event ids are permanent by policy (CURATION: "ids are
 * permanent"), which is exactly what makes them safe to put in a URL.
 *
 * Disclosure note, deliberate: the anchor id is emitted even for an event
 * behind a spoiler boundary. The gate already discloses that something exists
 * at that point and names the work that unlocks it (see the spoiler-audit
 * skill on shieldCopy), and the gated prose itself is never rendered - the
 * SpoilerGate returns the shield instead of its children rather than hiding
 * them with CSS. So the id in the markup adds the event's slug to a
 * disclosure the reader could already see, and in exchange a shared link
 * lands correctly for someone who has earned the reveal.
 */

/** The DOM id for an event, matching the `w-<slug>` convention for works. */
export function eventAnchorId(eventId: string): string {
  return `e-${eventId}`;
}

export function EventAnchor({
  eventId,
  label,
  className = "",
}: {
  eventId: string;
  /** Localised accessible name, e.g. "Link to this event". */
  label: string;
  className?: string;
}) {
  return (
    <a
      href={`#${eventAnchorId(eventId)}`}
      aria-label={label}
      title={label}
      // Quiet by default and revealed on hover or keyboard focus, so the
      // timeline stays uncluttered. Touch has no hover, so it keeps a faint
      // permanent mark that can be long-pressed to copy the link.
      className={`ml-1.5 inline-block align-baseline font-mono text-[0.85em] no-underline opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 max-lg:opacity-30 ${className}`}
    >
      #
    </a>
  );
}
