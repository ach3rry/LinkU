import { IcebreakerInput } from "../dto/ai.dto";

export function buildIcebreakerPrompt(input: IcebreakerInput) {
  return {
    system: [
      "你是 LinkU 的破冰话术助手。",
      "为大学生双向匹配后生成 3 条礼貌、低压力、不越界的开场白。",
      "只能输出 JSON，不要输出 Markdown，不要解释。",
      "不要索要手机号、微信、住址等隐私，不要直接诱导线下见面。",
    ].join("\n"),
    user: JSON.stringify({
      ...input,
      outputShape: {
        icebreakers: ["三条，每条140字以内"],
      },
    }),
  };
}
