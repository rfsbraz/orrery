import fs from "node:fs";
import path from "node:path";
import type { Author } from "@/lib/content/types";

/**
 * An author's portrait as the museum shows it: an engraved plate.
 *
 * Source order:
 * 1. A curated etched illustration at `public/portraits/<author-id>.webp`,
 *    when one exists. These are commissioned/generated artworks; where one
 *    derives from a licensed photograph its credit line must carry the
 *    original attribution (CC BY / BY-SA attribution and share-alike survive
 *    derivation) - keep `images.portraitCredit` accurate in content.
 * 2. The licensed photograph from content (`images.portrait`), rendered
 *    through the `.etched` accent-duotone treatment so it reads as a plate
 *    rather than a snapshot.
 * 3. No image: a quiet monogram tile in the display face. Empty is a
 *    supported state, never a broken one.
 *
 * The credit is part of the licence, not decoration: while an image renders,
 * the caption renders with it.
 */

function etchedOverride(authorId: string): string | null {
  const file = path.join(process.cwd(), "public", "portraits", `${authorId}.webp`);
  return fs.existsSync(file) ? `/portraits/${authorId}.webp` : null;
}

export function Portrait({
  author,
  className = "",
  plateClassName = "aspect-[3/4] rounded-xl",
  showCredit = true,
}: {
  author: Pick<Author, "id" | "name" | "images">;
  /** Figure wrapper: width and placement. */
  className?: string;
  /** The plate itself: aspect, radius, border. */
  plateClassName?: string;
  showCredit?: boolean;
}) {
  const override = etchedOverride(author.id);
  const photo = author.images?.portrait;
  const credit = author.images?.portraitCredit;
  const src = override ?? photo;

  if (!src) {
    return (
      <div aria-hidden className={className}>
        <div
          className={`flex w-full items-center justify-center bg-[var(--surface,#171a21)] ${plateClassName}`}
        >
          <span className="display text-4xl font-semibold text-[var(--accent,#8a8f98)]/70">
            {author.name.charAt(0)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <figure className={`m-0 ${className}`}>
      <div
        className={`relative isolate w-full overflow-hidden ${override ? "" : "etched"} ${plateClassName}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={author.name} loading="lazy" className="h-full w-full object-cover" />
      </div>
      {showCredit && credit && (
        <figcaption className="mt-1 text-right font-mono text-[9px] leading-tight text-[var(--muted,#8b8f98)]/70">
          {credit}
        </figcaption>
      )}
    </figure>
  );
}
