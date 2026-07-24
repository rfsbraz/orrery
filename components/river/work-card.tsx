import { Prose } from "../prose";
import { Cover } from "../cover";
import { FindACopy } from "../find-a-copy";
import { ProgressControl } from "../progress/control";
import type { SeriesEntry } from "@/lib/content/river";
import type { Work } from "@/lib/content/types";

/**
 * The works layer's own treatments, the counterpart to the event layer's
 * layout grammar (orrery-content docs/LAYOUT.md).
 *
 * Why this exists: the grammar gave EVENTS sixteen shapes, but on most wings
 * works outnumber events two or three to one - Butcher is 34 works to ~13
 * events, Slaughter 43 - and every one of them rendered as the same cover-led
 * card, two-up. So the majority of a wing's page stayed a uniform grid no
 * matter how well the events were paced, which undercut the whole point of
 * composing a rhythm.
 *
 * Three treatments, not sixteen. The event grammar is where narrative variety
 * belongs; a bibliography is a list, and a list wants weighting, not fifteen
 * kinds of cell:
 *
 * - `hero` - a work that changed the life (the debut, the breakout, the last
 *   one). Full width, larger cover, the synopsis given room. Authored, via
 *   `featured: true` in content, and capped there so it stays meaningful.
 * - `standard` - the workhorse, the two-up card this file inherited.
 * - `compact` - a dense row for apocrypha: a tie-in novella should not carry
 *   the same visual weight as a novel, and eight of them in one year should
 *   not take eight cards' worth of page.
 *
 * The treatment is DERIVED, never authored beyond the one `featured` flag:
 * `canonTier` is already on every work and already means exactly what compact
 * needs it to mean.
 */

export type WorkTreatment = "hero" | "standard" | "compact";

export function treatmentFor(w: Work): WorkTreatment {
  if (w.featured) return "hero";
  if (w.canonTier === "apocrypha") return "compact";
  return "standard";
}

/** The per-wing bits every treatment needs, bundled so the three components
 * (and the river's call site) do not each grow a nine-argument signature. */
export interface WorkContext {
  entry?: SeriesEntry;
  cover?: string;
  localTitle?: string;
  orderPosition?: number;
  forthcomingLabel: string;
  authorName?: string;
  isbn13?: string;
}

function anchorId(w: Work) {
  return `w-${w.id.split("/").pop()}`;
}

/** The order marker, identical across treatments: a real sequence earns a real
 * marker, and it must not move between one card and the next. */
function OrderMarker({ n, inline = false }: { n?: number; inline?: boolean }) {
  if (n == null) return null;
  if (inline) {
    return (
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center self-start rounded-full border border-[var(--accent)]/50 font-mono text-xs font-semibold text-[var(--accent)] lg:hidden">
        {n}
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className="absolute -left-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--accent)]/60 bg-[var(--bg)] font-mono text-[11px] font-semibold text-[var(--accent)] max-lg:hidden"
    >
      {n}
    </span>
  );
}

/** Series position, pseudonym, canon tier, forthcoming badge - the metadata
 * line, shared so the three treatments cannot drift apart on what a work says
 * about itself. `tier` is suppressed in `compact`, where being apocrypha is
 * already what put the work in that treatment. */
function WorkMeta({
  w,
  ctx,
  showTier = true,
  className = "",
}: {
  w: Work;
  ctx: WorkContext;
  showTier?: boolean;
  className?: string;
}) {
  return (
    <p className={`text-[10px] uppercase tracking-wide text-[var(--muted)] ${className}`}>
      {ctx.entry && (
        <span className="text-[var(--accent)]/90">
          {ctx.entry.name} · #{ctx.entry.n} of {ctx.entry.total}
        </span>
      )}
      {w.publishedAs && (
        <span className={ctx.entry ? "ml-2 italic normal-case" : "italic normal-case"}>
          as {w.publishedAs}
        </span>
      )}
      {showTier && w.canonTier !== "core" && (
        <span className="ml-2 text-[var(--muted)]/70">{w.canonTier}</span>
      )}
      {/* An announced book sits in its year like any other, so it has to say
          plainly that it is not out - otherwise the page states a publication
          that has not happened. */}
      {w.forthcoming && (
        <span className="ml-2 rounded border border-[var(--accent)]/40 px-1 py-px normal-case text-[var(--accent)]">
          {ctx.forthcomingLabel}
        </span>
      )}
    </p>
  );
}

/** Title plus the original-language title beneath it when they differ: a
 * reader searching or discussing a book needs both. */
function WorkTitle({
  w,
  ctx,
  className,
  originalClassName,
}: {
  w: Work;
  ctx: WorkContext;
  className: string;
  originalClassName: string;
}) {
  return (
    <>
      <h3 className={className}>{ctx.localTitle ?? w.title}</h3>
      {ctx.localTitle && ctx.localTitle !== w.title && (
        <p className={originalClassName}>{w.title}</p>
      )}
    </>
  );
}

/** `hero` - the one or two books a wing turns on. Full width, a cover at
 * roughly double the standard card's area, and the synopsis unclamped on
 * desktop, because the point of the treatment is that this book gets read
 * about rather than scanned past. */
function HeroWork({ w, ctx }: { w: Work; ctx: WorkContext }) {
  return (
    <article
      id={anchorId(w)}
      className="relative flex w-full scroll-mt-20 gap-5 rounded-lg border border-[var(--accent)]/25 bg-[var(--surface)] p-5 max-lg:gap-4 max-lg:rounded-2xl max-lg:p-4"
    >
      <OrderMarker n={ctx.orderPosition} />
      <OrderMarker n={ctx.orderPosition} inline />
      <Cover
        src={ctx.cover}
        title={w.title}
        year={w.published}
        className="h-[152px] w-[100px] shrink-0 max-lg:h-[128px] max-lg:w-[84px]"
      />
      <div className="min-w-0 flex-1">
        <WorkTitle
          w={w}
          ctx={ctx}
          className="display text-xl font-semibold leading-tight max-lg:text-[19px]"
          originalClassName="mt-1 text-xs italic text-[var(--muted)] max-lg:text-[13px]"
        />
        <WorkMeta w={w} ctx={ctx} className="mt-1.5 max-lg:text-[12px]" />
        {w.synopsis && (
          <Prose
            text={w.synopsis}
            className="prose-read mt-2 block text-[13px] leading-relaxed text-[var(--ink)]/70 max-lg:line-clamp-4 max-lg:text-[14px]"
          />
        )}
        <ProgressControl workId={w.id} />
        <FindACopy
          title={w.title}
          author={ctx.authorName}
          openLibraryId={w.externalIds?.openLibrary}
          isbn13={ctx.isbn13}
        />
      </div>
    </article>
  );
}

/** `standard` - the two-up card the river has always drawn. Unchanged on
 * purpose: this is still most of most wings, and the point of the other two
 * treatments is to stop it being ALL of them. */
function StandardWork({ w, ctx }: { w: Work; ctx: WorkContext }) {
  return (
    <article
      id={anchorId(w)}
      className="relative flex w-[calc(50%-0.375rem)] scroll-mt-20 gap-3 rounded-md border border-[var(--ink)]/10 bg-[var(--surface)] p-3 max-lg:w-full max-lg:rounded-2xl"
    >
      <OrderMarker n={ctx.orderPosition} />
      <OrderMarker n={ctx.orderPosition} inline />
      <Cover
        src={ctx.cover}
        title={w.title}
        year={w.published}
        className="h-[76px] w-[50px] max-lg:h-[104px] max-lg:w-[68px]"
      />
      <div className="min-w-0 flex-1">
        <WorkTitle
          w={w}
          ctx={ctx}
          className="display text-[15px] font-semibold leading-tight max-lg:text-[17px]"
          originalClassName="mt-0.5 text-[11px] italic text-[var(--muted)] max-lg:text-[13px]"
        />
        <WorkMeta w={w} ctx={ctx} className="mt-0.5 max-lg:mt-1 max-lg:text-[12px]" />
        {w.synopsis && (
          <Prose
            text={w.synopsis}
            className="prose-read mt-1 line-clamp-2 block text-xs text-[var(--ink)]/65 max-lg:line-clamp-3 max-lg:text-[14px] max-lg:leading-relaxed"
          />
        )}
        <ProgressControl workId={w.id} />
        <FindACopy
          title={w.title}
          author={ctx.authorName}
          openLibraryId={w.externalIds?.openLibrary}
          isbn13={ctx.isbn13}
        />
      </div>
    </article>
  );
}

/** `compact` - apocrypha at the weight apocrypha deserves. A single dense row,
 * no cover, no synopsis, no store link: enough to know the thing exists and
 * where it sits, without a tie-in novella occupying the same real estate as a
 * novel. Full width rather than a third, so a run of them reads as a LIST -
 * which is what it is - instead of a second grid competing with the first. */
function CompactWork({ w, ctx }: { w: Work; ctx: WorkContext }) {
  return (
    <article
      id={anchorId(w)}
      className="relative flex w-full scroll-mt-20 items-baseline gap-2 rounded border-l-2 border-[var(--ink)]/10 bg-[var(--surface)]/40 py-1.5 pl-3 pr-2"
    >
      {ctx.orderPosition != null && (
        <span className="font-mono text-[11px] text-[var(--accent)]/80">{ctx.orderPosition}</span>
      )}
      <h3 className="display min-w-0 shrink truncate text-[13px] font-medium leading-tight max-lg:whitespace-normal max-lg:text-[15px]">
        {ctx.localTitle ?? w.title}
      </h3>
      {/* Beside the title, not pushed to the far edge with `ml-auto`: a
          full-width row is wide enough that right-aligned metadata detaches
          from its own title and lands on top of the layer's ghosted year
          numeral. */}
      <WorkMeta w={w} ctx={ctx} showTier={false} className="min-w-0 truncate max-lg:text-[11px]" />
    </article>
  );
}

const TREATMENTS: Record<WorkTreatment, React.ComponentType<{ w: Work; ctx: WorkContext }>> = {
  hero: HeroWork,
  standard: StandardWork,
  compact: CompactWork,
};

export function WorkCard({ w, ctx }: { w: Work; ctx: WorkContext }) {
  const Component = TREATMENTS[treatmentFor(w)];
  return <Component w={w} ctx={ctx} />;
}
