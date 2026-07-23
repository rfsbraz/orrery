"use client";

import Link from "next/link";
import { parseRefs } from "@/lib/content/refs";
import { useLocale, useWorkTitles } from "@/components/i18n/provider";

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
  const titles = useWorkTitles();
  const segments = parseRefs(text, locale);
  return (
    <span className={className}>
      {segments.map((s, i) =>
        s.kind === "link" ? (
          <span key={i}>
            <Link
              href={s.href}
              className="underline decoration-[var(--accent)]/40 underline-offset-2 hover:decoration-[var(--accent)]"
            >
              {s.text}
            </Link>
            {/* A translated reference must not erase the author's own title.
                Only shown when the two actually differ, so an untranslated
                locale reads exactly as before. */}
            {s.type === "work" && titles[s.id] && titles[s.id] !== s.text && (
              <span className="text-[var(--muted)]"> ({titles[s.id]})</span>
            )}
          </span>
        ) : (
          <span key={i}>{s.text}</span>
        )
      )}
    </span>
  );
}
