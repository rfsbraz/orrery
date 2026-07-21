import { describe, expect, it } from "vitest";
import { getAllBundles } from "@/lib/content";
import { eventAnchorId } from "@/components/event-anchor";

/**
 * Events are citable: every one gets a stable `#e-<id>` anchor, and the ids
 * behind those anchors are permanent by policy. A renamed event id is a dead
 * link in somebody's notes, so this guards the ids as much as the markup.
 */
describe("event permalinks", () => {
  it("derives a stable anchor id from the event id", () => {
    expect(eventAnchorId("king-van-accident-1999")).toBe("e-king-van-accident-1999");
  });

  it("every event on every wing has a usable, unique anchor", () => {
    const bundles = getAllBundles();
    expect(bundles.length).toBeGreaterThan(0);

    for (const b of bundles) {
      const seen = new Set<string>();
      // `timeline` is already the merged view the page renders: the authors'
      // life events, the franchise's own events, and the global events that
      // reach this wing. Adding lifeEvents again here double-counts them.
      for (const e of b.timeline) {
        expect(e.id, `${b.franchise.id} has an event with no id`).toBeTruthy();
        const anchor = eventAnchorId(e.id);
        // Fragment-safe rather than encodeURIComponent-clean: a fragment may
        // legally contain "/" (RFC 3986), and three event ids carry a
        // franchise prefix. What must not appear is whitespace or a character
        // that ends the fragment or the attribute.
        expect(anchor, `${b.franchise.id}: ${anchor} is not fragment-safe`).toMatch(
          /^[A-Za-z0-9\-._~/:@!$&'()*+,;=]+$/
        );
        expect(
          seen.has(anchor),
          `${b.franchise.id}: duplicate anchor ${anchor} would make the link ambiguous`
        ).toBe(false);
        seen.add(anchor);
      }
    }
  });
});
