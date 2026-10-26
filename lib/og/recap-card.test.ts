import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderRecapCard } from "./recap-card";
import { buildYearRecap } from "../progress/recap";
import { getAllBundles } from "../content";
import { LOCALES } from "../i18n/config";
import type { FranchiseBundle } from "../content/types";

// next/og fetches a Google font for any glyph the card's own fonts lack, and
// draws an empty box when that fetch fails. Failing every fetch makes a missing
// glyph show up here as a network call instead of as a blank title.
let fetchCalls: string[];
beforeEach(() => {
  fetchCalls = [];
  vi.stubGlobal("fetch", (input: unknown) => {
    fetchCalls.push(String(input));
    return Promise.reject(new Error("the recap card must not need the network"));
  });
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function recapReading(title: string) {
  const bundle: FranchiseBundle = {
    franchise: { id: "w", name: "Wing", kind: "author", authorIds: [] },
    authors: [],
    works: [{ id: "w/book", title, authorIds: ["a"], published: 1979, canonTier: "core" }],
    eras: [],
    orders: [],
    timeline: [],
    editions: [],
  };
  return buildYearRecap(2026, [bundle], [{ workId: "w/book", status: "read", dateRead: "2026-03-01" }]);
}

async function renderPng(title: string) {
  return Buffer.from(await renderRecapCard(recapReading(title)).arrayBuffer());
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

describe("renderRecapCard", () => {
  it.each([
    ["Latin", "The Colour of Magic"],
    ["Cyrillic", "Мастер и Маргарита"],
    ["Greek", "Ὀδύσσεια"],
    ["Japanese", "風の歌を聴け"],
    ["Arabic", "ألف ليلة وليلة"],
  ])("draws %s longest-wait titles from its own fonts", async (_script, title) => {
    const png = await renderPng(title);
    expect(png.subarray(0, 4)).toEqual(PNG_SIGNATURE);
    expect(fetchCalls).toEqual([]);
  });

  it("has a glyph for every character of every catalogue title", async () => {
    const chars = new Set<string>();
    for (const locale of [undefined, ...LOCALES]) {
      for (const b of getAllBundles(locale)) {
        for (const w of b.works) for (const c of w.title) chars.add(c);
      }
    }
    await renderPng([...chars].join(""));
    expect(fetchCalls).toEqual([]);
  });
});
