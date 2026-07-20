import Link from "next/link";
import type { Capabilities, CapabilityKey } from "@/lib/content/capabilities";

// Capability-driven navigation for a franchise's feature pages. Each feature
// registers its entry here; a franchise only shows the links its content
// activates (the framework seam - sparse franchises show fewer doors, none
// broken). Ordering is editorial: browse features first, tools after.
const ITEMS: { key: CapabilityKey; href: (slug: string) => string; label: string }[] = [
  // Feature pages register here as they land.
  { key: "wizard", href: (s) => `/f/${s}/start`, label: "Where to start" },
  { key: "river", href: (s) => `/f/${s}/river`, label: "The River" },
  { key: "orderDiff", href: (s) => `/f/${s}/compare`, label: "Compare orders" },
];

export function FranchiseNav({ slug, caps }: { slug: string; caps: Capabilities }) {
  const items = ITEMS.filter((i) => caps[i.key]);
  if (items.length === 0) return null;
  return (
    <nav aria-label="Franchise features" className="mt-5 flex flex-wrap gap-2">
      {items.map((i) => (
        <Link
          key={i.key}
          href={i.href(slug)}
          className="rounded-full border border-[var(--ink)]/15 bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--ink)]/75 transition-colors hover:border-[var(--accent)] hover:text-[var(--ink)]"
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
