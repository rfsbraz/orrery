import { Prose } from "../prose";
import { Sketch } from "../sketch";
import type { Era } from "@/lib/content/types";

/**
 * `chapter-gate` - the era opening (LAYOUT.md). This IS the era-plate slot,
 * not an event: one per era, a strong visual reset introducing a new
 * creative or biographical phase. Folded in here verbatim from what used to
 * be inline JSX in river.tsx (the era header block), so it can be named and
 * reasoned about alongside the other fourteen organisations instead of being
 * the one river layout with no name of its own.
 *
 * An event should never carry `organisation: chapter-gate` - eras and events
 * are different content types, and LAYOUT.md is explicit this is the era
 * slot - but the dispatcher (components/river/dispatcher.tsx) still falls
 * back safely to `beside` if one ever does, rather than trying to render an
 * `Era`-shaped component with an `AuraEvent`.
 */
export function ChapterGate({ era, enteringLabel = "entering" }: { era: Era; enteringLabel?: string }) {
  return (
    <header className="relative -mx-6 mt-16 mb-4 overflow-hidden border-y border-[var(--accent)]/35 bg-[var(--accent)]/[0.06] first:mt-0">
      <div
        className={`relative px-6 py-9 ${
          era.images?.sketch ? "lg:w-[52%] lg:py-14 lg:pr-10" : ""
        }`}
      >
        {/* Alignment is a property of the era plate, not of whether an asset
            happens to exist yet. This used to switch between centred and
            left-aligned on `images?.sketch`, so the same element sat
            differently on two wings for a reason a reader cannot see, and a
            wing's headers re-aligned themselves as art landed. Left
            throughout; the illustration takes the right half when there is
            one. */}
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-8 bg-[var(--accent)]/30 lg:w-12" />
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--accent)]">
            {enteringLabel}
          </p>
          <span aria-hidden className="h-px w-8 bg-[var(--accent)]/30 lg:w-12" />
        </div>
        {/* Regular weight, matching every other display heading in the
            river. Semibold everywhere meant weight distinguished nothing;
            size and space carry the hierarchy instead. */}
        <h2
          className={`display mt-3 text-left text-3xl font-normal tracking-tight ${
            era.images?.sketch ? "lg:text-5xl lg:leading-[1.05]" : ""
          }`}
        >
          {era.title}
        </h2>
        <p className="mt-1 text-left font-mono text-xs text-[var(--accent)] lg:text-sm">{era.period}</p>
        {era.themes && era.themes.length > 0 && (
          // Same tracking as the eyebrow above it. These were 0.4em and
          // 0.2em: two scales for the same kind of uppercase micro-label,
          // eleven lines apart.
          <p className="mt-2.5 text-left text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">
            {era.themes.join(" · ")}
          </p>
        )}
        {era.description && (
          <Prose
            text={era.description}
            className="prose-read mt-3 block max-w-xl text-left text-sm text-[var(--ink)]/70"
          />
        )}
      </div>
      {era.images?.sketch && (
        <Sketch
          images={era.images}
          variant="plate"
          // Below the prose on a phone, matching how a rupture and an
          // illustrated card already stack there: read the era, then see
          // it. Above the title it read as a stray banner. On desktop it is
          // absolutely positioned, so this DOM order costs the spread
          // nothing.
          className="relative -mt-2 h-52 w-full lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:h-full lg:w-[52%]"
        />
      )}
    </header>
  );
}
