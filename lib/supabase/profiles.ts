import { createServerSupabase, getCurrentUser } from "./server";
import { HANDLE_RE, type Profile, type ProfileInput } from "../profile/types";

// Profiles are private by default (CONCEPT decision). RLS on public.profiles
// returns a row to a viewer only when it's their own or is_public = true, so
// getProfileByHandle naturally 404s a private profile for everyone else.

export type { Profile, ProfileInput } from "../profile/types";

function toProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    handle: row.handle as string,
    displayName: (row.display_name as string) ?? null,
    bio: (row.bio as string) ?? null,
    country: (row.country as string) ?? null,
    isPublic: Boolean(row.is_public),
    isModerator: Boolean(row.is_moderator),
  };
}

/** The signed-in user's own profile, or null if they haven't created one. */
export async function getMyProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabase();
  const user = await getCurrentUser();
  if (!supabase || !user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id,handle,display_name,bio,country,is_public,is_moderator")
    .eq("id", user.id)
    .maybeSingle();
  return data ? toProfile(data) : null;
}

/** Create or update the signed-in user's profile. Returns ok/error (handle clashes surface here). */
export async function upsertMyProfile(input: ProfileInput): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createServerSupabase();
  const user = await getCurrentUser();
  if (!supabase) return { ok: false, error: "accounts not configured" };
  if (!user) return { ok: false, error: "not signed in" };
  if (!HANDLE_RE.test(input.handle)) {
    return { ok: false, error: "Handle must be 3-30 characters: lowercase letters, numbers or _." };
  }
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    handle: input.handle,
    display_name: input.displayName ?? null,
    bio: input.bio ?? null,
    country: input.country ?? null,
    is_public: input.isPublic,
  });
  if (error) {
    // 23505 = unique_violation on handle.
    if (error.code === "23505") return { ok: false, error: "That handle is taken." };
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** A public profile by handle. RLS returns it only if public (or it's the owner). */
export async function getProfileByHandle(handle: string): Promise<Profile | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id,handle,display_name,bio,country,is_public,is_moderator")
    .eq("handle", handle)
    .maybeSingle();
  return data ? toProfile(data) : null;
}
