import { createServerSupabase, getCurrentUser } from "./server";
import type { ProgressEntry, ReadStatus } from "../progress/types";

// Data access for a user's reading progress. Progress rows reference canon
// Work IDs; RLS ensures a user only writes their own (see supabase migrations).

function toEntry(row: Record<string, unknown>): ProgressEntry {
  return {
    workId: row.work_id as string,
    status: row.status as ReadStatus,
    rating: (row.rating as number) ?? undefined,
    dateRead: (row.date_read as string) ?? undefined,
    note: (row.note as string) ?? undefined,
  };
}

/** The signed-in user's progress (empty when unauthenticated or unconfigured). */
export async function getMyProgress(): Promise<ProgressEntry[]> {
  const supabase = await createServerSupabase();
  const user = await getCurrentUser();
  if (!supabase || !user) return [];
  const { data } = await supabase
    .from("progress")
    .select("work_id,status,rating,date_read,note")
    .eq("user_id", user.id);
  return (data ?? []).map(toEntry);
}

/** A public profile's progress (RLS returns rows only if that profile is public). */
export async function getPublicProgress(userId: string): Promise<ProgressEntry[]> {
  const supabase = await createServerSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("progress")
    .select("work_id,status,rating,date_read,note")
    .eq("user_id", userId);
  return (data ?? []).map(toEntry);
}

/** Upsert one progress entry for the signed-in user. Returns ok/error. */
export async function setMyProgress(entry: ProgressEntry): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createServerSupabase();
  const user = await getCurrentUser();
  if (!supabase) return { ok: false, error: "accounts not configured" };
  if (!user) return { ok: false, error: "not signed in" };
  const { error } = await supabase.from("progress").upsert({
    user_id: user.id,
    work_id: entry.workId,
    status: entry.status,
    rating: entry.rating ?? null,
    date_read: entry.dateRead ?? null,
    note: entry.note ?? null,
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Bulk upsert (used by the Goodreads/StoryGraph import). */
export async function importProgress(entries: ProgressEntry[]): Promise<{ ok: boolean; count: number; error?: string }> {
  const supabase = await createServerSupabase();
  const user = await getCurrentUser();
  if (!supabase) return { ok: false, count: 0, error: "accounts not configured" };
  if (!user) return { ok: false, count: 0, error: "not signed in" };
  const rows = entries.map((e) => ({
    user_id: user.id,
    work_id: e.workId,
    status: e.status,
    rating: e.rating ?? null,
    date_read: e.dateRead ?? null,
    note: e.note ?? null,
  }));
  const { error } = await supabase.from("progress").upsert(rows);
  return error ? { ok: false, count: 0, error: error.message } : { ok: true, count: rows.length };
}
