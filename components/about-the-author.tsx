import { Prose } from "./prose";
import type { Author } from "@/lib/content/types";

/**
 * Who wrote this shelf: dates, biography, pen names.
 *
 * This lives on the wing itself rather than behind a link. A wing IS an
 * author, so sending a reader to a separate page to find out who they are
 * buries the one thing that frames everything below it. Desktop shows it
 * inline; mobile keeps it behind a disclosure so the walk stays close to the
 * top of the screen.
 *
 * Life events are deliberately NOT here - they are already woven into the
 * timeline below, in the years they happened, which is the whole point of the
 * aura. Repeating them as a list would be the same facts twice.
 */

export interface AuthorBio {
  id: string;
  name: string;
  bio: string;
  born?: string | number;
  died?: string | number;
  pseudonyms?: Author["pseudonyms"];
}

function lifespan(born?: string | number, died?: string | number) {
  if (!born && !died) return null;
  const b = String(born ?? "").slice(0, 4);
  const d = died ? String(died).slice(0, 4) : null;
  return `${b}${d ? ` - ${d}` : born ? " -" : ""}`;
}

export function AboutTheAuthorBody({
  bios,
  alsoWroteAs,
}: {
  bios: AuthorBio[];
  /** Localised "Also wrote as {name}." template. */
  alsoWroteAs: (name: string) => string;
}) {
  return (
    <>
      {bios.map(({ id, name, bio, born, died, pseudonyms }) => {
        const span = lifespan(born, died);
        return (
          <div key={id} className="mt-3 first:mt-0">
            {bios.length > 1 && (
              <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--accent)]/80">
                {name}
              </p>
            )}
            {span && <p className="font-mono text-xs text-[var(--muted)]">{span}</p>}
            <Prose
              text={bio}
              className="prose-read mt-1 block text-[15px] leading-relaxed text-[var(--ink)]/75"
            />
            {pseudonyms && pseudonyms.length > 0 && (
              <div className="mt-3 space-y-1 text-[13px] text-[var(--ink)]/60">
                {pseudonyms.map((p) => (
                  <p key={p.name}>
                    <span className="font-medium text-[var(--ink)]/80">
                      {alsoWroteAs(p.name)}
                    </span>{" "}
                    {p.note && <Prose text={p.note} className="inline" />}
                  </p>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

export function AboutTheAuthor({
  bios,
  label,
  alsoWroteAs,
}: {
  bios: AuthorBio[];
  /** Localised "About the author" / "Sobre o autor". */
  label: string;
  alsoWroteAs: (name: string) => string;
}) {
  if (bios.length === 0) return null;
  return (
    <>
      {/* Desktop: inline, because there is room and it frames the walk. */}
      <div className="mt-6 max-w-2xl border-l-2 border-[var(--accent)]/25 pl-4 max-lg:hidden">
        <AboutTheAuthorBody bios={bios} alsoWroteAs={alsoWroteAs} />
      </div>

      {/* Mobile: a disclosure, so the shelf stays within reach. Plain
          <details> rather than a client component - no JavaScript, works
          before hydration, and the browser gives us the accessible name and
          keyboard behaviour for free. */}
      <details className="group mt-5 border-y border-[var(--ink)]/10 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 text-sm font-medium text-[var(--ink)]/80 [&::-webkit-details-marker]:hidden">
          {label}
          <span
            aria-hidden
            className="font-mono text-xs text-[var(--muted)] transition-transform group-open:rotate-90"
          >
            ›
          </span>
        </summary>
        <div className="pb-4">
          <AboutTheAuthorBody bios={bios} alsoWroteAs={alsoWroteAs} />
        </div>
      </details>
    </>
  );
}
