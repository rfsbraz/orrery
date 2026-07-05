import { createServerSupabase, getCurrentUser } from "./server";
import type { Group, GroupMember, NewGroupInput, BoardRow } from "../groups/types";
import { GROUP_HANDLE_RE, GROUP_NAME_MAX } from "../groups/types";

export type { Group, GroupMember, NewGroupInput, BoardRow } from "../groups/types";

// Groups / book clubs. A group picks a franchise + order and reads it together;
// the shared board reuses members' own progress rows (RLS carve-out in 0003).

const SELECT = "id,handle,name,description,franchise_slug,order_ref,pace,owner_id,is_public,created_at";

function toGroup(row: Record<string, unknown>, memberCount = 0): Group {
  return {
    id: row.id as string,
    handle: row.handle as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    franchiseSlug: row.franchise_slug as string,
    orderRef: row.order_ref as string,
    pace: (row.pace as string) ?? null,
    ownerId: row.owner_id as string,
    isPublic: Boolean(row.is_public),
    createdAt: row.created_at as string,
    memberCount,
  };
}

async function countMembers(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabase>>>,
  groupIds: string[]
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (groupIds.length === 0) return counts;
  const { data } = await supabase.from("group_members").select("group_id").in("group_id", groupIds);
  for (const m of data ?? []) counts.set(m.group_id, (counts.get(m.group_id) ?? 0) + 1);
  return counts;
}

/** Create a group and add the creator as its owner member. */
export async function createGroup(input: NewGroupInput): Promise<{ ok: boolean; handle?: string; error?: string }> {
  const supabase = await createServerSupabase();
  const user = await getCurrentUser();
  if (!supabase) return { ok: false, error: "accounts not configured" };
  if (!user) return { ok: false, error: "not signed in" };
  if (!GROUP_HANDLE_RE.test(input.handle)) {
    return { ok: false, error: "Handle must be 3-30 characters: lowercase letters, numbers or _." };
  }
  const name = input.name.trim();
  if (!name || name.length > GROUP_NAME_MAX) return { ok: false, error: "Give the group a name (1-120 characters)." };

  const { data, error } = await supabase
    .from("groups")
    .insert({
      handle: input.handle,
      name,
      description: input.description?.trim() || null,
      franchise_slug: input.franchiseSlug,
      order_ref: input.orderRef,
      pace: input.pace?.trim() || null,
      owner_id: user.id,
      is_public: input.isPublic,
    })
    .select("id,handle")
    .single();
  if (error) {
    if (error.code === "23505") return { ok: false, error: "That group handle is taken." };
    return { ok: false, error: error.message };
  }
  const { error: memberErr } = await supabase
    .from("group_members")
    .insert({ group_id: data.id, user_id: user.id, role: "owner" });
  if (memberErr) return { ok: false, error: memberErr.message };
  return { ok: true, handle: data.handle as string };
}

/** Public groups, most members first. */
export async function getPublicGroups(): Promise<Group[]> {
  const supabase = await createServerSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("groups")
    .select(SELECT)
    .eq("is_public", true)
    .order("created_at", { ascending: false });
  const rows = data ?? [];
  const counts = await countMembers(supabase, rows.map((r) => r.id as string));
  return rows.map((r) => toGroup(r, counts.get(r.id as string) ?? 0)).sort((a, b) => b.memberCount - a.memberCount);
}

/** A group by handle (RLS hides private groups from non-members). */
export async function getGroupByHandle(handle: string): Promise<Group | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const { data } = await supabase.from("groups").select(SELECT).eq("handle", handle).maybeSingle();
  if (!data) return null;
  const counts = await countMembers(supabase, [data.id as string]);
  return toGroup(data, counts.get(data.id as string) ?? 0);
}

/** A group's members with display names. */
export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const supabase = await createServerSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("group_members").select("user_id,role").eq("group_id", groupId);
  const rows = data ?? [];
  const ids = rows.map((r) => r.user_id as string);
  const nameById = new Map<string, string>();
  if (ids.length > 0) {
    const { data: profiles } = await supabase.from("profiles").select("id,handle,display_name").in("id", ids);
    for (const p of profiles ?? []) nameById.set(p.id as string, (p.display_name as string) || `@${p.handle}`);
  }
  return rows.map((r) => ({
    userId: r.user_id as string,
    name: nameById.get(r.user_id as string) ?? "a reader",
    role: r.role as "owner" | "member",
  }));
}

/** Is the signed-in user a member of this group? */
export async function amIMember(groupId: string): Promise<boolean> {
  const supabase = await createServerSupabase();
  const user = await getCurrentUser();
  if (!supabase || !user) return false;
  const { data } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .maybeSingle();
  return Boolean(data);
}

export async function joinGroup(groupId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createServerSupabase();
  const user = await getCurrentUser();
  if (!supabase || !user) return { ok: false, error: "not signed in" };
  const { error } = await supabase.from("group_members").upsert({ group_id: groupId, user_id: user.id, role: "member" });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function leaveGroup(groupId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createServerSupabase();
  const user = await getCurrentUser();
  if (!supabase || !user) return { ok: false, error: "not signed in" };
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", user.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/**
 * The shared progress board: per member, how many of the order's works they've
 * read. Populated once you're a member (the RLS carve-out only exposes progress
 * to fellow group members); non-members see the roster with zeroed counts.
 */
export async function getGroupProgressBoard(members: GroupMember[], orderWorkIds: string[]): Promise<BoardRow[]> {
  const supabase = await createServerSupabase();
  const user = await getCurrentUser();
  const total = orderWorkIds.length;
  if (!supabase || members.length === 0) {
    return members.map((m) => ({ userId: m.userId, name: m.name, read: 0, total, isMe: false }));
  }
  const memberIds = members.map((m) => m.userId);
  const workSet = new Set(orderWorkIds);
  const { data } = await supabase
    .from("progress")
    .select("user_id,work_id,status")
    .in("user_id", memberIds)
    .eq("status", "read");
  const readByUser = new Map<string, number>();
  for (const p of data ?? []) {
    if (workSet.has(p.work_id as string)) {
      readByUser.set(p.user_id as string, (readByUser.get(p.user_id as string) ?? 0) + 1);
    }
  }
  return members
    .map((m) => ({
      userId: m.userId,
      name: m.name,
      read: readByUser.get(m.userId) ?? 0,
      total,
      isMe: user?.id === m.userId,
    }))
    .sort((a, b) => b.read - a.read);
}
