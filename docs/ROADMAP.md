# LinkU 开发路线图

## Phase 0 仓库初始化

目标：让项目从第一天就具备长期维护的工程基础。

- pnpm workspace。
- apps/web。
- apps/api。
- packages/shared。
- TypeScript。
- ESLint / Prettier。
- README。
- .gitignore。
- .env.example。

验收：依赖可安装，lint 和 typecheck 可运行。

## Phase 1 产品与工程文档

目标：把 PRD、架构、API、数据库、AI Prompt 和任务拆解写清楚。

- docs/PRD.md。
- docs/ARCHITECTURE.md。
- docs/API.md。
- docs/DATABASE.md。
- docs/AI_PROMPTS.md。
- docs/ROADMAP.md。
- docs/TASKS.md。

验收：文档能支持后续开发，不需要靠口头记忆推进。

## Phase 2 数据库设计

目标：建立 Prisma schema 和 seed 数据。

- users。
- profiles。
- zones。
- cards。
- swipes。
- matches。
- contact_requests。
- reports。
- blocks。
- ai_logs。
- moderation_results。
- subscriptions mock。
- seed 数据。

验收：`pnpm db:generate` 可运行，seed 数据结构可读。

## Phase 3 后端基础框架

目标：搭建 NestJS 业务模块和基础 REST API。

- Auth module。
- User module。
- Profile module。
- Zone module。
- Card module。
- mock login + JWT。
- 基础 DTO 或 Zod 校验。

验收：API 可启动，能完成 mock 登录和基础数据读取。

## Phase 4 前端基础页面

目标：搭建 MVP 主路径页面。

- Landing Page。
- Zone Selection。
- Onboarding。
- Swipe 页面。
- Match Success。
- Profile。
- Admin Mock。

验收：Web 可启动，主页面可浏览。

## Phase 5 滑卡核心闭环

目标：跑通推荐、滑卡和双向匹配。

- 推荐卡片接口。
- SwipeCard 组件。
- 左滑/右滑交互。
- swipes 记录。
- 双向匹配判断。
- Match Success Modal。
- 联系申请入口。

验收：使用 seed 用户可以制造一次双向匹配。

## Phase 6 AI Link

目标：接入 AI Provider 抽象和 fallback。

- OpenAI-compatible Provider。
- parse-demand。
- generate-card。
- match-reason。
- icebreaker。
- moderation。
- Zod 校验。
- fallback。

验收：无 AI Key 也能跑通，有 AI Key 时能调用真实模型。

## Phase 7 安全与风控

目标：补齐 MVP 安全闭环。

- 举报。
- 拉黑。
- 敏感词规则。
- 内容审核状态。
- 联系方式保护。
- 线下安全提示。
- 管理后台基础审核。

验收：被拉黑和被举报内容不会继续正常推荐。

## Phase 8 会员与 Premium Match mock

目标：保留商业化展示，不接真实支付。

- 免费次数限制 mock。
- 会员状态 mock。
- Premium Match 展示。
- 付费接口预留。

验收：前端能展示会员状态和 Premium 入口。

## Phase 9 测试、README 与部署说明

目标：让项目能作为作品集展示和交接。

- README 完善。
- 本地启动步骤。
- 环境变量说明。
- seed 使用说明。
- 基础测试。
- 常见问题。

验收：新开发者可以按 README 跑起来。
