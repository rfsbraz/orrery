import { SpoilerGate } from "../spoilers/spoiler-gate";
import { Sketch } from "../sketch";
import { EventMeta, EventProse, EventTitle, RailNode, eventAnchorId } from "./shared";
import type { EventCardProps } from "./shared";

/**
 * `full-bleed-vista` - the breath (LAYOUT.md). A wide establishing image
 * spanning the full content column; prose is a SEPARATE block, never
 * overlaid (that overlay is `immersion`'s job, one door down). Use: a
 * birthplace, an arrival, the opening of a period - a pause between beats
 * rather than a beat itself.
 *
 * "Above or below" in the spec is read here as: the image always comes
 * first (it's the establishing shot, the thing you see before you're told
 * what it is), and the prose block sits below it, aligned to `side` so the
 * alternation the river already computes still reads as rhythm rather than
 * every vista looking identical.
 *
 * No modifiers are listed as compatible with this organisation in LAYOUT.md;
 * none are handled here.
 */
export function FullBleedVista({
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

  return (
    <li
      id={eventAnchorId(event.id)}
      className={`group relative scroll-mt-24 ${rupture ? "my-10" : "my-7"}`}
    >
      <RailNode rupture={rupture} />

      <div className="overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--surface)]/60">
        <SpoilerGate spoilerAfter={event.spoilerAfter} boundaryTitle={boundaryTitle}>
          {illustrated && (
            // Opaque establishing art (VISUAL.md §3b): cover, not contain, so
            // the panorama actually spans the column instead of
            // letterboxing. Plain `object` variant, deliberately NOT `plate`
            // - this image sits in its own block with a hard edge (the
            // card's rounded corners already clip it), it is never
            // overlaid with text the way `chapter-gate`'s plate mask exists
            // to dissolve under, so the radial fade would just be an
            // unexplained vignette here.
            //
            // Sized by ASPECT RATIO, not a fixed pixel height, at EVERY
            // breakpoint. A fixed height against a full-width column
            // produces a crop window against the 3:2/16:9 source that gets
            // MORE severe the wider the column is - at `cover` that discards
            // height evenly top and bottom, and every sketch's orrery motif
            // (VISUAL.md §1a) defaults to the sky, so it kept landing in the
            // discarded band (the Stephen King birth card is the case that
            // surfaced it, first on desktop, then again on a wide phone once
            // desktop was fixed and mobile still had a fixed height - the
            // crop keeps growing with viewport width no matter which
            // breakpoint it happens at). aspect-[2/1]/[16/9] keep the crop
            // to roughly 10% top and bottom against both authored source
            // aspects AT ANY WIDTH, which is enough margin for a motif
            // placed anywhere reasonably off-centre, while still reading
            // shallower than the source - the "breath" this organisation is
            // for.
            <Sketch
              images={event.images}
              fit="cover"
              className={`block w-full ${rupture ? "aspect-[16/9]" : "aspect-[2/1]"}`}
            />
          )}
          <div
            className={`flex p-6 max-lg:p-4 ${side === "left" ? "lg:justify-start" : "lg:justify-end"}`}
          >
            <div className="max-w-md">
              <EventMeta event={event} year={year} age={age} permalinkLabel={permalinkLabel} />
              <EventTitle className={rupture ? "text-3xl max-lg:text-2xl" : "text-xl"}>
                {event.title}
              </EventTitle>
              <EventProse text={event.description} className={rupture ? "mt-3 text-[15px]" : "mt-2 text-sm"} />
            </div>
          </div>
        </SpoilerGate>
      </div>
    </li>
  );
}
