// Resolve a group's order_ref to an ordered list of Work IDs. Pure: it takes
// already-loaded canon (works + curated orders) and approved community orders,
// so it's testable and has no Supabase/content coupling.

export interface WorkRef {
  id: string;
  published: number;
}
export interface OrderRef {
  id: string;
  name: string;
  orderedWorkIds: string[];
}

export interface ResolvedOrder {
  workIds: string[];
  label: string;
}

export interface OrderOption {
  value: string;
  label: string;
}

/** The derived default: every work in publication order (CONCEPT §4b). */
function defaultOrder(works: WorkRef[]): string[] {
  return [...works].sort((a, b) => a.published - b.published).map((w) => w.id);
}

export function resolveOrderRef(
  orderRef: string,
  works: WorkRef[],
  curated: OrderRef[],
  community: OrderRef[]
): ResolvedOrder {
  if (orderRef.startsWith("canon:")) {
    const id = orderRef.slice("canon:".length);
    if (id === "default") return { workIds: defaultOrder(works), label: "Complete works, in publication order" };
    const o = curated.find((c) => c.id === id);
    if (o) return { workIds: o.orderedWorkIds, label: o.name };
  } else if (orderRef.startsWith("community:")) {
    const id = orderRef.slice("community:".length);
    const o = community.find((c) => c.id === id);
    if (o) return { workIds: o.orderedWorkIds, label: `${o.name} (community)` };
  }
  // Unknown/stale ref falls back to the always-valid default.
  return { workIds: defaultOrder(works), label: "Complete works, in publication order" };
}

/** Selectable orders for the create form: default + curated + approved community. */
export function orderRefOptions(curated: OrderRef[], community: OrderRef[]): OrderOption[] {
  return [
    { value: "canon:default", label: "Complete works, in publication order" },
    ...curated.map((c) => ({ value: `canon:${c.id}`, label: c.name })),
    ...community.map((c) => ({ value: `community:${c.id}`, label: `${c.name} (community)` })),
  ];
}
