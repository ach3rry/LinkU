import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { createHash } from "node:crypto";
import { ZodSchema } from "zod";
import { PrismaService } from "../prisma/prisma.service";
import {
  CardDraftOutput,
  GenerateCardInput,
  IcebreakerInput,
  IcebreakerOutput,
  MatchReasonInput,
  MatchReasonOutput,
  ModerationInput,
  ModerationOutput,
  ParseDemandInput,
  ParsedDemandOutput,
  cardDraftOutputSchema,
  icebreakerOutputSchema,
  matchReasonOutputSchema,
  moderationOutputSchema,
  parsedDemandOutputSchema,
} from "./dto/ai.dto";
import { buildGenerateCardPrompt } from "./prompts/generate-card.prompt";
import { buildIcebreakerPrompt } from "./prompts/icebreaker.prompt";
import { buildMatchReasonPrompt } from "./prompts/match-reason.prompt";
import { buildModerationPrompt } from "./prompts/moderation.prompt";
import { buildParseDemandPrompt } from "./prompts/parse-demand.prompt";
import { OpenAICompatibleProvider } from "./provider/openai-compatible.provider";

type AiFeature = "parse_demand" | "generate_card" | "match_reason" | "icebreakers" | "moderation";

@Injectable()
export class AiService {
  constructor(
    private readonly provider: OpenAICompatibleProvider,
    private readonly prisma: PrismaService,
  ) {}

  parseDemand(userId: string, input: ParseDemandInput) {
    const prompt = buildParseDemandPrompt(input);

    return this.runWithFallback({
      userId,
      feature: "parse_demand",
      prompt,
      schema: parsedDemandOutputSchema,
      fallback: () => this.fallbackParseDemand(input),
    });
  }

  generateCard(userId: string, input: GenerateCardInput) {
    const prompt = buildGenerateCardPrompt(input);

    return this.runWithFallback({
      userId,
      feature: "generate_card",
      prompt,
      schema: cardDraftOutputSchema,
      fallback: () => this.fallbackGenerateCard(input),
    });
  }

  matchReason(userId: string, input: MatchReasonInput) {
    const prompt = buildMatchReasonPrompt(input);

    return this.runWithFallback({
      userId,
      feature: "match_reason",
      prompt,
      schema: matchReasonOutputSchema,
      fallback: () => this.fallbackMatchReason(input),
    });
  }

  icebreakers(userId: string, input: IcebreakerInput) {
    const prompt = buildIcebreakerPrompt(input);

    return this.runWithFallback({
      userId,
      feature: "icebreakers",
      prompt,
      schema: icebreakerOutputSchema,
      fallback: () => this.fallbackIcebreakers(input),
    });
  }

  moderate(userId: string, input: ModerationInput) {
    const prompt = buildModerationPrompt(input);

    return this.runWithFallback({
      userId,
      feature: "moderation",
      prompt,
      schema: moderationOutputSchema,
      fallback: () => this.fallbackModeration(input),
    });
  }

  private async runWithFallback<T>(input: {
    userId: string;
    feature: AiFeature;
    prompt: { system: string; user: string };
    schema: ZodSchema<T>;
    fallback: () => T;
  }): Promise<T> {
    const startedAt = Date.now();

    if (!this.provider.isConfigured()) {
      const output = input.fallback();
      await this.logAiCall(input, output, false, startedAt, "AI Provider 未配置，已使用 fallback");
      return output;
    }

    try {
      const output = await this.provider.generateJson({
        system: input.prompt.system,
        user: input.prompt.user,
        schema: input.schema,
      });

      await this.logAiCall(input, output, true, startedAt);
      return output;
    } catch (error) {
      const output = input.fallback();
      const message = error instanceof Error ? error.message : "AI 调用失败，已使用 fallback";
      await this.logAiCall(input, output, false, startedAt, message);
      return output;
    }
  }

  private async logAiCall<T>(
    input: {
      userId: string;
      feature: AiFeature;
      prompt: { system: string; user: string };
    },
    output: T,
    success: boolean,
    startedAt: number,
    error?: string,
  ) {
    try {
      await this.prisma.aiLog.create({
        data: {
          userId: input.userId,
          feature: input.feature,
          provider: "openai-compatible",
          model: process.env.OPENAI_COMPATIBLE_MODEL ?? "fallback",
          inputHash: this.hashPrompt(input.prompt),
          output: output as Prisma.InputJsonValue,
          latencyMs: Date.now() - startedAt,
          success,
          error,
        },
      });
    } catch {
      // AI 日志不应该阻断用户主流程。
    }
  }

  private hashPrompt(prompt: { system: string; user: string }) {
    return createHash("sha256").update(`${prompt.system}\n${prompt.user}`).digest("hex");
  }

  private fallbackParseDemand(input: ParseDemandInput): ParsedDemandOutput {
    const text = input.text;
    const zone = this.inferZone(text);
    const budget = text.match(/(\d{2,4})\s*(?:元|块|\/h|每小时|一小时|h)/i);
    const skills = this.inferSkills(text);
    const interests = this.inferInterests(text);

    return {
      zone,
      intent: this.inferIntent(zone, text),
      subject: skills[0],
      skills,
      interests,
      budgetMin: budget ? Number(budget[1]) : undefined,
      budgetMax: budget ? Number(budget[1]) : undefined,
      scheduleText: this.inferSchedule(text),
      location: this.inferLocation(text),
      onlineMode: this.inferOnlineMode(text),
      urgency: /今天|明天|尽快|急|马上/.test(text) ? "high" : "medium",
      relationshipBoundary: this.inferBoundary(zone, text),
      safetyRisk: this.detectRisk(text).riskLevel,
    };
  }

  private fallbackGenerateCard(input: GenerateCardInput): CardDraftOutput {
    const demand = input.demand;
    const tags = [
      demand.subject,
      ...demand.skills,
      ...demand.interests,
      demand.scheduleText,
      demand.onlineMode === "offline"
        ? "线下"
        : demand.onlineMode === "online"
          ? "线上"
          : "线上/线下",
    ]
      .filter((item): item is string => Boolean(item))
      .slice(0, 10);

    const title =
      demand.zone === "buddy"
        ? `找${demand.interests[0] ?? "校园"}搭子`
        : demand.zone === "premium"
          ? `${demand.subject ?? "经验"}咨询匹配`
          : `${demand.subject ?? "课程"}学习匹配`;

    return {
      title: title.slice(0, 40),
      subtitle: "AI fallback 生成，可继续编辑后发布",
      tags,
      description:
        `需求：${demand.intent}。希望匹配对象边界清楚、沟通礼貌，具体安排双向确认后再沟通。`.slice(
          0,
          500,
        ),
      highlight: "需求已结构化，适合进入滑卡推荐。",
    };
  }

  private fallbackMatchReason(input: MatchReasonInput): MatchReasonOutput {
    const factors = input.matchedFactors.length > 0 ? input.matchedFactors.join("、") : "专区需求";
    const tags = input.cardTags.slice(0, 2).join("和");

    return {
      reason: tags
        ? `TA 的标签包含${tags}，并且在${factors}上与你比较匹配，可以优先了解。`
        : `TA 在${factors}上与你比较匹配，可以先查看卡片细节再决定是否联系。`,
      matchedFactors: input.matchedFactors,
      confidence: input.score >= 80 ? "high" : input.score >= 60 ? "medium" : "low",
    };
  }

  private fallbackIcebreakers(input: IcebreakerInput): IcebreakerOutput {
    const target = input.targetCardTitle ? `关于「${input.targetCardTitle}」` : "关于你的卡片";

    return {
      icebreakers: [
        `你好！我看到我们${target}挺匹配的，可以先简单聊聊具体安排吗？`,
        "很高兴匹配到你。我想先说明一下我的需求和时间，如果合适我们再继续确认。",
        "你的卡片信息很清楚，我这边也会保持边界感，想先发一个联系申请了解一下。",
      ],
    };
  }

  private fallbackModeration(input: ModerationInput): ModerationOutput {
    const result = this.detectRisk(input.content);

    return {
      riskLevel: result.riskLevel,
      categories: result.categories,
      actionSuggestion:
        result.riskLevel === "high" ? "block" : result.riskLevel === "medium" ? "review" : "allow",
      reason: result.categories.length
        ? `命中规则风险：${result.categories.join("、")}。`
        : "未命中明显风险规则。",
    };
  }

  private inferZone(text: string): ParsedDemandOutput["zone"] {
    if (/简历|保研|考研|项目|coding|竞赛|咨询|学长|学姐/i.test(text)) return "premium";
    if (/饭|自习|运动|台球|电影|搭子|黑客松|口语|轻社交/i.test(text)) return "buddy";
    return "tutoring";
  }

  private inferIntent(zone: ParsedDemandOutput["zone"], text: string) {
    if (zone === "tutoring") return /当|教|提供/.test(text) ? "提供家教" : "寻找家教";
    if (zone === "buddy") return "寻找校园搭子";
    return "寻找经验咨询";
  }

  private inferSkills(text: string) {
    const skillMap = ["高数", "线代", "C 语言", "Python", "英语口语", "简历修改", "AI Coding"];
    return skillMap.filter((skill) => text.toLowerCase().includes(skill.toLowerCase()));
  }

  private inferInterests(text: string) {
    const interestMap = ["饭搭子", "自习", "运动", "台球", "电影", "黑客松", "英语口语"];
    return interestMap.filter((interest) => text.includes(interest));
  }

  private inferSchedule(text: string) {
    if (/周末/.test(text)) return "周末";
    if (/工作日/.test(text)) return "工作日";
    if (/晚上|晚/.test(text)) return "晚上";
    if (/下午/.test(text)) return "下午";
    return undefined;
  }

  private inferLocation(text: string) {
    const locations = ["北京", "上海", "广州", "深圳", "杭州", "南京", "武汉", "成都"];
    return locations.find((location) => text.includes(location));
  }

  private inferOnlineMode(text: string): ParsedDemandOutput["onlineMode"] {
    if (/线下|见面|校内/.test(text)) return "offline";
    if (/线上|远程|腾讯会议|飞书|Zoom/i.test(text)) return "online";
    return "hybrid";
  }

  private inferBoundary(
    zone: ParsedDemandOutput["zone"],
    text: string,
  ): ParsedDemandOutput["relationshipBoundary"] {
    if (/恋爱|对象|脱单/.test(text)) return "open_to_relationship";
    if (zone === "buddy") return /轻社交|聊天/.test(text) ? "light_social" : "activity_partner";
    return "study_only";
  }

  private detectRisk(text: string): {
    riskLevel: ModerationOutput["riskLevel"];
    categories: string[];
  } {
    const categories: string[] = [];

    if (/微信|vx|qq|手机号|电话|加我/i.test(text)) categories.push("personal_contact_leakage");
    if (/裸|约炮|开房|包夜|性/i.test(text)) categories.push("sexual_content");
    if (/辱骂|傻逼|骚扰/i.test(text)) categories.push("harassment");
    if (/代写|作弊|买答案|违法|交易/i.test(text)) categories.push("illegal_transaction");
    if (/转账|押金|先付款|稳赚|返利/i.test(text)) categories.push("scam");
    if (/偏僻|单独来|深夜见/i.test(text)) categories.push("dangerous_offline_meeting");

    if (
      categories.some((category) =>
        ["sexual_content", "illegal_transaction", "scam"].includes(category),
      )
    ) {
      return { riskLevel: "high", categories };
    }

    if (categories.length > 0) {
      return { riskLevel: "medium", categories };
    }

    return { riskLevel: "low", categories };
  }
}
