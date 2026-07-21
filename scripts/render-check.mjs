#!/usr/bin/env node
/**
 * Cheap render verification: fetch the built pages and check the HTML.
 *
 * The pages are statically generated, so everything a reader sees is in the
 * markup. That makes a browser unnecessary for content questions - does the
 * prose reach the reader, do the images resolve, did a locale leak - and a
 * browser is expensive in both time and tokens. This is the default check;
 * reach for a browser only for things that genuinely need a layout engine.
 *
 * Checks, per page:
 *   status      the route resolves
 *   images      every <img src> resolves to a real image (HEAD, following
 *               redirects; OpenLibrary answers 302 to its CDN)
 *   locale      a non-default locale page carries no known base-language
 *               chrome, and does carry its own
 *   emptiness   the page has actual prose, not just chrome
 *
 * Usage:
 *   node scripts/render-check.mjs [--base http://localhost:3311]
 *                                 [--paths /f/x,/f/y]   (default: all wings)
 *                                 [--locales en,pt]     (default: en,pt)
 *   Exit code 1 if anything failed, so CI and pipelines can gate on it.
 */
import fs from "node:fs";
import path from "node:path";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

const BASE = arg("base", "http://localhost:3311").replace(/\/$/, "");
const LOCALES = arg("locales", "en,pt").split(",").filter(Boolean);

// Chrome that must NOT appear on a non-default locale page, and the strings
// that must. Extend these as the app grows: every entry here is a bug that
// once shipped.
const BASE_LANG_MARKERS = [
  ">entering<",
  "Complete, in publication order",
  "Where to start",
  "Reading orders",
];
// The reliable locale signal is the document's own lang attribute, not chrome
// strings: chrome differs per page type, so string markers produce false
// positives on the home page while missing the real failure.
const LANG_FOR = { pt: "pt" };

function wings() {
  const dir = path.join(process.cwd(), "orrery-content", "content", "franchises");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((d) => fs.existsSync(path.join(dir, d, "works.yaml")))
    .map((slug) => `/f/${slug}`);
}

const paths = arg("paths", "")
  ? arg("paths", "").split(",").filter(Boolean)
  : ["/", ...wings()];

const failures = [];
const note = (page, msg) => failures.push(`${page}: ${msg}`);

// One result per URL for the whole run: the same cover appears on every locale
// of a page, and an uncached sweep spends minutes re-asking a CDN what it just
// said. This cache is what keeps the check cheap in wall-clock as well as
// tokens.
const imageCache = new Map();

async function headOk(url) {
  if (imageCache.has(url)) return imageCache.get(url);
  const p = (async () => {
    try {
      // Some CDNs reject HEAD; fall back to a ranged GET rather than pulling
      // the whole image. Both are capped, because a hung CDN must not hang
      // the check.
      const opts = { redirect: "follow", signal: AbortSignal.timeout(6000) };
      let r = await fetch(url, { method: "HEAD", ...opts });
      if (!r.ok || !(r.headers.get("content-type") || "").startsWith("image")) {
        r = await fetch(url, { headers: { Range: "bytes=0-64" }, ...opts });
      }
      const type = r.headers.get("content-type") || "";
      const len = Number(r.headers.get("content-length") || "1");
      return r.ok && type.startsWith("image") && len > 0;
    } catch {
      return false;
    }
  })();
  imageCache.set(url, p);
  return p;
}

/** Run tasks with a concurrency cap: external CDNs, so neither serial nor a flood. */
async function pooled(items, fn, limit = 12) {
  const out = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]);
      }
    })
  );
  return out;
}

async function checkPage(prefix, p) {
  const page = `${prefix}${p}`;
  const url = `${BASE}${page}`;
  let res;
  try {
    res = await fetch(url, { redirect: "follow" });
  } catch (e) {
    note(page, `unreachable (${e.message})`);
    return;
  }
  if (!res.ok) {
    note(page, `HTTP ${res.status}`);
    return;
  }
  const html = await res.text();

  // Prose presence: a wing page with almost no text is a data-loading failure
  // that still returns 200.
  const text = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ");
  if (text.replace(/\s+/g, " ").trim().length < 400) {
    note(page, "renders almost no text (data did not load?)");
  }

  // Images: every src must resolve to a real image. A URL nobody loaded is
  // worse than an absent one, because the designed fallback tile hangs off
  // onError and never fires for an image that failed before hydration.
  const srcs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((s) => !s.startsWith("data:"))
    .map((s) => (s.startsWith("http") ? s : `${BASE}${s}`));
  const unique = [...new Set(srcs)];
  const results = await pooled(unique, headOk);
  const bad = unique.filter((_, i) => !results[i]);
  if (bad.length) {
    note(page, `${bad.length}/${unique.length} images do not resolve: ${bad.slice(0, 3).join(" ")}`);
  }

  // Locale leakage, both directions.
  const loc = prefix.replace(/\//g, "");
  if (loc) {
    const leaked = BASE_LANG_MARKERS.filter((m) => html.includes(m));
    if (leaked.length) note(page, `base-language chrome leaked: ${leaked.join(", ")}`);
    const want = LANG_FOR[loc];
    const declared = (html.match(/<html[^>]+lang="([^"]+)"/) || [])[1];
    if (want && declared && !declared.startsWith(want)) {
      note(page, `declares lang="${declared}" on a ${loc} page`);
    }
  }

  process.stdout.write(
    `  ${page.padEnd(34)} ${res.status}  imgs ${unique.length - bad.length}/${unique.length}\n`
  );
}

console.log(`render-check against ${BASE}\n`);
for (const locale of LOCALES) {
  const prefix = locale === "en" ? "" : `/${locale}`;
  for (const p of paths) await checkPage(prefix, p);
}

if (failures.length) {
  console.log(`\n${failures.length} problem(s):`);
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
console.log("\nAll pages resolve, images load, locales apply.");
