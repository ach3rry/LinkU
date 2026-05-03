# Supabase-only MVP 设置

本阶段目标是只用 Netlify + Supabase 跑通真实注册和建卡。已有 NestJS API、Prisma、AI Provider 暂时保留，不重构；后续要恢复智能建卡、推荐、审核工作流时再接回来。

## 1. 环境变量

Netlify Web：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_LINKU_DATA_MODE=supabase
```

本地如果也要测试 Supabase-only 模式，在 `.env` 中配置同样三项。

## 2. 数据库结构

先让 Supabase Postgres 拥有当前 Prisma schema 对应的数据表。推荐做法：

```bash
pnpm db:generate
pnpm db:push
```

这里的 `DATABASE_URL` 指向 Supabase 项目的 Postgres 连接串。第一次验证阶段可以用 `db push`，正式上线前再补 Prisma migration。

## 3. 基础数据

至少要有三条专区数据。可以在 Supabase SQL Editor 运行：

```sql
insert into "Zone" ("code", "name", "description", "enabled")
values
  ('TUTORING', '家教专区', '找家教、当家教，按科目、价格、时间、学校和认证状态匹配。', true),
  ('BUDDY', '搭子专区', '饭搭子、自习搭子、运动搭子、黑客松队友和英语口语搭子。', true),
  ('PREMIUM', '学长学姐专区', '保研考研经验、简历修改、项目修改、项目陪跑等高价值资源。', true)
on conflict ("code") do update
set
  "name" = excluded."name",
  "description" = excluded."description",
  "enabled" = excluded."enabled";
```

## 4. 预设演示数据

在 Supabase SQL Editor 中执行以下 SQL 可插入 4 个演示用户和 4 张预设卡片（每个专区一张）。这些用户不是真实 Supabase Auth 账号，仅供其他用户滑卡时看到内容。

```sql
-- 演示用户
INSERT INTO "User" ("id", "email", "nickname", "role", "status", "createdAt", "updatedAt")
VALUES
  ('demo-tutor-00000000-0000-0000-0000-000000000001', 'tutor@linku.demo', '小林学姐', 'USER', 'ACTIVE', now(), now()),
  ('demo-seeker-00000000-0000-0000-0000-000000000002', 'student@linku.demo', '想补高数的阿泽', 'USER', 'ACTIVE', now(), now()),
  ('demo-buddy-00000000-0000-0000-0000-000000000003', 'buddy@linku.demo', '晚饭搭子小周', 'USER', 'ACTIVE', now(), now()),
  ('demo-senior-00000000-0000-0000-0000-000000000004', 'senior@linku.demo', '简历修改学长', 'USER', 'ACTIVE', now(), now())
ON CONFLICT ("id") DO UPDATE SET
  "nickname" = EXCLUDED."nickname",
  "status" = EXCLUDED."status",
  "updatedAt" = now();

-- 演示用户资料
INSERT INTO "Profile" ("id", "userId", "school", "city", "grade", "major", "bio", "verifiedStatus", "relationshipBoundary", "createdAt", "updatedAt")
VALUES
  ('demo-profile-00000001', 'demo-tutor-00000000-0000-0000-0000-000000000001', '复旦大学', '上海', '大三', '数学与应用数学', '擅长高数和线代，讲题风格比较耐心。', 'PROVIDER_VERIFIED', 'STUDY_ONLY', now(), now()),
  ('demo-profile-00000002', 'demo-seeker-00000000-0000-0000-0000-000000000002', '同济大学', '上海', '大一', '计算机科学与技术', '高数基础一般，希望周末有人带着复习。', 'STUDENT_VERIFIED', 'STUDY_ONLY', now(), now()),
  ('demo-profile-00000003', 'demo-buddy-00000000-0000-0000-0000-000000000003', '上海交通大学', '上海', '研一', '软件工程', '想找固定自习和晚饭搭子，边界清楚，轻松一点就好。', 'STUDENT_VERIFIED', 'ACTIVITY_PARTNER', now(), now()),
  ('demo-profile-00000004', 'demo-senior-00000000-0000-0000-0000-000000000004', '浙江大学', '杭州', '研二', '人工智能', '可以帮忙看 AI / 后端方向简历和项目表达。', 'PROVIDER_VERIFIED', 'STUDY_ONLY', now(), now())
ON CONFLICT ("id") DO UPDATE SET
  "school" = EXCLUDED."school",
  "city" = EXCLUDED."city",
  "updatedAt" = now();

-- 演示卡片（家教 / 搭子 / 学长学姐各一张）
INSERT INTO "Card" ("id", "userId", "zoneId", "type", "title", "subtitle", "description", "tags", "priceMin", "priceMax", "schedule", "location", "onlineMode", "status", "aiGenerated", "createdAt", "updatedAt")
SELECT 'demo-card-tutor-001', 'demo-tutor-00000000-0000-0000-0000-000000000001', z."id",
  'provide_tutoring', '高数 / 线代耐心辅导', '复旦数学大三，周末可线下或线上',
  '适合想补基础、梳理题型和考前冲刺的同学。第一次会先了解你的课程进度。',
  '["高等数学", "线性代数", "周末", "线下可约"]',
  80, 120, '{"text": "周六下午、周日上午"}', '上海', 'HYBRID', 'ACTIVE', false, now(), now()
FROM "Zone" z WHERE z."code" = 'TUTORING'
ON CONFLICT ("id") DO UPDATE SET "title" = EXCLUDED."title", "status" = EXCLUDED."status", "updatedAt" = now();

INSERT INTO "Card" ("id", "userId", "zoneId", "type", "title", "subtitle", "description", "tags", "priceMin", "priceMax", "schedule", "location", "onlineMode", "status", "aiGenerated", "createdAt", "updatedAt")
SELECT 'demo-card-seeker-001', 'demo-seeker-00000000-0000-0000-0000-000000000002', z."id",
  'need_tutoring', '想找高数家教带复习', '大一计算机，预算 100/h 左右，周末优先',
  '希望老师能帮我补高数基础，重点是极限、导数和积分题型。',
  '["高等数学", "大一", "周末", "预算100/h"]',
  80, 120, '{"text": "周末白天"}', '上海', 'HYBRID', 'ACTIVE', false, now(), now()
FROM "Zone" z WHERE z."code" = 'TUTORING'
ON CONFLICT ("id") DO UPDATE SET "title" = EXCLUDED."title", "status" = EXCLUDED."status", "updatedAt" = now();

INSERT INTO "Card" ("id", "userId", "zoneId", "type", "title", "subtitle", "description", "tags", "schedule", "location", "onlineMode", "status", "aiGenerated", "createdAt", "updatedAt")
SELECT 'demo-card-buddy-001', 'demo-buddy-00000000-0000-0000-0000-000000000003', z."id",
  'buddy_request', '找固定自习 + 晚饭搭子', '一周 2-3 次，边界清楚，互相督促',
  '主要想找一起自习和吃晚饭的同学，不尬聊、不越界，效率优先。',
  '["自习", "晚饭", "轻社交", "边界清楚"]',
  '{"text": "工作日晚上"}', '上海', 'OFFLINE', 'ACTIVE', false, now(), now()
FROM "Zone" z WHERE z."code" = 'BUDDY'
ON CONFLICT ("id") DO UPDATE SET "title" = EXCLUDED."title", "status" = EXCLUDED."status", "updatedAt" = now();

INSERT INTO "Card" ("id", "userId", "zoneId", "type", "title", "subtitle", "description", "tags", "priceMin", "priceMax", "schedule", "location", "onlineMode", "status", "aiGenerated", "createdAt", "updatedAt")
SELECT 'demo-card-premium-001', 'demo-senior-00000000-0000-0000-0000-000000000004', z."id",
  'premium_consultation', 'AI / 后端方向简历修改', '浙大人工智能研二，帮你梳理项目亮点',
  '可以帮你梳理项目亮点、技术表达和面试追问点。',
  '["简历修改", "AI Coding", "项目表达"]',
  99, 199, '{"text": "预约制"}', '线上', 'ONLINE', 'ACTIVE', false, now(), now()
FROM "Zone" z WHERE z."code" = 'PREMIUM'
ON CONFLICT ("id") DO UPDATE SET "title" = EXCLUDED."title", "status" = EXCLUDED."status", "updatedAt" = now();
```

## 5. RLS 策略

开启 Row Level Security，并允许登录用户创建自己的用户记录和卡片。

**重要**：User 和 Profile 的 SELECT 策略需要允许读取有 ACTIVE 卡片的用户信息，否则推荐页 join 时用户资料会是 null。

```sql
alter table "User" enable row level security;
alter table "Zone" enable row level security;
alter table "Card" enable row level security;
alter table "Profile" enable row level security;

-- User：允许读取自己 + 有 ACTIVE 卡片的用户（推荐页需要 join）
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

-- Profile：允许读取自己 + 有 ACTIVE 卡片的用户资料
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

-- Swipe：允许用户创建和查看自己的滑卡记录
alter table "Swipe" enable row level security;

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

-- Match：允许用户创建和查看自己的匹配
alter table "Match" enable row level security;

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

-- ContactRequest：允许匹配双方发起和查看联系申请
alter table "ContactRequest" enable row level security;

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

-- Block：允许用户创建和查看自己的拉黑记录
alter table "Block" enable row level security;

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

-- Report：允许用户提交自己的举报
alter table "Report" enable row level security;

drop policy if exists "report_insert_own" on "Report";
create policy "report_insert_own"
on "Report"
for insert
to authenticated
with check ("reporterId" = auth.uid()::text);
```

## 6. 当前能力边界

- 已支持：Supabase 注册 / 登录、登录用户直接发布 ACTIVE 卡片（免审核）、Supabase 直连推荐、滑卡、双向匹配、联系申请、举报和拉黑。
- 尚不支持：AI 智能解析（有本地 fallback）、后台审核写操作。
- 保留代码：NestJS API 和 Prisma 服务端逻辑先不删，等 Netlify + Supabase MVP 跑稳后再选择是否迁回服务端。

## 7. 测试推荐和滑卡

推荐和滑卡需要至少有 `status = 'ACTIVE'` 的卡片。步骤：

1. 先执行第 4 节的预设数据 SQL。
2. 用真实邮箱注册账号。
3. 建卡（直接 ACTIVE，免审核）。
4. 进入滑卡页面，应该能看到预设的演示卡片。
