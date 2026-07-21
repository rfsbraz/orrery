"use client";

import { useSyncExternalStore } from "react";
import { ageNow, formatAge } from "@/lib/age";

/**
 * Whether we are past hydration. The age has to be absent server-side (a
 * statically generated page cannot know today's date) and present client-side,
 * which is precisely the mismatch useSyncExternalStore's two snapshots exist
 * for. An effect calling setState would do the same job by rendering twice.
 */
const neverChanges = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * A living author's age today.
 *
 * Rendered on the client on purpose. The pages are statically generated, so an
 * age baked in at build time is correct only until the author's next birthday
 * and then quietly wrong until someone happens to redeploy. On a site whose
 * whole claim is that the facts are checked, "78" when he is 79 is exactly the
 * small lie that costs trust.
 *
 * Age at death has no such problem and is rendered on the server.
 */
export function CurrentAge({ born, template }: { born: string | number; template: string }) {
  const hydrated = useSyncExternalStore(neverChanges, onClient, onServer);
  if (!hydrated) return null;

  const age = formatAge(ageNow(born, new Date()));
  if (!age) return null;
  return <span>{template.replace("{age}", age)}</span>;
}
