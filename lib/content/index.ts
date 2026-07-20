import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { Achievement } from "../achievements/types";
import type {
  Author,
  AuraEvent,
  Character,
  Edition,
  Era,
  Franchise,
  FranchiseBundle,
  ReadingOrder,
  Theme,
  Work,
} from "./types";

// Canon content lives in the orrery-content submodule.
const CONTENT_ROOT = path.join(process.cwd(), "orrery-content", "content");
const FRANCHISES = path.join(CONTENT_ROOT, "franchises");
const AUTHORS = path.join(CONTENT_ROOT, "authors");
const GLOBAL_EVENTS = path.join(CONTENT_ROOT, "events", "global.yaml");
const GLOBAL_ACHIEVEMENTS = path.join(CONTENT_ROOT, "achievements.yaml");
const I18N = path.join(CONTENT_ROOT, "i18n");

// Translation overlays (content/i18n/<locale>/...) carry only prose fields,
// keyed by stable ID. Merging is field-by-field so a partially translated
// franchise shows translated prose where it exists and the base language
// everywhere else - never a blank, never a broken page.
type Overlay = Record<string, Record<string, unknown>>;
const _overlays = new Map<string, Overlay>();

function overlayFor(locale: string | undefined, relPath: string): Overlay {
  if (!locale || locale === "en") return {};
  const key = `${locale}:${relPath}`;
  const cached = _overlays.get(key);
  if (cached) return cached;
  const file = path.join(I18N, locale, relPath);
  const raw = readYaml<unknown>(file);
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const map: Overlay = {};
  for (const entry of list as Record<string, unknown>[]) {
    const id = entry?.id as string | undefined;
    if (id) map[id] = entry;
  }
  _overlays.set(key, map);
  return map;
}

/**
 * Merge a nested list of id-bearing items (lifeEvents, startHere paths) by id,
 * so a translation carries only prose and never restates structure like
 * workIds, orderId or fit tags.
 */
function mergeList<T extends { id: string }>(
  base: T[] | undefined,
  translated: unknown
): T[] | undefined {
  if (!base || !Array.isArray(translated)) return base;
  const byId: Overlay = {};
  for (const t of translated as Record<string, unknown>[]) {
    if (t?.id) byId[t.id as string] = t;
  }
  return base.map((item) => merge(item, byId));
}

/** Apply an overlay entry's prose fields over a base record. */
function merge<T extends { id: string }>(base: T, overlay: Overlay): T {
  const t = overlay[base.id];
  if (!t) return base;
  const out = { ...base } as Record<string, unknown>;
  for (const [k, v] of Object.entries(t)) {
    // `id` is the join key, never content; empty strings mean "not translated".
    if (k !== "id" && v !== null && v !== "") out[k] = v;
  }
  return out as T;
}

function readYaml<T>(file: string): T | null {
  if (!fs.existsSync(file)) return null;
  return parseYaml(fs.readFileSync(file, "utf8")) as T;
}

let _authors: Map<string, Author> | null = null;
function authorMap(): Map<string, Author> {
  if (_authors) return _authors;
  const m = new Map<string, Author>();
  if (fs.existsSync(AUTHORS)) {
    for (const f of fs.readdirSync(AUTHORS).filter((f) => f.endsWith(".yaml"))) {
      const a = readYaml<Author>(path.join(AUTHORS, f));
      if (a?.id) m.set(a.id, a);
    }
  }
  _authors = m;
  return m;
}

export function getAuthor(id: string, locale?: string): Author | undefined {
  const base = authorMap().get(id);
  if (!base) return undefined;
  return withAuthorTranslations(base, locale);
}

/** Apply an author's translation overlay, including either lifeEvents shape. */
function withAuthorTranslations(a: Author, locale?: string): Author {
  const ov = overlayFor(locale, path.join("authors", `${a.id}.yaml`));
  const merged = merge(a, ov);
  const nested = ov[a.id]?.lifeEvents;
  const lifeEvents = Array.isArray(nested)
    ? mergeList(merged.lifeEvents, nested)
    : (merged.lifeEvents ?? []).map((e) => merge(e, ov));
  return { ...merged, lifeEvents };
}

export function listFranchiseSlugs(): string[] {
  if (!fs.existsSync(FRANCHISES)) return [];
  return fs
    .readdirSync(FRANCHISES)
    .filter((d) => fs.existsSync(path.join(FRANCHISES, d, "franchise.yaml")));
}

/** The default order: every work in publication-chronological order (CONCEPT §4b). */
function deriveDefaultOrder(slug: string, works: Work[]): ReadingOrder {
  const ordered = [...works].sort((a, b) => a.published - b.published);
  return {
    id: `${slug}/default`,
    name: "Complete, in publication order",
    type: "official-publication",
    source: "canon",
    derived: true,
    rationale:
      "Every published work in the order it appeared - the default way to read the whole body of work.",
    orderedWorkIds: ordered.map((w) => w.id),
  };
}

export function getFranchise(slug: string, locale?: string): FranchiseBundle | null {
  const dir = path.join(FRANCHISES, slug);
  const franchiseBase = readYaml<Franchise>(path.join(dir, "franchise.yaml"));
  if (!franchiseBase) return null;
  const franchiseOverlay = overlayFor(locale, path.join("franchises", slug, "franchise.yaml"));
  const franchise = merge(
    { ...franchiseBase, id: franchiseBase.id ?? slug },
    franchiseOverlay
  );
  // startHere paths are nested prose (title/description/note) - merge by path
  // id so the translation never restates workIds/orderId/fit.
  const startHereOverlay = (
    franchiseOverlay[franchise.id] as { startHere?: { paths?: unknown } } | undefined
  )?.startHere?.paths;
  if (franchise.startHere?.paths && startHereOverlay) {
    franchise.startHere = {
      ...franchise.startHere,
      paths: mergeList(franchise.startHere.paths, startHereOverlay) ?? franchise.startHere.paths,
    };
  }

  const rel_ = (f: string) => path.join("franchises", slug, f);
  const works = (readYaml<Work[]>(path.join(dir, "works.yaml")) ?? []).map((w) =>
    merge(w, overlayFor(locale, rel_("works.yaml")))
  );
  const eras = (readYaml<Era[]>(path.join(dir, "eras.yaml")) ?? []).map((e) =>
    merge(e, overlayFor(locale, rel_("eras.yaml")))
  );
  const curatedOrders = (readYaml<ReadingOrder[]>(path.join(dir, "orders.yaml")) ?? []).map((o) =>
    merge(o, overlayFor(locale, rel_("orders.yaml")))
  );
  const theme = readYaml<Theme>(path.join(dir, "theme.yaml")) ?? undefined;
  const franchiseEvents = (readYaml<AuraEvent[]>(path.join(dir, "events.yaml")) ?? []).map((e) =>
    merge(e, overlayFor(locale, rel_("events.yaml")))
  );
  const characters = (readYaml<Character[]>(path.join(dir, "characters.yaml")) ?? []).map((c) =>
    merge(c, overlayFor(locale, rel_("characters.yaml")))
  );
  // Editions are deliberately NOT overlaid: an edition's `title` is the title
  // as published, which is data, not prose to translate.
  const editions = readYaml<Edition[]>(path.join(dir, "editions.yaml")) ?? [];

  const authors = franchise.authorIds
    .map((id) => authorMap().get(id))
    .filter((a): a is Author => Boolean(a))
    .map((a) => withAuthorTranslations(a, locale));

  // Timeline = author-life events + franchise events + global events, dated.
  const lifeEvents = authors.flatMap((a) =>
    (a.lifeEvents ?? []).map((e) => ({ ...e, scope: e.scope ?? "author-life" }))
  );
  const globalEvents = (readYaml<{ events: AuraEvent[] }>(GLOBAL_EVENTS)?.events ?? []).map(
    (e) => merge(e, overlayFor(locale, path.join("events", "global.yaml")))
  );
  const timeline = [...lifeEvents, ...franchiseEvents, ...globalEvents].sort(
    (a, b) => eventYear(a) - eventYear(b)
  );

  const orders = [deriveDefaultOrder(slug, works), ...curatedOrders];

  return { franchise, authors, works, eras, orders, timeline, characters, editions, theme };
}

export function listFranchises(locale?: string): Franchise[] {
  return listFranchiseSlugs()
    .map((slug) => {
      const f = readYaml<Franchise>(path.join(FRANCHISES, slug, "franchise.yaml"));
      if (!f) return null;
      return merge(
        { ...f, id: f.id ?? slug },
        overlayFor(locale, path.join("franchises", slug, "franchise.yaml"))
      );
    })
    .filter((f): f is Franchise => Boolean(f));
}

/** Every franchise, fully loaded - for cross-franchise views (profile, achievements). */
export function getAllBundles(locale?: string): FranchiseBundle[] {
  return listFranchiseSlugs()
    .map((slug) => getFranchise(slug, locale))
    .filter((b): b is FranchiseBundle => Boolean(b));
}

/** First year of an event's date/dateRange, for sorting. */
export function eventYear(e: AuraEvent): number {
  const raw = String(e.date ?? e.dateRange ?? "");
  const m = raw.match(/\d{4}/);
  return m ? Number(m[0]) : 0;
}

/**
 * Every achievement definition: the global set plus each franchise's own
 * (CONCEPT §7 - achievements are data). Adding a badge is a content PR; only
 * a new criteria *kind* needs app code.
 */
export function listAchievements(): Achievement[] {
  const global = readYaml<Achievement[]>(GLOBAL_ACHIEVEMENTS) ?? [];
  const perFranchise = listFranchiseSlugs().flatMap(
    (slug) => readYaml<Achievement[]>(path.join(FRANCHISES, slug, "achievements.yaml")) ?? []
  );
  return [...global, ...perFranchise];
}

/** Reset caches (tests). */
export function _reset() {
  _authors = null;
  _overlays.clear();
}
