# Orrery - Concept

Codename **Orrery**. A contextual reading-order platform for completionists. This document captures the concept, data model, feature set, and phased roadmap so implementation can start from a shared plan.

> Status: pre-implementation. A prior King-only prototype exists (Vite + React + shadcn/ui + Tailwind + TypeScript, Lovable-originated) with a real data model - `eras` (decades with life events, writing style, themes, trivia) and 41 King books - plus three timeline renderers (Classic / River / Vertical). Orrery generalizes that from one author into a platform.

---

## 1. The hook

Reading-order sites are utilitarian checklists ("read Discworld in this order"). They compete with a Google search and lose - free and instant.

Orrery's difference is **contextual reading**: each book sits in the *aura* of its moment - what was happening in the author's life, the world, and the culture when it was written. An impact-weighted event layer turns a list into a guided museum walk. High-impact events (an author's near-fatal accident, a cultural rupture) are anchors; low-impact events are texture.

That reframe changes the competition. A checklist competes with search. A contextual, atmospheric reading experience competes with nothing, because nobody does it well.

## 2. Audiences and the wedge

- **Completionists** - the people who Google "Cosmere reading order" and argue about Discworld sub-series sequencing. They want authoritative, *multiple competing* orders plus progress tracking. High intent, underserved (Goodreads lists are ad-hoc and ugly).
- **Context enjoyers** - people who love knowing *The Stand* was written at the peak of King's addiction. They want the aura. This is the delight/retention layer.

**The wedge:** curated multi-order + progress + rich contextual timeline. Goodreads and StoryGraph treat none of those three as first-class. That triangle is empty.

## 3. Launch franchises (a deliberate test matrix)

Each was chosen because it stresses a different axis of the data model. If the model survives all five, it survives anything.

| Franchise | Author(s) | What it proves out |
|---|---|---|
| **Discworld** | Terry Pratchett | Sub-series threading (Rincewind, Witches, Death, City Watch, Moist von Lipwig, Tiffany Aching…) and multiple valid entry points. The famous "reading order guide" flowchart is the model to beat. |
| **Cosmere** | Brandon Sanderson | Shared-universe **cross-series chronology** that diverges wildly from publication order, an active author-recommended order, and "worldhopper" connective tissue between series. |
| **Wheel of Time** | Robert Jordan → Brandon Sanderson | Near-linear, but the *New Spring* prequel-placement debate (publication vs chronological) and the author-death/co-author transition - itself a high-impact aura event. |
| **Stephen King** | Stephen King (+ Richard Bachman) | Loose multiverse with the **Dark Tower as a connective spine** through many other novels, decades of prolific output, and a pseudonym. Prototype data already exists. |
| **João Tordo** | João Tordo | The hard case: **sparse metadata** (Portuguese literary fiction is thin in OpenLibrary/Google Books), **non-English**, a small community with few existing reading orders, and the **Portugal book market** (Bertrand, FNAC, Wook). Forces i18n and non-English retail support early. *(Bibliography and any loosely-linked sequences need curation - do not assume; verify at data time.)* |

## 4. Core concepts and data model

The central modeling decision is generalizing from one author to a platform. Shape:

- **Work** - the abstract book: `id, title, author(s), pubDate, subseries, franchiseId, synopsis, canonTier (core | extended | apocrypha), externalIds { openLibrary, googleBooks, wikidata }`. Reading orders operate on **Works**.
- **Edition** - a concrete published edition: `id, workId, isbn, language, coverUrl, publisher, format`. Covers, ISBNs, and store links operate on **Editions**. *(Work vs Edition is the gotcha that bites if you skip it: an order is a sequence of Works; a "buy" link needs an Edition.)*
- **Franchise** - the universe/author-world: `id, name, kind (author | shared-universe | series), theme (see §6), curatorIds[]`.
- **ReadingOrder** - `id, franchiseId, name, type (official-publication | chronological-inuniverse | author-recommended | community | curated), curatorId, orderedWorkIds[], rationale`. A franchise has **many** orders - this is the completionist magnet.
- **Event** - the aura layer: `id, date | dateRange, title, description, impact (low | med | high), scope (author-life | world | culture | industry), reach (global | franchise-specific), sourceUrl, spoiler (see §9)`. Global-reach events (world/culture) are shared across every franchise; author-life events belong to one.
- **Progress** (per user) - `userId, workId, status (unread | reading | read | abandoned), rating, dateRead, note`.
- **Achievement** - data-driven (see §7): `id, name, description, icon, tier, category, criteria`.
- **Group** - book clubs (see §5): `id, name, memberIds[], chosenOrderId, schedule?, groupProgress`.
- **StoreLink** - monetization (see §8): `editionId, country, retailer, affiliateUrl`.
- **User** - `id, handle, publicProfile, country (drives store links + locale), progress, achievements, groupIds[], curatorCredits[]`.
- **Curator** - a credited role (see §5): a User with editorial rights over one or more franchises' orders and events.

## 5. Feature set

Grouped by the phase that unlocks them (see §11).

**The atmospheric museum (read-only)**
- Franchise pages with distinct author branding (§6).
- Multiple reading orders per franchise, with rationale, side-by-side **order diff** (where two orders diverge and why - completionist catnip).
- The three timeline views: **Classic** (scan an order), **River** (the aura/context browse - the soul of the product), **Vertical** (mobile progress).
- "Where to start" guided onboarding for someone new to an author.
- Canon-tier boundaries (core / extended / apocrypha) - completionists care intensely about what "counts."

**The completionist's home (accounts)**
- Public **profiles** as a trophy case: per-franchise progress rings, badge shelf, "canon completed" showcases.
- **Personal timeline overlay** (signature feature): overlay *when you read each book* against when it was written and what was happening - *"You read IT in 2019, 33 years after it published."* Fuses profiles + aura into something genuinely novel. Protect room for this.
- **Achievements** (§7).
- **Goodreads / StoryGraph CSV import** to bootstrap reading history and kill cold-start friction.
- **Per-country store links** (§8).
- **New-release tracking** for living authors, with notifications - retention loop.

**Community**
- **Groups / book clubs**: a shared order + members + a shared progress board + optional pace ("one book a month") + group achievements + spoiler-gated per-book discussion.
- **Community reading orders**: submission + voting + moderation.
- **Curation as a credited role**: curators get profile billing ("curated the Cosmere orders"), their own achievements, editorial reputation. This turns the data bottleneck (§8) into community energy.

## 6. Author branding / theming

Each franchise should feel like a distinct wing of a museum - King's page in blood-red + typewriter serif + 80s-paperback grain; Discworld in Josh-Kirby chaos. But bespoke design per author does not scale.

**Approach:** a **Franchise Theme** = `{ palette, type pairing, texture/motif, hero treatment }` applied via CSS custom properties keyed off a `data-franchise` attribute on the root. Swapping themes is flipping a token set, not rebuilding pages (the existing shadcn + Tailwind + CSS-vars stack supports this directly). Ship a **library of mood presets** (pulp-horror, whimsical-fantasy, cosmic-epic, epic-fantasy, literary-contemporary…) that a curator picks and tweaks. Atmospheric per-author pages are hard to copy and very shareable - the theming doubles as marketing.

## 7. Achievements engine

**Rules engine, not hardcoded.** An achievement is *data*: `{ id, name, icon, tier, category, criteria }` where `criteria` is a declarative predicate over a user's progress + the event data. New badges ship as config; curators can propose franchise-specific ones.

Categories (all just different predicates): completion, streak, context/aura, social, discovery, curation. Tie some to the aura layer for things nobody else can offer - *"Read The Stand - completed during King's darkest era,"* *"Read a book within a year of its publication,"* *"First to finish a community order."*

## 8. Metadata and data sourcing

The moat and the bottleneck are the same thing: curated orders + event data. Plan for scale from the start.

**Book metadata / covers** (cache hard - static reference data, nightly sync, not live calls):
- **OpenLibrary** - free, open, Work/Edition model matches ours, covers + editions.
- **Google Books API** - free tier, good descriptions + covers.
- **Wikidata** (SPARQL) - author bios and world/culture events with dates, to *seed* the aura layer.
- Skip **Goodreads** entirely - Amazon killed its API in 2020.
- Optional later: **Hardcover** (modern, community, has an API) as a spiritual-fit supplement.

**The aura layer**: seed world/culture events from Wikidata; author-life and franchise-specific events are curated. To scale franchises without it becoming a second job, **LLM-assisted drafting + human (curator) review** rather than hand-writing every event. João Tordo is the stress test - expect thin automated coverage and heavier manual curation.

## 9. Spoiler-awareness (cross-cutting primitive)

Bake this in from the start - painful to retrofit. The aura *can spoil* (knowing a book was written after a death recolors it), and book-club discussion needs per-book gates. Every Event, note, and discussion carries a spoiler boundary: *safe to reveal at what point in which order*. Reveal contextual detail progressively as the reader advances.

## 10. Monetization (good-faith, invisible)

Tasteful **per-country affiliate** only - it serves the reader (finding the book), stays in the background, and scales with the content being built anyway.

- **Bookshop.org first** (US / UK / ES) - has affiliate, supports indie bookshops, fits the vibe.
- **Amazon Associates** per marketplace as traffic justifies - note the friction: separate approval per country, and they de-list on low traffic.
- **Portugal**: Bertrand / FNAC / Wook - investigate affiliate availability (João Tordo forces this).
- Always fall back to a generic "find this book" (OpenLibrary / Bookshop search) when no affiliate exists for a country.
- Honest expectation: real but modest passive income that grows with traffic; not salary-replacing. Correct for "good-faith passive."

## 11. Phased roadmap (dependency-respecting)

Building auth before the read-only experience is delightful yields a tracker with no reason to exist. So:

- **Phase 0 - done-ish**: King prototype, initial data model, three timeline views.
- **Phase 1 - the atmospheric museum (read-only)**: generalize the data model; author theming; metadata enrichment (OpenLibrary + Google Books + Wikidata seeding); the five launch franchises' orders + aura; order-diff and "where to start." No auth. Goal: beautiful and shareable, proves it's a platform.
- **Phase 2 - the completionist's home**: accounts; public profiles; solo progress; the **personal timeline overlay**; achievements engine; Goodreads/StoryGraph import; per-country store links (Works now have Editions/ISBNs). Goal: a place that's *yours to return to*.
- **Phase 3 - community**: groups / book clubs; community orders (submission + moderation); curation roles + credits. Goal: the community carries the data load.

## 12. Tech notes

- **Frontend**: existing prototype is Vite + React + shadcn/ui + Tailwind + TypeScript (Lovable-originated). Theming via CSS custom properties fits §6 directly.
- **Backend** (needed from Phase 2 for accounts/progress; Phase 1 can run off static/generated data): needs a database (Works/Editions/Orders/Events/Users/Progress/Groups) and an API. Direction TBD - keep it boring and cheap for a passion project (managed Postgres + a thin API, or an edge/serverless stack). Content (Works/Orders/Events) is read-heavy and cacheable; user data is the write path.
- **i18n**: not optional - João Tordo forces multi-language content (Portuguese) and non-English retail early. Design content and store links locale-aware from Phase 1.
- **Deployment**: per Rodrigo's convention, if it becomes a hostable service it can live on homeberry behind Authelia during development; a public launch wants a public host + CDN for SEO. release-please for versioning when it has releases.

## 13. Open questions / decisions

- **Name** - "Orrery" is a codename. Real brand TBD; should signal "reading journeys in context," not "book tracker."
- **Repo visibility** - created **private** at concept stage (reversible); flip public when there's something to show, especially given the SEO/affiliate angle.
- **Backend choice** - defer until Phase 2 is real; Phase 1 can be static.
- **João Tordo bibliography** - needs genuine curation; do not assume series/order structure.
- **Portugal affiliate programs** - confirm Bertrand/FNAC/Wook affiliate availability.
- **Community moderation model** - defer to Phase 3, but keep the data model group-aware early.
