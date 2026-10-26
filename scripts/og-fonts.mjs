/**
 * Fetch the recap share card's fonts into lib/og/fonts.
 *
 * next/og draws only glyphs from the fonts it is handed. For anything else it
 * asks Google Fonts at render time, sending the reader's book title along, and
 * draws empty boxes when that request fails. The card ships its own fonts so
 * it never has to.
 *
 * Alphabets are small, so they come whole. Han and Hangul are not: those fonts
 * carry only the characters the catalogue's titles use, which keeps them a few
 * hundred KB. Rerun this after content gains a new one; content-sync does, and
 * lib/og/recap-card.test.ts fails on any title character no font covers.
 *
 * Usage: node scripts/og-fonts.mjs [--force]
 */
import { readdir, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const contentDir = path.join(root, "orrery-content", "content");
const outDir = path.join(root, "lib", "og", "fonts");
const manifestPath = path.join(outDir, "fonts.json");

const range = (from, to) =>
  Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i)).join("");

const ASCII = range(0x20, 0x7e);
const ALPHABETS = [
  ASCII,
  range(0xa0, 0x24f), // Latin-1 and Latin Extended A/B
  range(0x300, 0x36f), // combining diacritics
  range(0x370, 0x3ff), // Greek
  range(0x1f00, 0x1fff), // polytonic Greek
  range(0x400, 0x52f), // Cyrillic
  range(0x1e00, 0x1eff), // Latin Extended Additional
  range(0x2000, 0x206f), // general punctuation
].join("");
const KANA = range(0x3000, 0x30ff); // CJK punctuation, hiragana, katakana
const isHan = (c) => /[\p{Script=Han}\u3000-\u30ff\uff00-\uffef]/u.test(c);
const isHangul = (c) => /\p{Script=Hangul}/u.test(c);
const isOwnScript = (c) => /[\p{Script=Arabic}\p{Script=Hebrew}]/u.test(c);

/**
 * Every font the card loads, in fallback order. `text` picks its glyphs.
 *
 * Arabic stays last. satori looks up a replacement for each glyph its font
 * reports as unmapped, and Arabic letter forms are unmapped by design; the
 * lookup lands on the last font, which only works when that is the Arabic one.
 */
const FONTS = [
  { file: "noto-sans-400.ttf", family: "Noto Sans", weight: 400,
    text: (titles) => ALPHABETS + titles.filter((c) => !isHan(c) && !isHangul(c) && !isOwnScript(c)).join("") },
  { file: "noto-sans-700.ttf", family: "Noto Sans", weight: 700, text: () => ASCII },
  { file: "noto-sans-hebrew-400.ttf", family: "Noto Sans Hebrew", weight: 400, text: () => range(0x590, 0x5ff) },
  { file: "noto-sans-jp-400.ttf", family: "Noto Sans JP", weight: 400, text: (titles) => KANA + titles.filter(isHan).join("") },
  { file: "noto-sans-kr-400.ttf", family: "Noto Sans KR", weight: 400, text: (titles) => titles.filter(isHangul).join("") },
  // Noto Sans has no box drawing, and a catalogue title uses U+2500.
  { file: "noto-sans-mono-400.ttf", family: "Noto Sans Mono", weight: 400, text: () => range(0x2500, 0x257f) },
  { file: "vazirmatn-400.ttf", family: "Vazirmatn", weight: 400, text: () => range(0x600, 0x6ff) },
];

async function* yamlFiles(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* yamlFiles(p);
    else if (e.name.endsWith(".yaml")) yield p;
  }
}

/** Every character of every `title` in the catalogue, sorted. */
async function titleCharacters() {
  const chars = new Set();
  const walk = (v) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") {
      for (const [k, x] of Object.entries(v)) {
        if (k === "title" && typeof x === "string") for (const c of x) chars.add(c);
        else walk(x);
      }
    }
  };
  for await (const f of yamlFiles(contentDir)) walk(parse(await readFile(f, "utf8")));
  return [...chars].sort();
}

// An old Safari user agent makes the CSS API answer with TrueType, which
// satori reads; modern agents get WOFF2, which it does not.
const UA =
  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1";

async function download({ family, weight }, text) {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await fetch(url, { headers: { "User-Agent": UA } });
  if (!css.ok) throw new Error(`${family} ${weight}: CSS request failed with ${css.status}`);
  const src = (await css.text()).match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/);
  if (!src) throw new Error(`${family} ${weight}: no TrueType source in the CSS`);
  const font = await fetch(src[1]);
  if (!font.ok) throw new Error(`${family} ${weight}: font request failed with ${font.status}`);
  return Buffer.from(await font.arrayBuffer());
}

const titles = await titleCharacters();
// Google Fonts quietly serves the whole font when `text` gets long, so ask in
// slices of this many characters, one file each. satori keeps one font per name
// and weight, so every slice after the first gets a name of its own. The first
// slice keeps the family name, which pairs it with the bold font: both start
// with ASCII, and satori picks between them by weight.
const SLICE = 300;
const wanted = FONTS.flatMap(({ text, file, ...f }) => {
  const chars = [...new Set(text(titles))].sort();
  const slices = [];
  for (let i = 0; i < chars.length; i += SLICE) slices.push(chars.slice(i, i + SLICE).join(""));
  return slices.map((t, i) => ({
    name: i === 0 ? f.family : `${f.family} ${i + 1}`,
    ...f,
    file: slices.length > 1 ? file.replace(".ttf", `-${i + 1}.ttf`) : file,
    text: t,
  }));
});

const force = process.argv.includes("--force");
const current = await readFile(manifestPath, "utf8").then(JSON.parse, () => null);
if (!force && JSON.stringify(current) === JSON.stringify(wanted)) {
  console.log("og-fonts: up to date");
  process.exit(0);
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
for (const f of wanted) {
  const data = await download(f, f.text);
  await writeFile(path.join(outDir, f.file), data);
  console.log(`og-fonts: ${f.file} ${(data.length / 1024).toFixed(0)} KB`);
}
await writeFile(manifestPath, JSON.stringify(wanted, null, 2) + "\n");
