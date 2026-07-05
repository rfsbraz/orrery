"use server";

import { revalidatePath } from "next/cache";
import {
  getApprovedOrders,
  createOrder,
  deleteMyOrder,
  setVote,
  moderateOrder,
  isModerator,
} from "@/lib/supabase/orders";
import type { CommunityOrder, NewOrderInput } from "@/lib/orders/types";

/** Approved community orders for a franchise (loaded client-side on the SSG museum page). */
export async function loadApprovedOrdersAction(franchiseSlug: string): Promise<CommunityOrder[]> {
  return getApprovedOrders(franchiseSlug);
}

/** Submit a new community order (starts pending moderation). */
export async function createOrderAction(input: NewOrderInput) {
  const res = await createOrder(input);
  if (res.ok) revalidatePath(`/f/${input.franchiseSlug}`);
  return res;
}

/** Delete one of my own orders. */
export async function deleteOrderAction(id: string, franchiseSlug: string) {
  const res = await deleteMyOrder(id);
  if (res.ok) revalidatePath(`/f/${franchiseSlug}`);
  return res;
}

/** Toggle my vote on an order. */
export async function voteAction(orderId: string, voted: boolean, franchiseSlug: string) {
  const res = await setVote(orderId, voted);
  if (res.ok) revalidatePath(`/f/${franchiseSlug}`);
  return res;
}

/** Moderator: approve or reject a submission. */
export async function moderateOrderAction(id: string, status: "approved" | "rejected") {
  if (!(await isModerator())) return { ok: false, error: "not authorized" };
  const res = await moderateOrder(id, status);
  if (res.ok) revalidatePath("/moderate");
  return res;
}
