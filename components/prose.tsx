"use client";

import Link from "next/link";
import { parseRefs } from "@/lib/content/refs";
import { useLocale } from "@/components/i18n/provider";

/**
 * Render prose with inline [[type:id|text]] references turned into links.
 *
 * A client component purely so it can read the locale from context. Its props
 * are plain strings, so the server components rendering it are unaffected, and
 * this avoids threading a `locale` prop through all sixteen call sites just to
 * build a correct href.
 */
export function Prose({ text, className }: { text?: string | null; className?: string }) {
  const locale = useLocale();
  const segments = parseRefs(text, locale);
  return (
    <span className={className}>
      {segments.map((s, i) =>
        s.kind === "link" ? (
          <Link
            key={i}
            href={s.href}
            className="underline decoration-[var(--accent)]/40 underline-offset-2 hover:decoration-[var(--accent)]"
          >
            {s.text}
          </Link>
        ) : (
          <span key={i}>{s.text}</span>
        )
      )}
    </span>
  );
}
