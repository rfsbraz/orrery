import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_SEGMENT,
  localePath,
  preferredLocale,
  isLocale,
} from "@/lib/i18n/config";

/** Remembers an explicit language choice so detection never overrides it. */
export const LOCALE_COOKIE = "orrery.locale";

const LOCALE_SEGMENTS = new Set(
  LOCALES.map((l) => LOCALE_SEGMENT[l]).filter(Boolean)
);

// Next 16 renamed middleware.ts -> proxy.ts. Two jobs:
// 1. Refresh the Supabase auth session cookie so server components see a live
//    session.
// 2. Locale routing: every page lives under an /[locale] segment, but the
//    default locale is unprefixed in the URL. So "/f/x" is rewritten onto
//    "/en/f/x" internally - the reader (and Google) keep the clean URL, and
//    "/pt/f/x" passes through untouched as a real Portuguese page.
export async function proxy(request: NextRequest) {
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1] ?? "";
  if (LOCALE_SEGMENTS.has(first) || first === "en") return response;

  // Unprefixed path: decide which language this reader should get. An explicit
  // choice (the switcher's cookie) always wins; otherwise fall back to the
  // browser's Accept-Language. A Portuguese reader should land on Portuguese
  // without having to discover the switcher first.
  const chosen = request.cookies.get(LOCALE_COOKIE)?.value;
  const target =
    chosen && isLocale(chosen)
      ? chosen
      : preferredLocale(request.headers.get("accept-language")) ?? DEFAULT_LOCALE;

  if (target !== DEFAULT_LOCALE) {
    const to = request.nextUrl.clone();
    to.pathname = localePath(target, pathname);
    const redirect = NextResponse.redirect(to, 307); // 307: not cacheable as permanent
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  const rewritten = NextResponse.rewrite(url, { request });
  // Carry over whatever updateSession set (refreshed auth cookies).
  response.cookies.getAll().forEach((c) => rewritten.cookies.set(c));
  return rewritten;
}

export const config = {
  // Run on all routes except static assets and the PWA's root-level files.
  // Those must never be locale-rewritten: /en/manifest.webmanifest does not
  // exist, and a service worker's scope is decided by the path it is served
  // from, so /sw.js has to stay at the root to control the whole origin.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons/|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest|xml|txt)$).*)",
  ],
};
