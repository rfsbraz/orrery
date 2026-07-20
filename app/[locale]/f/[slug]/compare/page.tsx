import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { localeFromSegment, localePath } from "@/lib/i18n/config";
import { translator } from "@/lib/i18n/messages";
import { getFranchise, listFranchiseSlugs } from "@/lib/content";
import { capabilities } from "@/lib/content/capabilities";
import { themeVars } from "@/lib/theme";
import { OrderCompare } from "@/components/orders/compare";

export function generateStaticParams() {
  return listFranchiseSlugs()
    .filter((slug) => {
      const b = getFranchise(slug);
      return b ? capabilities(b).orderDiff : false;
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
    title: t("meta.compare", { name: b.franchise.name }),
    description: `Where the ${b.franchise.name} reading orders agree, where they fork, and why.`,
  };
}

export default async function ComparePage(props: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeSeg, slug } = await props.params;
  const locale = localeFromSegment(localeSeg === "en" ? undefined : localeSeg);
  const t = translator(locale);
  const b = getFranchise(slug);
  if (!b || !capabilities(b).orderDiff) notFound();

  const workTitles = Object.fromEntries(b.works.map((w) => [w.id, w.title]));

  return (
    <div
      data-franchise={slug}
      style={themeVars(b.theme)}
      className="min-h-screen bg-[var(--bg)] text-[var(--ink)]"
    >
      <main className="mx-auto max-w-3xl px-6 py-14">
        <Link href={localePath(locale, `/f/${slug}`)} className="text-xs text-[var(--ink)]/50 hover:text-[var(--ink)]">
          ← {b.franchise.name}
        </Link>
        <header className="mt-4 mb-8">
          <h1 className="display text-4xl font-semibold tracking-tight">{t("compare.title")}</h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--ink)]/65">
            {t("compare.lede")}
          </p>
        </header>
        <OrderCompare orders={b.orders} workTitles={workTitles} />
      </main>
    </div>
  );
}
