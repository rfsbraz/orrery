import { Prose } from "./prose";
import { ProgressControl } from "./progress/control";
import { SpoilerGate } from "./spoilers/spoiler-gate";
import { signatureLine, type SignatureKind } from "@/lib/theme";
import type { RiverSection } from "@/lib/content/river";
import type { Work } from "@/lib/content/types";

/**
 * The River: the atmospheric context browse (CONCEPT §5 - "the soul of the
 * product"). A museum walk, not a checklist: era bands set the light, works
 * drift along the signature beam alternating sides, high-impact events stand
 * full-width as anchors you pass through, low-impact events sit as marginalia.
 * Atmosphere through structure and typography - no decor, no motion demands
 * (pure document flow; respects reduced motion by having none to reduce).
 */
export function River({
  sections,
  workTitles,
  signature = "thread",
}: {
  sections: RiverSection[];
  workTitles: Map<string, string>;
  /** The franchise's signature element, from its theme.yaml. */
  signature?: SignatureKind;
}) {
  return (
    <div className="relative">
      {/* The beam runs the whole walk */}
      <div
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-0 bottom-0 -translate-x-1/2 max-md:left-2 ${signatureLine[signature]}`}
      />
      {sections.map((s, si) => (
        <section key={s.era?.id ?? `s-${si}`} className="relative">
          {s.era && (
            <header className="relative z-10 my-16 text-center max-md:text-left max-md:pl-8 first:mt-4">
              <p className="font-mono text-xs tracking-[0.3em] text-[var(--muted)]">
                {s.era.period}
              </p>
              <h2 className="display mt-2 text-3xl font-semibold tracking-tight">
                {s.era.title}
              </h2>
              {s.era.themes && s.era.themes.length > 0 && (
                <p className="mt-2 text-xs uppercase tracking-widest text-[var(--muted)]/80">
                  {s.era.themes.join(" · ")}
                </p>
              )}
              {s.era.description && (
                <Prose
                  text={s.era.description}
                  className="prose-read mx-auto mt-3 block max-w-xl text-sm text-[var(--ink)]/70 max-md:mx-0"
                />
              )}
            </header>
          )}

          <ol className="space-y-10">
            {s.items.map((item, i) =>
              item.kind === "anchor" && item.event ? (
                <li key={`a-${item.event.id}-${i}`} className="relative z-10 mx-auto max-w-xl py-6 text-center max-md:pl-8 max-md:text-left">
                  <SpoilerGate
                    spoilerAfter={item.event.spoilerAfter}
                    boundaryTitle={workTitles.get(item.event.spoilerAfter ?? "")}
                  >
                    <p className="font-mono text-xs text-[var(--accent)]">{item.year}</p>
                    <p className="display mt-1 text-xl font-semibold leading-snug text-[var(--ink)]">
                      {item.event.title}
                    </p>
                    {item.event.description && (
                      <Prose
                        text={item.event.description}
                        className="prose-read mt-2 block text-sm text-[var(--ink)]/70"
                      />
                    )}
                  </SpoilerGate>
                </li>
              ) : item.kind === "event" && item.event ? (
                <li
                  key={`e-${item.event.id}-${i}`}
                  className={`relative flex max-md:pl-8 ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[44%] max-md:max-w-full ${
                      item.event.impact === "med" ? "opacity-90" : "opacity-70"
                    }`}
                  >
                    <SpoilerGate
                      spoilerAfter={item.event.spoilerAfter}
                      boundaryTitle={workTitles.get(item.event.spoilerAfter ?? "")}
                    >
                      <p className="text-xs leading-relaxed text-[var(--ink)]/60">
                        <span className="font-mono text-[10px] text-[var(--muted)]">
                          {item.year}
                        </span>{" "}
                        <span className="font-medium text-[var(--ink)]/80">
                          {item.event.title}.
                        </span>{" "}
                        {item.event.description && (
                          <Prose text={item.event.description} className="inline" />
                        )}
                      </p>
                    </SpoilerGate>
                  </div>
                </li>
              ) : item.work ? (
                <RiverWork key={`w-${item.work.id}`} work={item.work} flip={i % 2 === 1} />
              ) : null
            )}
          </ol>
        </section>
      ))}
    </div>
  );
}

function RiverWork({ work, flip }: { work: Work; flip: boolean }) {
  return (
    <li
      id={`w-${work.id.split("/").pop()}`}
      className={`relative flex max-md:pl-8 ${flip ? "justify-end" : "justify-start"}`}
    >
      {/* node on the beam */}
      <span
        aria-hidden
        className="absolute left-1/2 top-3 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-[var(--bg)] bg-[var(--accent)] max-md:left-2"
      />
      <div className="w-[46%] rounded-lg border border-[var(--ink)]/10 bg-[var(--surface)] p-4 max-md:w-full">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span className="font-mono text-xs text-[var(--muted)]">{work.published}</span>
          <h3 className="display text-lg font-semibold">{work.title}</h3>
        </div>
        <div className="mt-0.5 flex flex-wrap gap-x-2 text-[10px] uppercase tracking-wide text-[var(--muted)]/80">
          {work.subseries && <span>{work.subseries}</span>}
          {work.publishedAs && <span className="italic normal-case">as {work.publishedAs}</span>}
          {work.canonTier !== "core" && <span>{work.canonTier}</span>}
        </div>
        {work.synopsis && (
          <Prose
            text={work.synopsis}
            className="prose-read mt-2 block text-sm text-[var(--ink)]/75"
          />
        )}
        <ProgressControl workId={work.id} />
      </div>
    </li>
  );
}
