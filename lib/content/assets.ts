/**
 * Multi-image river organisations (`diptych`, `strip`, `split-counterpoint`,
 * `layered-stack`) can carry more than one filed asset per entry
 * (`images_required` - see orrery-content docs/LAYOUT.md). The convention is
 * positional: the primary sketch keeps its own path, and slot N>1 is filed
 * alongside it with `-N` before the extension.
 *
 * Pure and unit-testable; the fs existence check that decides how many of
 * those slots actually landed lives in components/river/shared.tsx (a server
 * component - see components/portrait.tsx for the same pattern), because
 * "does this file exist yet" is not something this module should know.
 */
export function slotPath(raw: string, index: number): string {
  if (index <= 1) return raw;
  const m = raw.match(/^(.*)(\.[a-zA-Z0-9]+)$/);
  return m ? `${m[1]}-${index}${m[2]}` : `${raw}-${index}`;
}
