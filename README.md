# LinkU

LinkU 是一个面向大学生的 AI 校园滑卡匹配平台。它不做传统论坛和帖子信息流，而是通过类似 Tinder 的左右滑卡片交互，帮助学生快速匹配家教、校园搭子和高价值经验咨询资源。

## 核心功能

- 家教专区：找家教、当家教，按科目、学校、价格、时间、线上/线下、认证和评价匹配。
- 搭子专区：饭搭子、自习搭子、运动搭子、台球搭子、电影搭子、黑客松队友、英语口语搭子等轻社交场景。
- 学长学姐专区 / Premium Match：保研考研经验、简历修改、项目修改、AI coding 陪跑、竞赛经验等高价值资源匹配。
- AI Link：需求解析、卡片生成、匹配理由、破冰话术、内容审核和安全提示。
- 信任安全：双向匹配后沟通、举报、拉黑、内容审核、线下安全提示和资质认证预留。

## 技术栈

- Monorepo：pnpm workspace
- 前端：Next.js、TypeScript、Tailwind CSS、shadcn/ui 风格组件、Framer Motion
- 后端：NestJS、TypeScript、REST API
- 数据库：PostgreSQL、Prisma ORM
- 共享类型：packages/shared、Zod
- AI：OpenAI-compatible Provider 抽象，支持通过环境变量切换模型服务

## 目录结构

```txt
LinkU/
  apps/
    web/                 # Next.js 前端
    api/                 # NestJS 后端
  packages/
    shared/              # 前后端共享类型、常量、Zod Schema
  docs/                  # 产品、架构、API、数据库、路线图文档
  .env.example           # 环境变量示例，不包含真实密钥
  pnpm-workspace.yaml
  README.md
```

## 文档语言约定

项目文档、README、任务清单和阶段说明默认使用中文，必要的框架名、命令、API 名称和类型名保留英文，方便中文使用者快速理解和交接。

## 本地启动

本地开发需要 Node.js 20+、pnpm 10+ 和可访问的 PostgreSQL。首次运行建议按下面顺序启动：

```bash
pnpm install
Copy-Item .env.example .env
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm dev
```

也可以分别启动前后端：

```bash
pnpm --filter @linku/web dev
pnpm --filter @linku/api dev
```

默认地址：

- Web：http://localhost:3000
- API：http://localhost:4000

更完整的本地环境说明见 [docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md)。

## 环境变量

请复制 `.env.example` 为 `.env`，然后填写本地配置。真实密钥不要提交到 Git。

```env
DATABASE_URL=
JWT_SECRET=
AI_PROVIDER=openai-compatible
OPENAI_COMPATIBLE_BASE_URL=
OPENAI_COMPATIBLE_API_KEY=
OPENAI_COMPATIBLE_MODEL=
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

## 数据库与 seed 数据

数据库使用 Prisma。MVP 阶段优先使用 `db push` 快速同步本地 schema：

```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

后续进入更稳定阶段后，再切换到 Prisma migration 工作流。

`pnpm db:seed` 会写入三大专区、演示用户、卡片、一次双向匹配、联系申请、举报审核示例和会员 mock 数据。常用演示账号包括：

- `admin@linku.local`：管理后台演示用户
- `student@linku.local`：家教需求方
- `tutor@linku.local`：家教提供方
- `buddy@linku.local`：搭子专区演示用户
- `senior@linku.local`：Premium Match 演示用户

## AI Provider 配置

AI 层会按 OpenAI-compatible API 抽象，不绑定单一模型。你可以使用 OpenAI、DeepSeek、通义或其他兼容服务，只需要配置：

```env
OPENAI_COMPATIBLE_BASE_URL=
OPENAI_COMPATIBLE_API_KEY=
OPENAI_COMPATIBLE_MODEL=
```

如果没有配置 AI Key，系统应使用 fallback 逻辑完成需求解析、卡片生成、匹配理由和破冰话术。

## MVP 功能清单

- [x] mock login + JWT
- [x] 三大专区入口
- [x] 用户资料创建
- [x] AI 或 fallback 需求解析
- [x] AI 或 fallback 卡片生成
- [x] 推荐卡片
- [x] 左滑 / 右滑
- [x] 双向匹配
- [x] 联系申请
- [x] 举报 / 拉黑
- [x] 管理后台基础审核
- [x] Premium Match mock 展示

更细的阶段任务见 [docs/TASKS.md](docs/TASKS.md)。当前已完成阶段 0-9，MVP 已具备本地验证与交付说明。

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

数据库相关变更还需要额外运行：

```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

详细验证清单见 [docs/VERIFICATION.md](docs/VERIFICATION.md)。

## 部署说明

MVP 推荐将 Web、API 和 PostgreSQL 分开部署：Web 使用 Vercel 或同类 Next.js 平台，API 使用 Railway、Render、Fly.io 或自管 Node.js 服务，数据库使用托管 PostgreSQL。部署前请确认环境变量、Prisma Client 生成、构建命令和 `/health` 健康检查。

详细部署步骤见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)。

## Roadmap

- 第一阶段：跑通 Web MVP 闭环。
- 第二阶段：接入真实校园邮箱认证和更完整的安全审核。
- 第三阶段：完善 Premium Match 的咨询履约与付费能力。
- 第四阶段：引入更精细的推荐策略、数据分析和移动端体验。

## 安全边界

LinkU 不鼓励低俗 dating、擦边内容、骚扰、隐私买卖、性暗示匹配或不安全线下行为。搭子专区允许轻社交，但必须保留关系边界、双向匹配、举报拉黑、内容审核、安全提醒和联系方式保护。

## 截图区域

后续完成前端页面后，可在这里补充 Landing、Onboarding、Swipe、Match Success 和 Admin 页面截图。

## License

MVP 阶段暂不指定开源协议。正式开源前请补充 License。
