import { describe, expect, it } from "vitest";
import { visualOrder } from "./bidi";

describe("visualOrder", () => {
  it("lists the words of an Arabic title right to left", () => {
    expect(visualOrder("ألف ليلة وليلة")).toBe("وليلة ليلة ألف");
  });

  it("reverses only the right-to-left run inside a mixed title", () => {
    expect(visualOrder("The שיר השירים edition")).toBe("The השירים שיר edition");
  });

  it("leaves left-to-right titles alone", () => {
    expect(visualOrder("Мастер и Маргарита")).toBe("Мастер и Маргарита");
    expect(visualOrder("風の歌を聴け")).toBe("風の歌を聴け");
  });
});
