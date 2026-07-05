import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnv } from "./env";

/** Refresh the Supabase session cookie on each request (per @supabase/ssr). */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  const env = supabaseEnv();
  if (!env) return response; // accounts not configured - no-op

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Touch the session so it refreshes; ignore result.
  await supabase.auth.getUser();
  return response;
}
