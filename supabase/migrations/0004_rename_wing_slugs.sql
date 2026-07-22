-- Three wings were renamed from the fiction to the author who wrote it:
--   cosmere       -> brandon-sanderson
--   discworld     -> terry-pratchett
--   wheel-of-time -> robert-jordan
--
-- Work ids are `<wing-slug>/<work-slug>`, and user data stores them as text,
-- so a rename in git orphans real shelves unless the rows move too. SCHEMA.md
-- calls ids immutable precisely because of this table; renaming them was a
-- deliberate exception, and this file is the other half of it.
--
-- Idempotent: re-running rewrites nothing, because the old prefixes no longer
-- match. Safe to apply before or after the content deploy - a row pointing at
-- a work id that does not exist yet is inert, not broken.

begin;

create temporary table wing_renames (old text primary key, new text not null) on commit drop;
insert into wing_renames (old, new) values
  ('cosmere', 'brandon-sanderson'),
  ('discworld', 'terry-pratchett'),
  ('wheel-of-time', 'robert-jordan');

-- progress: one row per user per work. work_id is half the primary key, so a
-- collision here would mean the same user already had the new id, which cannot
-- happen on a first run; let it error loudly rather than silently dropping a
-- reader's row.
update public.progress p
   set work_id = r.new || substring(p.work_id from length(r.old) + 1)
  from wing_renames r
 where p.work_id like r.old || '/%';

-- reading_orders: a community order names its wing and lists work ids.
update public.reading_orders o
   set franchise_slug = r.new
  from wing_renames r
 where o.franchise_slug = r.old;

update public.reading_orders o
   set ordered_work_ids = (
         select array_agg(
                  case when w like r.old || '/%'
                       then r.new || substring(w from length(r.old) + 1)
                       else w end
                  order by ord)
           from unnest(o.ordered_work_ids) with ordinality as t(w, ord)
       )
  from wing_renames r
 where exists (
         select 1 from unnest(o.ordered_work_ids) as w
          where w like r.old || '/%'
       );

-- groups: a reading group is scoped to a wing, AND names the order it follows
-- as 'canon:<orderId>' - and an order id is wing-prefixed too, so both columns
-- move. Missing order_ref would leave a group pointing at an order that no
-- longer exists while looking correctly migrated.
update public.groups g
   set franchise_slug = r.new
  from wing_renames r
 where g.franchise_slug = r.old;

update public.groups g
   set order_ref = 'canon:' || r.new || substring(g.order_ref from length('canon:' || r.old) + 1)
  from wing_renames r
 where g.order_ref like 'canon:' || r.old || '/%';

commit;
