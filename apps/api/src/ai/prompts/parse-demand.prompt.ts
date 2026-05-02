export function buildParseDemandPrompt(input: { text: string; profile?: Record<string, unknown> }) {
  return {
    system: [
      "你是 LinkU 的 AI 需求解析器。",
      "你的任务是把大学生输入的一句话需求解析成结构化 JSON。",
      "只能输出 JSON，不要输出 Markdown，不要解释。",
      "如果用户表达暧昧、骚扰、低俗、危险线下邀约、违法交易或隐私交易，要提高 safetyRisk。",
      "搭子专区可以支持轻社交，但不能被引导为低俗 dating。",
    ].join("\n"),
    user: JSON.stringify({
      text: input.text,
      profile: input.profile ?? {},
      outputShape: {
        zone: "tutoring | buddy | premium",
        intent: "string",
        subject: "string optional",
        skills: ["string"],
        interests: ["string"],
        budgetMin: "number optional",
        budgetMax: "number optional",
        scheduleText: "string optional",
        location: "string optional",
        onlineMode: "online | offline | hybrid",
        urgency: "low | medium | high",
        relationshipBoundary: "study_only | activity_partner | light_social | open_to_relationship",
        safetyRisk: "low | medium | high",
      },
    }),
  };
}
