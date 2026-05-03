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

## 4. RLS 策略

开启 Row Level Security，并允许登录用户创建自己的用户记录和卡片：

```sql
alter table "User" enable row level security;
alter table "Zone" enable row level security;
alter table "Card" enable row level security;

drop policy if exists "user_select_self" on "User";
create policy "user_select_self"
on "User"
for select
to authenticated
using ("id" = auth.uid()::text);

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
```

## 5. 当前能力边界

- 已支持：Supabase 注册 / 登录、登录用户发布待审核卡片、Supabase 直连推荐、滑卡、双向匹配、联系申请、举报和拉黑。
- 暂不支持：AI 智能解析（有本地 fallback）、后台审核写操作。
- 保留代码：NestJS API 和 Prisma 服务端逻辑先不删，等 Netlify + Supabase MVP 跑稳后再选择是否迁回服务端。

## 6. 测试推荐和滑卡

推荐和滑卡需要至少有 `status = 'ACTIVE'` 的卡片。测试步骤：

1. 注册两个不同邮箱的账号。
2. 分别建卡（使用建卡页面）。
3. 在 Supabase SQL Editor 或通过 API 把卡片 `status` 从 `PENDING` 改为 `ACTIVE`。
4. 用其中一个账号进入滑卡页面，应该能看到另一个账号的卡片。
5. 右滑后切换到另一个账号，也右滑，即触发匹配。
