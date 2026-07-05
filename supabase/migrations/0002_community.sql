-- Orrery Phase 3: community reading orders (submission + voting + moderation).
-- Community/user orders are rows here; they reference the same immutable canon
-- Work IDs (<franchise>/<work>) that git defines (CONCEPT §4a). Canon orders stay
-- in git and are read at build time - this table is only user-contributed data.

-- ---------------------------------------------------------------------------
-- reading_orders: a user-submitted order of works within one franchise
-- ---------------------------------------------------------------------------
create table public.reading_orders (
  id uuid primary key default gen_random_uuid(),
  franchise_slug text not null,
  author_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  rationale text check (char_length(rationale) <= 4000),
  ordered_work_ids text[] not null check (cardinality(ordered_work_ids) between 1 and 500),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reading_orders_franchise_idx on public.reading_orders (franchise_slug, status);
create index reading_orders_author_idx on public.reading_orders (author_id);

-- ---------------------------------------------------------------------------
-- order_votes: one upvote per user per order
-- ---------------------------------------------------------------------------
create table public.order_votes (
  order_id uuid not null references public.reading_orders (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (order_id, user_id)
);
create index order_votes_order_idx on public.order_votes (order_id);

-- moderator flag: curators/moderators can see the pending queue and approve/reject.
alter table public.profiles add column is_moderator boolean not null default false;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.reading_orders enable row level security;
alter table public.order_votes enable row level security;

-- Helper: is the current user a moderator? SECURITY DEFINER so the policy can
-- read profiles without recursing through profiles' own RLS.
create or replace function public.is_moderator()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_moderator);
$$;

-- Read an order if it's approved, or it's yours, or you moderate.
create policy "orders: read approved or own or moderator"
  on public.reading_orders for select
  using (status = 'approved' or auth.uid() = author_id or public.is_moderator());

-- Authors create/edit/delete their own submissions.
create policy "orders: insert own"
  on public.reading_orders for insert
  with check (auth.uid() = author_id);
create policy "orders: update own"
  on public.reading_orders for update
  using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "orders: delete own"
  on public.reading_orders for delete
  using (auth.uid() = author_id);

-- Moderators approve/reject (update status on any row).
create policy "orders: moderator update"
  on public.reading_orders for update
  using (public.is_moderator()) with check (public.is_moderator());

-- Votes: anyone can read counts; a user manages only their own vote, and only
-- on an order they're allowed to see (approved).
create policy "votes: read all"
  on public.order_votes for select using (true);
create policy "votes: write own"
  on public.order_votes for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.reading_orders o where o.id = order_id and o.status = 'approved')
  );

-- ---------------------------------------------------------------------------
-- Privileges (RLS decides which rows; these grant the operation at all - the
-- same gotcha as 0001: default privileges don't reach migration-made tables).
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.reading_orders to authenticated;
grant select, insert, update, delete on public.order_votes to authenticated;
grant select on public.reading_orders, public.order_votes to anon;

-- keep updated_at fresh
create trigger reading_orders_touch before update on public.reading_orders
  for each row execute function public.touch_updated_at();
