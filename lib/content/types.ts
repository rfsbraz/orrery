// Types mirroring the canon content schema in orrery-content
// (see orrery-content/.claude/skills/franchise-research/SKILL.md).

export type CanonTier = "core" | "extended" | "apocrypha";

/** What a reader is actually picking up. Defaults to "novel" - only present
 * when a work is something else a reader would want to know before starting
 * it (orrery-content docs/SCHEMA.md). Display-only, like `canonTier` - it
 * does not change where a work sits in the reading spine. Widened 2026-08-01
 * from 3 values to a real taxonomy: this is what the badge renders now
 * instead of raw `canonTier`, so every value needs a matching
 * `work.format.<value>` key in `lib/i18n/messages.ts` for every locale. */
export type WorkFormat =
  | "novel"
  | "novella"
  | "short-story"
  | "short-story-collection"
  | "poem"
  | "poetry-collection"
  | "essay"
  | "essay-collection"
  | "memoir"
  | "nonfiction"
  | "reference"
  | "play"
  | "screenplay"
  | "tv-series"
  | "graphic-novel"
  | "picture-book"
  | "anthology";
export type Impact = "low" | "med" | "high";
export type EventScope = "author-life" | "world" | "culture" | "industry";
export type OrderType =
  | "official-publication"
  | "chronological-inuniverse"
  | "author-recommended"
  | "curated"
  | "community"
  | "user";

/** The generated-art block carried by eras, events and life events.
 * `sketchCredit` must say the image was generated - the content validator
 * enforces it, so a reader can always tell our illustration from a licensed
 * photograph. See orrery-content docs/VISUAL.md. */
export interface SketchImage {
  sketch?: string;
  sketchCredit?: string;
  sketchSource?: string;
}

/** One of the 16 river layout-grammar cells (orrery-content docs/LAYOUT.md).
 * An open string, not a union: the validator over there is the enforcement
 * point, and the app must render whatever it gets, falling back to `beside`
 * for anything it does not recognise (an older app build against newer
 * content, a typo that slipped past validation) rather than throwing. */
export type Organisation = string;

export interface AuraEvent {
  id: string;
  date: string | number;
  dateRange?: string;
  title: string;
  scope?: EventScope;
  /** Derived by the loader on merged life events, never present in content:
   * which author's life this belongs to, so their age at it can be shown. */
  authorId?: string;
  reach?: string;
  impact: Impact;
  description: string;
  spoilerAfter?: string | null;
  images?: SketchImage;
  sources?: string[];
  /** How the river cell lays image and text out (LAYOUT.md's 16 organisations).
   * Absent means `beside`, the workhorse - most events, and every event authored
   * before this field existed. */
  organisation?: Organisation;
  /** What the artwork depicts (VISUAL.md §3b's 25 types) and how it was
   * authored. The app never branches on this for layout - that is
   * `organisation`'s job - but it is useful for alt text and analytics. */
  illustrationType?: string;
  /** A composition twist layered onto a compatible `organisation`
   * (`breakout`, `pull-focus`, `fold-reveal`, `anchor-with-satellites`,
   * `branch` - see LAYOUT.md "Modifiers"). Unknown or incompatible modifiers
   * are ignored, never a rendering error. */
  modifier?: string;
  /** How many image slots this entry's organisation needs (LAYOUT.md
   * "images_required"). 1 unless the organisation says otherwise; the filed
   * assets are `<id>.webp`, `<id>-2.webp`, ... */
  imagesRequired?: number;
  /** The author's own words, for the `epigraph` organisation - the one cell
   * whose illustration is a quotation rather than a drawing. `title` carries
   * the attribution (the work, the interview, the occasion) and `description`
   * an optional gloss. Ignored by every other organisation. */
  quote?: string;
}

export interface Pseudonym {
  name: string;
  note?: string;
}

/** A literary heteronym: an invented persona with its own authored biography,
 * not a pen name (orrery-content docs/SCHEMA.md, "heteronyms"). `authored:
 * true` marks born/died/lifeEvents as fiction the real author wrote, never
 * biographical fact about a real person - render them with that framing,
 * never as a plain fact. */
export interface Heteronym {
  id: string;
  name: string;
  authored: boolean;
  born?: string | number;
  died?: string | number;
  bio?: string;
  lifeEvents?: AuraEvent[];
  sources?: string[];
}

export interface Author {
  id: string;
  name: string;
  aka?: string[];
  born?: string | number;
  died?: string | number;
  bio?: string;
  pseudonyms?: Pseudonym[];
  heteronyms?: Heteronym[];
  lifeEvents?: AuraEvent[];
  /** Curated imagery from the visual-metadata pass (licensed, credited). */
  images?: {
    portrait?: string;
    portraitCredit?: string;
    portraitSource?: string;
    header?: string;
    headerCredit?: string;
    headerSource?: string;
  };
  sources?: string[];
}

export interface Work {
  id: string;
  title: string;
  authorIds: string[];
  published: number;
  /** Announced release date (YYYY-MM-DD) for a work that is NOT out yet.
   * `published` still carries the expected year, because every consumer of it
   * is year arithmetic; this says only that the event has not happened. The
   * content validator warns once the date passes, so an announced title cannot
   * quietly sit here looking published. See orrery-content docs/SCHEMA.md. */
  forthcoming?: string;
  subseries?: string | null;
  canonTier: CanonTier;
  /** Defaults to "novel"; unset for every ordinary book. See `WorkFormat`. */
  format?: WorkFormat;
  /** A work that changed the life: the debut, the breakout, the last one. The
   * river gives it the `hero` treatment (components/river/work-card.tsx) so a
   * wing's page is not one uniform grid of identical cards. Capped per wing by
   * the content validator - the treatment only means anything while it is
   * rare. */
  featured?: boolean;
  publishedAs?: string;
  withAuthorIds?: string[];
  /** This work's own text is reprinted in full inside the work at this id
   * (orrery#168) - a periodical or standalone-booklet appearance later
   * collected whole into a bigger volume, the way Fernando Pessoa's
   * `o-guardador-de-rebanhos` (Athena, 1925) is also the first third of
   * `poemas-de-alberto-caeiro` (1946). Both remain real, separately-dated,
   * separately-sourced works - this id is NOT dropped from the wing's
   * bibliography - but a reader walking the DERIVED default order would
   * otherwise read the same text twice, once under each id, with nothing
   * telling them so. `deriveDefaultOrder` skips a work that names one, and
   * completion tracking (`lib/achievements/evaluate.ts`) treats reading the
   * container as covering this id too. Never a curated order's own call:
   * `orders.yaml` orders are hand-picked and can include or omit either id
   * exactly as their own rationale argues, same as any other work. */
  containedIn?: string;
  synopsis?: string;
  externalIds?: { openLibrary?: string; googleBooks?: string; wikidata?: string };
  /** Curated imagery from the visual-metadata pass. Every URL here has been
   * fetched and looked at by a curator, which an ISBN-derived OpenLibrary URL
   * has not - see `coverFor` for why that ordering matters. */
  images?: {
    cover?: string;
    coverCredit?: string;
    coverSource?: string;
  };
}

/** A concrete published edition of a Work (covers, ISBNs, store links). */
export interface Edition {
  id: string;
  workId: string;
  isbn13?: string;
  /** BCP-47; region matters for books (pt-PT and pt-BR differ). */
  language?: string;
  /** The title AS PUBLISHED in that language - never an invented translation. */
  title?: string;
  translator?: string;
  format?: "hardcover" | "paperback" | "ebook" | "audiobook";
  publisher?: string;
  year?: number;
  coverUrl?: string | null;
  /** A complete, free, legally-hosted text (Project Gutenberg, Standard Ebooks). */
  readUrl?: string | null;
  note?: string;
  sources?: string[];
}

export interface Era {
  id: string;
  title: string;
  period: string;
  themes?: string[];
  description?: string;
  images?: SketchImage;
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
  /** Key into the app's curated display faces (lib/theme.ts DISPLAY_FACES). */
  displayFace?: string;
  /** The franchise's signature element: beam | thread | rule | none. */
  signature?: string;
  typePairing?: Record<string, string>;
  motif?: string;
  notes?: string;
}

/** Per-franchise feature switch: auto-detect from data, or force on/off. */
export type FeatureSetting = "auto" | "on" | "off" | boolean;

/** Optional feature overrides in franchise.yaml; omitted keys mean auto. */
export interface FranchiseFeatures {
  river?: FeatureSetting;
  wizard?: FeatureSetting;
  companion?: FeatureSetting;
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
  /** Overrides to the default "global events within the author's lifetime"
   * rule. `include` claims an event outside the span the author writes out of;
   * `exclude` refuses one that overlaps but never reached the page. */
  globalEvents?: { include?: string[]; exclude?: string[] };
  /** Curated header imagery from the visual-metadata pass (licensed, credited).
   * 15 wings were already setting this in franchise.yaml before the field
   * existed on this interface or was read anywhere - it is declared here and
   * rendered by the franchise page. The credit is not decorative: several of
   * these are CC BY, where attribution is a licence condition. */
  images?: {
    header?: string;
    headerCredit?: string;
    headerSource?: string;
  };
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
  editions: Edition[];
  theme?: Theme;
}
