import { describe, it, expect } from "vitest";
import { storeLinks } from "./links";

const carrie = { title: "Carrie", author: "Stephen King", openLibraryId: "OL81626W" };

describe("storeLinks", () => {
  it("uses the exact OpenLibrary work page when an OLID is known", () => {
    const links = storeLinks(carrie, "US");
    const ol = links.find((l) => l.label === "OpenLibrary");
    expect(ol?.url).toBe("https://openlibrary.org/works/OL81626W");
  });

  it("falls back to an OpenLibrary search without an OLID", () => {
    const ol = storeLinks({ title: "Carrie", author: "Stephen King" }, "US").find(
      (l) => l.label === "OpenLibrary"
    );
    expect(ol?.url).toContain("openlibrary.org/search?q=");
  });

  it("routes Portugal to Amazon.es (no Amazon.pt)", () => {
    const az = storeLinks(carrie, "PT").find((l) => l.label === "Amazon");
    expect(az?.url).toContain("amazon.es/s?k=");
  });

  it("uses the country Amazon TLD and encodes title + author", () => {
    const az = storeLinks(carrie, "GB").find((l) => l.label === "Amazon");
    expect(az?.url).toBe("https://www.amazon.co.uk/s?k=Carrie%20Stephen%20King");
  });

  it("adds Bookshop.org for US and UK", () => {
    expect(storeLinks(carrie, "US").some((l) => l.label === "Bookshop.org")).toBe(true);
    expect(storeLinks(carrie, "GB").some((l) => l.label === "Bookshop.org")).toBe(true);
  });

  it("carries the Wook affiliate id on the Portuguese store link", () => {
    const wook = storeLinks(carrie, "PT").find((l) => l.label === "Wook");
    expect(wook?.url).toContain("a_aid=5d3ee4327c2fd");
    // the affiliate id must not clobber the search query
    expect(wook?.url).toContain("keyword=");
  });

  it("gives only universal links for an unknown/blank country", () => {
    const links = storeLinks(carrie, "");
    expect(links.some((l) => l.label === "Amazon")).toBe(false);
    expect(links.map((l) => l.label)).toEqual(["OpenLibrary", "Google Books"]);
  });

  it("is case-insensitive on the country code", () => {
    expect(storeLinks(carrie, "gb").some((l) => l.url.includes("amazon.co.uk"))).toBe(true);
  });
});
