-- Orrery Phase 3: groups / book clubs. A group picks a franchise + a reading
-- order (canon or community) and reads it together; the shared progress board
-- reuses each member's own progress rows (CONCEPT §5). Members implicitly share
-- their progress with their groups - a scoped RLS carve-out below.

-- ---------------------------------------------------------------------------
-- groups
-- ---------------------------------------------------------------------------
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  handle text unique not null check (handle ~ '^[a-z0-9_]{3,30}$'),
  name text not null check (char_length(name) between 1 and 120),
  description text check (char_length(description) <= 2000),
  franchise_slug text not null,
  -- which order they read: 'canon:default' | 'canon:<orderId>' | 'community:<uuid>'
  order_ref text not null,
  pace text,  -- e.g. 'one book a month'; free text, optional
  owner_id uuid not null references auth.users (id) on delete cascade,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index group_members_user_idx on public.group_members (user_id);

alter table public.groups enable row level security;
alter table public.group_members enable row level security;

-- Security-definer helpers break the groups<->group_members RLS recursion.
create or replace function public.is_group_member(gid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.group_members where group_id = gid and user_id = auth.uid());
$$;

create or replace function public.group_is_public(gid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.groups where id = gid and is_public);
$$;

create or replace function public.group_owner(gid uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select owner_id from public.groups where id = gid;
$$;

-- Do the current user and `other` share any group? Drives the progress carve-out.
create or replace function public.shares_group(other uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.group_members a
    join public.group_members b on a.group_id = b.group_id
    where a.user_id = auth.uid() and b.user_id = other
  );
$$;

-- groups: read public or your own; owner writes.
create policy "groups: read public or member"
  on public.groups for select
  using (is_public or public.is_group_member(id) or owner_id = auth.uid());
create policy "groups: insert own"
  on public.groups for insert with check (owner_id = auth.uid());
create policy "groups: owner update"
  on public.groups for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "groups: owner delete"
  on public.groups for delete using (owner_id = auth.uid());

-- group_members: visible with the group; self-join public groups (or owner);
-- leave yourself, owner can remove.
create policy "members: read with group"
  on public.group_members for select
  using (public.group_is_public(group_id) or public.is_group_member(group_id));
create policy "members: self join"
  on public.group_members for insert
  with check (
    user_id = auth.uid()
    and (public.group_is_public(group_id) or public.group_owner(group_id) = auth.uid())
  );
create policy "members: leave or owner-remove"
  on public.group_members for delete
  using (user_id = auth.uid() or public.group_owner(group_id) = auth.uid());

-- Progress carve-out: a member can read another member's progress (the shared
-- board). Additive to the own-or-public policy from 0001.
create policy "progress: read for shared group"
  on public.progress for select using (public.shares_group(user_id));

-- Grants (RLS decides rows; these grant the operation - the 0001/0002 gotcha).
grant select, insert, update, delete on public.groups to authenticated;
grant select, insert, delete on public.group_members to authenticated;
grant select on public.groups, public.group_members to anon;
