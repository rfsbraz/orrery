// Supabase connection env. Returns null when unset so the app degrades
// gracefully (renders "accounts coming soon") instead of crashing before the
// instance is provisioned. Same vars whether local (supabase CLI), self-hosted
// on homeberry, or cloud - only the values change.
export function supabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

export const accountsEnabled = () => supabaseEnv() !== null;
