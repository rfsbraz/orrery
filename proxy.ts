import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { LOCALES, LOCALE_SEGMENT } from "@/lib/i18n/config";

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

  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  const rewritten = NextResponse.rewrite(url, { request });
  // Carry over whatever updateSession set (refreshed auth cookies).
  response.cookies.getAll().forEach((c) => rewritten.cookies.set(c));
  return rewritten;
}

export const config = {
  // Run on all routes except static assets and images.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
