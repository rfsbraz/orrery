"use client";

import { useT } from "@/components/i18n/provider";

import { useState } from "react";
import { rankPaths, type WizardAnswers } from "@/lib/wizard/match";
import { Prose } from "@/components/prose";
import { ProgressControl } from "@/components/progress/control";
import type {
  FitCommitment,
  FitExperience,
  StartHerePath,
} from "@/lib/content/types";

/** A path with its books resolved server-side so the client stays dumb. */
export interface ResolvedPath extends StartHerePath {
  /** Resolved list to show: [workId, title] pairs, in reading order. */
  books: [string, string][];
  /** Name of the referenced order, when the path points at one. */
  orderName?: string;
  orderHref?: string;
}

const Q1 = [
  { value: "new", key: "wizard.q1.new" },
  { value: "returning", key: "wizard.q1.returning" },
  { value: "completionist", key: "wizard.q1.completionist" },
] as const;
const Q2 = [
  { value: "taste", key: "wizard.q2.taste" },
  { value: "arc", key: "wizard.q2.arc" },
  { value: "complete", key: "wizard.q2.complete" },
] as const;

/**
 * The two-question onboarding. Answers score the franchise's curated paths
 * (content-driven, see lib/wizard/match.ts); the best match becomes the
 * recommendation, the rest stay one click away. No stepper theatre - two
 * questions on one screen, instant result.
 */
export function StartWizard({ paths }: { paths: ResolvedPath[] }) {
  const t = useT();
  const [experience, setExperience] = useState<FitExperience | null>(null);
  const [commitment, setCommitment] = useState<FitCommitment | null>(null);
  const [showAll, setShowAll] = useState(false);

  const answered = experience !== null && commitment !== null;
  const ranked = answered
    ? rankPaths(paths, { experience, commitment } as WizardAnswers)
    : null;
  const best = ranked?.[0];
  const alternates = ranked?.slice(1) ?? [];

  const chip = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
      active
        ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--ink)]"
        : "border-[var(--ink)]/20 text-[var(--ink)]/65 hover:border-[var(--ink)]/40 hover:text-[var(--ink)]"
    }`;

  return (
    <div>
      <fieldset className="mb-6">
        <legend className="mb-2.5 text-sm font-medium text-[var(--ink)]/80">
          {t("wizard.q1")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {Q1.map((o) => (
            <button key={o.value} className={chip(experience === o.value)} onClick={() => setExperience(o.value)}>
              {t(o.key)}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mb-8">
        <legend className="mb-2.5 text-sm font-medium text-[var(--ink)]/80">
          {t("wizard.q2")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {Q2.map((o) => (
            <button key={o.value} className={chip(commitment === o.value)} onClick={() => setCommitment(o.value)}>
              {t(o.key)}
            </button>
          ))}
        </div>
      </fieldset>

      {best && (
        <div>
          <PathCard resolved={findResolved(paths, best.path.id)!} highlight reasons={best.reasons} />
          {alternates.length > 0 && (
            <div className="mt-6">
              <button
                onClick={() => setShowAll((v) => !v)}
                className="text-xs font-medium text-[var(--ink)]/55 underline decoration-[var(--accent)]/40 underline-offset-2 hover:text-[var(--ink)]"
              >
                {showAll ? t("wizard.hideOther") : t("wizard.otherWays", { n: alternates.length })}
              </button>
              {showAll && (
                <div className="mt-3 space-y-3">
                  {alternates.map((r) => (
                    <PathCard key={r.path.id} resolved={findResolved(paths, r.path.id)!} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function findResolved(paths: ResolvedPath[], id: string) {
  return paths.find((p) => p.id === id);
}

function PathCard({
  resolved,
  highlight = false,
  reasons = [],
}: {
  resolved: ResolvedPath;
  highlight?: boolean;
  reasons?: string[];
}) {
  const t = useT();
  return (
    <div
      className={`rounded-lg border p-5 ${
        highlight
          ? "border-[var(--accent)]/60 bg-[var(--surface)]"
          : "border-[var(--ink)]/10 bg-[var(--surface)]"
      }`}
    >
      {highlight && (
        <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-[var(--accent)]">
          {t("wizard.startHere")}
          {reasons.length > 0 && <> - {t("wizard.because", { reasons: reasons.join(", ") })}</>}
        </p>
      )}
      <h3 className="display text-xl font-semibold">{resolved.title}</h3>
      {resolved.description && (
        <Prose text={resolved.description} className="prose-read mt-1.5 block text-sm text-[var(--ink)]/70" />
      )}
      {resolved.orderName && resolved.orderHref && (
        <p className="mt-2 text-xs text-[var(--ink)]/60">
          {t("wizard.followsOrder")}{" "}
          <a href={resolved.orderHref} className="underline decoration-[var(--accent)]/40 underline-offset-2">
            {resolved.orderName}
          </a>
          .
        </p>
      )}
      {resolved.books.length > 0 && (
        <ol className="mt-3 space-y-2">
          {resolved.books.map(([id, title], i) => (
            <li key={id} className="flex items-baseline gap-2.5 text-sm">
              <span className="font-mono text-xs text-[var(--muted)]">{i + 1}</span>
              <span className="text-[var(--ink)]/85">{title}</span>
              <ProgressControl workId={id} />
            </li>
          ))}
        </ol>
      )}
      {resolved.note && (
        <Prose text={resolved.note} className="prose-read mt-3 block text-xs italic text-[var(--muted)]" />
      )}
    </div>
  );
}
