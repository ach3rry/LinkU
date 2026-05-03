# LinkU MVP 任务清单

## 阶段 0：仓库初始化

- [x] 初始化 Git 仓库
- [x] 初始化 pnpm workspace
- [x] 创建 Web 前端应用
- [x] 创建 API 后端应用
- [x] 添加 shared 共享包
- [x] 添加 `.gitignore`
- [x] 添加 `.env.example`
- [x] 添加 README
- [x] 添加 ESLint / Prettier / TypeScript 配置

## 阶段 1：产品与工程文档

- [x] 产品需求文档 PRD
- [x] 系统架构文档
- [x] API 设计文档
- [x] 数据库设计文档
- [x] AI Prompt 设计文档
- [x] 开发路线图
- [x] MVP 任务清单

## 阶段 2：数据库设计

- [x] Prisma schema
- [x] 用户表
- [x] 用户资料表
- [x] 专区表
- [x] 卡片表
- [x] 滑卡记录表
- [x] 匹配表
- [x] 联系申请表
- [x] 举报表
- [x] 拉黑表
- [x] AI 调用日志表
- [x] 内容审核结果表
- [x] 会员 mock 表
- [x] 种子数据

## 阶段 3：后端基础框架

- [x] Auth 模块
- [x] Users 模块
- [x] Profiles 模块
- [x] Zones 模块
- [x] Cards 模块
- [x] mock login + JWT
- [x] 基础 REST API

## 阶段 4：前端基础页面

- [x] Landing Page
- [x] 专区选择页
- [x] Onboarding 建卡页
- [x] 滑卡页
- [x] 匹配成功弹窗
- [x] 个人中心页
- [x] 管理后台 mock 页

## 阶段 5：滑卡核心闭环

- [x] 推荐卡片 API
- [x] SwipeCard 组件
- [x] 左滑 / 右滑交互
- [x] 滑卡记录持久化
- [x] 双向匹配创建
- [x] 联系申请入口

## 阶段 6：AI Link

- [x] AI Provider 抽象
- [x] 需求解析 Prompt
- [x] 卡片生成 Prompt
- [x] 匹配理由 Prompt
- [x] 破冰话术 Prompt
- [x] 内容审核 Prompt
- [x] Zod 输出校验
- [x] fallback 兜底机制

## 阶段 7：安全与风控

- [x] 举报功能
- [x] 拉黑功能
- [x] 敏感词规则
- [x] 内容审核流程
- [x] 联系方式保护
- [x] 安全提示
- [x] 管理后台审核

## 阶段 8：会员与 Premium Match mock

- [x] 每日滑卡次数 mock
- [x] 每日右滑次数 mock
- [x] 会员状态 mock
- [x] Premium Match 入口
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

- [x] 本地 PostgreSQL Docker Compose
- [x] 本地 `DATABASE_URL` 配置说明
- [x] Prisma `db push` + seed 跑通
- [x] Web 调 API 健康检查
- [x] mock login + JWT + 数据库写入跑通
- [x] DeepSeek `deepseek-v4-pro` 普通调用跑通
- [x] DeepSeek JSON 模式调用跑通
- [x] Onboarding 调用 AI 解析需求
- [x] Onboarding 调用 AI 生成卡片草稿
- [x] Onboarding 保存生成卡片到数据库

## 阶段 12：去 mock 认证与用户体系

- [ ] 替换 mock login 为真实认证入口
- [ ] 选择首发认证方式：邮箱验证码 / OAuth / 校园邮箱白名单
- [ ] 用户注册 / 登录 / 退出
- [ ] JWT refresh 或 session 续期策略
- [ ] 找回登录能力
- [ ] 用户资料必填项校验
- [ ] 管理员账号初始化方案
- [ ] 删除或限制生产环境 mock login

## 阶段 13：生产级数据库与迁移

- [ ] 从 `prisma db push` 切换到 Prisma migrations
- [ ] 创建首个 migration
- [ ] 生产数据库初始化脚本
- [ ] seed 拆分为 demo seed 和 production seed
- [ ] 数据库备份与恢复方案
- [ ] 数据库连接池 / 连接数限制
- [ ] AI 调用日志和用户行为日志保留策略

## 阶段 14：生产安全与风控上线

- [ ] CORS 按生产域名收紧
- [ ] Helmet / 安全响应头
- [ ] API rate limit
- [ ] 输入长度和上传大小限制复核
- [ ] DeepSeek API Key 只放云平台 Secret
- [ ] JWT_SECRET 强随机并只放云平台 Secret
- [ ] 管理后台真实权限保护
- [ ] 联系方式保护策略上线复核
- [ ] 举报审核工作流生产化

## 阶段 15：去 mock 业务闭环

- [ ] 滑卡页默认使用真实 API 数据
- [ ] Profile 页默认使用真实 API 数据
- [ ] Admin 页默认使用真实 API 数据
- [ ] 移除或隔离前端 mock 数据
- [ ] 会员状态从 mock 表切换为真实权益表
- [ ] Premium Match 明确 MVP 规则：展示 / 预约 / 付费占位
- [ ] 支付保持禁用或接入真实支付沙箱
- [ ] 空状态 / 错误态 / 加载态补齐

## 阶段 16：云部署 MVP

- [ ] 选择云平台：Railway / Render / Fly.io / 其他
- [ ] 创建托管 PostgreSQL
- [ ] 配置 API 服务
- [ ] 配置 Web 服务
- [ ] 配置生产环境变量
- [ ] 执行 Prisma migration
- [ ] 配置生产域名
- [ ] 配置 HTTPS
- [ ] 部署后 smoke test
- [ ] GitHub Actions 增加部署检查或自动部署

## 阶段 17：上线前验收

- [ ] 真实用户注册登录
- [ ] 真实建卡
- [ ] 真实 AI 解析与卡片生成
- [ ] 真实推荐列表
- [ ] 真实滑卡与匹配
- [ ] 真实联系申请
- [ ] 举报 / 拉黑 / Admin 审核
- [ ] 移动端关键页面检查
- [ ] 生产错误日志检查
- [ ] README / docs 同步上线状态
