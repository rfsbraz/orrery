import type { FeatureSetting, FranchiseBundle } from "./types";

// The framework seam (CONCEPT: the schema is a framework, not a mandate).
// Every advanced feature activates per franchise from the shape of its data,
// with an optional explicit override in franchise.yaml `features:`. A sparse
// franchise (works list only) gets the derived order and a clean museum page;
// nothing renders half-empty.

export type CapabilityKey =
  | "river"
  | "orderDiff"
  | "wizard"
  | "connections"
  | "companion"
  | "hall"
  | "editions";

export type Capabilities = Record<CapabilityKey, boolean>;

/** What the data supports on its own (the `auto` value per capability). */
function autoDetect(b: FranchiseBundle): Capabilities {
  return {
    // The River is the aura browse; it needs events to breathe.
    river: b.timeline.length > 0,
    // Comparing orders needs at least two (the derived default counts).
    orderDiff: b.orders.length >= 2,
    // The wizard is entirely content-driven.
    wizard: (b.franchise.startHere?.paths?.length ?? 0) > 0,
    // Connections need edges: work links or a character roster.
    connections:
      b.characters.length > 0 || b.works.some((w) => (w.connections ?? []).length > 0),
    // Companion mode feeds on the aura around the book being read.
    companion: b.timeline.length > 0,
    // Every franchise joins the cross-franchise hall unless opted out.
    hall: true,
    // Exact-edition links/covers need edition data.
    editions: b.editions.length > 0,
  };
}

function resolve(setting: FeatureSetting | undefined, auto: boolean): boolean {
  if (setting === "on" || setting === true) return true;
  if (setting === "off" || setting === false) return false;
  return auto; // "auto" or omitted
}

/** The franchise's active capability set: auto-detection + explicit overrides. */
export function capabilities(b: FranchiseBundle): Capabilities {
  const auto = autoDetect(b);
  const f = b.franchise.features ?? {};
  return {
    river: resolve(f.river, auto.river),
    orderDiff: resolve(f.orderDiff, auto.orderDiff),
    wizard: resolve(f.wizard, auto.wizard),
    connections: resolve(f.connections, auto.connections),
    companion: resolve(f.companion, auto.companion),
    hall: resolve(f.hall, auto.hall),
    editions: resolve(f.editions, auto.editions),
  };
}
