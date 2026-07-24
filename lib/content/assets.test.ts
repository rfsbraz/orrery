import { describe, expect, it } from "vitest";
import { slotPath } from "./assets";

describe("slotPath", () => {
  it("slot 1 is the path unchanged", () => {
    expect(slotPath("assets/wing/id.webp", 1)).toBe("assets/wing/id.webp");
  });

  it("inserts the slot suffix before the extension", () => {
    expect(slotPath("assets/wing/id.webp", 2)).toBe("assets/wing/id-2.webp");
    expect(slotPath("assets/wing/id.webp", 3)).toBe("assets/wing/id-3.webp");
  });

  it("falls back to a trailing suffix when there is no extension to split on", () => {
    expect(slotPath("assets/wing/id", 2)).toBe("assets/wing/id-2");
  });
});
