import { localePath, type Locale } from "@/lib/i18n/config";

// Parse inline [[type:id|text]] references in prose into renderable segments.
// See orrery CONCEPT §4c: IDs are the source of truth; names are display-only.

export type RefType = "work" | "author" | "franchise" | "character";

export interface RefLink {
  kind: "link";
  type: RefType;
  id: string;
  text: string;
  href: string;
}
export interface RefText {
  kind: "text";
  text: string;
}
export type Segment = RefLink | RefText;

const REF = /\[\[(work|author|franchise|character):([^\]|]+)(?:\|([^\]]*))?\]\]/g;

/**
 * Route for a referenced entity. Work IDs are `<franchise>/<work>`.
 *
 * Locale-aware: inline references appear in every synopsis, bio and event
 * description, so an unprefixed href sends a Portuguese reader out of their
 * own language on almost any click. The proxy would redirect them back only
 * if they carry the locale cookie, so a reader arriving from a shared /pt link
 * was being bounced to English.
 */
export function hrefFor(type: RefType, id: string, locale?: Locale): string {
  const at = (path: string) => (locale ? localePath(locale, path) : path);
  switch (type) {
    case "work": {
      const [franchise, slug] = id.split("/");
      return `${at(`/f/${franchise}`)}#w-${slug}`;
    }
    case "author":
      return at(`/author/${id}`);
    case "franchise":
      return at(`/f/${id}`);
    default:
      return "#"; // character: no registry yet
  }
}

/** Split prose into text and link segments. Unmatched brackets stay as text. */
export function parseRefs(input: string | undefined | null, locale?: Locale): Segment[] {
  const text = (input ?? "").trim();
  if (!text) return [];
  const out: Segment[] = [];
  let last = 0;
  for (const m of text.matchAll(REF)) {
    const [full, type, rawId, display] = m;
    const start = m.index ?? 0;
    if (start > last) out.push({ kind: "text", text: text.slice(last, start) });
    const id = rawId.trim();
    out.push({
      kind: "link",
      type: type as RefType,
      id,
      text: (display ?? "").trim() || id.split("/").pop() || id,
      href: hrefFor(type as RefType, id, locale),
    });
    last = start + full.length;
  }
  if (last < text.length) out.push({ kind: "text", text: text.slice(last) });
  return out;
}

/** Strip refs to plain text (for meta descriptions, titles, etc.). */
export function stripRefs(input: string | undefined | null): string {
  return parseRefs(input)
    .map((s) => s.text)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}
