"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";

/** Tiny top-right nav: Sign in when logged out; My shelf + Sign out when in. */
export function AuthNav() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const supabase = createBrowserSupabase();

  useEffect(() => {
    if (!supabase) return; // unconfigured: render() returns null, no nav shown
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setAuthed(!!session?.user));
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (authed === null || !supabase) return null;

  return (
    <nav className="fixed right-4 top-4 z-50 flex items-center gap-3 text-sm">
      {authed ? (
        <>
          <Link href="/me" className="text-neutral-400 hover:text-neutral-100">
            My shelf
          </Link>
          <button
            className="text-neutral-500 hover:text-neutral-300"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/");
              router.refresh();
            }}
          >
            Sign out
          </button>
        </>
      ) : (
        <Link href="/login" className="text-neutral-400 hover:text-neutral-100">
          Sign in
        </Link>
      )}
    </nav>
  );
}
