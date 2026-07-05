// Pure profile types + validation, safe to import from client components
// (the data layer in lib/supabase/profiles.ts pulls in next/headers and must
// not reach the browser bundle).

export interface Profile {
  id: string;
  handle: string;
  displayName: string | null;
  bio: string | null;
  country: string | null;
  isPublic: boolean;
  isModerator: boolean;
}

export interface ProfileInput {
  handle: string;
  displayName?: string | null;
  bio?: string | null;
  country?: string | null;
  isPublic: boolean;
}

// Mirror of the DB check constraint (supabase/migrations/0001_init.sql).
export const HANDLE_RE = /^[a-z0-9_]{3,30}$/;
