import Link from "next/link";
import type { Metadata } from "next";
import { listFranchises } from "@/lib/content";
import { stripRefs } from "@/lib/content/refs";

export const metadata: Metadata = {
  title: "Orrery - reading journeys in context",
  description:
    "Follow an author or franchise through its reading orders on a timeline of the life, world, and cultural events that shaped each book.",
};

export default function Home() {
  const franchises = listFranchises();
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-14">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-neutral-500">Orrery</p>
        <h1 className="display text-5xl font-semibold tracking-tight text-neutral-100 sm:text-6xl">
          Read the whole thing, in context.
        </h1>
        <p className="prose-read mt-5 max-w-2xl text-lg text-neutral-400">
          Not just <em>what order</em> to read a franchise, but how to experience it in its
          moment - each book set against the life, world, and cultural events that shaped it.
        </p>
      </header>

      <section>
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Franchises
          </h2>
          <Link
            href="/hall"
            className="text-xs text-neutral-400 underline decoration-neutral-700 underline-offset-2 hover:text-neutral-100"
          >
            The Hall - every author, one timeline
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {franchises.map((f) => (
            <Link
              key={f.id}
              href={`/f/${f.id}`}
              className="group rounded-lg border border-neutral-800 bg-neutral-900/40 p-5 transition-colors hover:border-neutral-600"
            >
              <h3 className="display text-xl font-semibold text-neutral-100 group-hover:text-white">
                {f.name}
              </h3>
              {f.description && (
                <p className="mt-1 line-clamp-2 text-sm text-neutral-400">
                  {stripRefs(f.description)}
                </p>
              )}
            </Link>
          ))}
          {franchises.length === 0 && <p className="text-neutral-500">No franchises yet.</p>}
        </div>
      </section>
    </main>
  );
}
