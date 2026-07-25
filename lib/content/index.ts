import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { translator } from "../i18n/messages";
import { DEFAULT_LOCALE, isLocale } from "../i18n/config";
import type { Achievement } from "../achievements/types";
import type {
  Author,
  AuraEvent,
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

/**
 * Apply an overlay entry's prose fields over a base record.
 *
 * Only SCALARS are copied. Overlays carry prose (see SCHEMA: "translations are
 * prose only"), and a nested list or object in an overlay is a partial copy of
 * a structure that lives in the base - taking it wholesale silently destroys
 * whatever the translator did not restate.
 *
 * That is not hypothetical. Copying nested values clobbered two structures at
 * once on every non-default locale:
 *   - an author's `lifeEvents` lost their `date`, so every Portuguese life event
 *     resolved to year 0 and `buildRiver` (which drops year-0 layers) removed
 *     them from the timeline entirely
 *   - `startHere.paths` lost `workIds`, `orderId` and `fit`, so the whole
 *     where-to-start wizard recommended nothing in Portuguese
 *
 * Nested lists are merged by id explicitly (see mergeList) precisely so the
 * base keeps its structure. Skipping non-scalars here is what makes that safe.
 */
/**
 * Lists of plain strings that are PROSE a reader reads, not structure.
 *
 * Deliberately an allowlist rather than "any array of strings": `orderedWorkIds`
 * and `workIds` are also arrays of strings, and letting a translation overwrite
 * those would re-point a reading order at whatever a translator happened to
 * type. Skipping every array instead was the other extreme, and it shipped
 * Portuguese era plates with English themes underneath on four wings while the
 * coverage script reported complete.
 */
const PROSE_LISTS = new Set(["themes", "debated"]);

function merge<T extends { id: string }>(base: T, overlay: Overlay): T {
  const t = overlay[base.id];
  if (!t) return base;
  const out = { ...base } as Record<string, unknown>;
  for (const [k, v] of Object.entries(t)) {
    // `id` is the join key, never content; empty strings mean "not translated".
    if (k === "id" || v === null || v === "") continue;
    if (Array.isArray(v)) {
      // A prose list translates wholesale; any other array is structure and is
      // handled by mergeList, never copied from an overlay.
      if (PROSE_LISTS.has(k) && v.length > 0 && v.every((x) => typeof x === "string")) {
        out[k] = v;
      }
      continue;
    }
    if (typeof v === "object") continue; // maps: handled by mergeList
    out[k] = v;
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
function deriveDefaultOrder(slug: string, works: Work[], locale?: string): ReadingOrder {
  const t = translator(locale && isLocale(locale) ? locale : DEFAULT_LOCALE);
  const ordered = [...works].sort((a, b) => a.published - b.published);
  return {
    id: `${slug}/default`,
    name: t("order.defaultName"),
    type: "official-publication",
    source: "canon",
    derived: true,
    rationale: t("order.defaultRationale"),
    orderedWorkIds: ordered.map((w) => w.id),
  };
}

/**
 * Decide which global events belong on THIS franchise's timeline.
 *
 * `reach: global` means "any franchise could carry this", not "every franchise
 * must". Without a relevance test, João Tordo (born 1975) opened his page in
 * 1910 and walked a reader through both world wars before reaching his first
 * novel in 2004. The events were correctly curated; they were just being shown
 * to an author they could not possibly have touched.
 *
 * A global event renders on a wing if and only if that wing names it in
 * `globalEvents.include`. There is no arithmetic default and no implicit
 * membership: silence means absent.
 *
 * It used to work the other way - an event showed on every wing whose author
 * lifespan covered it, unless the wing excluded it. That default was cheap for
 * new WINGS and quietly wrong for new EVENTS, because adding one retroactively
 * opted in every wing already curated. It shipped: `portugal-bailout-2011` was
 * added a day after the Palahniuk wing was ruled, and rendered on his timeline
 * and on four other foreign wings until someone noticed. Nobody re-runs
 * resonance across the catalogue when a global event lands, so the failure was
 * silent, live and wrong - and wrong content costs more than absent content.
 *
 * The cost of this direction is that a genuinely relevant event stays invisible
 * until a wing claims it. That is the trade taken deliberately: an unclaimed
 * event is a gap someone can grep for, where a wrongly-claimed one just looks
 * like curation.
 *
 * `exclude` no longer gates anything - nothing renders unless included. It is
 * kept in the content files as the record of a judgement already made, so a
 * later pass does not re-litigate ground already covered.
 */
function relevantGlobalEvents(events: AuraEvent[], franchise: Franchise): AuraEvent[] {
  const rule = franchise.globalEvents ?? {};
  const include = new Set(rule.include ?? []);
  return events.filter((e) => include.has(e.id));
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
  // Editions are deliberately NOT overlaid: an edition's `title` is the title
  // as published, which is data, not prose to translate.
  const editions = readYaml<Edition[]>(path.join(dir, "editions.yaml")) ?? [];

  const authors = franchise.authorIds
    .map((id) => authorMap().get(id))
    .filter((a): a is Author => Boolean(a))
    .map((a) => withAuthorTranslations(a, locale));

  // Timeline = author-life events + franchise events + global events, dated.
  // `authorId` is a DERIVED annotation, never written in content: it records
  // whose life a merged event belongs to, so the UI can show their age at it.
  // A wing with two authors (Jordan and Sanderson) would otherwise have no way
  // to tell which lifespan an "author-life" event should be measured against.
  const lifeEvents = authors.flatMap((a) =>
    (a.lifeEvents ?? []).map((e) => ({
      ...e,
      scope: e.scope ?? "author-life",
      authorId: a.id,
    }))
  );
  const allGlobal = (readYaml<{ events: AuraEvent[] }>(GLOBAL_EVENTS)?.events ?? []).map((e) =>
    merge(e, overlayFor(locale, path.join("events", "global.yaml")))
  );
  const globalEvents = relevantGlobalEvents(allGlobal, franchise);
  const timeline = [...lifeEvents, ...franchiseEvents, ...globalEvents].sort(
    (a, b) => eventYear(a) - eventYear(b)
  );

  const orders = [deriveDefaultOrder(slug, works, locale), ...curatedOrders];

  return { franchise, authors, works, eras, orders, timeline, editions, theme };
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
