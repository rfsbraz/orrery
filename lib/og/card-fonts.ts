import { readFile } from "node:fs/promises";
import path from "node:path";
import manifest from "./fonts/fonts.json";

// The fonts scripts/og-fonts.mjs fetched for the recap card. Handing them to
// ImageResponse means it never goes to Google Fonts for a glyph: titles stay on
// this server, and a title in a script the default font lacks still renders.
type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
export type CardFont = { name: string; data: ArrayBuffer; weight: Weight; style: "normal" };

const dir = path.join(process.cwd(), "lib", "og", "fonts");
let loading: Promise<CardFont[]> | undefined;

export function cardFonts(): Promise<CardFont[]> {
  loading ??= Promise.all(
    manifest.map(async (f) => {
      const buf = await readFile(path.join(dir, f.file));
      return {
        name: f.name,
        data: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer,
        weight: f.weight as Weight,
        style: "normal" as const,
      };
    })
  ).catch((e) => {
    loading = undefined;
    throw e;
  });
  return loading;
}
