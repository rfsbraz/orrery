# Orrery features and the capability model

How the app's features work, what content activates them, and where they live
in the code. Companion to [`CONCEPT.md`](CONCEPT.md) (the why) and to
orrery-content's [`docs/SCHEMA.md`](https://github.com/rfsbraz/orrery-content/blob/main/docs/SCHEMA.md)
(the content spec).

## The framework model

Orrery is a **framework for chronologies, not a King site with settings**.
Every advanced feature activates per franchise from the shape of its content,
with an optional explicit override in `franchise.yaml`:

```yaml
features:
  river: auto   # auto (default) | on | off
```

Resolution lives in `lib/content/capabilities.ts`:

| Capability    | Auto-activates when the franchise has...     | Feature |
|---------------|----------------------------------------------|---------|
| `river`       | aura events                                  | The River view |
| `orderDiff`   | 2+ reading orders (derived default counts)   | Compare orders |
| `wizard`      | `startHere` paths in franchise.yaml          | Where to start |
| `connections` | work `connections` or a `characters.yaml`    | Connections map |
| `companion`   | aura events                                  | Reading companion |
| `hall`        | (always; opt-out only)                       | The Hall |
| `editions`    | an `editions.yaml`                           | Exact store links |

Two contracts follow:

1. **A sparse franchise is complete.** A works-only bundle gets the derived
   publication order, a clean museum page, and membership in the Hall. No
   half-empty pages, no broken doors: feature pages are statically generated
   only for franchises whose capability is on (`generateStaticParams` +
   `dynamicParams = false`), and `FranchiseNav` only links what exists.
2. **Adding a feature to a franchise is a content PR**, never an app change.
   The Wheel of Time bundle deliberately ships with `connections` dark (one
   continuous sequence - a map would add noise, not signal); João Tordo ships
   a thin honest aura. Both are correct uses of the framework.

## The spoiler engine (cross-cutting)

`lib/spoilers/` + `components/spoilers/spoiler-gate.tsx`. Any event, character
appearance, or note can carry `spoilerAfter: <work-id>` - the work whose
experience the detail would damage. Readers who have read the boundary work
see the content plainly; everyone else (including signed-out visitors) gets a
neutral shielded teaser with a deliberate "Reveal" - progressive disclosure,
never a hard wall. The reader's read-set comes from `ProgressProvider`
(`readSet`).

Used by: the classic timeline, the River, the connections map's character
threads, and the reading companion.

## The features

### The River - `/f/<slug>/river`
The atmospheric context browse (CONCEPT calls it the soul of the product).
Era bands set the scene; works drift along the signature beam alternating
sides; high-impact events stand full-width as anchors; low/med events sit as
marginalia. Pure document flow - nothing for reduced-motion to reduce.
Model: `lib/content/river.ts` (era-span parsing, anchor promotion, era
sectioning with nearest-era attachment). View: `components/river.tsx`.

### Compare orders - `/f/<slug>/compare`
Two orders side by side: the spine they agree on renders once down the
middle; each divergence forks into two columns, with both orders' rationales
and `debated:` notes attached. LCS-based diff in `lib/orders/diff.ts`
(common/fork segments, only-in-A/B, fork count). The selected pair syncs to
the URL hash, so a comparison is shareable while the page stays static.

### Where to start - `/f/<slug>/start`
Two questions (experience, commitment), instant recommendation. Paths are
declared in franchise.yaml `startHere` with `fit` tags; `lib/wizard/match.ts`
scores them (exact tag 2/axis, untagged axis is a soft universal 1, ties keep
curator order). Order-backed paths preview their first 8 books; explicit
workIds lists render in full with progress controls.

### Connections map - `/f/<slug>/connections`
Two layers. **The map**: a static SVG arc diagram - works with at least one
declared connection strung chronologically on the beam, arcs showing how far
back each book leans (`lib/content/connections.ts`, `components/connections/
arc-map.tsx`). **The travellers**: character threads - each recurring figure's
appearances as year-chips, spoiler-gated per appearance (an appearance whose
existence is a reveal stays shielded until earned).

### Reading companion
When a signed-in reader marks a work "Reading", its timeline card grows a
panel: the spoiler-safe aura within 2 years of publication (max 4 items,
anchors first), the era, the position in the publication walk, and
connections in both directions. `lib/progress/companion.ts` (pure selector),
`components/companion/panel.tsx` (visibility only). Computed and embedded
only when the capability is on - sparse franchises pay nothing.

### Year in reading - `/me/recap/<year>` (auth)
The personal overlay folded into a year: books read (dated, finished only),
franchises touched, publication-year span, average gap, longest wait closed,
punctual reads, eras visited. `lib/progress/recap.ts`. A shareable 1200x630
card renders at `/me/recap/<year>/card` (next/og) for the signed-in reader
only - profiles stay private by default; sharing is the reader's act.

### The Hall - `/hall`
Every franchise on one timeline: what each author published year by year,
with reach-global world events interleaved and a sticky decade rail.
`lib/content/hall.ts` (per-year merge, global-event dedup, decade grouping).
Degrades to a single wing; franchises opt out via `features.hall: off`.
Author-life events never join (they stay in their own wing).

### Editions and store links
`lib/content/editions.ts`: `pickEdition` (per-country language preference,
then recency, curated data only), `coverFor` (curated cover > edition-ISBN
cover > work-OLID cover > null), `isbn13to10`. Timeline cards show covers
when one resolves (text-first otherwise). `lib/stores/links.ts` upgrades to
exact-edition links when a verified ISBN exists (Amazon /dp/, ISBN-keyed
searches at Wook/Bertrand/Casa del Libro/Waterstones/Bookshop) and keeps the
search fallbacks otherwise. Affiliate tags are explicit config
(`AFFILIATE_TAGS`), empty until referral programs are approved.

## Testing conventions

Every feature keeps its logic in a pure `lib/` module with vitest coverage
(94 tests as of the framework stack); components only render and decide
visibility. New features should follow the same split - if a behavior can't
be tested without a browser, too much of it lives in the component.
