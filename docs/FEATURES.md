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
| `wizard`      | `startHere` paths in franchise.yaml          | Where to start |
| `companion`   | aura events                                  | Reading companion |
| `editions`    | an `editions.yaml`                           | Exact store links |

Two contracts follow:

1. **A sparse franchise is complete.** A works-only bundle gets the derived
   publication order and a clean museum page. No
   half-empty pages, no broken doors: feature pages are statically generated
   only for franchises whose capability is on (`generateStaticParams` +
   `dynamicParams = false`), and `FranchiseNav` only links what exists.
2. **Adding a feature to a franchise is a content PR**, never an app change.
   João Tordo ships a thin honest aura and nothing else; that is a correct use
   of the framework.

## The spoiler engine (cross-cutting)

`lib/spoilers/` + `components/spoilers/spoiler-gate.tsx`. Any event (franchise,
global, or author life event) can carry `spoilerAfter: <work-id>` - the work whose
experience the detail would damage. Readers who have read the boundary work
see the content plainly; everyone else (including signed-out visitors) gets a
neutral shielded teaser with a deliberate "Reveal" - progressive disclosure,
never a hard wall. The reader's read-set comes from `ProgressProvider`
(`readSet`).

Used by: the classic timeline, the River, and the reading companion.

## The features

### The River - the franchise root, `/f/<slug>`
The atmospheric context browse (CONCEPT calls it the soul of the product),
rendered as **strata**: time as sediment that you descend through. Chosen over
two alternatives (a centered "beam" spine and an annotated "margin" edition)
because it is the only one that makes event *weight* physical - see the river
lab in this branch's history if the alternatives are ever worth revisiting.

- Every year is a layer with a ghosted year numeral behind it.
- Decades cut heavy rules with a sticky decade marker riding the scroll.
- Works are cover-led cards inside their layer, showing series membership
  ("The Dark Tower · #3 of 8", derived from `subseries`), pen name, canon tier,
  synopsis, and a Reading/Read control.
- Low and medium events are thin interbedded seams; **high-impact events are
  ruptures**: full-bleed inverted bands that break the stratigraphy.
- **Era plates** announce each new era as a threshold: a full-bleed band
  ("ENTERING" / era title / period / themes / description) between double
  rules, structurally distinct from the inverted rupture bands.
- The franchise's `signature` (theme.yaml) threads the layers.
- A sticky **overall progress bar** tops the walk ("12 of 77 read").

Pure document flow - no scroll-jacking, nothing for reduced-motion to undo.
The strata walk **is** the franchise root: an author's page opens straight
into the chronological order rather than a summary above a timeline. The old
`/f/<slug>/river` route permanently redirects to the root so shared links
survive.

Model: `lib/content/river.ts` (`buildRiver` layers, era-span parsing, era and
decade boundaries, `subseriesEntries`). View: `components/river.tsx`, which
also carries the per-work progress control, companion panel, and find-a-copy
links.

### Where to start - `/f/<slug>/start`
Two questions (experience, commitment), instant recommendation. Paths are
declared in franchise.yaml `startHere` with `fit` tags; `lib/wizard/match.ts`
scores them (exact tag 2/axis, untagged axis is a soft universal 1, ties keep
curator order). Order-backed paths preview their first 8 books; explicit
workIds lists render in full with progress controls.

### Reading companion
When a signed-in reader marks a work "Reading", its timeline card grows a
panel: the spoiler-safe aura within 2 years of publication (max 4 items,
anchors first), the era, and the position in the publication walk.
`lib/progress/companion.ts` (pure selector),
`components/companion/panel.tsx` (visibility only). Computed and embedded
only when the capability is on - sparse franchises pay nothing.

### Year in reading - `/me/recap/<year>` (auth)
The personal overlay folded into a year: books read (dated, finished only),
franchises touched, publication-year span, average gap, longest wait closed,
punctual reads, eras visited. `lib/progress/recap.ts`. A shareable 1200x630
card renders at `/me/recap/<year>/card` (next/og) for the signed-in reader
only - profiles stay private by default; sharing is the reader's act.

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
