"use server";

import { revalidatePath } from "next/cache";
import { createGroup, joinGroup, leaveGroup } from "@/lib/supabase/groups";
import type { NewGroupInput } from "@/lib/groups/types";

export async function createGroupAction(input: NewGroupInput) {
  const res = await createGroup(input);
  if (res.ok) revalidatePath("/groups");
  return res;
}

export async function joinGroupAction(groupId: string, handle: string) {
  const res = await joinGroup(groupId);
  if (res.ok) revalidatePath(`/g/${handle}`);
  return res;
}

export async function leaveGroupAction(groupId: string, handle: string) {
  const res = await leaveGroup(groupId);
  if (res.ok) revalidatePath(`/g/${handle}`);
  return res;
}
