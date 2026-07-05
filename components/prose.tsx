import Link from "next/link";
import { parseRefs } from "@/lib/content/refs";

/** Render prose with inline [[type:id|text]] references turned into links. */
export function Prose({ text, className }: { text?: string | null; className?: string }) {
  const segments = parseRefs(text);
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
