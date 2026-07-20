"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LOCALES,
  LOCALE_NAME,
  LOCALE_SEGMENT,
  isLocale,
  type Locale,
} from "@/lib/i18n/config";
import { useLocale } from "./provider";

/**
 * Language switcher. Swaps the locale segment in the current path rather than
 * sending the reader home, so switching language keeps your place - and each
 * target is a real crawlable URL, not a client-side toggle.
 */
export function LocaleSwitcher() {
  const current = useLocale();
  const pathname = usePathname() || "/";

  /** The same page in another locale. */
  function pathFor(locale: Locale): string {
    const parts = pathname.split("/").filter(Boolean);
    // strip an existing locale segment
    const bare =
      parts.length > 0 && isLocale(segmentToLocale(parts[0]))
        ? parts.slice(1)
        : parts;
    const seg = LOCALE_SEGMENT[locale];
    return "/" + [seg, ...bare].filter(Boolean).join("/");
  }

  return (
    <nav aria-label="Language" className="flex items-center gap-1.5">
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={pathFor(l)}
          hrefLang={l}
          aria-current={l === current ? "true" : undefined}
          className={
            l === current
              ? "text-xs font-medium text-neutral-200"
              : "text-xs text-neutral-500 hover:text-neutral-300"
          }
        >
          {LOCALE_NAME[l]}
        </Link>
      ))}
    </nav>
  );
}

/** Map a URL segment back to its locale string ("pt" -> "pt-PT"). */
function segmentToLocale(segment: string): string {
  const hit = LOCALES.find((l) => LOCALE_SEGMENT[l] === segment);
  return hit ?? "";
}
