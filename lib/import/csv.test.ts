import { describe, it, expect } from "vitest";
import { getFranchise, getAuthor } from "../content";
import { parseCsv, parseExport, matchToCanon } from "./csv";

const king = getFranchise("stephen-king")!;
const authorNames = new Map<string, string>();
for (const a of king.authors) authorNames.set(a.id, a.name);
// include collaborators referenced by works
for (const id of ["peter-straub", "owen-king", "richard-chizmar"]) {
  authorNames.set(id, getAuthor(id)?.name ?? id);
}

const GOODREADS = `Title,Author,My Rating,Exclusive Shelf,Date Read
"The Stand",Stephen King,5,read,2019/07/15
It,Stephen King,4,read,2020/01/02
Carrie,Stephen King,0,currently-reading,
"A Book That Does Not Exist",Nobody,3,read,2021/05/01`;

const STORYGRAPH = `Title,Authors,Star Rating,Read Status,Last Date Read
Misery,Stephen King,4.5,read,2018/03/03
'Salem's Lot,Stephen King,,did-not-finish,`;

describe("parseCsv", () => {
  it("handles quoted fields with commas", () => {
    const rows = parseCsv('a,"b,c",d\n1,2,3');
    expect(rows[0]).toEqual(["a", "b,c", "d"]);
    expect(rows[1]).toEqual(["1", "2", "3"]);
  });
});

describe("Goodreads import", () => {
  const entries = parseExport(GOODREADS);

  it("maps statuses, ratings, and dates", () => {
    const stand = entries.find((e) => e.title === "The Stand")!;
    expect(stand).toMatchObject({ status: "read", rating: 5, dateRead: "2019-07-15" });
    expect(entries.find((e) => e.title === "Carrie")!.status).toBe("reading");
  });

  it("matches known works to canon and flags the unknown", () => {
    const { matched, unmatched } = matchToCanon(entries, king.works, authorNames);
    const ids = matched.map((m) => m.workId);
    expect(ids).toContain("stephen-king/the-stand");
    expect(ids).toContain("stephen-king/it");
    expect(ids).toContain("stephen-king/carrie");
    expect(unmatched.map((u) => u.title)).toEqual(["A Book That Does Not Exist"]);
    expect(matched.find((m) => m.workId === "stephen-king/the-stand")).toMatchObject({
      status: "read",
      rating: 5,
      dateRead: "2019-07-15",
    });
  });
});

describe("StoryGraph import", () => {
  it("reads the StoryGraph column names and DNF status", () => {
    const entries = parseExport(STORYGRAPH);
    const misery = entries.find((e) => e.title === "Misery")!;
    expect(misery).toMatchObject({ status: "read", rating: 5, dateRead: "2018-03-03" }); // 4.5 -> 5
    const lot = entries.find((e) => e.title.includes("Salem"))!;
    expect(lot.status).toBe("abandoned");
    const { matched } = matchToCanon(entries, king.works, authorNames);
    expect(matched.map((m) => m.workId)).toContain("stephen-king/misery");
  });
});
