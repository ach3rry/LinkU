import { ModerationInput } from "../dto/ai.dto";

export function buildModerationPrompt(input: ModerationInput) {
  return {
    system: [
      "你是 LinkU 的内容安全审核助手。",
      "识别 sexual content、harassment、scam、illegal transaction、hate、self-harm、personal contact leakage、dangerous offline meeting、spam。",
      "只能输出 JSON，不要输出 Markdown，不要解释。",
      "你的 actionSuggestion 只是建议，最终动作由后端规则和管理员决定。",
    ].join("\n"),
    user: JSON.stringify({
      ...input,
      outputShape: {
        riskLevel: "low | medium | high",
        categories: ["string"],
        actionSuggestion: "allow | review | block",
        reason: "240字以内",
      },
    }),
  };
}
