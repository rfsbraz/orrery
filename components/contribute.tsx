import { contributeLinks } from "@/lib/content/contribute";
import { translator } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/config";

/**
 * The contribution footer. Canon is curated in the open, so every page offers
 * the honest routes back: report an error, add a missing book, propose an
 * order, ask for an author we do not have yet. Each goes to a real issue form
 * with the context prefilled, not a blank box.
 */
export function Contribute({
  locale,
  franchiseName,
  compact = false,
}: {
  locale: Locale;
  /** Prefills the issue title when we are on a franchise page. */
  franchiseName?: string;
  /** Site-wide footer (e.g. the home page) omits the page-specific actions. */
  compact?: boolean;
}) {
  const t = translator(locale);
  const links = contributeLinks(franchiseName);

  const item = (href: string, label: string) => (
    <a
      key={label}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-current/30 underline-offset-2 hover:decoration-current"
    >
      {label}
    </a>
  );

  return (
    <footer className="mt-16 border-t border-current/10 pt-5 text-xs text-current/50">
      <p className="mb-1.5 font-medium text-current/70">{t("contribute.title")}</p>
      <p className="prose-read max-w-2xl leading-relaxed">
        {t("contribute.lede")}{" "}
        {!compact && (
          <>
            {item(links.reportError, t("contribute.reportError"))}
            {" · "}
            {item(links.missingWork, t("contribute.missingWork"))}
            {" · "}
            {item(links.readingOrder, t("contribute.readingOrder"))}
            {" · "}
          </>
        )}
        {item(links.newFranchise, t("contribute.newAuthor"))}
        {" · "}
        {item(links.repo, t("contribute.repo"))}
      </p>
    </footer>
  );
}
