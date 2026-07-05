"use server";

import { revalidatePath } from "next/cache";
import { getMyProfile, upsertMyProfile } from "@/lib/supabase/profiles";
import type { Profile, ProfileInput } from "@/lib/profile/types";

/** Load the signed-in user's profile (null if not created yet). */
export async function loadMyProfileAction(): Promise<Profile | null> {
  return getMyProfile();
}

/** Create/update the signed-in user's profile, then revalidate the public page. */
export async function saveProfileAction(input: ProfileInput): Promise<{ ok: boolean; error?: string }> {
  const res = await upsertMyProfile(input);
  if (res.ok) revalidatePath(`/u/${input.handle}`);
  return res;
}
