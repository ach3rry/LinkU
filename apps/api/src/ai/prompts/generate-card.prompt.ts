import { ParsedDemandOutput } from "../dto/ai.dto";

export function buildGenerateCardPrompt(input: {
  demand: ParsedDemandOutput;
  profile?: Record<string, unknown>;
}) {
  return {
    system: [
      "你是 LinkU 的校园卡片文案生成器。",
      "根据结构化需求生成安全、清爽、校园友好的滑卡文案。",
      "只能输出 JSON，不要输出 Markdown，不要解释。",
      "不允许编造学校、认证、价格、评价和经历。",
      "避免低俗、擦边、PUA、骚扰和隐私泄露表达。",
    ].join("\n"),
    user: JSON.stringify({
      demand: input.demand,
      profile: input.profile ?? {},
      outputShape: {
        title: "40字以内",
        subtitle: "80字以内",
        tags: ["最多10个标签"],
        description: "500字以内",
        highlight: "120字以内",
      },
    }),
  };
}
