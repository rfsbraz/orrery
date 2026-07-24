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
  fit,
  onError,
}: {
  images?: SketchImage;
  /** Empty by default: these are atmosphere, and the adjacent prose says it. */
  alt?: string;
  className?: string;
  /** World events are drawn once in neutral house style and coloured per wing. */
  tint?: boolean;
  variant?: "object" | "plate";
  /** Override the variant's default object-fit. `plate` defaults to `cover`
   * and `object` to `contain`; a few layout-grammar organisations (e.g.
   * `full-bleed-vista`) want a `cover` crop without the plate's edge-dissolve
   * mask, which is the one combination the variant alone can't express. */
  fit?: "contain" | "cover";
  /** Forwarded to the underlying `<img>`. Lets a multi-image organisation
   * (components/river/image-slot.tsx) hide a slot that 404s instead of
   * showing a broken-image glyph, without this component needing to know
   * anything about that - see the comment there for why it's a client-side
   * check rather than a server-side existence check. */
  onError?: () => void;
}) {
  const raw = images?.sketch;
  if (!raw) return null;
  // Content stores a repo-relative path ("assets/<wing>/<id>.webp"); the build
  // copies orrery-content/assets into public/, so the served URL is rooted.
  // Absolute URLs are still honoured in case a sketch is ever hosted elsewhere.
  const src = /^https?:\/\//.test(raw) ? raw : `/${raw.replace(/^\/+/, "")}`;

  const plate = variant === "plate";
  const cover = fit ? fit === "cover" : plate;
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
        onError={onError}
        className={`h-full w-full ${cover ? "object-cover" : "object-contain"}`}
        style={plate ? { WebkitMaskImage: fade, maskImage: fade } : undefined}
      />
    </span>
  );
}
