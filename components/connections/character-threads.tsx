import { Prose } from "@/components/prose";
import { SpoilerGate } from "@/components/spoilers/spoiler-gate";
import { translator } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/config";
import type { CharacterThread } from "@/lib/content/connections";

/**
 * The character layer of the connections map: each recurring figure as a
 * thread of appearances through the years. Appearances whose existence is a
 * reveal sit behind the spoiler gate - "this book connects to 3 others"
 * without saying how, until you have earned it (or deliberately peek).
 */
export function CharacterThreads({
  threads,
  workTitles,
  locale,
}: {
  threads: CharacterThread[];
  workTitles: Map<string, string>;
  locale: Locale;
}) {
  const t = translator(locale);
  if (threads.length === 0) return null;
  return (
    <div className="space-y-5">
      {threads.map(({ character, appearances }) => {
        return (
          <div
            key={character.id}
            className="rounded-lg border border-[var(--ink)]/10 bg-[var(--surface)] p-5"
          >
            <div className="flex flex-wrap items-baseline gap-x-2.5">
              <h3 className="display text-lg font-semibold">{character.name}</h3>
              {character.aka && character.aka.length > 0 && (
                <span className="text-xs italic text-[var(--muted)]">
                  {character.aka.join(" · ")}
                </span>
              )}
              <span className="font-mono text-[10px] text-[var(--muted)]">
                {t("connections.appearances", { n: appearances.length })}
              </span>
            </div>
            {character.description && (
              <Prose
                text={character.description}
                className="prose-read mt-1.5 block text-sm text-[var(--ink)]/70"
              />
            )}
            <ol className="mt-3 flex flex-wrap gap-2">
              {appearances.map((a) => (
                <li key={a.workId}>
                  <SpoilerGate
                    spoilerAfter={a.spoilerAfter}
                    boundaryTitle={workTitles.get(a.spoilerAfter ?? "")}
                  >
                    <span className="inline-flex items-baseline gap-1.5 rounded border border-[var(--ink)]/15 px-2 py-1 text-xs text-[var(--ink)]/80">
                      <span className="font-mono text-[10px] text-[var(--muted)]">{a.year}</span>
                      {a.title}
                      {a.note && (
                        <span className="text-[var(--muted)]" title={a.note}>
                          *
                        </span>
                      )}
                    </span>
                  </SpoilerGate>
                </li>
              ))}
            </ol>
          </div>
        );
      })}
    </div>
  );
}
