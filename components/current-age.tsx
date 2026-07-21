"use client";

import { useEffect, useState } from "react";
import { ageNow, formatAge } from "@/lib/age";

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
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const age = formatAge(ageNow(born, new Date()));
    setText(age ? template.replace("{age}", age) : null);
  }, [born, template]);

  if (!text) return null;
  return <span>{text}</span>;
}
