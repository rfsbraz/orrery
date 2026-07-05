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

- **Work** - the abstract book: `id, title, authorIds, published, subseries, franchiseId, synopsis, canonTier (core | extended | apocrypha), publishedAs?, withAuthorIds?, externalIds { openLibrary, googleBooks, wikidata }`. Reading orders operate on **Works**. `publishedAs` = the name on the cover when it differs from the author's real name (a pen name); see §4b. `withAuthorIds` reference global Authors (see §4c).
- **Edition** - a concrete published edition: `id, workId, isbn, language, coverUrl, publisher, format`. Covers, ISBNs, and store links operate on **Editions**. *(Work vs Edition is the gotcha that bites if you skip it: an order is a sequence of Works; a "buy" link needs an Edition.)*
- **Author** - a **global entity** (`id, name, aka[], born, bio, pseudonyms[], lifeEvents[], sources[]`), referenced by `authorIds` everywhere. Global because a person recurs across franchises (Sanderson: Cosmere + Wheel of Time) and names collide; **author-life events live here** (they follow the person). See §4c.
- **Franchise** - the universe/author-world: `id, name, kind (author | shared-universe | series), authorIds[], theme (see §6), curatorIds[]`.
- **ReadingOrder** - `id, franchiseId, name, type (official-publication | chronological-inuniverse | author-recommended | community | curated | user), source (canon | community | user), ownerId?, orderedWorkIds[], rationale`. A franchise has **many** orders - this is the completionist magnet. *Canon* orders come from git; *community/user* orders are Supabase rows (see §4a). Both reference the same stable Work IDs.
- **Event** - the aura layer: `id, date | dateRange, title, description, impact (low | med | high), scope (author-life | world | culture | industry), reach (global | franchise-specific), sourceUrl, spoiler (see §9)`. Global-reach events (world/culture) are shared across every franchise; author-life events belong to one.
- **Progress** (per user) - `userId, workId, status (unread | reading | read | abandoned), rating, dateRead, note`.
- **Achievement** - data-driven (see §7): `id, name, description, icon, tier, category, criteria`.
- **Group** - book clubs (see §5): `id, name, memberIds[], chosenOrderId, schedule?, groupProgress`.
- **StoreLink** - monetization (see §8): `editionId, country, retailer, affiliateUrl`.
- **User** - `id, handle, publicProfile, country (drives store links + locale), progress, achievements, groupIds[], curatorCredits[]`.
- **Curator** - a credited role (see §5): a User with editorial rights over one or more franchises' orders and events.

## 4a. Content sources: canon (git) vs user data (Supabase)

The one seam that could break the git-content model is **user-created reading orders** - they're runtime writes, they can't live in git. Resolution:

- **Git = source of truth for canon only.** Works, Editions, Franchises, Events, and *official / author-recommended / curated* ReadingOrders. Reviewed via PR, versioned, never contains user data.
- **The bridge is stable Work IDs.** Every Work has a permanent slug defined in git, `<franchise-slug>/<work-slug>` (e.g. `stephen-king/the-stand`). **These IDs are immutable forever** - DB rows and user orders reference them, so renaming one orphans data. This is a hard content-discipline rule.
- **A deploy-time sync upserts the git canon into Supabase** (`works`, `editions`, `events`, and `reading_orders` where `source = 'canon'`). So at runtime *everything* is queryable in one place, with uniform joins.
- **Custom and community orders are rows in the same `reading_orders` table**, with `source = 'user' | 'community'` and an `ownerId`, their `orderedWorkIds` pointing at the same git-defined Work IDs. A query for "all orders for franchise X" returns canon + community + the user's own, uniformly - a custom order is just a private row.
- **Round-trip:** a community order that earns promotion to canon gets exported by a curator into a git file (and its DB row retired or remarked). Canon always ends up back in git.

Net: curation stays PR-based and versioned, custom orders "just work" as DB rows, and there's a single runtime query path.

## 4b. The default order, and pen names

**Every franchise has exactly one default order: the author's *complete* published works in publication-chronological order.** It is **derived** - generated by sorting the full `works.yaml` by publication date - so it is always complete and never drifts. Curators don't hand-maintain it; they keep the works list complete. Every other order (chronological in-universe, author-recommended, curated, community) is additional and hand-authored in `orders.yaml`. Because the default is derived from *all* works, `works.yaml` completeness is a first-class goal, not a nice-to-have.

**Pen names.** An **Author** is the person; pen names are recorded on the author (`pseudonyms`) and on each work (`publishedAs` = the name on the cover, defaulting to the real name). Franchise grouping is a *curatorial* decision:
- **Default: one franchise per author, all names included.** Pen-name works belong to the author and appear in the default all-works order regardless of the cover name. The pen name shows as a per-work badge and a filter.
- **Exception: a distinct-brand pen name may get its own franchise** that links the same Author - when the pen name is a genuinely separate persona with its own substantial catalog and reader community (e.g. J.D. Robb vs Nora Roberts, Robert Galbraith vs J.K. Rowling). Curator's call, for its own page/branding/orders.
- **Meta/in-universe pen-name lore** (e.g. Richard Bachman's staged "death," which King folded into *The Dark Half*) lives in the aura **events**, not as a data quirk.

## 4c. References: entities and links

**IDs are the source of truth; names are display-only. Nothing resolves by name.** This is what keeps ambiguous authors and works from colliding.

- **Global entity IDs.** Works have `<franchise-slug>/<work-slug>` (permanent, §4a). **Authors are global** in `content/authors/<slug>.yaml` and are referenced by `authorIds` / `withAuthorIds` - so one person is one entity across every franchise, and two people who share a name get distinct slugs (`aka:` carries alternate spellings for search).
- **Typed reference syntax, two forms of the same `type:id` scheme:**
  - *Structured fields* use bare IDs: `authorIds: [stephen-king]`, `withAuthorIds: [peter-straub]`, and (for work-to-work links like a shared multiverse) a `connections: [<work-id>]` field.
  - *Prose* (bios, synopses, event/era descriptions, order rationales) uses inline links: `[[work:stephen-king/the-stand|The Stand]]`, `[[author:peter-straub]]` - wiki-style, pipe for display text. The app linkifies them.
- **Everything must resolve.** `scripts/validate.py` in the content repo's CI checks every reference - structured and inline - and fails the build on a dangling one. This is the reference resolver behind the validation Action.
- **Extensible:** the same scheme extends later to `character:<id>` (a recurring character like Randall Flagg across the King multiverse) with no rework.

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

Each franchise should feel like a distinct wing of the same museum. Personality comes through a **modern editorial system**, not genre costume.

**The design law (non-negotiable):**
- **Modern, editorial, readable first.** A shared, contemporary baseline (generous type scale, real hierarchy, high contrast) is constant across every franchise. An author's identity is a *variation on that baseline*, never a skin over it.
- **Personality lives in three levers only:** the **palette** (4-6 considered hex values drawn from the author's world), one **display typeface** (characterful but modern, from a curated set, used with restraint on headings) over a shared highly-readable body + mono-for-data, and **one signature element** per franchise that embodies the world.
- **Hard anti-goals - no cringe.** No novelty/decorative/genre fonts (no dripping-horror, no comic whimsy). No literal genre textures (paper grain, blood, parchment, starfields). No word-art. No low-contrast atmosphere at the cost of readability. And avoid the AI-default looks (near-black + one neon accent; cream + serif + terracotta) - those are defaults, not choices.
- **Readability floor:** WCAG AA contrast for body text, sane measure and line-height, visible focus, reduced-motion respected, responsive to mobile.

A franchise that reads as a tasteful, distinctive literary edition - not a Halloween costume - is what's hard to copy and worth sharing.

**Approach:** a **Franchise Theme** = `{ palette, displayFace, signature, notes }` applied via CSS custom properties keyed off a `data-franchise` attribute. The body and mono faces stay constant for readability; only the display face and palette vary per author, plus the one signature. Swapping a theme is flipping a token set, not rebuilding pages. A curator picks a starting **preset** (each maps to a real modern display face + a palette family) and tunes it.

Example - **Stephen King** is *not* "black + blood-red horror." It's a serious literary edition: a warm near-black paper, bone-white text (high contrast), a single restrained oxblood accent used sparingly, a characterful literary serif for display, and the **signature "Beam"** - a continuous vertical line the works are strung along, echoing the Dark Tower connecting his whole multiverse. Atmosphere through restraint.

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
  - *Working end-to-end (local Supabase):* email/password auth (`/login`), progress tracking via server actions (RLS-enforced), and the `/me` shelf (stats, earned badges, read-vs-written personal overlay). Verified against live local Supabase: sign up → mark read → badges + overlay render. The engines (achievements, CSV import, overlay) are unit-tested (27 tests). **Gotcha captured:** migration-created tables need *explicit* `grant`s to the `authenticated`/`anon` roles - Supabase default privileges don't reach them, and the RLS policies silently fail with `42501 permission denied` until granted (matters for the homeberry self-host too). Grants now live in `0001_init.sql`.
  - *Also working:* **public profiles** - editable profile (handle/display name/bio/country/public toggle) on `/me`, and read-only shelves at `/u/[handle]` sharing one `Shelf` component with `/me`. RLS-gated and verified: anon sees a public shelf (200), a private or unknown handle 404s, and the owner can still preview their own private shelf.
  - *Deferred within Phase 2:* the Goodreads/StoryGraph import UI (parser is built + tested), per-country store links (profile `country` is captured, ready to drive them). **Provisioning decision (open):** Supabase Cloud recommended for a beta (managed auth for real users) over homeberry self-host - see §12.
- **Phase 3 - community**: groups / book clubs; community orders (submission + moderation); curation roles + credits. Goal: the community carries the data load.

## 12. Tech and hosting

**Hosting decision (2026-07-05):** start as a **Docker-based stack on the media server (homeberry)**, architected so migrating to a cloud host later is a config change, not a rewrite. Principles:
- **Portable containers, no homeberry-specific coupling.** Everything env-configured; nothing assumes local paths, the Authelia edge, or the mergerfs pool.
- **Portable data.** Containerized **Postgres** now → managed Postgres (Neon / Supabase / RDS) later by changing a connection string. Cover images and assets behind an **S3-compatible** interface (MinIO container now → Cloudflare R2 / S3 / B2 later) - never the local filesystem.
- **Stateless app containers** so they scale/move freely; state lives only in Postgres + object storage.
- During dev it can sit behind Authelia on homeberry; the **public launch wants a public host + CDN** for SEO (see below).

**Frontend - the one real architecture fork:** the prototype is a Vite + React SPA (client-rendered), which is **bad for SEO** - and search discovery is core to the passion-project-with-affiliate goal. Recommendation: move the public "museum" to an **SSR/SSG framework (Next.js)**, keeping React + shadcn/ui + Tailwind (components port over). SSR/SSG gives crawlable franchise/book pages; it containerizes cleanly on homeberry and later deploys to Vercel or any Node host unchanged. Theming via CSS custom properties (§6) works the same.

**Content model (decided):** **git-versioned content files** (YAML per franchise, reviewed via PR) are the source of truth for canon; a deploy-time sync loads them into Supabase; user/community orders are DB rows referencing stable Work IDs (§4a). Curation is pull requests, fitting the credited-curator model (§5).

**Two-repo split (decided):** canon content lives in a **separate repo, [`orrery-content`](https://github.com/rfsbraz/orrery-content)** - no app code, no secrets, so it can be opened to community contribution independently of the app. The app never reads those files at runtime; a sync step (deploy/CI) validates and upserts them into Supabase. The `franchise-research` skill lives in `orrery-content` (it authors content, so it belongs with the content). This app repo holds the frontend/backend and this concept doc.

**Backend (decided): Supabase.** Provides Postgres + Auth (GoTrue) + row-level security + storage in one - covers the DB, the auth provider, and the S3-compatible asset layer at once. Fits the hosting plan: **self-host Supabase via its Docker compose on homeberry now → Supabase Cloud (or plain managed Postgres) later.** Mild lock-in to flag: Supabase Auth + RLS are somewhat coupled, so migrating *off* Supabase entirely is more work than swapping a connection string - acceptable for a passion project, and "for now" per the decision.

**i18n**: not optional - João Tordo forces multi-language content (Portuguese) and non-English retail early. Design content and store links locale-aware from Phase 1.

**Curation workflow (decided): authored Claude Code skills.** The LLM-assisted curation is concrete tooling, not a vague step - a set of skills (in the `orrery-content` repo under `.claude/skills/`) that research a franchise and emit the git content bundle for curator review. First one: **`franchise-research`** (authors + life events, world/culture events, eras, bibliography, known orders) - it also defines the content schema.

**Releases**: release-please once it has versioned releases, per convention.

## 13. Open questions / decisions

**Resolved**
- **Hosting** - Docker stack on homeberry, built cloud-portable (§12).
- **Repo visibility** - **private** at concept stage; flip public when there's something to show (SEO/affiliate angle).
- **Backend + auth** - **Supabase** (Postgres + Auth + RLS + storage), self-hosted on homeberry now → cloud later (§12).
- **Content model** - git canon synced to Supabase; user/community orders as DB rows (§4a, §12).
- **Profile privacy** - **private by default**, opt-in public.
- **Curation workflow** - **authored Claude Code skills**; first is `franchise-research` (§12).

**Decide now (shapes the foundation)**
- **Frontend architecture** - SSR/SSG (Next.js) for SEO vs keeping the Vite SPA. Recommendation: migrate to Next.js (§12). The expensive-to-reverse one - still open.
- **Cover-image and metadata rights** - can we legally display covers, and from where? OpenLibrary covers are generally usable; Google Books has API ToS; Amazon cover art requires being an affiliate; Wikidata is CC0. Resolve before public launch (not blocking Phase 1 dev). Assets sit behind Supabase storage regardless.

**Decide later (named, deferred)**
- **Community moderation model** - Phase 3; keep the data model group-aware early.

**Homework / curation**
- **Name** - "Orrery" is a codename; real brand should signal "reading journeys in context," not "book tracker."
- **João Tordo bibliography** - genuine curation via `franchise-research`; do not assume series/order structure.
- **Portugal affiliate programs** - confirm Bertrand / FNAC / Wook affiliate availability.
- **Phase 1 "definition of done"** - how many orders per franchise and how deep the aura before it's shippable (scope discipline).
