// Pure group types, safe to import from client components.

export interface Group {
  id: string;
  handle: string;
  name: string;
  description: string | null;
  franchiseSlug: string;
  orderRef: string; // 'canon:default' | 'canon:<orderId>' | 'community:<uuid>'
  pace: string | null;
  ownerId: string;
  isPublic: boolean;
  createdAt: string;
  memberCount: number;
}

export interface GroupMember {
  userId: string;
  name: string; // display name / @handle, or "a reader" if private
  role: "owner" | "member";
}

export interface NewGroupInput {
  handle: string;
  name: string;
  description?: string | null;
  franchiseSlug: string;
  orderRef: string;
  pace?: string | null;
  isPublic: boolean;
}

/** One member's standing on the shared progress board. */
export interface BoardRow {
  userId: string;
  name: string;
  read: number;
  total: number;
  isMe: boolean;
}

export const GROUP_HANDLE_RE = /^[a-z0-9_]{3,30}$/;
export const GROUP_NAME_MAX = 120;
