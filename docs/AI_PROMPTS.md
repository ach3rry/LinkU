# LinkU AI Prompt 设计

## 1. AI 工程原则

- 所有 AI 输出必须是 JSON。
- 所有 AI 输出必须经过 Zod 或 JSON Schema 校验。
- AI 失败、超时、格式错误时必须走 fallback。
- AI 不能直接决定封禁、支付、匹配安全等关键逻辑。
- AI 不能编造认证、学校、价格、时间、评价等事实。
- Prompt 模板放在后端 `apps/api/src/ai/prompts`。

## 2. parse-demand.prompt.ts

用途：把用户自然语言解析成结构化需求。

输入：

- 用户原始需求文本。
- 当前用户资料。
- 可用专区列表。

输出字段：

```ts
{
  zone: "tutoring" | "buddy" | "premium";
  intent: string;
  subject?: string;
  skills: string[];
  interests: string[];
  budgetMin?: number;
  budgetMax?: number;
  scheduleText?: string;
  location?: string;
  onlineMode: "online" | "offline" | "hybrid";
  urgency: "low" | "medium" | "high";
  relationshipBoundary: "study_only" | "activity_partner" | "light_social" | "open_to_relationship";
  safetyRisk: "low" | "medium" | "high";
}
```

安全要求：

- 如果出现明显骚扰、低俗、危险线下邀约、违法交易，应标记 `safetyRisk`。
- 不要把搭子专区引导成低俗 dating。

## 3. generate-card.prompt.ts

用途：根据用户资料和结构化需求生成卡片文案。

输出字段：

```ts
{
  title: string;
  subtitle: string;
  tags: string[];
  description: string;
  highlight: string;
}
```

文案要求：

- 年轻、清爽、校园友好。
- 不夸大、不编造资质。
- 避免低俗、擦边和隐私泄露。
- 保持安全友好的表达。

## 4. match-reason.prompt.ts

用途：根据后端匹配算法结果生成一句自然语言匹配理由。

输入：

- 匹配分。
- 命中的维度。
- 双方公开卡片字段。

输出字段：

```ts
{
  reason: string;
  matchedFactors: string[];
  confidence: "low" | "medium" | "high";
}
```

示例：

```txt
TA 擅长高数和 C 语言，与你的学习需求高度匹配，而且本周末有空，价格也在你的预算范围内。
```

## 5. icebreaker.prompt.ts

用途：匹配成功后生成 3 条破冰话术。

要求：

- 礼貌。
- 低压力。
- 不越界。
- 不索要隐私。
- 不直接诱导线下见面。

输出字段：

```ts
{
  icebreakers: string[];
}
```

## 6. moderation.prompt.ts

用途：审核用户输入、卡片内容和联系申请。

风险类别：

- sexual content
- harassment
- scam
- illegal transaction
- hate
- self-harm
- personal contact leakage
- dangerous offline meeting
- spam

输出字段：

```ts
{
  riskLevel: "low" | "medium" | "high";
  categories: string[];
  actionSuggestion: "allow" | "review" | "block";
  reason: string;
}
```

注意：`actionSuggestion` 只是建议，最终动作由后端规则和管理员决定。
