# LinkU MVP 任务清单

## 当前进度（2026-05-03 更新）

### 已完成

- **阶段 0-11**：仓库初始化 → 本地联调，全部完成
- **阶段 12（部分）**：Supabase Auth 前端登录/注册、NestJS API 验证、用户同步、生产禁用演示登录
- **阶段 15（部分）**：Swipe/Profile Supabase 直连、建卡直接 ACTIVE、Netlify 部署
- **阶段 16（部分）**：Netlify + Supabase 直连架构已上线 https://linkuni.netlify.app/

### 本次会话修复的代码问题（未部署，待 push）

1. **隐藏审核台入口**：导航栏移除 `/admin` 链接（MVP 免审核，不需要暴露）
2. **修正建卡提示文字**：所有"等待审核"改为"卡片已发布！"
3. **Profile 页面卡片不显示**：修复 session 时序问题（加 `isReady` 检查）、Supabase 错误不再静默吞掉、加了 console.error 日志
4. **滑卡页 session 时序**：同样加了 `isReady` 检查和错误日志
5. **文档更新**：SUPABASE_MVP_SETUP.md 补充了预设数据 SQL、RLS 策略更新说明

### 待在 Supabase Dashboard 手动完成（代码改不了，必须手动）

**以下操作在 Supabase Dashboard → SQL Editor 执行：**

1. **确认所有用户邮箱**（关不掉 Confirm email 的替代方案）：
   ```sql
   UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;
   ```

2. **更新 RLS 策略**（解决推荐页 join User/Profile 为 null 的问题 + 补齐 Match/Swipe/Block 策略）：
   ```sql
   -- User：允许读取自己 + 有 ACTIVE 卡片的用户
   DROP POLICY IF EXISTS "user_select_self" ON "User";
   CREATE POLICY "user_select_self_or_active_card_owner"
   ON "User" FOR SELECT TO authenticated
   USING (
     "id" = auth.uid()::text
     OR EXISTS (SELECT 1 FROM "Card" WHERE "Card"."userId" = "User"."id" AND "Card"."status" = 'ACTIVE')
   );

   -- Profile：允许读取自己 + 有 ACTIVE 卡片的用户资料
   ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
   DROP POLICY IF EXISTS "profile_select_visible" ON "Profile";
   CREATE POLICY "profile_select_visible"
   ON "Profile" FOR SELECT TO authenticated
   USING (
     "userId" = auth.uid()::text
     OR EXISTS (SELECT 1 FROM "Card" WHERE "Card"."userId" = "Profile"."userId" AND "Card"."status" = 'ACTIVE')
   );

   -- Match：允许用户查看自己的匹配
   ALTER TABLE "Match" ENABLE ROW LEVEL SECURITY;
   DROP POLICY IF EXISTS "match_select_own" ON "Match";
   CREATE POLICY "match_select_own"
   ON "Match" FOR SELECT TO authenticated
   USING ("userAId" = auth.uid()::text OR "userBId" = auth.uid()::text);

   -- Swipe：允许用户查看自己的滑卡记录
   ALTER TABLE "Swipe" ENABLE ROW LEVEL SECURITY;
   DROP POLICY IF EXISTS "swipe_select_own" ON "Swipe";
   CREATE POLICY "swipe_select_own"
   ON "Swipe" FOR SELECT TO authenticated
   USING ("swiperId" = auth.uid()::text);

   -- Block：允许用户查看自己的拉黑记录
   ALTER TABLE "Block" ENABLE ROW LEVEL SECURITY;
   DROP POLICY IF EXISTS "block_select_own" ON "Block";
   CREATE POLICY "block_select_own"
   ON "Block" FOR SELECT TO authenticated
   USING ("blockerId" = auth.uid()::text);
   ```

3. **插入预设演示数据**（见 `docs/SUPABASE_MVP_SETUP.md` 第 4 节完整 SQL）：4 个演示用户 + 4 张预设卡片（家教/搭子/学长学姐各至少一张）

### 重要技术备注

1. **数据库 DEFAULT**：所有表的 id、createdAt、updatedAt 已在数据库层加 DEFAULT。Prisma 的 @default(uuid()) 和 @updatedAt 只在 Prisma Client 写入时生效，Supabase 直连需要数据库层 DEFAULT。
2. **建卡免审核**：卡片状态直接为 ACTIVE，不走 PENDING 审核流程。前端 `supabase.ts` 和后端 `cards.service.ts` 均已改为 ACTIVE。
3. **环境变量**：Netlify 的 NEXT_PUBLIC_SUPABASE_ANON_KEY 粘贴时不能有换行或空格，否则 JWT 截断导致 401。
4. **认证代理**：新增 `/api/auth/[...path]` 服务端代理，浏览器直连 Supabase 失败时自动回退。
5. **Supabase 邮件确认**：Dashboard 关不掉 Confirm email，用 SQL 手动确认用户作为替代方案。
6. **RLS 已知缺陷**：之前只有 User/Zone/Card 三张表有 RLS 策略，Profile/Match/Swipe/Block 缺失，导致 Profile 页 join 查询和匹配计数查询静默失败。需手动执行上面的 SQL 补齐。
7. **详细会话记录**：见 docs/SESSION_LOG.md。

---

## 阶段 0：仓库初始化 ✅

- [x] 初始化 Git 仓库
- [x] 初始化 pnpm workspace
- [x] 创建 Web、API、shared 包
- [x] 添加 README、`.env.example`、ESLint、Prettier、TypeScript 配置

## 阶段 1：产品与工程文档 ✅

- [x] PRD、系统架构、API 设计、数据库设计、AI Prompt 设计
- [x] 开发路线图与任务清单

## 阶段 2：数据库设计 ✅

- [x] Prisma schema
- [x] 用户、资料、专区、卡片、滑卡、匹配、联系申请、举报、拉黑、审核、会员相关表
- [x] seed 数据

## 阶段 3：后端基础框架 ✅

- [x] Auth、Users、Profiles、Zones、Cards 模块
- [x] 基础 REST API
- [x] 开发演示登录

## 阶段 4：前端基础页面 ✅

- [x] 首页、专区、建卡、滑卡、匹配弹窗、个人中心、审核台

## 阶段 5：滑卡核心闭环 ✅

- [x] 推荐 API
- [x] 左滑 / 右滑
- [x] 滑卡记录持久化
- [x] 双向匹配与联系申请入口

## 阶段 6：LinkU 智能建卡 ✅

- [x] Provider 抽象
- [x] 需求解析、卡片生成、匹配理由、破冰话术、内容审核
- [x] Zod 输出校验与兜底机制

## 阶段 7：安全与风控 ✅

- [x] 举报、拉黑、敏感词、内容审核、联系保护、安全提示、审核台

## 阶段 8：会员与学长学姐专区 ✅

- [x] 每日滑卡额度
- [x] 会员状态占位
- [x] 学长学姐专区入口
- [x] 支付 API 占位

## 阶段 9：验证与交付 ✅

- [x] README 本地启动说明
- [x] 本地验证清单
- [x] seed 数据说明
- [x] 基础测试
- [x] 部署说明

## 阶段 10：CI 与轻量测试 ✅

- [x] GitHub Actions CI
- [x] API 最小单测
- [x] 本地验证命令同步 CI

## 阶段 11：本地真实联调 ✅

- [x] PostgreSQL Docker Compose
- [x] Prisma `db push` + seed
- [x] Web 调 API 健康检查
- [x] 登录、AI 解析、卡片生成、保存卡片跑通

## 阶段 12：去 mock 认证与用户体系（进行中）

- [x] 接入 Supabase Auth 前端登录 / 注册
- [x] NestJS API 验证 Supabase 会话
- [x] Supabase 用户自动同步到本地 User
- [x] 生产环境默认禁用演示登录
- [x] Supabase-only 模式下前端可同步当前用户到 `"User"` 表
- [ ] 找回登录能力
- [ ] 用户资料必填项校验
- [ ] 管理员初始化与角色维护方案
- [ ] 邮箱验证码 / OAuth / 校园邮箱白名单策略定稿

## 阶段 13：生产级数据库与迁移

- [ ] 从 `prisma db push` 切换到 Prisma migrations
- [ ] 创建首个 migration
- [ ] 生产数据库初始化脚本
- [ ] seed 拆分为 demo seed 和 production seed
- [ ] 备份与恢复方案
- [ ] 连接池与连接数限制

## 阶段 14：生产安全与风控上线

- [ ] CORS 按生产域名收紧
- [ ] Helmet / 安全响应头
- [ ] API rate limit
- [ ] 输入长度与上传大小复核
- [ ] 云平台 Secret 配置复核
- [ ] 管理后台真实权限保护
- [ ] 举报审核工作流生产化

## 阶段 15：去 mock 业务闭环（进行中）

- [x] Swipe 页面 Supabase 直连推荐、滑卡、匹配
- [x] Profile 页面 Supabase 直连展示真实卡片和匹配数
- [x] 建卡直接 ACTIVE，跳过审核
- [x] Netlify + Supabase 直连模式下建卡页可发布卡片
- [x] Profile 页 session 时序 bug 修复 + Supabase 错误日志
- [x] 滑卡页 session 时序 bug 修复
- [x] 导航栏隐藏审核台入口
- [x] 建卡提示文字修正（免审核）
- [ ] Admin 页面 Supabase 直连
- [ ] 我的资料编辑页（学校、城市、年级、专业）
- [ ] 会员状态从占位表切换为真实权益表
- [ ] 学长学姐专区 MVP 规则定稿
- [ ] 支付保持禁用或接入真实支付沙箱
- [ ] 空状态、错误状态、加载状态补齐

## 阶段 16：云部署 MVP（进行中）

- [x] 调整首发架构：Netlify Web + Supabase Postgres/Auth
- [x] 保留 NestJS API，不为首发重构或部署
- [x] 增加 Supabase-only 建卡配置说明
- [x] 创建 Supabase 项目
- [x] 部署 Netlify Web（https://linkuni.netlify.app/）
- [x] 配置生产环境变量
- [x] 初始化 Supabase schema、Zone 数据和 RLS 策略
- [ ] **补齐 RLS 策略**（Profile/Match/Swipe/Block，需手动在 Dashboard 执行 SQL）
- [ ] **插入预设演示数据**（需手动在 Dashboard 执行 SQL）
- [ ] **手动确认用户邮箱**（需手动在 Dashboard 执行 SQL）
- [ ] 配置自定义域名（可选）
- [ ] 部署后完整 smoke test

## 阶段 17：上线前验收

- [ ] 真实用户注册登录
- [ ] 真实建卡
- [ ] 真实解析与卡片生成
- [ ] 真实推荐列表
- [ ] 真实滑卡与匹配
- [ ] 真实联系申请
- [ ] 举报 / 拉黑 / Admin 审核
- [ ] 移动端关键页面检查
- [ ] 生产错误日志检查
- [ ] README / docs 同步上线状态

## 阶段 18：后续服务端能力回接

- [ ] 评估是否恢复独立 NestJS API 部署
- [ ] 智能建卡重新接入服务端模型调用
- [ ] 推荐、滑卡、匹配闭环迁回服务端规则
- [ ] Admin 审核写操作迁回受保护 API
- [ ] 支付与会员权益服务端化

## Supabase 直连架构说明

MVP 阶段前端直接通过 Supabase JS Client 操作数据库，不经过 NestJS API。相关代码集中在：

- `apps/web/src/lib/supabase.ts` — Supabase 客户端、Session 管理、所有直连数据操作
- `apps/web/src/app/swipe/swipe-experience.tsx` — 三种数据模式（supabase/api/mock）
- `apps/web/src/app/profile/profile-dashboard.tsx` — Profile 直连
- `apps/web/src/components/onboarding-stepper.tsx` — 建卡直连

RLS 策略覆盖的表：User, Zone, Card（已配置）；Profile, Match, Swipe, Block（待补齐，见上方 SQL）。

数据模式由 `NEXT_PUBLIC_LINKU_DATA_MODE` 控制：
- `supabase`：直连 Supabase（线上 Netlify）
- `api`：通过 NestJS API（本地开发联调）
- 未设置 + 非 production：fallback mock 数据
