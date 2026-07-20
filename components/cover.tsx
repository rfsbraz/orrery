"use client";

import { useState } from "react";

/**
 * A book cover that never breaks: tries the cover URL (OpenLibrary asked to
 * 404 rather than serve its blank placeholder) and falls back to a designed
 * "spine" tile - accent-washed cloth with the title's initial and the year -
 * so a missing cover reads as intentional, not broken.
 */
export function Cover({
  src,
  title,
  year,
  className,
}: {
  src?: string;
  title: string;
  year: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const url =
    src && src.includes("covers.openlibrary.org") ? `${src}?default=false` : src;

  if (!url || failed) {
    return (
      <div
        aria-hidden
        className={`flex shrink-0 flex-col items-center justify-between rounded-sm border border-[var(--ink)]/15 bg-gradient-to-b from-[var(--accent)]/25 to-[var(--accent)]/10 py-2 ${className ?? ""}`}
      >
        <span aria-hidden className="h-px w-2/3 bg-[var(--ink)]/25" />
        <span className="display text-xl font-semibold text-[var(--ink)]/70">
          {title.replace(/^['"]/, "").charAt(0).toUpperCase()}
        </span>
        <span className="font-mono text-[9px] text-[var(--ink)]/50">{year}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-sm object-cover shadow-md ${className ?? ""}`}
    />
  );
}
