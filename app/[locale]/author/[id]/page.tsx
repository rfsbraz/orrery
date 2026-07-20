import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { localeFromSegment, localePath } from "@/lib/i18n/config";
import fs from "node:fs";
import path from "node:path";
import { getAuthor } from "@/lib/content";
import { Prose } from "@/components/prose";
import { Timeline } from "@/components/timeline";

function authorIds(): string[] {
  const dir = path.join(process.cwd(), "orrery-content", "content", "authors");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".yaml")).map((f) => f.replace(/\.yaml$/, ""));
}

export function generateStaticParams() {
  return authorIds().map((id) => ({ id }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const a = getAuthor(id);
  return a ? { title: `${a.name} | Orrery` } : {};
}

export default async function AuthorPage(props: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: localeSeg, id } = await props.params;
  const locale = localeFromSegment(localeSeg === "en" ? undefined : localeSeg);
  const a = getAuthor(id, locale);
  if (!a) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <Link href={localePath(locale, "/")} className="text-xs text-neutral-500 hover:text-neutral-300">
        ← Orrery
      </Link>
      <header className="mt-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-100">{a.name}</h1>
        {(a.born || a.died) && (
          <p className="mt-1 font-mono text-sm text-neutral-500">
            {String(a.born ?? "").slice(0, 4)}
            {a.died ? ` – ${String(a.died).slice(0, 4)}` : ""}
          </p>
        )}
        {a.bio && <Prose text={a.bio} className="mt-3 block text-neutral-300" />}
        {a.pseudonyms && a.pseudonyms.length > 0 && (
          <div className="mt-4 space-y-1 text-sm text-neutral-400">
            {a.pseudonyms.map((p) => (
              <p key={p.name}>
                <span className="font-medium text-neutral-300">Also wrote as {p.name}.</span>{" "}
                {p.note && <Prose text={p.note} />}
              </p>
            ))}
          </div>
        )}
      </header>

      {a.lifeEvents && a.lifeEvents.length > 0 && (
        <section
          style={{ ["--ink" as string]: "#e5e5e5", ["--accent" as string]: "#8a8f98", ["--surface" as string]: "#171717" }}
        >
          <h2 className="mb-5 text-xs font-medium uppercase tracking-widest text-neutral-500">Life</h2>
          <Timeline works={[]} events={a.lifeEvents} />
        </section>
      )}
    </main>
  );
}
