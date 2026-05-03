# LinkU

LinkU 是一个面向大学生的校园滑卡匹配平台。它不做传统论坛和信息流，而是让用户用一句话创建卡片，在家教、搭子、学长学姐经验咨询等场景里更轻地找到合适的人。

## 核心功能

- 家教专区：找家教、当家教，按科目、价格、时间、学校、线上/线下和认证状态匹配。
- 搭子专区：饭搭子、自习搭子、运动搭子、黑客松队友、英语口语搭子等轻社交场景。
- 学长学姐专区：保研考研经验、简历修改、项目修改、AI coding 陪跑、竞赛经验等高价值资源。
- 智能建卡：需求解析、卡片生成、匹配理由、内容审核和安全提示。
- 信任安全：双向匹配后沟通、举报、拉黑、审核和线下安全提示。

## 技术栈

- Monorepo：pnpm workspace
- Web：Next.js、TypeScript、Tailwind CSS、Framer Motion
- API：NestJS、TypeScript、REST API
- 数据库：PostgreSQL、Prisma ORM
- 认证：Supabase Auth 第一阶段接入
- AI：OpenAI-compatible Provider 抽象，可接 DeepSeek 等模型服务

## 本地启动

本地开发需要 Node.js 20+、pnpm 10+ 和 PostgreSQL。

```bash
pnpm install
Copy-Item .env.example .env
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm dev
```

也可以分别启动：

```bash
pnpm --filter @linku/api dev
pnpm --filter @linku/web dev
```

默认地址：

- Web：http://localhost:3000
- API：http://localhost:4000

## 环境变量

复制 `.env.example` 后填写本地配置。真实 `.env`、API Key、数据库密码、`JWT_SECRET` 不要提交到 Git。

```env
DATABASE_URL=
JWT_SECRET=
SUPABASE_URL=
SUPABASE_JWT_SECRET=
SUPABASE_JWKS_URL=
SUPABASE_AUTH_ISSUER=
SUPABASE_AUTH_AUDIENCE=authenticated
SUPABASE_ADMIN_EMAILS=
AI_PROVIDER=openai-compatible
OPENAI_COMPATIBLE_BASE_URL=
OPENAI_COMPATIBLE_API_KEY=
OPENAI_COMPATIBLE_MODEL=
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 数据库与 seed 数据

数据库使用 Prisma 和 PostgreSQL。本地快速同步 schema：

```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

`pnpm db:seed` 会写入三大专区、演示用户、卡片、匹配、举报和会员相关演示数据。生产环境不要直接运行演示 seed。

## 部署说明

MVP 推荐架构：

- Web：Netlify
- 数据库与认证：Supabase Postgres + Supabase Auth
- API：Render、Railway 或 Fly 托管 NestJS 服务

详细说明见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)。

## 本地验证

阶段交付前至少运行：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm smoke
pnpm --filter @linku/api build
pnpm --filter @linku/web build
```

数据库相关变更还需要运行：

```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

## 当前任务

详细阶段状态见 [docs/TASKS.md](docs/TASKS.md)。当前重点是阶段 12 的真实认证、阶段 15 的去 mock 业务闭环，以及阶段 16 的云部署 MVP。

## 安全边界

LinkU 不鼓励擦边内容、骚扰、隐私买卖、性暗示匹配或不安全线下行为。搭子专区允许轻社交，但必须保留关系边界、双向匹配、举报拉黑、内容审核、安全提醒和联系方式保护。
