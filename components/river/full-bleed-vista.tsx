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
            // Desktop is sized by ASPECT RATIO, not a fixed pixel height. A
            // fixed h-64/h-80 against a ~850px column produced a >3:1 crop
            // window against a 3:2 or 16:9 source, which at `cover` discards
            // roughly half the image's height, split evenly top and bottom -
            // and every sketch's orrery motif (VISUAL.md §1a) defaults to the
            // sky, so it landed in the discarded band more often than not
            // (the Stephen King birth card is the case that surfaced it).
            // aspect-[2/1]/[16/9] keep the crop within ~10% top and bottom
            // against both authored source aspects, which is enough margin
            // for a motif placed anywhere reasonably off-centre, while still
            // reading shallower than the source - the "breath" this
            // organisation is for. Mobile keeps its original fixed height:
            // the narrower column is already close to the source aspect
            // there, so the crop was never the problem on that breakpoint.
            <Sketch
              images={event.images}
              fit="cover"
              className={`block w-full ${
                rupture
                  ? "aspect-[16/9] max-lg:aspect-auto max-lg:h-56"
                  : "aspect-[2/1] max-lg:aspect-auto max-lg:h-48"
              }`}
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
