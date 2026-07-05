import { createServerSupabase, getCurrentUser } from "./server";
import type { CommunityOrder, NewOrderInput, OrderStatus } from "../orders/types";
import { ORDER_NAME_MAX, ORDER_RATIONALE_MAX } from "../orders/types";

export type { CommunityOrder, NewOrderInput, OrderStatus } from "../orders/types";

// Community reading orders: user-submitted, moderated, votable. They reference
// the same immutable canon Work IDs as git-defined orders (CONCEPT §4a). RLS
// enforces visibility (approved-or-own-or-moderator); these helpers just shape
// the rows and fold in vote counts + author attribution.

interface OrderRow {
  id: string;
  franchise_slug: string;
  author_id: string;
  name: string;
  rationale: string | null;
  ordered_work_ids: string[];
  status: OrderStatus;
  created_at: string;
}

/** Attach vote counts, my-vote flag, and author names to a set of order rows. */
async function decorate(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabase>>>,
  rows: OrderRow[],
  meId: string | null
): Promise<CommunityOrder[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const authorIds = [...new Set(rows.map((r) => r.author_id))];

  const [{ data: votes }, { data: authors }] = await Promise.all([
    supabase.from("order_votes").select("order_id,user_id").in("order_id", ids),
    // RLS returns only public profiles (or the viewer's own); private authors
    // fall back to "a reader" below.
    supabase.from("profiles").select("id,handle,display_name").in("id", authorIds),
  ]);

  const counts = new Map<string, number>();
  const mine = new Set<string>();
  for (const v of votes ?? []) {
    counts.set(v.order_id, (counts.get(v.order_id) ?? 0) + 1);
    if (meId && v.user_id === meId) mine.add(v.order_id);
  }
  const nameById = new Map<string, string>();
  for (const a of authors ?? []) {
    nameById.set(a.id, (a.display_name as string) || `@${a.handle}`);
  }

  return rows.map((r) => ({
    id: r.id,
    franchiseSlug: r.franchise_slug,
    authorId: r.author_id,
    authorName: nameById.get(r.author_id) ?? "a reader",
    name: r.name,
    rationale: r.rationale,
    orderedWorkIds: r.ordered_work_ids,
    status: r.status,
    voteCount: counts.get(r.id) ?? 0,
    votedByMe: mine.has(r.id),
    createdAt: r.created_at,
  }));
}

const SELECT = "id,franchise_slug,author_id,name,rationale,ordered_work_ids,status,created_at";

/** Approved community orders for a franchise, most-voted first. */
export async function getApprovedOrders(franchiseSlug: string): Promise<CommunityOrder[]> {
  const supabase = await createServerSupabase();
  if (!supabase) return [];
  const user = await getCurrentUser();
  const { data } = await supabase
    .from("reading_orders")
    .select(SELECT)
    .eq("franchise_slug", franchiseSlug)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  const decorated = await decorate(supabase, (data ?? []) as OrderRow[], user?.id ?? null);
  return decorated.sort((a, b) => b.voteCount - a.voteCount || b.createdAt.localeCompare(a.createdAt));
}

/** The signed-in user's own submissions (any status). */
export async function getMyOrders(): Promise<CommunityOrder[]> {
  const supabase = await createServerSupabase();
  const user = await getCurrentUser();
  if (!supabase || !user) return [];
  const { data } = await supabase
    .from("reading_orders")
    .select(SELECT)
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });
  return decorate(supabase, (data ?? []) as OrderRow[], user.id);
}

/** Create a community order (starts pending). Returns the new id or an error. */
export async function createOrder(input: NewOrderInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  const supabase = await createServerSupabase();
  const user = await getCurrentUser();
  if (!supabase) return { ok: false, error: "accounts not configured" };
  if (!user) return { ok: false, error: "not signed in" };
  const name = input.name.trim();
  if (!name || name.length > ORDER_NAME_MAX) return { ok: false, error: "Give the order a name (1-120 characters)." };
  if ((input.rationale ?? "").length > ORDER_RATIONALE_MAX) return { ok: false, error: "Rationale is too long." };
  if (input.orderedWorkIds.length === 0) return { ok: false, error: "Add at least one book." };

  const { data, error } = await supabase
    .from("reading_orders")
    .insert({
      franchise_slug: input.franchiseSlug,
      author_id: user.id,
      name,
      rationale: input.rationale?.trim() || null,
      ordered_work_ids: input.orderedWorkIds,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data.id as string };
}

/** Delete one of the signed-in user's own orders. */
export async function deleteMyOrder(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createServerSupabase();
  const user = await getCurrentUser();
  if (!supabase || !user) return { ok: false, error: "not signed in" };
  const { error } = await supabase.from("reading_orders").delete().eq("id", id).eq("author_id", user.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Add or remove the signed-in user's vote on an order. */
export async function setVote(orderId: string, voted: boolean): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createServerSupabase();
  const user = await getCurrentUser();
  if (!supabase || !user) return { ok: false, error: "not signed in" };
  const { error } = voted
    ? await supabase.from("order_votes").upsert({ order_id: orderId, user_id: user.id })
    : await supabase.from("order_votes").delete().eq("order_id", orderId).eq("user_id", user.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Count a user's approved community-order submissions (their curation credit). */
export async function countApprovedOrdersBy(userId: string): Promise<number> {
  const supabase = await createServerSupabase();
  if (!supabase) return 0;
  const { count } = await supabase
    .from("reading_orders")
    .select("id", { count: "exact", head: true })
    .eq("author_id", userId)
    .eq("status", "approved");
  return count ?? 0;
}

/** Is the signed-in user a moderator? */
export async function isModerator(): Promise<boolean> {
  const supabase = await createServerSupabase();
  const user = await getCurrentUser();
  if (!supabase || !user) return false;
  const { data } = await supabase.from("profiles").select("is_moderator").eq("id", user.id).maybeSingle();
  return Boolean(data?.is_moderator);
}

/** The pending queue (RLS returns pending rows only to moderators / their authors). */
export async function getPendingOrders(): Promise<CommunityOrder[]> {
  const supabase = await createServerSupabase();
  const user = await getCurrentUser();
  if (!supabase) return [];
  const { data } = await supabase
    .from("reading_orders")
    .select(SELECT)
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  return decorate(supabase, (data ?? []) as OrderRow[], user?.id ?? null);
}

/** Moderator action: approve or reject a submission. */
export async function moderateOrder(id: string, status: "approved" | "rejected"): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, error: "not configured" };
  const { error } = await supabase.from("reading_orders").update({ status }).eq("id", id);
  return error ? { ok: false, error: error.message } : { ok: true };
}
