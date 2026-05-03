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
