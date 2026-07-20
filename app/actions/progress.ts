"use server";

import { getMyProgress, setMyProgress, importProgress } from "@/lib/supabase/progress";
import { getCurrentUser } from "@/lib/supabase/server";
import type { ProgressEntry, ReadStatus } from "@/lib/progress/types";

/** How long the progress UI is willing to wait on auth before going guest. */
const AUTH_TIMEOUT_MS = 2500;

/** Load the signed-in user's progress (server-side; reliable cookie session). */
export async function loadMyProgressAction(): Promise<{ authed: boolean; progress: ProgressEntry[] }> {
  try {
    // A slow/unreachable auth backend (or a stale session forcing retry
    // backoff) must not hold the reading UI hostage - cap it and go guest.
    const user = await Promise.race([
      getCurrentUser(),
      new Promise<null>((r) => setTimeout(() => r(null), AUTH_TIMEOUT_MS)),
    ]);
    if (!user) return { authed: false, progress: [] };
    return { authed: true, progress: await getMyProgress() };
  } catch {
    // Auth backend unreachable: degrade to signed-out (guest progress still works).
    return { authed: false, progress: [] };
  }
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
