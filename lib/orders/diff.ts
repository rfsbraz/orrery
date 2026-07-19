// Order diff (CONCEPT §5: "side-by-side order diff - completionist catnip").
// Aligns two reading orders on their longest common subsequence so the shared
// spine renders once and every divergence shows as a fork: what order A slots
// here vs what order B slots here, ready to hang each order's rationale on.

export interface CommonSegment {
  kind: "common";
  ids: string[];
}
export interface ForkSegment {
  kind: "fork";
  a: string[]; // what A does here (possibly empty: A skips ahead)
  b: string[]; // what B does here
}
export type DiffSegment = CommonSegment | ForkSegment;

export interface OrderDiff {
  segments: DiffSegment[];
  shared: number; // works on the common spine
  onlyA: string[]; // works A includes that B omits entirely
  onlyB: string[];
  forks: number; // number of divergence points
}

/** Longest-common-subsequence table over two id sequences. */
function lcs(a: string[], b: string[]): number[][] {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0)
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  return dp;
}

/** Diff two ordered id lists into a common spine + forks. */
export function diffOrders(a: string[], b: string[]): OrderDiff {
  const dp = lcs(a, b);
  const segments: DiffSegment[] = [];
  let i = 0;
  let j = 0;

  const pushCommon = (id: string) => {
    const last = segments[segments.length - 1];
    if (last?.kind === "common") last.ids.push(id);
    else segments.push({ kind: "common", ids: [id] });
  };
  const pushFork = (side: "a" | "b", id: string) => {
    const last = segments[segments.length - 1];
    if (last?.kind === "fork") last[side].push(id);
    else segments.push({ kind: "fork", a: side === "a" ? [id] : [], b: side === "b" ? [id] : [] });
  };

  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      pushCommon(a[i]);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      pushFork("a", a[i]);
      i++;
    } else {
      pushFork("b", b[j]);
      j++;
    }
  }
  while (i < a.length) pushFork("a", a[i++]);
  while (j < b.length) pushFork("b", b[j++]);

  const inA = new Set(a);
  const inB = new Set(b);
  return {
    segments,
    shared: segments.filter((s) => s.kind === "common").reduce((n, s) => n + s.ids.length, 0),
    onlyA: a.filter((id) => !inB.has(id)),
    onlyB: b.filter((id) => !inA.has(id)),
    forks: segments.filter((s) => s.kind === "fork").length,
  };
}
