-- LinkU Supabase-only MVP RLS policies.
-- Run in Supabase Dashboard -> SQL Editor after Prisma schema is pushed.

update auth.users
set email_confirmed_at = now()
where email_confirmed_at is null;

alter table "User" enable row level security;
alter table "Zone" enable row level security;
alter table "Card" enable row level security;
alter table "Profile" enable row level security;
alter table "Swipe" enable row level security;
alter table "Match" enable row level security;
alter table "ContactRequest" enable row level security;
alter table "Block" enable row level security;
alter table "Report" enable row level security;

drop policy if exists "user_select_self" on "User";
drop policy if exists "user_select_self_or_active_card_owner" on "User";
create policy "user_select_self_or_active_card_owner"
on "User"
for select
to authenticated
using (
  "id" = auth.uid()::text
  or exists (
    select 1 from "Card"
    where "Card"."userId" = "User"."id"
    and "Card"."status" = 'ACTIVE'
  )
);

drop policy if exists "user_insert_self" on "User";
create policy "user_insert_self"
on "User"
for insert
to authenticated
with check ("id" = auth.uid()::text);

drop policy if exists "user_update_self" on "User";
create policy "user_update_self"
on "User"
for update
to authenticated
using ("id" = auth.uid()::text)
with check ("id" = auth.uid()::text);

drop policy if exists "profile_select_visible" on "Profile";
create policy "profile_select_visible"
on "Profile"
for select
to authenticated
using (
  "userId" = auth.uid()::text
  or exists (
    select 1 from "Card"
    where "Card"."userId" = "Profile"."userId"
    and "Card"."status" = 'ACTIVE'
  )
);

drop policy if exists "profile_insert_own" on "Profile";
create policy "profile_insert_own"
on "Profile"
for insert
to authenticated
with check ("userId" = auth.uid()::text);

drop policy if exists "profile_update_own" on "Profile";
create policy "profile_update_own"
on "Profile"
for update
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "zone_select_enabled" on "Zone";
create policy "zone_select_enabled"
on "Zone"
for select
to authenticated, anon
using ("enabled" = true);

drop policy if exists "card_insert_own" on "Card";
create policy "card_insert_own"
on "Card"
for insert
to authenticated
with check ("userId" = auth.uid()::text);

drop policy if exists "card_select_own_or_active" on "Card";
create policy "card_select_own_or_active"
on "Card"
for select
to authenticated
using ("userId" = auth.uid()::text or "status" = 'ACTIVE');

drop policy if exists "swipe_select_own" on "Swipe";
create policy "swipe_select_own"
on "Swipe"
for select
to authenticated
using ("swiperId" = auth.uid()::text);

drop policy if exists "swipe_insert_own" on "Swipe";
create policy "swipe_insert_own"
on "Swipe"
for insert
to authenticated
with check ("swiperId" = auth.uid()::text);

drop policy if exists "match_select_own" on "Match";
create policy "match_select_own"
on "Match"
for select
to authenticated
using ("userAId" = auth.uid()::text or "userBId" = auth.uid()::text);

drop policy if exists "match_insert_own" on "Match";
create policy "match_insert_own"
on "Match"
for insert
to authenticated
with check ("userAId" = auth.uid()::text or "userBId" = auth.uid()::text);

drop policy if exists "contact_request_select_own_match" on "ContactRequest";
create policy "contact_request_select_own_match"
on "ContactRequest"
for select
to authenticated
using (
  exists (
    select 1 from "Match"
    where "Match"."id" = "ContactRequest"."matchId"
    and ("Match"."userAId" = auth.uid()::text or "Match"."userBId" = auth.uid()::text)
  )
);

drop policy if exists "contact_request_insert_own_match" on "ContactRequest";
create policy "contact_request_insert_own_match"
on "ContactRequest"
for insert
to authenticated
with check (
  "senderId" = auth.uid()::text
  and exists (
    select 1 from "Match"
    where "Match"."id" = "ContactRequest"."matchId"
    and ("Match"."userAId" = auth.uid()::text or "Match"."userBId" = auth.uid()::text)
  )
);

drop policy if exists "block_select_own" on "Block";
create policy "block_select_own"
on "Block"
for select
to authenticated
using ("blockerId" = auth.uid()::text);

drop policy if exists "block_insert_own" on "Block";
create policy "block_insert_own"
on "Block"
for insert
to authenticated
with check ("blockerId" = auth.uid()::text);

drop policy if exists "report_insert_own" on "Report";
create policy "report_insert_own"
on "Report"
for insert
to authenticated
with check ("reporterId" = auth.uid()::text);

-- Admin read policies. Set app_metadata.linku_role = 'admin' for admin users.
drop policy if exists "admin_report_select" on "Report";
create policy "admin_report_select"
on "Report"
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'linku_role') = 'admin');

drop policy if exists "admin_card_select" on "Card";
create policy "admin_card_select"
on "Card"
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'linku_role') = 'admin');

drop policy if exists "admin_user_select" on "User";
create policy "admin_user_select"
on "User"
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'linku_role') = 'admin');
