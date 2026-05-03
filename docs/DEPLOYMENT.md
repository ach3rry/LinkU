# LinkU MVP 部署说明

LinkU MVP 采用三段式部署：Netlify 托管 Web，Supabase 提供 Postgres 与 Auth，NestJS API 独立部署到 Render、Railway 或 Fly。当前不建议把 NestJS API 直接塞进 Supabase Edge Functions，除非后续决定重写为 Deno/Edge 版本。

## 最小上线方案

1. Supabase
   - 创建项目，开启 Email Auth。
   - 使用 Supabase Postgres 作为生产数据库。
   - 在 API 服务中配置 `DATABASE_URL`、`SUPABASE_URL`，以及 `SUPABASE_JWT_SECRET` 或 `SUPABASE_JWKS_URL`。
   - 管理员先用 `SUPABASE_ADMIN_EMAILS` 白名单控制，后续再做后台角色管理。

2. NestJS API
   - 首选 Render 或 Railway 部署 Node 服务。
   - 构建命令：`pnpm install --frozen-lockfile && pnpm --filter @linku/api db:generate && pnpm --filter @linku/api build`
   - 启动命令：`pnpm --filter @linku/api start`
   - 配置 `WEB_ORIGIN` 为 Netlify 域名，收紧 CORS。
   - 生产环境默认不开放演示登录；如需临时演示，必须显式设置 `ALLOW_MOCK_LOGIN=true`，演示后立即关闭。

3. Netlify Web
   - 连接 GitHub 仓库，Base directory 设为仓库根目录。
   - 构建命令：`pnpm install --frozen-lockfile && pnpm --filter @linku/web build`
   - 发布目录由 Netlify Next.js 适配器处理。
   - 配置 `NEXT_PUBLIC_API_BASE_URL`、`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`。

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
NEXT_PUBLIC_API_BASE_URL=https://你的-api-域名
NEXT_PUBLIC_SUPABASE_URL=https://你的-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
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
- API 只接受 Supabase 会话或明确允许的开发令牌。
- 生产界面不出现演示、mock、fallback、Provider、JWT 等字样。
