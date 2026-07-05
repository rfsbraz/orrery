import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "./env";

/**
 * Server-side Supabase client (React Server Components, Route Handlers, Actions).
 * Returns null when Supabase isn't configured yet, so callers can no-op instead
 * of throwing. Follows the @supabase/ssr cookie pattern for Next.js.
 */
export async function createServerSupabase() {
  const env = supabaseEnv();
  if (!env) return null;
  const cookieStore = await cookies();
  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component (read-only cookies) - safe to ignore;
          // session refresh happens in middleware.
        }
      },
    },
  });
}

/** The current authenticated user, or null. */
export async function getCurrentUser() {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
