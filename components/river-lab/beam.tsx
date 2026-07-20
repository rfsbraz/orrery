import { Prose } from "@/components/prose";
import { SpoilerGate } from "@/components/spoilers/spoiler-gate";
import { Cover } from "./cover";
import { groupByYear, type LabProps } from "./shared";

/**
 * CONCEPT 1 - THE BEAM
 * One continuous spine down the center of the page; everything hangs off it.
 * Works alternate sides with their covers; texture events sit as small notes
 * on the opposite side; high-impact anchors interrupt the beam itself - the
 * line pauses, the event speaks, the line resumes. Era changes are quiet
 * interludes on the beam. The feeling: a single thread you follow downriver.
 */
export function BeamConcept(props: LabProps) {
  const groups = groupByYear(props);
  let side = 0; // alternate works left/right across the whole walk

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-[var(--accent)] via-[var(--accent)]/35 to-transparent max-md:left-3"
      />
      <div className="space-y-2">
        {groups.map((g) => (
          <section key={g.year}>
            {g.eraStart && g.era && (
              <header className="relative z-10 mx-auto my-16 max-w-md text-center max-md:pl-9 max-md:text-left">
                <span
                  aria-hidden
                  className="absolute left-1/2 top-1/2 -z-10 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)]/8 blur-xl max-md:hidden"
                />
                <p className="font-mono text-[11px] tracking-[0.35em] text-[var(--accent)]">
                  {g.era.period}
                </p>
                <h2 className="display mt-1.5 text-2xl font-semibold">{g.era.title}</h2>
                {g.era.themes && (
                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                    {g.era.themes.join(" · ")}
                  </p>
                )}
              </header>
            )}

            {/* year tick on the beam */}
            <p className="relative z-10 my-4 text-center max-md:text-left max-md:pl-9">
              <span className="rounded-full border border-[var(--ink)]/12 bg-[var(--bg)] px-2.5 py-0.5 font-mono text-[11px] text-[var(--muted)]">
                {g.year}
              </span>
            </p>

            {/* anchors interrupt the beam */}
            {g.anchors.map((e) => (
              <div key={e.id} className="relative z-10 mx-auto my-10 max-w-lg text-center max-md:pl-9 max-md:text-left">
                <SpoilerGate spoilerAfter={e.spoilerAfter} boundaryTitle={props.workTitles[e.spoilerAfter ?? ""]}>
                  <span aria-hidden className="mx-auto mb-3 block h-1.5 w-1.5 rotate-45 bg-[var(--accent)] max-md:mx-0" />
                  <p className="display text-xl font-semibold leading-snug">{e.title}</p>
                  {e.description && (
                    <Prose text={e.description} className="prose-read mt-2 block text-sm text-[var(--ink)]/70" />
                  )}
                </SpoilerGate>
              </div>
            ))}

            {g.works.map((w) => {
              const flip = side++ % 2 === 1;
              const cover = props.covers[w.id];
              return (
                <div
                  key={w.id}
                  className={`relative flex py-2 max-md:pl-9 ${flip ? "justify-end" : "justify-start"}`}
                >
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--bg)] bg-[var(--accent)] max-md:left-3"
                  />
                  {/* connector from beam to card */}
                  <span
                    aria-hidden
                    className={`absolute top-1/2 h-px w-[4%] bg-[var(--ink)]/15 max-md:hidden ${flip ? "left-1/2" : "right-1/2"}`}
                  />
                  <article className="flex w-[44%] gap-3.5 rounded-lg border border-[var(--ink)]/10 bg-[var(--surface)] p-4 max-md:w-full">
                    <Cover src={cover} title={w.title} year={w.published} className="h-[88px] w-[58px]" />
                    <div className="min-w-0">
                      <h3 className="display text-[17px] font-semibold leading-tight">{w.title}</h3>
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                        {w.subseries ?? (w.publishedAs ? `as ${w.publishedAs}` : " ")}
                      </p>
                      {w.synopsis && (
                        <Prose text={w.synopsis} className="prose-read mt-1.5 line-clamp-3 block text-[13px] text-[var(--ink)]/70" />
                      )}
                    </div>
                  </article>
                </div>
              );
            })}

            {g.texture.map((e) => {
              const flip = side % 2 === 0; // opposite the next work's side
              return (
                <div
                  key={e.id}
                  className={`relative flex py-1 max-md:pl-9 ${flip ? "justify-end" : "justify-start"}`}
                >
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-[0.85rem] h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--ink)]/35 max-md:left-3"
                  />
                  <p className={`w-[42%] text-xs leading-relaxed text-[var(--ink)]/55 max-md:w-full ${flip ? "text-left" : "text-right max-md:text-left"}`}>
                    <SpoilerGate spoilerAfter={e.spoilerAfter} boundaryTitle={props.workTitles[e.spoilerAfter ?? ""]}>
                      <span className="font-medium text-[var(--ink)]/75">{e.title}.</span>{" "}
                      {e.description && <Prose text={e.description} className="inline" />}
                    </SpoilerGate>
                  </p>
                </div>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}
