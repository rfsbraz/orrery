-- Remove the groups / book-clubs feature (Phase 3). Forward-only: 0003_groups.sql
-- stays as history; this migration undoes it on any database that ran it.
--
-- Order matters: the progress carve-out policy and the RLS on the group tables
-- lean on the security-definer helpers, so drop the policies before the
-- functions. The tables' own policies drop with the tables (cascade).

-- The additive carve-out 0003 put on the existing progress table.
drop policy if exists "progress: read for shared group" on public.progress;

-- The tables (group_members references groups; drop it first, cascade covers
-- the policies and the FK either way).
drop table if exists public.group_members;
drop table if exists public.groups cascade;

-- The security-definer helpers, now unreferenced.
drop function if exists public.shares_group(uuid);
drop function if exists public.is_group_member(uuid);
drop function if exists public.group_is_public(uuid);
drop function if exists public.group_owner(uuid);
