"use server";

import { getMyProgress, setMyProgress, importProgress } from "@/lib/supabase/progress";
import { getCurrentUser } from "@/lib/supabase/server";
import type { ProgressEntry, ReadStatus } from "@/lib/progress/types";

/** Load the signed-in user's progress (server-side; reliable cookie session). */
export async function loadMyProgressAction(): Promise<{ authed: boolean; progress: ProgressEntry[] }> {
  const user = await getCurrentUser();
  if (!user) return { authed: false, progress: [] };
  return { authed: true, progress: await getMyProgress() };
}

/** Set one work's status for the signed-in user (server-side, cookie session). */
export async function setProgressAction(workId: string, status: ReadStatus) {
  const dateRead = status === "read" ? new Date().toISOString().slice(0, 10) : undefined;
  return setMyProgress({ workId, status, dateRead });
}

/** Bulk import (Goodreads/StoryGraph) for the signed-in user. */
export async function importProgressAction(entries: ProgressEntry[]) {
  return importProgress(entries);
}
