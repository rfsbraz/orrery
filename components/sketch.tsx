import type { SketchImage } from "@/lib/content/types";

/**
 * A generated sketch for an era or an event.
 *
 * Two variants, because two different jobs:
 *
 * - `plate` - a backdrop behind an era title. It fills its box and is masked to
 *   dissolve at the edges, because a full-bleed backdrop must not read as a
 *   picture with a border.
 * - `object` (the default) - a piece of drawn paper laid ON the page: torn
 *   edges, a shadow, and objects that break out of its lower edge. That edge is
 *   part of the artwork and could not be faked in CSS, so these are generated
 *   on a TRANSPARENT background and nothing is masked here. Transparency is
 *   what keeps them wing-agnostic: the page shows through the tear, whatever
 *   colour that page happens to be.
 *
 * The earlier version masked everything with a radial fade. On a near-black
 * wing that still read as a pale square floating on the page, because a fade
 * cannot disguise a rectangle of cream paper - only a drawn edge can.
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
  /** World events are drawn once in neutral house style on transparency and
   * coloured per wing, so the accent reaches them through this. */
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

  return (
    <span aria-hidden={!alt} className={`pointer-events-none block ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`h-full w-full ${plate ? "object-cover" : "object-contain"}`}
        style={{
          ...(plate ? { WebkitMaskImage: fade, maskImage: fade } : {}),
          ...(tint
            ? {
                // The sketch is a transparent line drawing; painting the accent
                // through it keeps one shared asset looking native to each wing.
                backgroundColor: "var(--accent)",
                WebkitMaskComposite: "source-in",
                maskComposite: "intersect",
              }
            : {}),
        }}
      />
    </span>
  );
}
