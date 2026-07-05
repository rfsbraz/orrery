-- Orrery Phase 2: user data (accounts, progress, achievements).
-- Canon (works, authors, orders, events) stays file-sourced from orrery-content;
-- these tables only hold per-user data, keyed to canon by stable Work IDs.
-- Profiles are PRIVATE by default (CONCEPT decision); public profiles expose
-- their progress + achievements read-only.

-- ---------------------------------------------------------------------------
-- profiles: one row per authenticated user
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  handle text unique not null check (handle ~ '^[a-z0-9_]{3,30}$'),
  display_name text,
  bio text,
  country text,                              -- ISO-3166-1 alpha-2; drives store links + locale
  is_public boolean not null default false,  -- private by default
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- progress: a user's status per work (work_id = <franchise>/<work-slug> in canon)
-- ---------------------------------------------------------------------------
create table public.progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  work_id text not null,
  status text not null check (status in ('unread', 'reading', 'read', 'abandoned')),
  rating smallint check (rating between 1 and 5),
  date_read date,
  note text,
  updated_at timestamptz not null default now(),
  primary key (user_id, work_id)
);
create index progress_user_idx on public.progress (user_id);

-- ---------------------------------------------------------------------------
-- achievements_earned: unlocks (definitions live in app code, evaluated server-side)
-- ---------------------------------------------------------------------------
create table public.achievements_earned (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id text not null,
  earned_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- ---------------------------------------------------------------------------
-- Row-level security: own data always; other users' only when profile is public
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.achievements_earned enable row level security;

create policy "profiles: read own or public"
  on public.profiles for select
  using (is_public or auth.uid() = id);
create policy "profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = id);
create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "progress: read own or public profile"
  on public.progress for select
  using (
    auth.uid() = user_id
    or exists (select 1 from public.profiles p where p.id = progress.user_id and p.is_public)
  );
create policy "progress: write own"
  on public.progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "achievements: read own or public profile"
  on public.achievements_earned for select
  using (
    auth.uid() = user_id
    or exists (select 1 from public.profiles p where p.id = achievements_earned.user_id and p.is_public)
  );
create policy "achievements: write own"
  on public.achievements_earned for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger progress_touch before update on public.progress
  for each row execute function public.touch_updated_at();
