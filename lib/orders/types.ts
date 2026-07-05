// Pure community-order types, safe to import from client components (the data
// layer in lib/supabase/orders.ts pulls in next/headers).

export type OrderStatus = "pending" | "approved" | "rejected";

export interface CommunityOrder {
  id: string;
  franchiseSlug: string;
  authorId: string;
  authorName: string; // display name / @handle, or "a reader" if the profile is private
  name: string;
  rationale: string | null;
  orderedWorkIds: string[];
  status: OrderStatus;
  voteCount: number;
  votedByMe: boolean;
  createdAt: string;
}

export interface NewOrderInput {
  franchiseSlug: string;
  name: string;
  rationale?: string | null;
  orderedWorkIds: string[];
}

export const ORDER_NAME_MAX = 120;
export const ORDER_RATIONALE_MAX = 4000;
