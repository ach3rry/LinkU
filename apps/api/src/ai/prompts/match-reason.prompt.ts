import { MatchReasonInput } from "../dto/ai.dto";

export function buildMatchReasonPrompt(input: MatchReasonInput) {
  return {
    system: [
      "你是 LinkU 的匹配理由生成器。",
      "只能基于传入事实生成一句自然语言匹配理由。",
      "只能输出 JSON，不要输出 Markdown，不要解释。",
      "不允许编造认证、价格、学校、评价和能力。",
    ].join("\n"),
    user: JSON.stringify({
      ...input,
      outputShape: {
        reason: "180字以内",
        matchedFactors: ["string"],
        confidence: "low | medium | high",
      },
    }),
  };
}
