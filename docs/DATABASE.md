# LinkU 数据库设计初稿

## 1. 设计原则

- 使用 PostgreSQL + Prisma。
- MVP 阶段优先保证核心闭环：用户、资料、卡片、滑动、匹配、联系申请、举报、拉黑。
- Premium Match 和会员先 mock，但保留数据表。
- AI 调用和审核结果要可追踪，方便复盘安全问题。

## 2. 主要数据表

### users

| 字段         | 类型      | 用途                    |
| ------------ | --------- | ----------------------- |
| id           | uuid      | 主键                    |
| email        | string?   | 校园邮箱，MVP 可为空    |
| phone        | string?   | 手机号预留              |
| nickname     | string    | 昵称                    |
| avatarUrl    | string?   | 头像                    |
| role         | enum      | user/admin              |
| status       | enum      | active/suspended/banned |
| lastActiveAt | datetime? | 最近活跃                |
| createdAt    | datetime  | 创建时间                |
| updatedAt    | datetime  | 更新时间                |

关键索引：`email unique`、`status`。

### profiles

| 字段                 | 类型    | 用途                                                          |
| -------------------- | ------- | ------------------------------------------------------------- |
| id                   | uuid    | 主键                                                          |
| userId               | uuid    | 用户                                                          |
| school               | string  | 学校                                                          |
| campus               | string? | 校区                                                          |
| city                 | string  | 城市                                                          |
| grade                | string? | 年级                                                          |
| major                | string? | 专业                                                          |
| bio                  | string? | 简介                                                          |
| gender               | string? | 可选展示字段                                                  |
| verifiedStatus       | enum    | unverified/student_verified/provider_verified                 |
| relationshipBoundary | enum    | study_only/activity_partner/light_social/open_to_relationship |
| safetyPreference     | json    | 安全偏好                                                      |

关键索引：`userId unique`、`school`、`city`。

### zones

| 字段        | 类型        | 用途                   |
| ----------- | ----------- | ---------------------- |
| id          | uuid        | 主键                   |
| code        | enum/string | tutoring/buddy/premium |
| name        | string      | 名称                   |
| description | string      | 描述                   |
| enabled     | boolean     | 是否启用               |

关键索引：`code unique`。

### cards

| 字段        | 类型     | 用途                                 |
| ----------- | -------- | ------------------------------------ |
| id          | uuid     | 主键                                 |
| userId      | uuid     | 发卡用户                             |
| zoneId      | uuid     | 所属专区                             |
| type        | string   | 需求类型                             |
| title       | string   | 标题                                 |
| subtitle    | string   | 副标题                               |
| description | string   | 描述                                 |
| tags        | json     | 标签                                 |
| priceMin    | int?     | 最低价格                             |
| priceMax    | int?     | 最高价格                             |
| schedule    | json     | 时间                                 |
| location    | string?  | 地点                                 |
| onlineMode  | enum     | online/offline/hybrid                |
| status      | enum     | draft/pending/active/rejected/hidden |
| aiGenerated | boolean  | 是否由 AI 生成                       |
| scoreBoost  | int      | 推荐加权预留                         |
| createdAt   | datetime | 创建时间                             |

关键索引：`zoneId/status`、`userId`、`createdAt`。

### swipes

| 字段         | 类型     | 用途       |
| ------------ | -------- | ---------- |
| id           | uuid     | 主键       |
| swiperId     | uuid     | 滑卡用户   |
| targetCardId | uuid     | 目标卡片   |
| zoneId       | uuid     | 专区       |
| direction    | enum     | left/right |
| createdAt    | datetime | 创建时间   |

关键索引：`swiperId + targetCardId unique`、`swiperId + zoneId`。

### matches

| 字段        | 类型     | 用途                    |
| ----------- | -------- | ----------------------- |
| id          | uuid     | 主键                    |
| userAId     | uuid     | 用户 A                  |
| userBId     | uuid     | 用户 B                  |
| cardAId     | uuid     | 用户 A 卡片             |
| cardBId     | uuid     | 用户 B 卡片             |
| zoneId      | uuid     | 专区                    |
| status      | enum     | active/closed/reported  |
| matchScore  | int      | 匹配分                  |
| matchReason | string?  | AI 或 fallback 匹配理由 |
| createdAt   | datetime | 创建时间                |

关键索引：`userAId + userBId`、`zoneId + status`。

### contact_requests

| 字段      | 类型     | 用途                                |
| --------- | -------- | ----------------------------------- |
| id        | uuid     | 主键                                |
| matchId   | uuid     | 匹配                                |
| senderId  | uuid     | 发送者                              |
| message   | string   | 联系申请内容                        |
| status    | enum     | pending/accepted/rejected/cancelled |
| createdAt | datetime | 创建时间                            |

关键索引：`matchId`、`senderId + status`。

### reports

| 字段            | 类型     | 用途                                |
| --------------- | -------- | ----------------------------------- |
| id              | uuid     | 主键                                |
| reporterId      | uuid     | 举报人                              |
| targetUserId    | uuid?    | 被举报用户                          |
| targetCardId    | uuid?    | 被举报卡片                          |
| targetMessageId | uuid?    | 被举报消息                          |
| reason          | string   | 原因                                |
| detail          | string?  | 详情                                |
| status          | enum     | pending/reviewing/resolved/rejected |
| createdAt       | datetime | 创建时间                            |

关键索引：`status + createdAt`、`targetUserId`。

### blocks

| 字段          | 类型     | 用途       |
| ------------- | -------- | ---------- |
| id            | uuid     | 主键       |
| blockerId     | uuid     | 拉黑发起人 |
| blockedUserId | uuid     | 被拉黑用户 |
| reason        | string?  | 原因       |
| createdAt     | datetime | 创建时间   |

关键索引：`blockerId + blockedUserId unique`。

### ai_logs

| 字段      | 类型     | 用途                                       |
| --------- | -------- | ------------------------------------------ |
| id        | uuid     | 主键                                       |
| userId    | uuid?    | 调用用户                                   |
| feature   | string   | parse_demand/generate_card/match_reason 等 |
| provider  | string   | AI 服务商                                  |
| model     | string   | 模型                                       |
| inputHash | string   | 输入哈希，不直接存敏感原文                 |
| output    | json     | 输出                                       |
| latencyMs | int?     | 耗时                                       |
| success   | boolean  | 是否成功                                   |
| error     | string?  | 错误                                       |
| createdAt | datetime | 创建时间                                   |

关键索引：`feature + createdAt`、`userId`。

### moderation_results

| 字段       | 类型     | 用途                              |
| ---------- | -------- | --------------------------------- |
| id         | uuid     | 主键                              |
| targetType | string   | user/card/message/contact_request |
| targetId   | uuid     | 目标 ID                           |
| riskLevel  | enum     | low/medium/high                   |
| categories | json     | 风险类别                          |
| action     | enum     | allow/review/block                |
| rawResult  | json     | 原始结果                          |
| createdAt  | datetime | 创建时间                          |

关键索引：`targetType + targetId`、`riskLevel`。

### subscriptions

| 字段     | 类型      | 用途                       |
| -------- | --------- | -------------------------- |
| id       | uuid      | 主键                       |
| userId   | uuid      | 用户                       |
| plan     | string    | free/semester/premium_mock |
| status   | enum      | active/inactive/expired    |
| startsAt | datetime? | 开始时间                   |
| endsAt   | datetime? | 结束时间                   |
| source   | string    | mock/payment/provider      |

关键索引：`userId + status`。

### payments

MVP 不实现真实支付，只预留表设计。

### admin_actions

记录管理员审核、封禁、处理举报等操作。
