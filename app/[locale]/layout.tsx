import { notFound } from "next/navigation";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces, Spectral, Source_Serif_4 } from "next/font/google";
import { RegisterSW } from "@/components/pwa/register-sw";
import "../globals.css";
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
//
// THIS IS THE ROOT LAYOUT, and it renders <html> deliberately. It used to live
// one level up, which meant `lang` was hardcoded to "en" because a layout above
// the [locale] segment cannot know the locale. Every Portuguese page therefore
// declared itself English: screen readers pronounced Portuguese with English
// phonetics, and crawlers indexed /pt/ as an English page. Since no route lives
// outside a locale, the locale layout can own <html> and the attribute can be
// correct.

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });
// The curated display faces (CONCEPT 6): each franchise's theme.yaml picks one
// by key via lib/theme.ts DISPLAY_FACES; the body/mono faces never vary.
const fraunces = Fraunces({
  variable: "--font-display-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
});
const spectral = Spectral({
  variable: "--font-display-spectral",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});
const sourceSerif = Source_Serif_4({
  variable: "--font-display-source-serif",
  subsets: ["latin"],
});

// Installed, the app draws into the safe areas (see globals.css) and keeps the
// browser chrome dark to match the museum.
export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  viewportFit: "cover",
};

export function generateStaticParams() {
  return LOCALES.map((l) => ({ locale: LOCALE_SEGMENT[l] || "en" }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: segment } = await props.params;
  const locale = localeFromSegment(segment === "en" ? undefined : segment);
  return {
    title: "Orrery",
    description: "Reading journeys in context",
    applicationName: "Orrery",
    appleWebApp: { capable: true, title: "Orrery", statusBarStyle: "black-translucent" },
    formatDetection: { telephone: false },
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
    <html
      lang={LOCALE_HREFLANG[locale] ?? "en"}
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${spectral.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-neutral-950 font-sans text-neutral-200">
        <LocaleProvider locale={locale}>
          <AuthNav />
          {children}
        </LocaleProvider>
        <RegisterSW />
      </body>
    </html>
  );
}

export const dynamicParams = false;
export { DEFAULT_LOCALE };
