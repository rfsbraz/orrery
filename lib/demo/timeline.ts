import type { AuraEvent, Era } from "@/lib/content/types";
import type { EventCardProps } from "@/components/river/shared";
import { demoPlaceholder, type PlaceholderColors, type PlaceholderPattern } from "./placeholder";

/**
 * The sample timeline for app/[locale]/demo/page.tsx. DEMO-ONLY: a fictional
 * author's life, invented purely to exercise every cell of the layout
 * grammar (orrery-content docs/LAYOUT.md) at once. Nothing here is real
 * content and none of it is loaded through the real content pipeline
 * (lib/content) - the page renders it directly through the same dispatcher
 * and organisation components a real franchise page uses, just fed a
 * made-up bundle instead of one built from orrery-content.
 *
 * One entry per organisation at minimum, `beside` several times over (it is
 * the workhorse - LAYOUT.md's own rotation budget gives it half a wing), the
 * `breakout` modifier on two of its four compatible+implemented
 * organisations (artifact-spread, medallion - see those components' own
 * comments on why the other two listed-compatible modifiers are safe
 * no-ops), and a real second image slot on both multi-image organisations
 * (diptych, split-counterpoint).
 */

export type DemoEventCardProps = Omit<EventCardProps, "event">;

export type DemoEntry =
  | { kind: "era"; id: string; era: Era }
  | { kind: "event"; id: string; event: AuraEvent; cardProps: DemoEventCardProps };

interface AspectSpec {
  width: number;
  height: number;
  aspectLabel: string;
  pattern?: PlaceholderPattern;
}

/** One pixel aspect per organisation, chosen from LAYOUT.md's own allowed
 * list for that organisation. Dimensions are all even (see placeholder.ts on
 * why that matters) and deliberately vary between organisations that share an
 * allowed aspect (immersion vs full-bleed-vista) so two placeholders never
 * look interchangeable at a glance. */
const ASPECTS: Record<string, AspectSpec> = {
  "full-bleed-vista": { width: 1600, height: 900, aspectLabel: "16:9" },
  beside: { width: 900, height: 600, aspectLabel: "3:2" },
  immersion: { width: 1200, height: 800, aspectLabel: "3:2" },
  "floating-object": { width: 700, height: 700, aspectLabel: "1:1" },
  "artifact-spread": { width: 800, height: 1000, aspectLabel: "4:5" },
  // diptych/split-counterpoint: the aspect LAYOUT.md allows for each
  // ("1:1/4:5", both ways) isn't a free choice at render time - each
  // component's own slot wrapper hardcodes ONE of them (diptych.tsx:
  // `aspect-square`; split-counterpoint.tsx: `aspect-[4/5]`), and `fit="cover"`
  // crops whatever the placeholder draws to fit that box regardless. So the
  // placeholder is drawn at the box's REAL aspect, not just any allowed one -
  // otherwise the labelled aspect would lie about what the reader actually sees.
  diptych: { width: 800, height: 800, aspectLabel: "1:1" },
  strip: { width: 2400, height: 600, aspectLabel: "4:1", pattern: "strip" },
  marginalia: { width: 400, height: 400, aspectLabel: "1:1" },
  medallion: { width: 800, height: 800, aspectLabel: "1:1", pattern: "medallion" },
  "split-counterpoint": { width: 800, height: 1000, aspectLabel: "4:5" },
  "layered-stack": { width: 1200, height: 900, aspectLabel: "4:3" },
  mosaic: { width: 1200, height: 800, aspectLabel: "3:2", pattern: "mosaic" },
  interlude: { width: 400, height: 400, aspectLabel: "1:1" },
  passage: { width: 1500, height: 500, aspectLabel: "3:1" },
  "chapter-gate": { width: 1600, height: 900, aspectLabel: "16:9" },
};

function sketchFor(organisation: string, label: string, colors: PlaceholderColors) {
  const spec = ASPECTS[organisation];
  return {
    sketch: demoPlaceholder({
      label,
      aspectLabel: spec.aspectLabel,
      width: spec.width,
      height: spec.height,
      colors,
      pattern: spec.pattern,
    }),
    // Real content credits every generated sketch as generated (the content
    // validator enforces it - see lib/content/types.ts SketchImage). This one
    // is not generated art at all, so it says the honest, stranger thing.
    sketchCredit: "Demo placeholder (inline SVG), not generated art",
    sketchSource: "demo",
  };
}

const AUTHOR_BORN = 1971;

function age(year: number): string {
  return `aged ${year - AUTHOR_BORN}`;
}

/**
 * Alternates "left"/"right" across illustrated cards only, same rule
 * river.tsx applies to the real river (see its `sideOf` comment) - a run of
 * unillustrated entries shouldn't shift the phase of the ones that do carry
 * art.
 */
function sideAlternator() {
  let n = 0;
  return () => (n++ % 2 === 0 ? "right" : "left");
}

export function buildDemoTimeline(colors: PlaceholderColors): DemoEntry[] {
  const nextSide = sideAlternator();

  const eraOne: Era = {
    id: "demo-formative-years",
    title: "Formative Years",
    period: "1971 - 1997",
    themes: ["origins", "apprenticeship", "the long wait"],
    description:
      "Before the debut: a childhood by the water, a decade of drafts, and the rejections that came before the one acceptance.",
    images: sketchFor("chapter-gate", "CHAPTER GATE · FORMATIVE YEARS", colors),
  };

  const eraTwo: Era = {
    id: "demo-public-life",
    title: "Public Life",
    period: "1998 - 2020",
    themes: ["fame", "reception", "the long career"],
    description:
      "From the overnight debut onward: the press, the parallel private life, the accumulated drafts, and the honours that followed.",
    images: sketchFor("chapter-gate", "CHAPTER GATE · PUBLIC LIFE", colors),
  };

  const entries: DemoEntry[] = [
    { kind: "era", id: "era-formative-years", era: eraOne },

    {
      kind: "event",
      id: "demo-full-bleed-vista",
      event: {
        id: "demo-full-bleed-vista",
        date: 1971,
        title: "Full-bleed vista - the birthplace",
        scope: "author-life",
        authorId: "demo-author",
        impact: "med",
        description:
          "Alba Ferro was born in a fishing town on a coast that shows up, thinly disguised, in half of what she later wrote. A vista organisation is one wide breath before the life begins.",
        organisation: "full-bleed-vista",
        illustrationType: "establishing-landscape",
        images: sketchFor("full-bleed-vista", "FULL-BLEED VISTA", colors),
      },
      cardProps: { side: nextSide(), year: 1971 },
    },

    {
      kind: "event",
      id: "demo-beside-library",
      event: {
        id: "demo-beside-library",
        date: 1978,
        title: "Beside - the childhood library",
        scope: "author-life",
        authorId: "demo-author",
        impact: "low",
        description:
          "The town library was two rooms and a stove. Ferro read the adult shelf out of boredom with the children's one, and never really left it.",
        organisation: "beside",
        illustrationType: "isolated-object",
        images: sketchFor("beside", "BESIDE · CHILDHOOD LIBRARY", colors),
      },
      cardProps: { side: nextSide(), year: 1978, age: age(1978) },
    },

    {
      kind: "event",
      id: "demo-floating-object-compass",
      event: {
        id: "demo-floating-object-compass",
        date: 1983,
        title: "Floating object - the toy compass",
        scope: "author-life",
        authorId: "demo-author",
        impact: "low",
        description:
          "A tin compass from a school trip, kept on every desk she owned afterward. Minor on its own, the kind of object a floating-object organisation exists for: small enough that the prose should keep running past it rather than stopping to make room, wrapping the way a real magazine page wraps text around a photograph instead of parking it in its own boxed-off cell. It turns up, renamed, in three later novels, and everyone who worked with her eventually asked about the real one.",
        organisation: "floating-object",
        illustrationType: "isolated-object",
        images: sketchFor("floating-object", "FLOATING OBJECT", colors),
      },
      cardProps: { side: nextSide(), year: 1983 },
    },

    {
      kind: "event",
      id: "demo-marginalia-prize",
      event: {
        id: "demo-marginalia-prize",
        date: 1986,
        title: "Marginalia - a school prize",
        scope: "author-life",
        authorId: "demo-author",
        impact: "low",
        description: "A regional essay prize, third place. Barely a footnote, which is exactly the point of this organisation.",
        organisation: "marginalia",
        illustrationType: "emblem-seal",
        images: sketchFor("marginalia", "MARGINALIA", colors),
      },
      cardProps: { year: 1986 },
    },

    {
      kind: "event",
      id: "demo-passage-apprentice-years",
      event: {
        id: "demo-passage-apprentice-years",
        date: 1988,
        dateRange: "1988-1994",
        title: "Passage - the compressed apprentice years",
        scope: "author-life",
        authorId: "demo-author",
        impact: "low",
        description: "Six years of night classes, day jobs, and unfinished manuscripts, none of which earns its own year.",
        organisation: "passage",
        illustrationType: "process-diagram",
        images: sketchFor("passage", "PASSAGE", colors),
      },
      cardProps: {},
    },

    {
      kind: "event",
      id: "demo-artifact-spread-rejection",
      event: {
        id: "demo-artifact-spread-rejection",
        date: 1995,
        title: "Artifact spread - the rejection letter (breakout)",
        scope: "author-life",
        authorId: "demo-author",
        impact: "med",
        description:
          "A form rejection from the one publisher she'd actually wanted, kept and later framed. The breakout modifier lets its torn corner cross the card's own edge.",
        organisation: "artifact-spread",
        illustrationType: "document-facsimile",
        modifier: "breakout",
        images: sketchFor("artifact-spread", "ARTIFACT SPREAD · BREAKOUT", colors),
      },
      cardProps: { side: nextSide(), year: 1995, age: age(1995) },
    },

    {
      kind: "event",
      id: "demo-beside-first-sale",
      event: {
        id: "demo-beside-first-sale",
        date: 1996,
        title: "Beside - the first sale",
        scope: "author-life",
        authorId: "demo-author",
        impact: "med",
        description: "A short story, a small magazine, and a cheque she didn't cash for a month because she liked looking at it.",
        organisation: "beside",
        illustrationType: "document-facsimile",
        images: sketchFor("beside", "BESIDE · FIRST SALE", colors),
      },
      cardProps: { side: nextSide(), year: 1996 },
    },

    {
      kind: "event",
      id: "demo-interlude-silence",
      event: {
        id: "demo-interlude-silence",
        date: 1997,
        title: "Interlude - the silence before the debut",
        scope: "author-life",
        authorId: "demo-author",
        impact: "low",
        description: "A year with no letters, no drafts logged, nothing recorded at all.",
        organisation: "interlude",
        illustrationType: "atmospheric-motif-field",
        images: sketchFor("interlude", "INTERLUDE", colors),
      },
      cardProps: { year: 1997 },
    },

    { kind: "era", id: "era-public-life", era: eraTwo },

    {
      kind: "event",
      id: "demo-immersion-debut",
      event: {
        id: "demo-immersion-debut",
        date: 1998,
        title: "Immersion - the overnight debut",
        scope: "author-life",
        authorId: "demo-author",
        impact: "high",
        description:
          "Her first novel sold out its printing in a week neither she nor the publisher was ready for. The one or two total stops a life gets - text sits over the art, not beside it.",
        organisation: "immersion",
        illustrationType: "portrait-of-absence",
        images: sketchFor("immersion", "IMMERSION", colors),
      },
      cardProps: { scale: "rupture", side: nextSide(), year: 1998, age: age(1998) },
    },

    {
      kind: "event",
      id: "demo-epigraph-on-the-debut",
      event: {
        id: "demo-epigraph-on-the-debut",
        date: 1999,
        title: "Interviewed by a regional paper, a year after the debut",
        scope: "author-life",
        authorId: "demo-author",
        impact: "low",
        // The only organisation with no `images` and no `illustrationType` at
        // all - the quotation is the illustration. Placed straight after the
        // `immersion` rupture on purpose: it is the one entry that can follow
        // the loudest cell on the page without competing with it.
        quote:
          "I did not write a book about the sea. I wrote a book about not being able to leave, and the sea was simply what was in the way.",
        description: "On being asked, for the ninth time that year, why every chapter ends at the water.",
        organisation: "epigraph",
        imagesRequired: 0,
      },
      cardProps: { year: 1999, age: age(1999) },
    },

    {
      kind: "event",
      id: "demo-diptych-flop-then-cult",
      event: {
        id: "demo-diptych-flop-then-cult",
        date: 1999,
        title: "Diptych - flop then cult classic",
        scope: "author-life",
        authorId: "demo-author",
        impact: "med",
        description:
          "The follow-up novel sold badly and was declared a one-hit wonder's mistake. It found its real readers a decade late, in paperback, which is the genuine before/after this organisation exists for.",
        organisation: "diptych",
        illustrationType: "editorial-portrait",
        imagesRequired: 2,
        images: sketchFor("diptych", "DIPTYCH · PANEL", colors),
      },
      cardProps: { year: 1999, age: age(1999) },
    },

    {
      kind: "event",
      id: "demo-strip-serialised-decade",
      event: {
        id: "demo-strip-serialised-decade",
        date: 2001,
        title: "Strip - the serialized decade",
        scope: "author-life",
        authorId: "demo-author",
        impact: "med",
        description:
          "Eight years of a weekly newspaper serial, one instalment after another, read left to right the way the strip organisation lays out a sequence.",
        organisation: "strip",
        illustrationType: "serial-contact-sheet",
        images: sketchFor("strip", "STRIP · WEEKLY SERIAL", colors),
      },
      cardProps: { year: 2001 },
    },

    {
      kind: "event",
      id: "demo-mosaic-press-storm",
      event: {
        id: "demo-mosaic-press-storm",
        date: 2005,
        title: "Mosaic - the press storm",
        scope: "author-life",
        authorId: "demo-author",
        impact: "med",
        description: "A misquoted interview line went everywhere at once: op-eds, parody covers, a radio feud. Many voices, one irregular field.",
        organisation: "mosaic",
        illustrationType: "press-media-collage",
        images: sketchFor("mosaic", "MOSAIC · PRESS RESPONSE", colors),
      },
      cardProps: { side: nextSide(), year: 2005 },
    },

    {
      kind: "event",
      id: "demo-split-counterpoint-writing-reception",
      event: {
        id: "demo-split-counterpoint-writing-reception",
        date: 2008,
        title: "Split counterpoint - writing beside reception",
        scope: "author-life",
        authorId: "demo-author",
        impact: "med",
        description:
          "The quiet year she actually wrote the book everyone assumed had taken five, running in parallel with the reviews still arriving for the last one. Two lanes, same period, neither one resolves the other.",
        organisation: "split-counterpoint",
        illustrationType: "editorial-portrait",
        imagesRequired: 2,
        images: sketchFor("split-counterpoint", "SPLIT COUNTERPOINT · LANE", colors),
      },
      cardProps: { year: 2008, age: age(2008) },
    },

    {
      kind: "event",
      id: "demo-layered-stack-desk-of-drafts",
      event: {
        id: "demo-layered-stack-desk-of-drafts",
        date: 2011,
        title: "Layered stack - the desk of drafts",
        scope: "author-life",
        authorId: "demo-author",
        impact: "med",
        description: "Seven drafts of the same manuscript, kept rather than shredded, eventually photographed as one accumulated pile rather than seven separate documents.",
        organisation: "layered-stack",
        illustrationType: "archive-stack",
        images: sketchFor("layered-stack", "LAYERED STACK", colors),
      },
      cardProps: { side: nextSide(), year: 2011 },
    },

    {
      kind: "event",
      id: "demo-medallion-lifetime-award",
      event: {
        id: "demo-medallion-lifetime-award",
        date: 2015,
        title: "Medallion - the lifetime achievement medal (breakout)",
        scope: "author-life",
        authorId: "demo-author",
        impact: "high",
        description:
          "A national letters medal, the one framed thing on the wall behind every interview since. The breakout modifier lets its ribbon end escape the medallion's own rim.",
        organisation: "medallion",
        illustrationType: "emblem-seal",
        modifier: "breakout",
        images: sketchFor("medallion", "MEDALLION · BREAKOUT", colors),
      },
      cardProps: { year: 2015, age: age(2015) },
    },

    {
      kind: "event",
      id: "demo-beside-quiet-years",
      event: {
        id: "demo-beside-quiet-years",
        date: 2018,
        title: "Beside - the quiet years (no art filed yet)",
        scope: "author-life",
        authorId: "demo-author",
        impact: "low",
        description:
          "No sketch is attached to this one on purpose: an event with no filed art still has to render as a plain, unillustrated card rather than an empty box.",
        organisation: "beside",
        // Deliberately no `images` - proves the "illustrated ? ... : null"
        // branch every organisation component carries for an event whose
        // art hasn't landed yet.
      },
      cardProps: { side: nextSide(), year: 2018 },
    },

    {
      kind: "event",
      id: "demo-beside-small-return",
      event: {
        id: "demo-beside-small-return",
        date: 2020,
        title: "Beside - a small return",
        scope: "author-life",
        authorId: "demo-author",
        impact: "low",
        description: "A slim book of essays, modest sales, the kind of late entry that closes a demo timeline rather than a real life.",
        organisation: "beside",
        illustrationType: "isolated-object",
        images: sketchFor("beside", "BESIDE · SMALL RETURN", colors),
      },
      cardProps: { side: nextSide(), year: 2020 },
    },
  ];

  return entries;
}

/** LAYOUT.md's own organisation order, for the jump nav. `chapter-gate` is
 * last because it is the era slot, not an event organisation - same
 * ordering note as dispatcher.tsx. */
export const ORGANISATION_ORDER = [
  "beside",
  "full-bleed-vista",
  "immersion",
  "floating-object",
  "artifact-spread",
  "diptych",
  "strip",
  "marginalia",
  "medallion",
  "split-counterpoint",
  "layered-stack",
  "mosaic",
  "interlude",
  "passage",
  "chapter-gate",
] as const;
