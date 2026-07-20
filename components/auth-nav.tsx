"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { useT, useLocale } from "@/components/i18n/provider";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { localePath } from "@/lib/i18n/config";

/** Tiny top-right nav: language switcher, plus sign in / shelf when accounts are on. */
export function AuthNav() {
  const t = useT();
  const locale = useLocale();
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

  // The language switcher shows even when accounts are unconfigured - it is
  // navigation, not an account feature.
  if (authed === null || !supabase) {
    return (
      <nav className="fixed right-3 top-3 z-50 flex items-center gap-2 text-xs md:right-4 md:top-4 md:gap-3 md:text-sm">
        <LocaleSwitcher />
      </nav>
    );
  }

  return (
    <nav className="fixed right-3 top-3 z-50 flex items-center gap-2 text-xs md:right-4 md:top-4 md:gap-3 md:text-sm">
      <LocaleSwitcher />
      {authed ? (
        <>
          <Link href={localePath(locale, "/groups")} className="text-neutral-400 hover:text-neutral-100">
            {t("nav.clubs")}
          </Link>
          <Link href={localePath(locale, "/me")} className="text-neutral-400 hover:text-neutral-100">
            {t("nav.myShelf")}
          </Link>
          <button
            className="text-neutral-500 hover:text-neutral-300"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/");
              router.refresh();
            }}
          >
            {t("nav.signOut")}
          </button>
        </>
      ) : (
        <Link href={localePath(locale, "/login")} className="text-neutral-400 hover:text-neutral-100">
          {t("nav.signIn")}
        </Link>
      )}
    </nav>
  );
}
