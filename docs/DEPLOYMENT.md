# LinkU MVP 部署说明

LinkU 当前优先采用两段式部署：Netlify 托管 Web，Supabase 提供 Postgres 与 Auth。已有 NestJS API 先保留在仓库中，不为这次上线做大重构；等真实注册和建卡跑通后，再决定是否把 AI、推荐和审核能力接回独立 API。

## 最小上线方案

1. Supabase
   - 创建项目，开启 Email Auth。
   - 使用 Supabase Postgres 作为生产数据库。
   - 用 `pnpm db:push` 初始化表结构，或后续切换到 Prisma migration。
   - 运行 [SUPABASE_MVP_SETUP.md](SUPABASE_MVP_SETUP.md) 中的基础专区数据和 RLS 策略。

2. Netlify Web
   - 连接 GitHub 仓库，Base directory 设为仓库根目录。
   - 构建命令：`pnpm install --frozen-lockfile && pnpm --filter @linku/web build`
   - 发布目录由 Netlify Next.js 适配器处理。
   - 配置 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`NEXT_PUBLIC_LINKU_DATA_MODE=supabase`。

3. 暂缓项
   - NestJS API、DeepSeek、服务端推荐、后台审核写操作暂不部署。
   - 这些代码不删除、不重构，后续作为阶段 18 重新接入。

## 环境变量

API 服务：

```env
DATABASE_URL=
JWT_SECRET=
SUPABASE_URL=
SUPABASE_JWT_SECRET=
SUPABASE_JWKS_URL=
SUPABASE_AUTH_ISSUER=
SUPABASE_AUTH_AUDIENCE=authenticated
SUPABASE_ADMIN_EMAILS=
WEB_ORIGIN=
AI_PROVIDER=openai-compatible
OPENAI_COMPATIBLE_BASE_URL=
OPENAI_COMPATIBLE_API_KEY=
OPENAI_COMPATIBLE_MODEL=
```

Web 服务：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_LINKU_DATA_MODE=supabase
```

真实 `.env`、API Key、数据库密码、`JWT_SECRET` 不允许提交到 Git。

## 数据库初始化

首次部署到空数据库时：

```bash
pnpm db:generate
pnpm db:push
```

seed 只建议用于本地或演示环境：

```bash
pnpm db:seed
```

正式上线前，阶段 13 需要切换到 Prisma migrations，并补生产初始化脚本。

## 发布前验证

本地至少运行：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm smoke
pnpm --filter @linku/api build
pnpm --filter @linku/web build
```

部署后检查：

- `GET /health` 返回 `status: "ok"`。
- Web 能正常登录、建卡、滑卡。
- 生产界面不出现演示、mock、fallback、Provider、JWT 等字样。

## 后续独立 API 方案

如果后续重新启用 NestJS API，再补充：

```env
DATABASE_URL=
JWT_SECRET=
SUPABASE_URL=
SUPABASE_JWT_SECRET=
SUPABASE_JWKS_URL=
SUPABASE_AUTH_ISSUER=
SUPABASE_AUTH_AUDIENCE=authenticated
SUPABASE_ADMIN_EMAILS=
WEB_ORIGIN=
AI_PROVIDER=openai-compatible
OPENAI_COMPATIBLE_BASE_URL=
OPENAI_COMPATIBLE_API_KEY=
OPENAI_COMPATIBLE_MODEL=
NEXT_PUBLIC_API_BASE_URL=https://你的-api-域名
```

API 构建命令：

```bash
pnpm install --frozen-lockfile
pnpm --filter @linku/api db:generate
pnpm --filter @linku/api build
```
