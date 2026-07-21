import { describe, expect, it } from "vitest";
import { ageAt, ageAtDeath, ageNow, formatAge } from "./age";

describe("age", () => {
  it("is exact when both dates are full", () => {
    // King, born 1947-09-21, at his 1999 accident on 19 June: birthday not yet
    // reached that year, so 51 and not 52.
    expect(ageAt("1947-09-21", "1999-06-19")).toEqual({ years: 51, approx: false });
    // The day after the birthday.
    expect(ageAt("1947-09-21", "1999-09-22")).toEqual({ years: 52, approx: false });
    // On the birthday itself.
    expect(ageAt("1947-09-21", "1999-09-21")).toEqual({ years: 52, approx: false });
    // The day before.
    expect(ageAt("1947-09-21", "1999-09-20")).toEqual({ years: 51, approx: false });
  });

  it("returns the lower bound, flagged, when the event is year-only", () => {
    // Christie born 1890-09-15; "1928" is 37 until September and 38 after, so
    // the honest answer is 37 with the flag rather than a confident 38.
    expect(ageAt("1890-09-15", "1928")).toEqual({ years: 37, approx: true });
    expect(formatAge(ageAt("1890-09-15", "1928"))).toBe("~37");
  });

  it("is approximate when the birth date itself is year-only", () => {
    expect(ageAt("1890", "1928-03-01")).toEqual({ years: 38, approx: true });
  });

  it("computes age at death", () => {
    // Christie: 1890-09-15 to 1976-01-12, so she died at 85, not 86.
    expect(ageAtDeath("1890-09-15", "1976-01-12")).toEqual({ years: 85, approx: false });
    // Pratchett: 1948-04-28 to 2015-03-12, died at 66.
    expect(ageAtDeath("1948-04-28", "2015-03-12")).toEqual({ years: 66, approx: false });
  });

  it("has no age at death for the living", () => {
    expect(ageAtDeath("1947-09-21", null)).toBeNull();
    expect(ageAtDeath("1947-09-21", undefined)).toBeNull();
  });

  it("computes a current age against a supplied clock", () => {
    expect(ageNow("1947-09-21", new Date(2026, 6, 21))).toEqual({ years: 78, approx: false });
    // Just after the birthday, a year older - the reason this is not baked in
    // at build time for a living author.
    expect(ageNow("1947-09-21", new Date(2026, 8, 22))).toEqual({ years: 79, approx: false });
  });

  it("shows no age for the birth itself", () => {
    // "aged 0" next to "Born in Torquay" is noise pretending to be data.
    expect(formatAge(ageAt("1890-09-15", "1890-09-15"))).toBeNull();
    expect(formatAge(ageAt("1890-09-15", "1890"))).toBeNull();
    // The age is still computed; only its display is suppressed.
    expect(ageAt("1890-09-15", "1890-09-15")).toEqual({ years: 0, approx: false });
  });

  it("refuses to invent an age from nothing", () => {
    expect(ageAt(null, "1999-06-19")).toBeNull();
    expect(ageAt("1947-09-21", null)).toBeNull();
    expect(ageAt("not a date", "1999")).toBeNull();
    expect(formatAge(null)).toBeNull();
  });

  it("returns null rather than a negative age", () => {
    expect(ageAt("1947-09-21", "1940")).toBeNull();
  });
});
