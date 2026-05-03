# LinkU MVP 任务清单

## 当前进度

- 阶段 0-11 已完成。
- 阶段 12 已开始：Supabase Auth 前端登录 / 注册已完成；找回登录、用户资料必填项校验、管理员角色、OAuth 等待后续。
- 阶段 15 已开始：Swipe、Profile 页面已支持 Supabase 直连；Admin 页面待改造；空状态和加载状态待补齐。
- 阶段 16 已基本完成：Netlify Web 已部署至 https://linkuni.netlify.app/ ；Supabase Postgres schema、Zone 数据、RLS 策略已初始化。
- **Supabase 直连模式已支持完整的 MVP 闭环**：注册 → 建卡（直接 ACTIVE，免审核）→ 推荐 → 滑卡 → 双向匹配 → 联系申请 → 举报/拉黑。

### 重要技术备注

1. **数据库 DEFAULT**：所有表的 id、createdAt、updatedAt 已在数据库层加 DEFAULT。Prisma 的 @default(uuid()) 和 @updatedAt 只在 Prisma Client 写入时生效，Supabase 直连需要数据库层 DEFAULT。
2. **建卡免审核**：卡片状态直接为 ACTIVE，不走 PENDING 审核流程。前端 `supabase.ts` 和后端 `cards.service.ts` 均已改为 ACTIVE。
3. **环境变量**：Netlify 的 NEXT_PUBLIC_SUPABASE_ANON_KEY 粘贴时不能有换行或空格，否则 JWT 截断导致 401。
4. **认证代理**：新增 `/api/auth/[...path]` 服务端代理，浏览器直连 Supabase 失败时自动回退。
5. **Supabase 邮件确认**：默认开启，建议 MVP 阶段在 Dashboard 关掉（Authentication → Providers → Email → Confirm email）。
6. **详细会话记录**：见 docs/SESSION_LOG.md。

## 阶段 0：仓库初始化

- [x] 初始化 Git 仓库
- [x] 初始化 pnpm workspace
- [x] 创建 Web、API、shared 包
- [x] 添加 README、`.env.example`、ESLint、Prettier、TypeScript 配置

## 阶段 1：产品与工程文档

- [x] PRD、系统架构、API 设计、数据库设计、AI Prompt 设计
- [x] 开发路线图与任务清单

## 阶段 2：数据库设计

- [x] Prisma schema
- [x] 用户、资料、专区、卡片、滑卡、匹配、联系申请、举报、拉黑、审核、会员相关表
- [x] seed 数据

## 阶段 3：后端基础框架

- [x] Auth、Users、Profiles、Zones、Cards 模块
- [x] 基础 REST API
- [x] 开发演示登录

## 阶段 4：前端基础页面

- [x] 首页、专区、建卡、滑卡、匹配弹窗、个人中心、审核台

## 阶段 5：滑卡核心闭环

- [x] 推荐 API
- [x] 左滑 / 右滑
- [x] 滑卡记录持久化
- [x] 双向匹配与联系申请入口

## 阶段 6：LinkU 智能建卡

- [x] Provider 抽象
- [x] 需求解析、卡片生成、匹配理由、破冰话术、内容审核
- [x] Zod 输出校验与兜底机制

## 阶段 7：安全与风控

- [x] 举报、拉黑、敏感词、内容审核、联系保护、安全提示、审核台

## 阶段 8：会员与学长学姐专区

- [x] 每日滑卡额度
- [x] 会员状态占位
- [x] 学长学姐专区入口
- [x] 支付 API 占位

## 阶段 9：验证与交付

- [x] README 本地启动说明
- [x] 本地验证清单
- [x] seed 数据说明
- [x] 基础测试
- [x] 部署说明

## 阶段 10：CI 与轻量测试

- [x] GitHub Actions CI
- [x] API 最小单测
- [x] 本地验证命令同步 CI

## 阶段 11：本地真实联调

- [x] PostgreSQL Docker Compose
- [x] Prisma `db push` + seed
- [x] Web 调 API 健康检查
- [x] 登录、AI 解析、卡片生成、保存卡片跑通

## 阶段 12：去 mock 认证与用户体系

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

## 阶段 15：去 mock 业务闭环

- [x] Swipe 页面 Supabase 直连推荐、滑卡、匹配
- [x] Profile 页面 Supabase 直连展示真实卡片和匹配数
- [x] 建卡直接 ACTIVE，跳过审核
- [x] Netlify + Supabase 直连模式下建卡页可发布卡片
- [ ] Admin 页面 Supabase 直连
- [ ] 我的资料编辑页（学校、城市、年级、专业）
- [ ] 会员状态从占位表切换为真实权益表
- [ ] 学长学姐专区 MVP 规则定稿
- [ ] 支付保持禁用或接入真实支付沙箱
- [ ] 空状态、错误状态、加载状态补齐

## 阶段 16：云部署 MVP

- [x] 调整首发架构：Netlify Web + Supabase Postgres/Auth
- [x] 保留 NestJS API，不为首发重构或部署
- [x] 增加 Supabase-only 建卡配置说明
- [x] 创建 Supabase 项目
- [x] 部署 Netlify Web（https://linkuni.netlify.app/）
- [x] 配置生产环境变量
- [x] 初始化 Supabase schema、Zone 数据和 RLS 策略
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

RLS 策略覆盖的表：User, Zone, Card, Swipe, Match, ContactRequest, Block, Report。

数据模式由 `NEXT_PUBLIC_LINKU_DATA_MODE` 控制：
- `supabase`：直连 Supabase（线上 Netlify）
- `api`：通过 NestJS API（本地开发联调）
- 未设置 + 非 production：fallback mock 数据
