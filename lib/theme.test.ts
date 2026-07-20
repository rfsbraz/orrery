import { describe, expect, it } from "vitest";
import { DISPLAY_FACES, signatureOf, themeVars } from "./theme";
import { getFranchise, listAchievements } from "./content";
import type { Theme } from "./content/types";

describe("theme is content-driven", () => {
  it("a theme's palette and display face reach the page as CSS vars", () => {
    const theme: Theme = {
      preset: "x",
      palette: { bg: "#111", accent: "#f00" },
      displayFace: "spectral",
    };
    const vars = themeVars(theme) as Record<string, string>;
    expect(vars["--bg"]).toBe("#111");
    expect(vars["--accent"]).toBe("#f00");
    expect(vars["--font-display"]).toBe(DISPLAY_FACES.spectral);
  });

  it("an uncurated display face falls back instead of breaking the page", () => {
    const vars = themeVars({ preset: "x", displayFace: "comic-nightmare" }) as Record<string, string>;
    expect(vars["--font-display"]).toBe(DISPLAY_FACES.fraunces);
  });

  it("the signature comes from content, defaulting to the neutral thread", () => {
    expect(signatureOf({ preset: "x", signature: "beam" })).toBe("beam");
    expect(signatureOf({ preset: "x", signature: "rule" })).toBe("rule");
    expect(signatureOf({ preset: "x" })).toBe("thread");
    expect(signatureOf(undefined)).toBe("thread");
    // an unknown signature degrades rather than rendering nothing
    expect(signatureOf({ preset: "x", signature: "lightning-bolts" })).toBe("thread");
  });

  it("the King wing's beam and serif come from its theme.yaml, not the app", () => {
    const king = getFranchise("stephen-king")!;
    expect(signatureOf(king.theme)).toBe("beam");
    expect((themeVars(king.theme) as Record<string, string>)["--font-display"]).toBe(
      DISPLAY_FACES.fraunces
    );
  });
});

describe("achievements are content", () => {
  it("loads global and franchise definitions from the content repo", () => {
    const defs = listAchievements();
    const ids = defs.map((a) => a.id);
    expect(ids).toContain("first-steps"); // global
    expect(ids).toContain("stephen-king/constant-reader"); // franchise
    // no duplicates, and franchise badges are namespaced
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      if (id.includes("/")) expect(id.split("/")[0]).not.toBe("");
    }
  });

  it("every definition is renderable and evaluable", () => {
    for (const a of listAchievements()) {
      expect(a.name).toBeTruthy();
      expect(a.description).toBeTruthy();
      expect(a.icon).toBeTruthy();
      expect(["bronze", "silver", "gold"]).toContain(a.tier);
      expect(a.criteria?.kind).toBeTruthy();
    }
  });
});
