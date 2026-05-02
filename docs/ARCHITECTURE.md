# LinkU 系统架构设计

## 1. 架构原则

- 前后端分离，Web 和 API 独立开发、独立部署。
- MVP 保持轻量，不引入过重的微服务。
- AI 能力通过 Provider 层抽象，不绑定单一模型。
- 核心安全逻辑由后端规则兜底，AI 只做辅助。
- 类型尽量共享，减少前后端字段漂移。

## 2. Monorepo 结构

```txt
LinkU/
  apps/
    web/                 # Next.js 前端
    api/                 # NestJS 后端
  packages/
    shared/              # 共享类型、常量、Zod Schema
  docs/                  # 项目文档
```

## 3. 前端模块

| 模块                | 说明                                            |
| ------------------- | ----------------------------------------------- |
| 登录注册模块        | MVP 使用 mock login，保存 JWT 和用户状态        |
| Onboarding 建档模块 | 选择身份、专区、输入需求、AI 解析预览、卡片确认 |
| 专区选择模块        | 家教、搭子、学长学姐专区入口                    |
| 滑卡推荐模块        | 中央大卡片、左右滑、匹配度、推荐理由            |
| 匹配结果模块        | 匹配成功动画、对方摘要、AI 破冰话术             |
| 联系申请模块        | MVP 优先做联系申请，不做完整 IM                 |
| 个人中心模块        | 我的卡片、我的需求、我的匹配、会员状态          |
| 会员/付费展示模块   | 展示 mock 会员权益和 Premium Match              |
| 举报/安全提示模块   | 举报弹窗、拉黑、安全提示                        |
| 管理后台模块        | 待审核卡片、举报列表、AI 审核结果、用户封禁     |

## 4. 后端模块

| 模块           | 说明                                       |
| -------------- | ------------------------------------------ |
| Auth           | mock login、JWT、用户身份守卫              |
| User           | 用户基础信息和状态                         |
| Profile        | 学校、城市、年级、专业、关系边界、认证状态 |
| Zone           | 三大专区配置                               |
| Card           | 用户卡片、AI 文案、审核状态                |
| Swipe          | 左滑/右滑记录、每日次数限制预留            |
| Match          | 双向右滑后创建匹配                         |
| ContactRequest | 联系申请，MVP 替代完整 IM                  |
| Review         | 评分和评价，MVP 可轻量                     |
| Report/Block   | 举报、拉黑、推荐过滤                       |
| AI             | Provider 抽象、Prompt 工作流、fallback     |
| Moderation     | 敏感词规则、AI 审核结果、人工审核          |
| Admin          | 审核、举报处理、封禁、操作日志             |
| Subscription   | MVP mock 会员状态                          |

## 5. 请求链路

```txt
Web
  -> REST API
    -> Auth Guard
    -> NestJS Module
    -> Prisma
    -> PostgreSQL
```

AI 链路：

```txt
Web
  -> REST API
    -> AI Service
      -> Provider Adapter
      -> OpenAI-compatible API
    -> Zod 校验
    -> fallback
```

## 6. 匹配链路

1. 用户请求推荐。
2. 后端过滤不可见候选：自己、已滑过、已拉黑、被拉黑、风险用户、审核未通过卡片。
3. 后端按规则计算 100 分制匹配分。
4. 后端返回候选卡片、匹配分和命中维度。
5. AI 根据命中维度生成匹配理由；AI 不允许编造事实。
6. 用户右滑后写入 swipe。
7. 如果对方已右滑当前用户卡片，则创建 match。

## 7. 部署建议

- Web：Vercel 或 Netlify。
- API：Railway、Render、Fly.io 或云服务器。
- 数据库：Neon、Supabase Postgres 或 Railway Postgres。
- Redis：MVP 可不接，后续用于限流、缓存和次数统计。
