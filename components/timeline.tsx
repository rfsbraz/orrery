import { Prose } from "./prose";
import { ProgressControl } from "./progress/control";
import { FindACopy } from "./find-a-copy";
import { Cover } from "./cover";
import { SpoilerGate } from "./spoilers/spoiler-gate";
import { EventAnchor, eventAnchorId } from "./event-anchor";
import { impactStyles, signatureLine, type SignatureKind } from "@/lib/theme";
import type { AuraEvent, Work, WorkFormat } from "@/lib/content/types";
import { DEFAULT_FORMAT_LABELS } from "./river";

function yearOf(e: AuraEvent): number {
  const m = String(e.date ?? e.dateRange ?? "").match(/\d{4}/);
  return m ? Number(m[0]) : 0;
}

type Item =
  | { kind: "work"; year: number; work: Work }
  | { kind: "event"; year: number; event: AuraEvent };

/**
 * The aura: works and the events around them, interwoven chronologically and
 * strung along the franchise's signature line (its theme.yaml picks which -
 * a beam, a quiet thread, a rule). Atmosphere through structure, not decor.
 */
export function Timeline({
  works,
  events,
  authorNames,
  editions,
  signature = "thread",
  permalinkLabel = "Link to this event",
  formatLabels = DEFAULT_FORMAT_LABELS,
  publishedAsLabel = (name: string) => `as ${name}`,
}: {
  works: Work[];
  events: AuraEvent[];
  authorNames?: Map<string, string>;
  /** Per-work cover URL + buy ISBN + free-read URL (editions layer; absent
   * entries fall back). */
  editions?: Record<string, { cover: string | null; isbn13?: string; readUrl?: string | null }>;
  /** Localised accessible name for an event's permalink. */
  permalinkLabel?: string;
  /** The franchise's signature element, from its theme.yaml. */
  signature?: SignatureKind;
  /** Localised badges for a work's `format` when it isn't an ordinary novel
   * (orrery-content docs/SCHEMA.md). Same badge as the River's work cards -
   * `canonTier` (core/extended/apocrypha) drives layout but is never itself
   * displayed. */
  formatLabels?: Record<Exclude<WorkFormat, "novel">, string>;
  /** Localised "as {name}" for a work published under a pseudonym. */
  publishedAsLabel?: (name: string) => string;
}) {
  const items: Item[] = [
    ...works.map((w) => ({ kind: "work" as const, year: w.published, work: w })),
    ...events.map((e) => ({ kind: "event" as const, year: yearOf(e), event: e })),
  ].sort((a, b) => a.year - b.year || (a.kind === "event" ? -1 : 1));

  const titles = new Map(works.map((w) => [w.id, w.title]));
  const titleOf = (id: string) => titles.get(id);

  return (
    <div className="relative">
      {/* The franchise's signature line (beam / thread / rule / none) */}
      <div
        aria-hidden
        className={`pointer-events-none absolute left-0 top-1.5 bottom-1.5 ${signatureLine[signature]}`}
      />
      <ol className="space-y-6 pl-6">
        {items.map((item, i) =>
          item.kind === "work" ? (
            <li key={`w-${item.work.id}`} id={`w-${item.work.id.split("/").pop()}`}>
              <span
                aria-hidden
                className="absolute -ml-[1.72rem] mt-2 h-2.5 w-2.5 rounded-full border border-[var(--bg)] bg-[var(--accent)]"
              />
              <div className="flex gap-4 rounded-lg border border-[var(--ink)]/10 bg-[var(--surface)] p-4">
                <Cover
                  src={editions?.[item.work.id]?.cover ?? undefined}
                  title={item.work.title}
                  year={item.work.published}
                  className="h-24 w-16 max-sm:hidden"
                />
                <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                  <span className="font-mono text-xs text-[var(--muted)]">{item.year}</span>
                  <h3 className="display text-lg font-semibold text-[var(--ink)]">
                    {item.work.title}
                  </h3>
                  {item.work.subseries && (
                    <span className="rounded bg-[var(--accent)]/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--ink)]/75">
                      {item.work.subseries}
                    </span>
                  )}
                  {item.work.publishedAs && (
                    <span className="text-[11px] italic text-[var(--muted)]">
                      {publishedAsLabel(item.work.publishedAs)}
                    </span>
                  )}
                  {item.work.format && item.work.format !== "novel" && (
                    <span className="text-[10px] uppercase tracking-wide text-[var(--muted)]/70">
                      {formatLabels[item.work.format]}
                    </span>
                  )}
                </div>
                {item.work.synopsis && (
                  <Prose
                    text={item.work.synopsis}
                    className="prose-read mt-2 block text-sm text-[var(--ink)]/80"
                  />
                )}
                <ProgressControl workId={item.work.id} />
                <FindACopy
                  title={item.work.title}
                  author={authorNames?.get(item.work.authorIds[0])}
                  openLibraryId={item.work.externalIds?.openLibrary}
                  isbn13={editions?.[item.work.id]?.isbn13}
                  readUrl={editions?.[item.work.id]?.readUrl}
                />
                </div>
              </div>
            </li>
          ) : (
            <li key={`e-${item.event.id}-${i}`} id={eventAnchorId(item.event.id)} className="group scroll-mt-24">
              <span
                aria-hidden
                className={`absolute -ml-[1.6rem] mt-[0.42rem] h-1.5 w-1.5 rounded-full ${
                  item.event.impact === "high" ? "bg-[var(--accent)]" : "bg-[var(--ink)]/40"
                }`}
              />
              <div className={`border-l-2 pl-3.5 ${impactStyles[item.event.impact] ?? ""}`}>
                <SpoilerGate
                  spoilerAfter={item.event.spoilerAfter}
                  boundaryTitle={titleOf(item.event.spoilerAfter ?? "")}
                >
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-mono text-[11px] text-[var(--muted)]/80">
                      {item.year}
                      <EventAnchor eventId={item.event.id} label={permalinkLabel} />
                    </span>
                    <span className="text-sm font-medium text-[var(--ink)]/90">
                      {item.event.title}
                    </span>
                    {item.event.scope && item.event.scope !== "author-life" && (
                      <span className="text-[10px] uppercase tracking-wide text-[var(--muted)]/70">
                        {item.event.scope}
                      </span>
                    )}
                  </div>
                  {item.event.description && (
                    <Prose
                      text={item.event.description}
                      className="prose-read mt-0.5 block text-xs text-[var(--ink)]/65"
                    />
                  )}
                </SpoilerGate>
              </div>
            </li>
          )
        )}
      </ol>
    </div>
  );
}
