"use client";

import { createContext, useContext } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { translate, type MessageKey } from "@/lib/i18n/messages";

// Client components need the locale too (progress chips, spoiler gates, the
// wizard, the order comparer). The server layout puts the locale in context;
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
