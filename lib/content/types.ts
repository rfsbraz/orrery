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
  /** Work-to-work links beyond subseries (crossovers, sequels, shared cosmology).
   * Declared on the later work pointing back; rendered both ways. */
  connections?: string[];
  externalIds?: { openLibrary?: string; googleBooks?: string; wikidata?: string };
}

export interface CharacterAppearance {
  workId: string;
  note?: string;
  /** When set, this appearance is a reveal: hidden until the reader has read
   * the boundary work (and shielded for anonymous visitors). */
  spoilerAfter?: string | null;
}

/** A recurring figure whose appearances thread works together (connective tissue). */
export interface Character {
  id: string;
  name: string;
  aka?: string[];
  description?: string;
  appearsIn: CharacterAppearance[];
  sources?: string[];
}

/** A concrete published edition of a Work (covers, ISBNs, store links). */
export interface Edition {
  id: string;
  workId: string;
  isbn13?: string;
  language?: string;
  format?: "hardcover" | "paperback" | "ebook" | "audiobook";
  publisher?: string;
  year?: number;
  coverUrl?: string | null;
  note?: string;
  sources?: string[];
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

/** Per-franchise feature switch: auto-detect from data, or force on/off. */
export type FeatureSetting = "auto" | "on" | "off" | boolean;

/** Optional feature overrides in franchise.yaml; omitted keys mean auto. */
export interface FranchiseFeatures {
  river?: FeatureSetting;
  orderDiff?: FeatureSetting;
  wizard?: FeatureSetting;
  connections?: FeatureSetting;
  companion?: FeatureSetting;
  hall?: FeatureSetting;
  editions?: FeatureSetting;
}

export type FitExperience = "new" | "returning" | "completionist";
export type FitCommitment = "taste" | "arc" | "complete";

/** A curated entry recommendation for the where-to-start wizard. */
export interface StartHerePath {
  id: string;
  title: string;
  description?: string;
  /** Exactly one of workIds / orderId ("default" = the derived order). */
  workIds?: string[] | null;
  orderId?: string | null;
  fit?: { experience?: FitExperience[]; commitment?: FitCommitment[] };
  note?: string;
}

export interface StartHere {
  paths: StartHerePath[];
}

export interface Franchise {
  id: string;
  name: string;
  kind: "author" | "shared-universe" | "series";
  description?: string;
  authorIds: string[];
  themePreset?: string;
  features?: FranchiseFeatures;
  startHere?: StartHere;
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
  characters: Character[];
  editions: Edition[];
  theme?: Theme;
}
