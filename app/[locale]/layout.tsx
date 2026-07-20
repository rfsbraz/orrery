import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_HREFLANG,
  LOCALE_SEGMENT,
  localeFromSegment,
} from "@/lib/i18n/config";
import { LocaleProvider } from "@/components/i18n/provider";
import { AuthNav } from "@/components/auth-nav";

// Every page lives under a locale segment. The default locale is unprefixed
// (the proxy rewrites "/f/x" to "/en/f/x" internally), so existing links and
// their SEO equity survive while "/pt/f/x" is a real, crawlable Portuguese URL.

export function generateStaticParams() {
  return LOCALES.map((l) => ({ locale: LOCALE_SEGMENT[l] || "en" }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: segment } = await props.params;
  const locale = localeFromSegment(segment === "en" ? undefined : segment);
  return {
    // Tell crawlers about every language version of this page.
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [
          LOCALE_HREFLANG[l],
          LOCALE_SEGMENT[l] ? `/${LOCALE_SEGMENT[l]}` : "/",
        ])
      ),
    },
    other: { "content-language": locale },
  };
}

export default async function LocaleLayout(props: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  const { children } = props;
  const { locale: segment } = await props.params;
  const known =
    segment === "en" || LOCALES.some((l) => LOCALE_SEGMENT[l] === segment);
  if (!known) notFound();
  const locale = localeFromSegment(segment === "en" ? undefined : segment);

  return (
    <LocaleProvider locale={locale}>
      <AuthNav />
      {children}
    </LocaleProvider>
  );
}

export const dynamicParams = false;
export { DEFAULT_LOCALE };
