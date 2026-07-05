import type { ProgressEntry, ReadStatus } from "../progress/types";
import type { Work } from "../content/types";

// Import a Goodreads or StoryGraph library export (CSV) into progress rows,
// matched to canon Work IDs. Kills the cold-start problem for completionists.

export interface RawShelfEntry {
  title: string;
  author: string;
  status: ReadStatus;
  rating?: number;
  dateRead?: string;
}

export interface ImportResult {
  matched: ProgressEntry[];
  unmatched: { title: string; author: string; reason: string }[];
}

const norm = (s: string) =>
  (s ?? "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

/** Minimal RFC-4180 CSV parser: quoted fields, embedded commas/newlines, "" escapes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const s = text.replace(/\r\n?/g, "\n");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

function mapStatus(raw: string): ReadStatus {
  const v = (raw ?? "").toLowerCase().trim();
  if (v === "read") return "read";
  if (v === "currently-reading" || v === "reading") return "reading";
  if (v === "did-not-finish" || v === "dnf" || v === "abandoned") return "abandoned";
  return "unread"; // to-read
}

function isoDate(raw?: string): string | undefined {
  if (!raw) return undefined;
  const m = raw.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (!m) return undefined;
  const [, y, mo, d] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

/** Parse a Goodreads or StoryGraph export into shelf entries. */
export function parseExport(text: string): RawShelfEntry[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);

  // Column names differ between the two services.
  const iTitle = col("title");
  const iAuthor = header.includes("author") ? col("author") : col("authors");
  const iStatus = header.includes("exclusive shelf") ? col("exclusive shelf") : col("read status");
  const iRating = header.includes("my rating") ? col("my rating") : col("star rating");
  const iDate = header.includes("date read") ? col("date read") : col("last date read");

  const out: RawShelfEntry[] = [];
  for (const r of rows.slice(1)) {
    const title = (r[iTitle] ?? "").trim();
    if (!title) continue;
    const ratingNum = Number(r[iRating] ?? "");
    out.push({
      title,
      author: (r[iAuthor] ?? "").trim(),
      status: mapStatus(r[iStatus] ?? ""),
      rating: ratingNum > 0 ? Math.round(ratingNum) : undefined,
      dateRead: isoDate(r[iDate]),
    });
  }
  return out;
}

/** Match shelf entries to canon Work IDs. authorNames maps authorId -> display name. */
export function matchToCanon(
  entries: RawShelfEntry[],
  works: Work[],
  authorNames: Map<string, string>
): ImportResult {
  const byTitle = new Map<string, Work[]>();
  for (const w of works) {
    const k = norm(w.title);
    (byTitle.get(k) ?? byTitle.set(k, []).get(k)!).push(w);
  }

  const matched: ProgressEntry[] = [];
  const unmatched: ImportResult["unmatched"] = [];

  for (const e of entries) {
    const cands = byTitle.get(norm(e.title)) ?? [];
    let work: Work | undefined;
    if (cands.length === 1) work = cands[0];
    else if (cands.length > 1) {
      // disambiguate by author overlap
      const a = norm(e.author);
      work = cands.find((w) =>
        (w.authorIds ?? []).some((id) => {
          const name = norm(authorNames.get(id) ?? "");
          return name && (a.includes(name) || name.includes(a));
        })
      );
    }
    if (work) {
      matched.push({
        workId: work.id,
        status: e.status,
        rating: e.rating,
        dateRead: e.dateRead,
      });
    } else {
      unmatched.push({
        title: e.title,
        author: e.author,
        reason: cands.length > 1 ? "ambiguous title, author didn't match" : "not in canon",
      });
    }
  }
  return { matched, unmatched };
}
