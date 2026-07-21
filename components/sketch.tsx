import type { SketchImage } from "@/lib/content/types";

/**
 * A generated sketch for an era or an event.
 *
 * Every sketch is drawn on a TRANSPARENT background, whatever presentation the
 * artwork itself uses (a torn sheet, a panel dissolving at its edges, objects
 * on an implied surface - see orrery-content docs/VISUAL.md). That is what lets
 * one asset read correctly on a dark event card AND on a rupture band, which is
 * the wing's ink colour inverted out of the page. Nothing here paints a
 * background behind the art, deliberately.
 *
 * Two variants:
 * - `object` (default) - the art sits on whatever is behind it, untouched.
 * - `plate` - an era backdrop: fills its box and is masked to dissolve at the
 *   edges, so a half-page illustration does not read as a picture with a border.
 */
export function Sketch({
  images,
  alt = "",
  className,
  tint = false,
  variant = "object",
}: {
  images?: SketchImage;
  /** Empty by default: these are atmosphere, and the adjacent prose says it. */
  alt?: string;
  className?: string;
  /** World events are drawn once in neutral house style and coloured per wing. */
  tint?: boolean;
  variant?: "object" | "plate";
}) {
  const raw = images?.sketch;
  if (!raw) return null;
  // Content stores a repo-relative path ("assets/<wing>/<id>.webp"); the build
  // copies orrery-content/assets into public/, so the served URL is rooted.
  // Absolute URLs are still honoured in case a sketch is ever hosted elsewhere.
  const src = /^https?:\/\//.test(raw) ? raw : `/${raw.replace(/^\/+/, "")}`;

  const plate = variant === "plate";
  const fade =
    "radial-gradient(ellipse 78% 78% at 50% 50%, #000 42%, rgba(0,0,0,0.72) 62%, transparent 88%)";

  // A shared world-event sketch is recoloured to the wing's accent. That means
  // painting the accent THROUGH the drawing's alpha - the image becomes a mask
  // over a coloured box and is never rendered as pixels. An earlier version set
  // backgroundColor on the <img>, which puts the colour behind the artwork and
  // leaves its own ink on top: the opposite of a tint. It shipped untested
  // because no world-event sketch existed yet to show it failing.
  if (tint) {
    const mask = `url("${src}") center / contain no-repeat`;
    return (
      <span
        aria-hidden={!alt}
        className={`pointer-events-none block ${className ?? ""}`}
        style={{
          backgroundColor: "var(--accent)",
          WebkitMask: mask,
          mask,
        }}
      >
        {/* The masked span paints a colour, so it has no intrinsic size and
            collapsed to zero height - a tinted sketch rendered as nothing at
            all. This hidden copy of the image gives the box the artwork's own
            aspect ratio; the accent is what actually shows, through the mask. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" aria-hidden className="w-full opacity-0" />
      </span>
    );
  }

  return (
    <span aria-hidden={!alt} className={`pointer-events-none block ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`h-full w-full ${plate ? "object-cover" : "object-contain"}`}
        style={plate ? { WebkitMaskImage: fade, maskImage: fade } : undefined}
      />
    </span>
  );
}
