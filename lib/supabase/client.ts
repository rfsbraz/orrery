"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "./env";

/** Browser Supabase client, or null when not configured. */
export function createBrowserSupabase() {
  const env = supabaseEnv();
  if (!env) return null;
  return createBrowserClient(env.url, env.anonKey);
}
