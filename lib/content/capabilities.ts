import type { FeatureSetting, FranchiseBundle } from "./types";

// The framework seam (CONCEPT: the schema is a framework, not a mandate).
// Every advanced feature activates per franchise from the shape of its data,
// with an optional explicit override in franchise.yaml `features:`. A sparse
// franchise (works list only) gets the derived order and a clean museum page;
// nothing renders half-empty.

export type CapabilityKey =
  | "river"
  | "wizard"
  | "companion"
  | "editions";

export type Capabilities = Record<CapabilityKey, boolean>;

/** What the data supports on its own (the `auto` value per capability). */
function autoDetect(b: FranchiseBundle): Capabilities {
  return {
    // The River is the aura browse; it needs events to breathe.
    river: b.timeline.length > 0,
    // The wizard is entirely content-driven.
    wizard: (b.franchise.startHere?.paths?.length ?? 0) > 0,
    // Companion mode feeds on the aura around the book being read.
    companion: b.timeline.length > 0,
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
    wizard: resolve(f.wizard, auto.wizard),
    companion: resolve(f.companion, auto.companion),
    editions: resolve(f.editions, auto.editions),
  };
}
