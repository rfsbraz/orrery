# Deploying Orrery

The step-by-step from "feature-complete on the local stack" to a live beta.
Architecture recap (CONCEPT §12): the app is a Next.js build that reads canon
from the orrery-content submodule at build time (fully static museum) and
talks to **Supabase** (Postgres + Auth + RLS) for everything per-user. Canon
never lives in the database - user rows reference stable Work IDs as text -
so there is **no canon-sync step**; shipping new content is just rebuilding.

Accounts degrade gracefully: with no Supabase env set, the museum works and
account features hide. That means you can deploy the static site first and
wire accounts second.

## 0. Prerequisites

- The framework stack merged (orrery PRs, bottom-up) and the content wave
  merged in orrery-content (schema v2 first, then the franchise bundles;
  resolve `brandon-sanderson.yaml` add/add conflict with the Cosmere version).
- The content-sync workflow (or a manual `git submodule update --remote`)
  bumping the app's submodule to the merged content.
- Accounts: Supabase (free tier is fine to start), and Vercel or the
  homeberry Docker stack for hosting.

## 1. Supabase project (Cloud - recommended for the beta)

Self-hosting on homeberry works for development, but a public beta means
strangers' emails/passwords on the home box, on the home IP, with you as the
one patching GoTrue. Use Supabase Cloud for real users; the app can't tell
the difference (same two env vars).

1. https://supabase.com/dashboard → **New project**: name `orrery`, region
   **eu-west** (closest to PT), generate and store the database password in
   the password manager.
2. Project **Settings → API**: note the **Project URL** and the **anon
   public** key. (Never expose the `service_role` key; the app doesn't use it.)

## 2. Apply the migrations

From the repo root (Supabase CLI ≥ 2.x, `npx supabase` works):

```bash
npx supabase login                       # one-time, opens browser
npx supabase link --project-ref <ref>    # <ref> = the id in the project URL
npx supabase db push                     # applies supabase/migrations/000{1,2,3}
```

`db push` runs, in order: `0001_init.sql` (profiles, progress, achievements +
RLS + the explicit grants), `0002_community.sql` (reading_orders, order_votes,
is_moderator), `0003_groups.sql` (groups, group_members, the scoped progress
carve-out). Verify in Dashboard → Database → Tables that all six tables exist
and RLS shows "enabled" on each.

## 3. Configure auth

Dashboard → **Authentication**:
- **Providers**: Email enabled (it is by default). Leave confirmations ON.
- **URL Configuration**: Site URL = the production URL (e.g.
  `https://orrery.example`), and add it to Redirect URLs. Add the Vercel
  preview wildcard too if using Vercel (`https://*-<team>.vercel.app`).
- **SMTP** (recommended before real signups): Settings → Auth → SMTP - the
  built-in sender is heavily rate-limited and lands in spam. Any transactional
  provider works (Resend/Postmark free tiers cover a beta).

## 4. Environment variables

Exactly two, both build-time public:

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

Unset = accounts hidden, museum still ships (lib/supabase/env.ts).

## 5. Host

### Option A - Vercel (recommended for the public beta)

The SEO goal wants a public host + CDN; the museum is SSG so it lands on the
edge for free.

1. Import the GitHub repo in Vercel. Framework preset: Next.js. Enable
   **"Include source files outside the Root Directory"** is not needed, but
   **submodules**: add a Vercel "Install Command" override only if the default
   clone misses them - Vercel clones public submodules automatically
   (orrery-content is public; this is why it was made public).
2. Set the two env vars (Production + Preview).
3. Deploy. Every push to main redeploys; the daily content-sync PR keeps
   content fresh once merged.
4. Domain: add the real domain when the name is chosen; until then the
   vercel.app URL is fine for a quiet beta.

### Option B - homeberry (Docker, private beta behind Authelia)

The image already builds and pushes to GHCR via `.github/workflows/docker.yml`.

1. On homeberry, add to TheOneStack compose:
   ```yaml
   orrery:
     image: ghcr.io/rfsbraz/orrery:latest
     container_name: orrery
     environment:
       NEXT_PUBLIC_SUPABASE_URL: ${ORRERY_SUPABASE_URL}
       NEXT_PUBLIC_SUPABASE_ANON_KEY: ${ORRERY_SUPABASE_ANON_KEY}
       HOSTNAME: 0.0.0.0        # Next standalone binds the container id otherwise
     labels: [the standard Traefik pair for orrery.homeberry.me]
     restart: unless-stopped
   ```
   Note: env vars are **build-time** in Next.js. The GHCR image is built
   without them, which yields the accounts-hidden museum. For accounts on
   homeberry, build the image with build args instead (docker.yml would need
   the two vars as build-args) - or just use Vercel for the account-bearing
   deployment; this option is best as a museum mirror / staging.
2. Authelia: one_factor rule for `orrery.homeberry.me` ABOVE the wildcard
   `^/api` bypass (health-history lesson: rule order is first-match).
3. Cloudflare DNS record like the other services.

## 6. Post-deploy checklist

- [ ] Sign up with a real email; confirm the confirmation mail arrives.
- [ ] Mark a book read; check the row lands in `progress` (Dashboard → Table).
- [ ] Set your own account as moderator (SQL editor):
      `update profiles set is_moderator = true where id = '<your-user-uuid>';`
- [ ] Submit + approve a community order end to end.
- [ ] Check a private profile 404s anonymously and a public one renders.
- [ ] `/f/stephen-king`, `/hall`, and each new franchise page render with
      their capability nav correct (Tordo: no connections link; WoT: none).

## 7. Affiliate blocks (when ready to monetize)

All tags live in `AFFILIATE_TAGS` in `lib/stores/links.ts` - config, not code:

- **Amazon Associates**: apply per marketplace (ES covers PT). Requires a
  live site with content - apply after the beta is up. 180-day/3-sale rule:
  they close idle accounts; don't apply before launch.
- **Bookshop.org**: affiliate program (US/UK/ES) - fits the indie vibe;
  apply with the live URL.
- **Wook / Bertrand / FNAC PT**: no public affiliate program confirmed yet;
  links work unpaid today. Re-check via Awin/TradeTracker Iberia, where
  Bertrand/FNAC campaigns have historically lived.
- Cover-image rights note (CONCEPT §13): OpenLibrary covers are fine for a
  beta; revisit before any paid placement.

## 8. What deliberately is NOT deployed

- No analytics, no cookies beyond Supabase auth - add a privacy-respecting
  counter (Plausible/GoatCounter) only when there is traffic worth counting.
- The `service_role` key is nowhere in the app or CI - keep it that way.
- Backups: Supabase Cloud free tier keeps daily backups 7 days. Before the
  community layer gets real traction, wire a weekly `pg_dump` (GitHub Action
  with the connection string as a secret) into the existing backup habits.
