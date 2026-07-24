/**
 * The gutter: the space BETWEEN two strata, doing narrative work.
 *
 * Comics grammar puts the reader's sense of elapsed time not in the panel but
 * in the gutter between panels - "closure" is the reader crossing that space
 * and supplying what happened. The river had sixteen panel shapes and a
 * constant gap, so a year that followed the last one and a year that followed
 * it fourteen years later were separated by exactly the same amount of page.
 * Time is supposed to be the whole spine of this view ("depth is the point");
 * an evenly spaced stack of years is the one thing that cannot express it.
 *
 * So a leap gets: more space, scaled to how long it was, and the span said
 * out loud. Saying it is the important half. A big empty gap alone is
 * ambiguous - it reads as a layout decision, not as a silence - and the
 * reader has no way to know whether four years passed or forty without
 * subtracting two ghosted numerals themselves.
 *
 * DERIVED, not authored. The interval comes from the dates the content
 * already carries, so it cannot drift out of sync with them and costs a
 * curator nothing. That also means it is honest by construction: a wing whose
 * events cluster tightly simply never shows a gutter.
 *
 * A gutter that lands on a decade boundary does NOT shrink to make room for
 * the decade rule - the decade absorbs it instead (see river.tsx). The first
 * attempt had it the other way round and inverted the whole device: the
 * longest silences are precisely the ones most likely to cross a decade, so a
 * 29-year gap rendered SMALLER than a 4-year one.
 *
 * Spacing is in discrete steps with STATIC class names rather than an
 * arbitrary value computed from the year count. Tailwind generates utilities
 * by scanning source text, so a class assembled at runtime (`py-[${n}px]`) is
 * one that does not exist in the stylesheet - it renders as no spacing at all
 * and looks, on screen, exactly like a gutter that was never triggered.
 */

/** Below this, a gap is just the next year arriving; above it, something was
 * skipped. A prolific author publishes most years, so three quiet years is
 * ordinary and four begins to be a silence. */
export const LEAP_YEARS = 4;

function step(years: number) {
  if (years >= 15) return "py-14";
  if (years >= 7) return "py-9";
  return "py-6";
}

export function Gutter({
  years,
  label,
}: {
  years: number;
  /** Pre-formatted and localised by the caller, e.g. "catorze anos". */
  label: string;
}) {
  if (years < LEAP_YEARS) return null;

  return (
    <div aria-hidden className={`relative ${step(years)}`}>
      {/* Desktop: the label sits ON the rail, in the page's own background, so
          the continuous line visibly breaks for the length of the silence
          rather than running straight through it. */}
      <span className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--bg)] px-1 py-2 max-lg:hidden">
        <span className="block h-1.5 w-1.5 rounded-full border border-[var(--accent)]/40" />
      </span>
      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[11px] tracking-wide text-[var(--muted)] max-lg:hidden">
        {label}
      </span>
      {/* Mobile has no rail, so the span carries a hairline either side of it
          to read as an interruption rather than as a stray caption. */}
      <span className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center gap-3 lg:hidden">
        <span className="h-px flex-1 bg-[var(--ink)]/10" />
        <span className="font-mono text-[11px] tracking-wide text-[var(--muted)]">{label}</span>
        <span className="h-px flex-1 bg-[var(--ink)]/10" />
      </span>
    </div>
  );
}
