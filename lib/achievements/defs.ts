import type { Achievement } from "./types";

// Starter achievement set. Some are generic (completion, punctuality); some are
// aura-tied to a franchise so they mean something only Orrery can offer.
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-steps",
    name: "First Steps",
    description: "Marked your first book as read.",
    icon: "📖",
    tier: "bronze",
    category: "completion",
    criteria: { kind: "read_count", count: 1 },
  },
  {
    id: "first-edition-soul",
    name: "First-Edition Soul",
    description: "Read a book within a year of its publication.",
    icon: "🕰️",
    tier: "silver",
    category: "context",
    criteria: { kind: "punctual_read", withinYears: 1 },
  },
  {
    id: "king-devotee",
    name: "Devotee",
    description: "Read 10 Stephen King works.",
    icon: "🔟",
    tier: "silver",
    category: "completion",
    criteria: { kind: "read_count", count: 10, franchiseId: "stephen-king" },
  },
  {
    id: "king-golden-decade",
    name: "Into the Golden Decade",
    description: "Read 5 works from Stephen King's Golden Decade (1980-1989).",
    icon: "🌗",
    tier: "silver",
    category: "context",
    criteria: { kind: "era_reader", franchiseId: "stephen-king", eraId: "the-golden-decade", count: 5 },
  },
  {
    id: "dark-tower-pilgrim",
    name: "Pilgrim of the Beam",
    description: "Completed the Dark Tower connected reading order.",
    icon: "🗼",
    tier: "gold",
    category: "completion",
    criteria: { kind: "order_complete", orderId: "stephen-king/dark-tower-connected" },
  },
  {
    id: "king-constant-reader",
    name: "Constant Reader",
    description: "Read every Stephen King work in the canon.",
    icon: "👑",
    tier: "gold",
    category: "completion",
    criteria: { kind: "franchise_complete", franchiseId: "stephen-king" },
  },
];
