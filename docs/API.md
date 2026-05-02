# LinkU REST API 初稿

## 1. 通用约定

- API 前缀：`/api`
- 鉴权：MVP 使用 `Authorization: Bearer <token>`
- 数据格式：JSON
- 错误格式：

```json
{
  "message": "错误说明",
  "code": "ERROR_CODE"
}
```

## 2. Auth

| Method | Path                   | Request                       | Response        | 权限   |
| ------ | ---------------------- | ----------------------------- | --------------- | ------ |
| POST   | `/api/auth/mock-login` | `nickname`, `school`, `role?` | `token`, `user` | public |
| GET    | `/api/auth/me`         | none                          | `user`          | user   |

## 3. Profiles

| Method | Path               | Request                                                     | Response  | 权限 |
| ------ | ------------------ | ----------------------------------------------------------- | --------- | ---- |
| GET    | `/api/profiles/me` | none                                                        | `profile` | user |
| PUT    | `/api/profiles/me` | school, city, grade, major, bio, tags, relationshipBoundary | `profile` | user |

## 4. Zones

| Method | Path         | Request | Response  | 权限   |
| ------ | ------------ | ------- | --------- | ------ |
| GET    | `/api/zones` | none    | `zones[]` | public |

## 5. Cards

| Method | Path             | Request                                                                      | Response  | 权限  |
| ------ | ---------------- | ---------------------------------------------------------------------------- | --------- | ----- |
| POST   | `/api/cards`     | zone, type, title, subtitle, description, tags, budget, schedule, onlineMode | `card`    | user  |
| GET    | `/api/cards/me`  | none                                                                         | `cards[]` | user  |
| GET    | `/api/cards/:id` | none                                                                         | `card`    | user  |
| PATCH  | `/api/cards/:id` | card fields                                                                  | `card`    | owner |

## 6. Recommendations

| Method | Path                                 | Request       | Response                 | 权限 |
| ------ | ------------------------------------ | ------------- | ------------------------ | ---- |
| GET    | `/api/recommendations?zone=tutoring` | zone, cursor? | `items[]`, `nextCursor?` | user |

返回示例：

```json
{
  "items": [
    {
      "card": {},
      "score": 86,
      "matchedFactors": ["skills", "schedule", "budget"],
      "reason": "TA 擅长高数，也能接受周末线下辅导，与你的预算比较匹配。"
    }
  ]
}
```

## 7. Swipes

| Method | Path          | Request                     | Response          | 权限 |
| ------ | ------------- | --------------------------- | ----------------- | ---- |
| POST   | `/api/swipes` | `targetCardId`, `direction` | `swipe`, `match?` | user |

`direction` 取值：

- `left`：跳过。
- `right`：想联系。

## 8. Matches

| Method | Path               | Request | Response    | 权限 |
| ------ | ------------------ | ------- | ----------- | ---- |
| GET    | `/api/matches`     | status? | `matches[]` | user |
| GET    | `/api/matches/:id` | none    | `match`     | user |

## 9. Contact Requests

| Method | Path                        | Request              | Response            | 权限     |
| ------ | --------------------------- | -------------------- | ------------------- | -------- |
| POST   | `/api/contact-requests`     | `matchId`, `message` | `contactRequest`    | user     |
| GET    | `/api/contact-requests`     | none                 | `contactRequests[]` | user     |
| PATCH  | `/api/contact-requests/:id` | `status`             | `contactRequest`    | receiver |

## 10. Messages

MVP 优先联系申请，不做完整 IM。若时间允许，可实现轻量站内消息。

| Method | Path                     | Request              | Response     | 权限         |
| ------ | ------------------------ | -------------------- | ------------ | ------------ |
| POST   | `/api/messages`          | `matchId`, `content` | `message`    | user         |
| GET    | `/api/messages/:matchId` | cursor?              | `messages[]` | match member |

## 11. Reports and Blocks

| Method | Path              | Request                               | Response | 权限 |
| ------ | ----------------- | ------------------------------------- | -------- | ---- |
| POST   | `/api/reports`    | targetType, targetId, reason, detail? | `report` | user |
| POST   | `/api/blocks`     | blockedUserId, reason?                | `block`  | user |
| DELETE | `/api/blocks/:id` | none                                  | success  | user |

## 12. AI

| Method | Path                    | Request             | Response          | 权限       |
| ------ | ----------------------- | ------------------- | ----------------- | ---------- |
| POST   | `/api/ai/parse-demand`  | `text`              | structured demand | user       |
| POST   | `/api/ai/generate-card` | profile, demand     | card draft        | user       |
| POST   | `/api/ai/match-reason`  | matched factors     | reason            | user       |
| POST   | `/api/ai/icebreakers`   | matchId             | icebreakers[]     | user       |
| POST   | `/api/ai/moderate`      | targetType, content | moderation result | user/admin |

## 13. Admin

| Method | Path                          | Request               | Response      | 权限  |
| ------ | ----------------------------- | --------------------- | ------------- | ----- |
| GET    | `/api/admin/cards/pending`    | none                  | pending cards | admin |
| PATCH  | `/api/admin/cards/:id/review` | status, reason?       | card          | admin |
| GET    | `/api/admin/reports`          | status?               | reports[]     | admin |
| PATCH  | `/api/admin/reports/:id`      | status, action, note? | report        | admin |
| GET    | `/api/admin/ai-logs`          | filters               | logs[]        | admin |
