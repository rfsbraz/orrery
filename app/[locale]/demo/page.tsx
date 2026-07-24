import Link from "next/link";
import type { Metadata } from "next";
import { localeFromSegment, localePath } from "@/lib/i18n/config";
import { themeVars } from "@/lib/theme";
import { RiverEventCard } from "@/components/river/dispatcher";
import { ChapterGate } from "@/components/river/chapter-gate";
import { buildDemoTimeline, ORGANISATION_ORDER, type DemoEntry } from "@/lib/demo/timeline";

export const metadata: Metadata = {
  title: "Layout grammar demo (internal) - Orrery",
  // noindex: this is a review tool for sixteen river organisations, not a
  // page anyone should land on from search.
  robots: { index: false, follow: false },
};

/**
 * Internal review page: every one of the sixteen river layout-grammar
 * organisations (orrery-content docs/LAYOUT.md), rendered through the REAL
 * dispatcher (components/river/dispatcher.tsx) and the REAL organisation
 * components - never a mock, never a copy of their markup - against a
 * fabricated "demo" timeline (lib/demo/timeline.ts) so all sixteen can be
 * judged side by side without waiting on real generated art.
 *
 * Deliberately NOT wired through River/RiverView (components/river.tsx):
 * that component also renders works, reading orders, decade rules and the
 * order-scoped progress UI, none of which this page is about, and pulling it
 * in would mean fabricating a full FranchiseBundle just to reach the
 * organisation cells underneath. This page talks to `RiverEventCard` and
 * `ChapterGate` directly - the same two entry points River itself uses - so
 * it stays a thin, honest, internal-only harness around the grammar, not a
 * second copy of the franchise page.
 */
export default async function DemoPage(props: { params: Promise<{ locale: string }> }) {
  const { locale: localeSeg } = await props.params;
  const locale = localeFromSegment(localeSeg === "en" ? undefined : localeSeg);

  // Same themeVars() call a real franchise page makes (lib/theme.ts), with
  // no franchise theme so it resolves to the brand-neutral default palette.
  // The literal hex values are also handed to the placeholder generator
  // (lib/demo/placeholder.ts) - see that file for why a data-URI image can't
  // just reference `var(--accent)` itself.
  const vars = themeVars() as Record<string, string>;
  const colors = { surface: vars["--surface"], ink: vars["--ink"], accent: vars["--accent"] };

  const entries = buildDemoTimeline(colors);

  // ChapterGate renders a <header>, not an <li> - it cannot sit inside the
  // same <ul> as the event cards (RiverEventCard always renders an <li>,
  // matching river.tsx's own <ul> boundaries around each run of cards). So
  // consecutive events are grouped into one <ul> per run, and an era stands
  // alone between runs, exactly where river.tsx breaks its own list.
  type EraEntry = Extract<DemoEntry, { kind: "era" }>;
  type EventEntry = Extract<DemoEntry, { kind: "event" }>;
  type Run = { kind: "era"; entry: EraEntry } | { kind: "events"; items: EventEntry[] };
  const runs: Run[] = [];
  for (const entry of entries) {
    if (entry.kind === "era") {
      runs.push({ kind: "era", entry });
    } else {
      const last = runs[runs.length - 1];
      if (last?.kind === "events") last.items.push(entry);
      else runs.push({ kind: "events", items: [entry] });
    }
  }

  // One jump-link per organisation, to that organisation's first appearance
  // in the timeline above - a plain reviewer tool, not a product surface.
  const firstAnchor = new Map<string, string>();
  for (const entry of entries) {
    const org = entry.kind === "era" ? "chapter-gate" : entry.event.organisation ?? "beside";
    if (!firstAnchor.has(org)) firstAnchor.set(org, entry.id);
  }

  return (
    <div style={vars} className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <main className="mx-auto max-w-4xl px-6 py-14">
        <Link href={localePath(locale, "/")} className="text-xs text-[var(--ink)]/50 hover:text-[var(--ink)]">
          ← Orrery
        </Link>

        <header className="mt-4 mb-8">
          <h1 className="display text-4xl font-semibold tracking-tight">Layout grammar demo</h1>
          <p className="prose-read mt-3 max-w-2xl text-sm text-[var(--ink)]/70">
            Every one of the sixteen river organisations from orrery-content docs/LAYOUT.md, rendered through the
            real dispatcher against a fabricated demo life (Alba Ferro, b. 1971 - invented for this page only). Each
            cell shows the real generated asset once it has been filed under orrery-content assets/demo; any not yet
            drawn fall back to an inline SVG placeholder at that organisation&apos;s exact aspect. Internal review
            only - not a product surface.
          </p>
        </header>

        <nav aria-label="Jump to organisation" className="mb-10 flex flex-wrap gap-1.5 border-y border-[var(--ink)]/10 py-3">
          {ORGANISATION_ORDER.map((org) => {
            const anchor = firstAnchor.get(org);
            if (!anchor) return null;
            return (
              <a
                key={org}
                href={`#e-${anchor}`}
                className="rounded-full border border-[var(--ink)]/15 px-2.5 py-0.5 font-mono text-[11px] text-[var(--ink)]/70 hover:border-[var(--accent)] hover:text-[var(--ink)]"
              >
                {org}
              </a>
            );
          })}
        </nav>

        <div className="relative lg:pl-8">
          {runs.map((run, i) => {
            if (run.kind === "era") {
              return (
                <div key={run.entry.id} id={`e-${run.entry.id}`} className="scroll-mt-24">
                  <ChapterGate era={run.entry.era} enteringLabel="entering" />
                </div>
              );
            }
            return (
              <ul key={`run-${i}`}>
                {run.items.map((e) => (
                  <RiverEventCard key={e.id} event={e.event} {...e.cardProps} permalinkLabel="Link to this entry" />
                ))}
              </ul>
            );
          })}
        </div>
      </main>
    </div>
  );
}
