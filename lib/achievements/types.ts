// Achievements are DATA, not code (CONCEPT §7). A definition carries a
// declarative `criteria` evaluated over a user's progress + canon. New badges
// ship as config; add a criteria kind here + a case in evaluate.ts to extend.

export type AchievementCategory =
  | "completion"
  | "streak"
  | "context" // aura-tied
  | "social"
  | "discovery"
  | "curation";

export type AchievementTier = "bronze" | "silver" | "gold";

export type Criteria =
  // read >= `count` works (optionally scoped to a franchise)
  | { kind: "read_count"; count: number; franchiseId?: string }
  // read every work in a franchise
  | { kind: "franchise_complete"; franchiseId: string }
  // read every work in a named reading order
  | { kind: "order_complete"; orderId: string }
  // read any work within `withinYears` of its publication
  | { kind: "punctual_read"; withinYears: number }
  // read >= `count` works from a franchise era
  | { kind: "era_reader"; franchiseId: string; eraId: string; count: number };

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji for now
  tier: AchievementTier;
  category: AchievementCategory;
  criteria: Criteria;
}
