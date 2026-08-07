"use client";

import { useState } from "react";
import { River } from "./river";
import { OrderSelector } from "./orders/order-selector";
import { ListProgress } from "./progress/list-progress";
import type { RiverLayer, SeriesEntry } from "@/lib/content/river";
import type { ReadingOrder, WorkFormat } from "@/lib/content/types";
import type { SignatureKind } from "@/lib/theme";

/** Scope the walk to one order's works, recomputing era/decade markers. */
function rescope(layers: RiverLayer[], scoped: Set<string>): RiverLayer[] {
  const kept = layers
    .map((l) => ({ ...l, works: l.works.filter((w) => scoped.has(w.id)) }))
    .filter((l) => l.works.length > 0);

  let prevEra: string | null = null;
  let prevDecade: number | null = null;
  return kept.map((l) => {
    const decade = Math.floor(l.year / 10) * 10;
    const out = {
      ...l,
      eraStart: l.era !== null && l.era.id !== prevEra,
      decadeStart: decade !== prevDecade,
    };
    if (l.era) prevEra = l.era.id;
    prevDecade = decade;
    return out;
  });
}

/**
 * The walk plus its controls. Picking a curated order scopes the strata to
 * that order's works and numbers each by its position in it; time stays the
 * spine, because the whole point is seeing a chosen reading against the years
 * it came from.
 */
export function RiverView({
  layers,
  orders,
  series,
  covers,
  workTitles,
  localTitles,
  authorNames,
  authorHrefs,
  withCoAuthorPrefix,
  isbns,
  readUrls,
  signature,
  allWorkIds,
  enteringLabel,
  permalinkLabel,
  forthcomingLabel,
  formatLabels,
  publishedAsTemplate,
  authorBorn,
  agedTemplate,
  elapsedTemplate,
}: {
  layers: RiverLayer[];
  orders: ReadingOrder[];
  series: Map<string, SeriesEntry>;
  covers: Record<string, string>;
  workTitles: Record<string, string>;
  localTitles?: Record<string, string>;
  authorNames?: Map<string, string>;
  /** `/author/<id>` for every id in `authorNames` - a co-author page that
   * redirects straight to their own wing if they have one. */
  authorHrefs?: Map<string, string>;
  /** Localised "with" prefix before a work's `withAuthorIds` credit line. */
  withCoAuthorPrefix?: string;
  isbns?: Record<string, string | undefined>;
  readUrls?: Record<string, string | null | undefined>;
  signature?: SignatureKind;
  allWorkIds: string[];
  /** Localised label above an era plate title ("entering" / "a entrar em"). */
  enteringLabel?: string;
  /** Localised accessible name for an event's permalink. */
  permalinkLabel?: string;
  forthcomingLabel?: string;
  formatLabels?: Record<Exclude<WorkFormat, "novel">, string>;
  publishedAsTemplate?: string;
  /** Birth date per author id, for a life event's age. */
  authorBorn?: Map<string, string | number>;
  /** Localised "aged {age}" template. */
  agedTemplate?: string;
  elapsedTemplate?: string;
}) {
  const [selection, setSelection] = useState<{ id: string; workIds: string[] } | null>(null);

  const scoped = selection ? new Set(selection.workIds) : null;
  const positions = selection
    ? new Map(selection.workIds.map((id, i) => [id, i + 1]))
    : undefined;

  // Scoped to an order: keep only the years that actually contain one of its
  // books. A rupture or era plate in a year the order never visits is noise,
  // so era and decade markers are recomputed over what survives - the reader
  // still crosses eras, but only the ones their reading passes through.
  const visible = scoped ? rescope(layers, scoped) : layers;

  return (
    <>
      <OrderSelector orders={orders} onChange={setSelection} />
      <ListProgress workIds={selection ? selection.workIds : allWorkIds} />
      <div className="pt-6">
        <River
          layers={visible}
          series={series}
          covers={covers}
          workTitles={workTitles}
          localTitles={localTitles}
          authorNames={authorNames}
          authorHrefs={authorHrefs}
          withCoAuthorPrefix={withCoAuthorPrefix}
          isbns={isbns}
          readUrls={readUrls}
          signature={signature}
          orderPositions={positions}
          enteringLabel={enteringLabel}
          permalinkLabel={permalinkLabel}
          forthcomingLabel={forthcomingLabel}
          formatLabels={formatLabels}
          publishedAsTemplate={publishedAsTemplate}
          authorBorn={authorBorn}
          agedTemplate={agedTemplate}
          elapsedTemplate={elapsedTemplate}
        />
      </div>
    </>
  );
}
