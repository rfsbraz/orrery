# Contributing to Orrery

Two repos, and which one you want depends on what you are fixing.

- **A wrong date, a missing book, a reading order, an author's life event** goes
  to [orrery-content](https://github.com/rfsbraz/orrery-content). That is the
  canon, it is CC0, and it has its own contributing guide.
- **The app itself** is here: the site, the timeline, accounts, community
  features.

## Getting it running

```bash
git clone --recurse-submodules https://github.com/rfsbraz/orrery.git
cd orrery
npm install
cp .env.example .env.local     # fill in a Supabase project's URL and anon key
npm run dev
```

The canon lives in the `orrery-content` submodule and is read **at build time**,
not at runtime. If you forget `--recurse-submodules` the app builds with no
content and every wing 404s.

```bash
npm test          # vitest
npm run lint      # eslint
npm run build     # the real gate: SSG builds every page against the content
```

Supabase is only needed for the account and community features. The museum, the
timelines and the reading orders all work without it.

## Before you open a PR

- `npm test`, `npm run lint` and `npm run build` all pass.
- New behaviour has a test. The suite is small and fast; keep it that way.
- Commits follow [conventional commits](https://www.conventionalcommits.org):
  `feat:`, `fix:`, `chore:`, `docs:`, `perf:`, `refactor:`, `test:`, `ci:`,
  `build:`.
- Keep the change focused. A PR that fixes one thing gets reviewed; a PR that
  fixes five gets postponed.

## Things that will get a PR sent back

- **Renaming a work id.** `id: <wing-slug>/<work-slug>` is referenced by user
  data in the database. Renaming one orphans real readers' shelves. There is a
  migration pattern for when it genuinely has to happen; ask first.
- **Weakening Row Level Security.** The Supabase anon key is public by design,
  so RLS is the only thing standing between one reader's data and another's.
- **Spoilers in prose.** Synopses stay at publisher jacket altitude. Structural
  tells ("nothing is as it seems") are spoilers too: they tell a reader to
  expect a turn. A false negative here is permanent for whoever reads it.
- **A check that cannot fail.** If you add a validator or a test, break
  something on purpose first and watch it fire. This project has shipped
  several guards whose only symptom of being broken was that they stayed green.

## On AI assistance

This project is openly AI-assisted and you are welcome to work the same way. The
content repo ships the agents and scripts it was built with, and documents where
they fail.

Say how you produced a change if you like; it is not held against you. What is
not acceptable is submitting code or content nobody read. The bar is the same
either way: it builds, it is tested, and you understand it well enough to defend
it in review.

## Security

Do not open a public issue for a vulnerability. See [SECURITY.md](SECURITY.md).
