import type {
  FitCommitment,
  FitExperience,
  StartHerePath,
} from "../content/types";

// The "where to start" matcher (CONCEPT §5). Entirely content-driven: the
// franchise declares curated paths tagged with who they fit (startHere in
// franchise.yaml); the reader answers two questions; we score the paths.
// No app code changes per franchise - that is the framework contract.

export interface WizardAnswers {
  experience: FitExperience;
  commitment: FitCommitment;
}

export interface RankedPath {
  path: StartHerePath;
  score: number;
  /** Why this path matched, in plain words (shown under the recommendation). */
  reasons: string[];
}

const EXPERIENCE_LABEL: Record<FitExperience, string> = {
  new: "you're new here",
  returning: "you've read some before",
  completionist: "you want it all",
};
const COMMITMENT_LABEL: Record<FitCommitment, string> = {
  taste: "a taste first",
  arc: "one great thread",
  complete: "the whole body of work",
};

/**
 * Rank a franchise's startHere paths for a reader's answers.
 * Exact tag matches score 2 per axis; a path that declares no tags on an axis
 * is a soft universal fit (1). Ties keep curator order (they are curated, the
 * order is editorial). Every path is always returned - the best is the
 * recommendation, the rest render as alternatives.
 */
export function rankPaths(paths: StartHerePath[], answers: WizardAnswers): RankedPath[] {
  const ranked = paths.map((path, idx) => {
    const exp = path.fit?.experience;
    const com = path.fit?.commitment;
    let score = 0;
    const reasons: string[] = [];

    if (!exp || exp.length === 0) score += 1;
    else if (exp.includes(answers.experience)) {
      score += 2;
      reasons.push(EXPERIENCE_LABEL[answers.experience]);
    }

    if (!com || com.length === 0) score += 1;
    else if (com.includes(answers.commitment)) {
      score += 2;
      reasons.push(COMMITMENT_LABEL[answers.commitment]);
    }

    return { path, score, reasons, idx };
  });

  return ranked
    .sort((a, b) => b.score - a.score || a.idx - b.idx)
    .map(({ path, score, reasons }) => ({ path, score, reasons }));
}
