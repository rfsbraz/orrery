import type { Metadata } from "next";
import { localeFromSegment } from "@/lib/i18n/config";
import { translator } from "@/lib/i18n/messages";

export const metadata: Metadata = { title: "Offline | Orrery" };

/** Shown when a page is requested with no network and nothing cached. */
export default async function OfflinePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: seg } = await props.params;
  const t = translator(localeFromSegment(seg === "en" ? undefined : seg));
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-6 py-20 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-neutral-500">
        {t("offline.label")}
      </p>
      <h1 className="display mt-3 text-3xl font-semibold text-neutral-100">
        {t("offline.title")}
      </h1>
      <p className="prose-read mt-3 text-sm text-neutral-400">{t("offline.body")}</p>
    </main>
  );
}
