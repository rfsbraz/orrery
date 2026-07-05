import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type {
  Author,
  AuraEvent,
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

export function getAuthor(id: string): Author | undefined {
  return authorMap().get(id);
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

export function getFranchise(slug: string): FranchiseBundle | null {
  const dir = path.join(FRANCHISES, slug);
  const franchise = readYaml<Franchise>(path.join(dir, "franchise.yaml"));
  if (!franchise) return null;

  const works = readYaml<Work[]>(path.join(dir, "works.yaml")) ?? [];
  const eras = readYaml<Era[]>(path.join(dir, "eras.yaml")) ?? [];
  const curatedOrders = readYaml<ReadingOrder[]>(path.join(dir, "orders.yaml")) ?? [];
  const theme = readYaml<Theme>(path.join(dir, "theme.yaml")) ?? undefined;
  const franchiseEvents = readYaml<AuraEvent[]>(path.join(dir, "events.yaml")) ?? [];

  const authors = franchise.authorIds
    .map((id) => authorMap().get(id))
    .filter((a): a is Author => Boolean(a));

  // Timeline = author-life events + franchise events + global events, dated.
  const lifeEvents = authors.flatMap((a) =>
    (a.lifeEvents ?? []).map((e) => ({ ...e, scope: e.scope ?? "author-life" }))
  );
  const globalEvents =
    readYaml<{ events: AuraEvent[] }>(GLOBAL_EVENTS)?.events ?? [];
  const timeline = [...lifeEvents, ...franchiseEvents, ...globalEvents].sort(
    (a, b) => eventYear(a) - eventYear(b)
  );

  const orders = [deriveDefaultOrder(slug, works), ...curatedOrders];

  return { franchise, authors, works, eras, orders, timeline, theme };
}

export function listFranchises(): Franchise[] {
  return listFranchiseSlugs()
    .map((slug) => readYaml<Franchise>(path.join(FRANCHISES, slug, "franchise.yaml")))
    .filter((f): f is Franchise => Boolean(f));
}

/** First year of an event's date/dateRange, for sorting. */
export function eventYear(e: AuraEvent): number {
  const raw = String(e.date ?? e.dateRange ?? "");
  const m = raw.match(/\d{4}/);
  return m ? Number(m[0]) : 0;
}

/** Reset caches (tests). */
export function _reset() {
  _authors = null;
}
