/**
 * Ages, computed only as precisely as the record allows.
 *
 * Every `born` in the catalogue is a full date today, but event dates are
 * roughly half year-only, and a year-only date cannot give an exact age: for
 * someone born in September, "1928" is 37 for most of the year and 38 after
 * their birthday. Reporting one of those as fact is inventing precision the
 * source does not have, so a year-only comparison returns the lower bound and
 * flags itself approximate. The UI is expected to show that flag.
 */

export interface Age {
  years: number;
  /** True when a year-only date means the real age could be one higher. */
  approx: boolean;
}

const FULL = /^(\d{4})-(\d{2})-(\d{2})$/;
const YEAR = /^(\d{4})/;

function parts(value: string | number | undefined | null) {
  if (value === null || value === undefined) return null;
  const s = String(value);
  const full = FULL.exec(s);
  if (full) {
    return { y: +full[1], m: +full[2], d: +full[3], exact: true };
  }
  const year = YEAR.exec(s);
  return year ? { y: +year[1], m: 1, d: 1, exact: false } : null;
}

/**
 * Age of someone born on `born` at the moment `at`.
 *
 * Returns null when either end is unusable, or when the result would be
 * negative (an event before the birth is a data error, not an age).
 */
export function ageAt(
  born: string | number | undefined | null,
  at: string | number | undefined | null
): Age | null {
  const b = parts(born);
  const a = parts(at);
  if (!b || !a) return null;

  let years = a.y - b.y;
  // Not yet had the birthday in the target year.
  if (a.m < b.m || (a.m === b.m && a.d < b.d)) years -= 1;
  if (years < 0) return null;

  // Exact only when both ends carry a full date. Where the target is
  // year-only we assumed 1 January, which yields the lower bound.
  return { years, approx: !(b.exact && a.exact) };
}

/** Age at death, or null if they are living or the record is unusable. */
export function ageAtDeath(
  born: string | number | undefined | null,
  died: string | number | undefined | null
): Age | null {
  if (!died) return null;
  return ageAt(born, died);
}

/**
 * Age today. Deliberately takes `now` so callers decide where the clock comes
 * from: a build-time value goes stale the moment the author has a birthday,
 * so this is called from the client for living authors.
 */
export function ageNow(born: string | number | undefined | null, now: Date): Age | null {
  const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
  return ageAt(born, iso);
}

/**
 * "78" or "~37", the compact form used inline next to a year.
 *
 * Age 0 returns null: the only life events that land there are the birth
 * itself and anything in the first year, and "aged 0" beside "Born in
 * Torquay" is noise pretending to be data.
 */
export function formatAge(age: Age | null): string | null {
  if (!age || age.years === 0) return null;
  return `${age.approx ? "~" : ""}${age.years}`;
}
