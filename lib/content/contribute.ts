// Deep links into the content repo's issue forms. Curation is public and
// PR-based, so every "this is wrong" or "please add X" should land on a real
// template with the context prefilled rather than a blank issue box.

const REPO = "https://github.com/rfsbraz/orrery-content";

function issueUrl(template: string, params: Record<string, string> = {}): string {
  const q = new URLSearchParams({ template, ...params });
  return `${REPO}/issues/new?${q.toString()}`;
}

export interface ContributeLinks {
  /** Something on this page is factually wrong. */
  reportError: string;
  /** A published work is missing from the bibliography. */
  missingWork: string;
  /** Propose a reading order. */
  readingOrder: string;
  /** Ask for an author/universe that is not here yet. */
  newFranchise: string;
  /** The content repo itself, for people who would rather open a PR. */
  repo: string;
}

/** Links for a specific franchise page (context prefilled into the title). */
export function contributeLinks(franchiseName?: string): ContributeLinks {
  const scope = franchiseName ?? "";
  return {
    reportError: issueUrl("content-error.yml", {
      title: `[error] ${scope}: `,
    }),
    missingWork: issueUrl("missing-work.yml", {
      title: `[work] ${scope}: add `,
    }),
    readingOrder: issueUrl("reading-order.yml", {
      title: `[order] ${scope}: `,
    }),
    newFranchise: issueUrl("new-franchise.yml", { title: "[franchise] " }),
    repo: REPO,
  };
}
