import type { Character, Work } from "./types";

// The connections model (CONCEPT §4c): work-to-work links (crossovers, sequels
// across subseries, shared cosmology) plus the characters whose recurring
// appearances thread works together. Feeds the connections map - the beam made
// navigable. Pure and unit-testable; rendering lives in components/connections.

export interface ConnectionEdge {
  /** The later work (declares the connection; its reading is enriched). */
  from: string;
  /** The earlier work it points back to. */
  to: string;
}

/** Explicit work connections, deduplicated regardless of orientation. */
export function connectionEdges(works: Work[]): ConnectionEdge[] {
  const known = new Set(works.map((w) => w.id));
  const seen = new Set<string>();
  const edges: ConnectionEdge[] = [];
  for (const w of works) {
    for (const to of w.connections ?? []) {
      if (!known.has(to) || to === w.id) continue;
      const key = [w.id, to].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ from: w.id, to });
    }
  }
  return edges;
}

export interface ArcNode {
  id: string;
  title: string;
  year: number;
  subseries?: string | null;
}

export interface ArcModel {
  /** Participating works only (connected by at least one edge), chronological. */
  nodes: ArcNode[];
  /** Arcs as node-index pairs, i < j (earlier to later along the line). */
  arcs: { i: number; j: number }[];
}

/**
 * The arc-diagram model: works that participate in at least one connection,
 * strung chronologically (the beam), with arcs between connected pairs.
 * Non-participating works stay off the map - the map shows tissue, not the
 * whole catalog.
 */
export function buildArcModel(works: Work[]): ArcModel {
  const edges = connectionEdges(works);
  const participating = new Set(edges.flatMap((e) => [e.from, e.to]));
  const nodes = works
    .filter((w) => participating.has(w.id))
    .sort((a, b) => a.published - b.published || a.id.localeCompare(b.id))
    .map((w) => ({ id: w.id, title: w.title, year: w.published, subseries: w.subseries }));
  const index = new Map(nodes.map((n, i) => [n.id, i]));
  const arcs = edges
    .map((e) => {
      const a = index.get(e.from)!;
      const b = index.get(e.to)!;
      return { i: Math.min(a, b), j: Math.max(a, b) };
    })
    .sort((x, y) => x.i - y.i || x.j - y.j);
  return { nodes, arcs };
}

export interface CharacterThread {
  character: Character;
  /** Appearances resolved against known works, chronological. */
  appearances: {
    workId: string;
    title: string;
    year: number;
    note?: string;
    spoilerAfter: string | null;
  }[];
}

/** Characters as threads: their appearances resolved and ordered. */
export function characterThreads(characters: Character[], works: Work[]): CharacterThread[] {
  const byId = new Map(works.map((w) => [w.id, w]));
  return characters
    .map((character) => ({
      character,
      appearances: character.appearsIn
        .filter((a) => byId.has(a.workId))
        .map((a) => {
          const w = byId.get(a.workId)!;
          return {
            workId: a.workId,
            title: w.title,
            year: w.published,
            note: a.note,
            spoilerAfter: a.spoilerAfter ?? null,
          };
        })
        .sort((a, b) => a.year - b.year),
    }))
    .filter((t) => t.appearances.length > 0);
}
