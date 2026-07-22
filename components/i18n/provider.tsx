"use client";

import { createContext, useContext } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { translate, type MessageKey } from "@/lib/i18n/messages";

// Client components need the locale too (progress chips, spoiler gates, the
// wizard). The server layout puts the locale in context;
// components call useT() exactly like server components call translator().

const Ctx = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={locale}>{children}</Ctx.Provider>;
}

export function useLocale(): Locale {
  return useContext(Ctx);
}

export function useT() {
  const locale = useContext(Ctx);
  return (key: MessageKey, vars?: Record<string, string | number>) =>
    translate(locale, key, vars);
}

// Canonical (original-language) work titles, by work id.
//
// A translated wing writes its inline references with the PUBLISHED local
// title: `[[work:jo-nesbo/flaggermusmannen|O Morcego]]`. That is right for
// readability and wrong on its own, because a Portuguese reader then has no
// way to know the book is *Flaggermusmannen*. Orrery is for experiencing an
// author as they were; an edition title is a convenience for browsing
// locally, so it must never be the only title a reader sees.
//
// Threaded as context rather than as a prop because `Prose` has sixteen call
// sites and none of them should have to care.
const TitlesCtx = createContext<Record<string, string>>({});

export function WorkTitlesProvider({
  titles,
  children,
}: {
  titles: Record<string, string>;
  children: React.ReactNode;
}) {
  return <TitlesCtx.Provider value={titles}>{children}</TitlesCtx.Provider>;
}

/** Canonical titles by work id. Empty by default, so an unwired page is unchanged. */
export function useWorkTitles(): Record<string, string> {
  return useContext(TitlesCtx);
}
