// The spoiler engine (CONCEPT §9): a cross-cutting primitive, not a feature.
// Any event, character appearance, or connection can carry a boundary
// (`spoilerAfter: <work-id>`): the work beyond which the detail is safe.
//
// Semantics:
// - A reader who has READ the boundary work sees the content plainly.
// - Everyone else (including anonymous visitors) gets a shielded teaser they
//   can deliberately reveal - progressive disclosure, never a hard wall.
//
// This module is pure; the client-side gate component lives in
// components/spoilers/spoiler-gate.tsx.

/** The set of work IDs the reader has read. Null = unknown/anonymous. */
export type ReadSet = ReadonlySet<string> | null;

/** Is content behind this boundary safe for this reader? */
export function isRevealed(
  spoilerAfter: string | null | undefined,
  read: ReadSet
): boolean {
  if (!spoilerAfter) return true;
  return read?.has(spoilerAfter) ?? false;
}

export interface Gated<T> {
  item: T;
  revealed: boolean;
  spoilerAfter: string | null;
}

/** Partition items carrying an optional spoilerAfter into revealed/shielded. */
export function gate<T extends { spoilerAfter?: string | null }>(
  items: T[],
  read: ReadSet
): Gated<T>[] {
  return items.map((item) => ({
    item,
    revealed: isRevealed(item.spoilerAfter, read),
    spoilerAfter: item.spoilerAfter ?? null,
  }));
}

/** Neutral teaser copy that says something is hidden without hinting at what. */
export function shieldCopy(boundaryTitle?: string): string {
  return boundaryTitle
    ? `Hidden until you finish ${boundaryTitle}`
    : "Hidden to protect a reveal";
}
