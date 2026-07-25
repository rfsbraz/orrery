# Orrery

> An orrery is a clockwork model of the planets moving through time. This is one for books: an author's works and the events around them, in motion on a timeline, held in the gravity of their context.

**Orrery** is a contextual reading-order platform. It answers not just *"what order do I read this in?"* but *"how do I experience this body of work in its moment?"* - following a franchise through official, community, and author-recommended reading orders on a timeline sprinkled with the life, world, and cultural events (weighted low / medium / high impact) that shaped each book.

Passion project first, with tasteful good-faith affiliate income (per-country bookstore links) as a background layer. Built by and for completionists.

- **Status:** live at [orrery.homeberry.me](https://orrery.homeberry.me). Ten wings, 483 works, 31 authors, full pt-PT locale coverage. Feature-complete through Phase 4 (museum, accounts, community, and the framework feature set - River, order diff, wizard, companion, recap, editions).
- **The plan:** see [`docs/CONCEPT.md`](docs/CONCEPT.md) - the full concept, data model, feature set, and phased roadmap.
- **The features and the capability model:** see [`docs/FEATURES.md`](docs/FEATURES.md) - every feature activates per franchise from the shape of its content; a sparse chronology is a first-class citizen.
- **Canon content lives in a separate repo:** [`orrery-content`](https://github.com/rfsbraz/orrery-content) holds the curated franchises, works, aura events, and reading orders (plus the `franchise-research` skill). This repo is the app; that one is the data.

## Launch franchises

Chosen as a deliberate test matrix - each stresses a different axis of the data model:

| Franchise | Data challenge it proves out |
|---|---|
| Discworld | Sub-series threading, multiple valid entry points |
| Cosmere | Shared-universe cross-series chronology vs publication order |
| Wheel of Time | Near-linear + prequel-placement debate + author-transition aura |
| Stephen King | Loose multiverse (Dark Tower spine) + prolific + pseudonym |
| João Tordo | Sparse metadata, non-English, Portugal market, small community |

## Contributing

The canon (books, dates, events, reading orders) lives in
[orrery-content](https://github.com/rfsbraz/orrery-content) and is released under
CC0. The app lives here. See [CONTRIBUTING.md](CONTRIBUTING.md) for both, and
[SECURITY.md](SECURITY.md) before reporting a vulnerability.

This project is openly AI-assisted, with a human reading every change. The
content repo documents how, and where the tooling fails.

## Licence

The app is **[AGPL-3.0](LICENSE)**. Read it, fork it, self-host it, contribute to
it. If you run a modified version as a public service, publish your changes.

The canon content in [orrery-content](https://github.com/rfsbraz/orrery-content)
is **CC0**, deliberately: facts about books are not ours to own, and the point of
assembling them in the open is that the work only has to be done once. Take the
data with no conditions at all.

Author portraits and cover images are third-party works with their own licences
and credits, and are covered by neither.

## ☕ Support

If you find this useful and want to support development, you can [buy me a coffee](https://buymeacoffee.com/rfsbraz) - no pressure at all, just a nice way to say thanks.
