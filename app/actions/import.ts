"use server";

import { getAllBundles } from "@/lib/content";
import { parseExport, matchToCanon, type ImportResult } from "@/lib/import/csv";
import { getCurrentUser } from "@/lib/supabase/server";
import type { ProgressEntry } from "@/lib/progress/types";

// Matched rows carry the canon title so the preview is readable; the commit
// (importProgressAction) only reads the ProgressEntry fields, ignoring `title`.
export type MatchedPreview = ProgressEntry & { title: string };

export interface ImportPreview {
  authed: boolean;
  matched: MatchedPreview[];
  unmatched: ImportResult["unmatched"];
}

/**
 * Parse a Goodreads/StoryGraph CSV and match it to canon server-side (the
 * browser doesn't hold the canon). Returns a preview the user confirms before
 * anything is written; the commit goes through importProgressAction.
 */
export async function previewImportAction(csvText: string): Promise<ImportPreview> {
  const user = await getCurrentUser();
  if (!user) return { authed: false, matched: [], unmatched: [] };

  const bundles = getAllBundles();
  const works = bundles.flatMap((b) => b.works);
  const titles = new Map(works.map((w) => [w.id, w.title]));
  const authorNames = new Map<string, string>();
  for (const b of bundles) for (const a of b.authors) authorNames.set(a.id, a.name);

  const entries = parseExport(csvText);
  const { matched, unmatched } = matchToCanon(entries, works, authorNames);
  return {
    authed: true,
    matched: matched.map((m) => ({ ...m, title: titles.get(m.workId) ?? m.workId })),
    unmatched,
  };
}
