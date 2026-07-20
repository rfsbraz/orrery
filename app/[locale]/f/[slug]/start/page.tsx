import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { localeFromSegment, localePath } from "@/lib/i18n/config";
import { translator } from "@/lib/i18n/messages";
import { getFranchise, listFranchiseSlugs } from "@/lib/content";
import { capabilities } from "@/lib/content/capabilities";
import { themeVars } from "@/lib/theme";
import { ProgressProvider } from "@/components/progress/provider";
import { StartWizard, type ResolvedPath } from "@/components/wizard/start-wizard";

export function generateStaticParams() {
  return listFranchiseSlugs()
    .filter((slug) => {
      const b = getFranchise(slug);
      return b ? capabilities(b).wizard : false;
    })
    .map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeSeg, slug } = await props.params;
  const locale = localeFromSegment(localeSeg === "en" ? undefined : localeSeg);
  const t = translator(locale);
  const b = getFranchise(slug);
  if (!b) return {};
  return {
    title: t("meta.start", { name: b.franchise.name }),
    description: `Two questions, a curated way in - where to start reading ${b.franchise.name}.`,
  };
}

/** How many books of an order-backed path to preview in the wizard. */
const ORDER_PREVIEW = 8;

export default async function StartPage(props: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeSeg, slug } = await props.params;
  const locale = localeFromSegment(localeSeg === "en" ? undefined : localeSeg);
  const t = translator(locale);
  const b = getFranchise(slug);
  if (!b || !capabilities(b).wizard) notFound();

  const title = (id: string) => b.works.find((w) => w.id === id)?.title ?? id;

  // Resolve each curated path's books server-side (the client stays dumb).
  const paths: ResolvedPath[] = (b.franchise.startHere?.paths ?? []).map((p) => {
    if (p.workIds && p.workIds.length > 0) {
      return { ...p, books: p.workIds.map((id) => [id, title(id)] as [string, string]) };
    }
    const order =
      p.orderId === "default"
        ? b.orders.find((o) => o.derived)
        : b.orders.find((o) => o.id === p.orderId);
    return {
      ...p,
      books: (order?.orderedWorkIds ?? [])
        .slice(0, ORDER_PREVIEW)
        .map((id) => [id, title(id)] as [string, string]),
      orderName: order?.name,
      orderHref: `/f/${slug}#orders`,
    };
  });

  return (
    <div
      data-franchise={slug}
      style={themeVars(b.theme)}
      className="min-h-screen bg-[var(--bg)] text-[var(--ink)]"
    >
      <main className="mx-auto max-w-2xl px-6 py-14">
        <Link href={localePath(locale, `/f/${slug}`)} className="text-xs text-[var(--ink)]/50 hover:text-[var(--ink)]">
          ← {b.franchise.name}
        </Link>
        <header className="mt-4 mb-8">
          <h1 className="display text-4xl font-semibold tracking-tight">{t("wizard.title")}</h1>
          <p className="mt-2 max-w-lg text-sm text-[var(--ink)]/65">
            {t("wizard.lede", { count: b.works.length })}
          </p>
        </header>
        <ProgressProvider>
          <StartWizard paths={paths} />
        </ProgressProvider>
      </main>
    </div>
  );
}
