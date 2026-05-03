# Codex 开发交接提示词

## 项目概述

LinkU 是一个校园互助匹配平台（家教/搭子/学长学姐），Next.js 前端 + NestJS 后端 + Supabase Postgres/Auth，monorepo 结构。

- **线上地址**：https://linkuni.netlify.app/
- **技术栈**：Next.js 14 (App Router) + NestJS + Prisma + Supabase + TailwindCSS
- **仓库**：pnpm workspace，`apps/web`（前端）、`apps/api`（后端）、`packages/shared`（共享类型）

## 已完成阶段

| 阶段 | 状态 | 说明 |
|------|------|------|
| 0-11 | ✅ 全部完成 | 仓库初始化 → 本地联调 |
| 12 | 🔶 部分完成 | Supabase Auth 登录/注册/同步已完成；找回登录、OAuth 待做 |
| 13 | ❌ 未开始 | Prisma migrations |
| 14 | ❌ 未开始 | 生产安全 |
| 15 | 🔶 部分完成 | Swipe/Profile 直连已完成；Admin 直连、资料编辑、空状态待做 |
| 16 | 🔶 部分完成 | Netlify 部署已上线；RLS 补齐、预设数据、smoke test 待做 |
| 17-18 | ❌ 未开始 | 上线验收、服务端回接 |

## 当前架构

MVP 阶段前端直接通过 Supabase JS Client 操作数据库，不走 NestJS API：

- `apps/web/src/lib/supabase.ts` — Supabase 客户端、Session 管理、所有直连数据操作
- `apps/web/src/app/swipe/swipe-experience.tsx` — 滑卡页（三种数据模式）
- `apps/web/src/app/profile/profile-dashboard.tsx` — Profile 页
- `apps/web/src/components/onboarding-stepper.tsx` — 建卡页
- `apps/web/src/components/site-header.tsx` — 导航栏
- 数据模式由 `NEXT_PUBLIC_LINKU_DATA_MODE=supabase` 控制

## 当前代码中有未部署的修复

本次会话修改了以下文件但**尚未 push**：

1. `apps/web/src/components/site-header.tsx` — 移除审核台入口
2. `apps/web/src/components/onboarding-stepper.tsx` — 建卡提示文字修正
3. `apps/web/src/app/profile/profile-dashboard.tsx` — session 时序 + 错误日志
4. `apps/web/src/app/swipe/swipe-experience.tsx` — session 时序 + 错误日志
5. `apps/web/src/lib/supabase.ts` — 关键查询加 console.error
6. `docs/TASKS.md` — 任务清单更新
7. `docs/SESSION_LOG.md` — 会话记录更新
8. `docs/SUPABASE_MVP_SETUP.md` — 预设数据 SQL + RLS 策略更新

## 待在 Supabase Dashboard 手动完成（代码改不了）

需要在 **Supabase Dashboard → SQL Editor** 执行（完整 SQL 见 `docs/TASKS.md` 顶部）：

1. **确认所有用户邮箱**：`UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;`
2. **补齐 RLS 策略**：Profile、Match、Swipe、Block 四张表
3. **插入预设演示数据**：4 个演示用户 + 4 张卡片（`docs/SUPABASE_MVP_SETUP.md` 第 4 节）

## 下一步开发优先级

### P0：先推代码 + 手动 SQL + 验证闭环
1. Push 代码触发 Netlify 部署
2. 在 Supabase SQL Editor 执行上面 3 段 SQL
3. 用两个账号走通：注册 → 建卡 → 滑卡 → 匹配 → 联系申请

### P1：体验优化
- 空状态/错误状态/加载状态补齐（建卡页、滑卡页、Profile 页）
- 用户资料编辑页（学校、城市、年级、专业）
- 滑卡页空状态引导用户去建卡

### P2：去 mock
- Admin 页面 Supabase 直连
- 会员状态从占位切换为真实权益
- 学长学姐专区 MVP 规则定稿

### P3：生产准备
- Prisma migrations（从 db push 切换）
- CORS / Rate limit / 安全响应头
- 自定义域名、备份方案

## 关键约束

1. **不要推倒重来**，严格在现有代码上迭代
2. **数据库连接串和密钥在 `.env` 文件里，不要提交到 GitHub**
3. **建卡免审核**：卡片状态直接 ACTIVE，不需要审核流程
4. **Supabase 直连模式**：MVP 阶段前端直接操作 Supabase，NestJS API 保留但不部署
5. **每完成一个小模块就提醒 commit**
6. **环境变量**：Netlify 的 NEXT_PUBLIC_SUPABASE_ANON_KEY 不能有换行或空格
