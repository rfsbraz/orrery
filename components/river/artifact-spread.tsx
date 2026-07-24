import { SpoilerGate } from "../spoilers/spoiler-gate";
import { Sketch } from "../sketch";
import { EventMeta, EventProse, EventTitle, RailNode, eventAnchorId } from "./shared";
import type { EventCardProps } from "./shared";

/**
 * `artifact-spread` - the document is the page (LAYOUT.md). One primary
 * archival artifact (manuscript, letter, proof, newspaper) replaces the
 * illustration entirely: it IS the principal surface, 55-70% of the cell,
 * with prose in a disciplined supporting column. Evidence, not atmosphere -
 * a rejection, a contract, a court record.
 *
 * The artifact draws its own paper edge and skips the dissolve filter
 * (VISUAL.md §3b/§5a); `Sketch`'s plain `object` variant already never
 * applies a CSS dissolve of its own (that fade is baked into the asset for
 * atmospheric types, and simply absent here), so no special-casing is needed
 * on this side - the note in the docs is a constraint on the generator, not
 * on this component.
 *
 * Compatible modifiers: `breakout` (an isolated element - a wax seal, a torn
 * corner - crossing the artifact's own edge) is real here, the same
 * `overflow-visible` + wider negative margin treatment as `beside`.
 * `pull-focus` and `fold-reveal` are also listed compatible in LAYOUT.md but
 * are not implemented; an event carrying either renders as if it carried
 * neither.
 */
export function ArtifactSpread({
  event,
  scale = "seam",
  side = "right",
  year,
  age,
  permalinkLabel,
  boundaryTitle,
}: EventCardProps) {
  const rupture = scale === "rupture";
  const illustrated = Boolean(event.images?.sketch);
  const breakout = event.modifier === "breakout";

  return (
    <li
      id={eventAnchorId(event.id)}
      className={`group relative scroll-mt-24 ${rupture ? "my-9" : "my-5"}`}
    >
      <RailNode rupture={rupture} />

      <div
        className={`rounded-xl border border-[var(--ink)]/10 bg-[var(--surface)]/60 p-5 max-lg:p-4 ${
          breakout ? "overflow-visible" : "overflow-hidden"
        }`}
      >
        <SpoilerGate spoilerAfter={event.spoilerAfter} boundaryTitle={boundaryTitle}>
          <div
            className={`flex items-start gap-6 max-lg:flex-col ${
              side === "left" ? "lg:flex-row-reverse" : ""
            }`}
          >
            {illustrated && (
              <Sketch
                images={event.images}
                className={`w-[62%] shrink-0 max-lg:w-full ${breakout ? "-my-2 overflow-visible" : ""}`}
              />
            )}
            <div className="min-w-0 flex-1">
              <EventMeta event={event} year={year} age={age} permalinkLabel={permalinkLabel} />
              <EventTitle className={rupture ? "text-2xl" : "text-lg"}>{event.title}</EventTitle>
              <EventProse text={event.description} />
            </div>
          </div>
        </SpoilerGate>
      </div>
    </li>
  );
}
