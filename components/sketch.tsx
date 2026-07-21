import type { SketchImage } from "@/lib/content/types";

/**
 * A generated sketch for an era or an event, dissolving into the page.
 *
 * The fade lives HERE and not in the prompt, deliberately. A fade baked into
 * the pixels can only fade to one colour, and these images are drawn on warm
 * paper while a wing's page may be near-black umber or pale - so a baked edge
 * reads as a card floating on the page instead of part of it. An alpha mask
 * fades to whatever is actually behind it, identically on every wing, and can
 * be retuned without regenerating seventeen images.
 *
 * It also keeps the asset neutral raw material: the same file survives a
 * layout change. Asking the model for an edge treatment would give us a
 * slightly different vignette every generation, which is exactly the
 * "looks like a different illustration system" failure the visual system
 * exists to prevent.
 */
export function Sketch({
  images,
  alt = "",
  className,
  tint = false,
}: {
  images?: SketchImage;
  /** Empty by default: these are atmosphere, and the adjacent prose says it. */
  alt?: string;
  className?: string;
  /** World events are drawn once in neutral house style on transparency and
   * coloured per wing, so the accent reaches them through this. */
  tint?: boolean;
}) {
  const raw = images?.sketch;
  if (!raw) return null;
  // Content stores a repo-relative path ("assets/<wing>/<id>.webp"); the build
  // copies orrery-content/assets into public/, so the served URL is rooted.
  // Absolute URLs are still honoured in case a sketch is ever hosted elsewhere.
  const src = /^https?:\/\//.test(raw) ? raw : `/${raw.replace(/^\/+/, "")}`;

  const fade =
    "radial-gradient(ellipse 78% 78% at 50% 50%, #000 42%, rgba(0,0,0,0.72) 62%, transparent 88%)";

  return (
    <span aria-hidden={!alt} className={`pointer-events-none block ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover"
        style={{
          WebkitMaskImage: fade,
          maskImage: fade,
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
