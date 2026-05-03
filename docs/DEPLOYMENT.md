# LinkU MVP 部署说明

MVP 推荐拆分为 Web、API、PostgreSQL 三部分部署，保持轻量、可替换。

## 推荐拓扑

- Web：Vercel、Netlify 或支持 Next.js 的 Node 平台。
- API：Railway、Render、Fly.io、Zeabur 或自管 Node.js 服务。
- 数据库：托管 PostgreSQL。
- AI：任意 OpenAI-compatible Provider；未配置时走 fallback。

## 环境变量

API 服务需要：

```env
DATABASE_URL=
JWT_SECRET=
AI_PROVIDER=openai-compatible
OPENAI_COMPATIBLE_BASE_URL=
OPENAI_COMPATIBLE_API_KEY=
OPENAI_COMPATIBLE_MODEL=
```

Web 服务需要：

```env
NEXT_PUBLIC_API_BASE_URL=https://你的-api-域名
```

生产环境必须使用强随机 `JWT_SECRET`，不要复用本地示例值。

## 构建命令

API：

```bash
pnpm install --frozen-lockfile
pnpm --filter @linku/api db:generate
pnpm --filter @linku/api build
```

启动命令：

```bash
pnpm --filter @linku/api start
```

Web：

```bash
pnpm install --frozen-lockfile
pnpm --filter @linku/web build
```

启动命令：

```bash
pnpm --filter @linku/web start
```

## 数据库初始化

首次部署到空数据库时：

```bash
pnpm db:generate
pnpm db:push
```

seed 只建议在演示环境运行：

```bash
pnpm db:seed
```

生产环境不要直接运行 seed，以免清空真实数据。后续正式上线前应切换到 Prisma migration 工作流。

## 发布前验证

部署前在本地运行：

```bash
pnpm lint
pnpm typecheck
pnpm smoke
pnpm --filter @linku/api build
pnpm --filter @linku/web build
```

部署后检查：

- API 健康检查：`GET /health` 返回 `status: "ok"`。
- Web 能访问并正确请求 `NEXT_PUBLIC_API_BASE_URL`。
- mock 登录、滑卡、匹配、联系申请、举报和 Admin 页面基础路径可用。

## MVP 注意事项

- 当前支付为占位和 mock，不接真实扣款。
- Premium Match 只做入口和状态展示，不做真实咨询履约。
- AI Provider 失败时应允许 fallback，避免核心闭环被外部模型服务阻断。
- CORS、真实校园认证、审计日志和 migration 流程是后续上线强化项。
