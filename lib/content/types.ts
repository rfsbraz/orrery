// Types mirroring the canon content schema in orrery-content
// (see orrery-content/.claude/skills/franchise-research/SKILL.md).

export type CanonTier = "core" | "extended" | "apocrypha";
export type Impact = "low" | "med" | "high";
export type EventScope = "author-life" | "world" | "culture" | "industry";
export type OrderType =
  | "official-publication"
  | "chronological-inuniverse"
  | "author-recommended"
  | "curated"
  | "community"
  | "user";

export interface AuraEvent {
  id: string;
  date: string | number;
  dateRange?: string;
  title: string;
  scope?: EventScope;
  reach?: string;
  impact: Impact;
  description: string;
  spoilerAfter?: string | null;
  sources?: string[];
}

export interface Pseudonym {
  name: string;
  note?: string;
}

export interface Author {
  id: string;
  name: string;
  aka?: string[];
  born?: string | number;
  died?: string | number;
  bio?: string;
  pseudonyms?: Pseudonym[];
  lifeEvents?: AuraEvent[];
  sources?: string[];
}

export interface Work {
  id: string;
  title: string;
  authorIds: string[];
  published: number;
  subseries?: string | null;
  canonTier: CanonTier;
  publishedAs?: string;
  withAuthorIds?: string[];
  synopsis?: string;
  externalIds?: { openLibrary?: string; googleBooks?: string; wikidata?: string };
}

export interface Era {
  id: string;
  title: string;
  period: string;
  themes?: string[];
  description?: string;
}

export interface ReadingOrder {
  id: string;
  name: string;
  type: OrderType;
  source: "canon" | "community" | "user";
  rationale?: string;
  orderedWorkIds: string[];
  debated?: string[];
  sources?: string[];
  /** True for the auto-derived default (publication-chronological, all works). */
  derived?: boolean;
}

export interface Theme {
  preset: string;
  palette?: Record<string, string>;
  typePairing?: Record<string, string>;
  motif?: string;
  notes?: string;
}

export interface Franchise {
  id: string;
  name: string;
  kind: "author" | "shared-universe" | "series";
  description?: string;
  authorIds: string[];
  themePreset?: string;
}

/** A franchise with everything needed to render its page. */
export interface FranchiseBundle {
  franchise: Franchise;
  authors: Author[];
  works: Work[];
  eras: Era[];
  orders: ReadingOrder[]; // default (derived) first, then curated
  /** Author-life + franchise + relevant global events, merged for the timeline. */
  timeline: AuraEvent[];
  theme?: Theme;
}
