import { Injectable } from "@nestjs/common";
import { ModerationAction, ModerationRiskLevel, Prisma } from "@prisma/client";
import { createHash } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";

export type SafetyCheckResult = {
  riskLevel: ModerationRiskLevel;
  categories: string[];
  action: ModerationAction;
  reason: string;
};

const sensitiveRules: Array<{
  category: string;
  riskLevel: ModerationRiskLevel;
  pattern: RegExp;
}> = [
  {
    category: "personal_contact_leakage",
    riskLevel: ModerationRiskLevel.MEDIUM,
    pattern: /(微信|vx|v信|qq|手机号|电话|加我|联系方式|1[3-9]\d{9})/i,
  },
  {
    category: "sexual_content",
    riskLevel: ModerationRiskLevel.HIGH,
    pattern: /(约炮|开房|裸|包夜|性服务|色情)/i,
  },
  {
    category: "illegal_transaction",
    riskLevel: ModerationRiskLevel.HIGH,
    pattern: /(代写|作弊|买答案|替考|违法|灰产|套现)/i,
  },
  {
    category: "scam",
    riskLevel: ModerationRiskLevel.HIGH,
    pattern: /(先付款|押金|稳赚|返利|刷单|贷款|投资群)/i,
  },
  {
    category: "harassment",
    riskLevel: ModerationRiskLevel.MEDIUM,
    pattern: /(骚扰|傻逼|滚|辱骂|人身攻击)/i,
  },
  {
    category: "dangerous_offline_meeting",
    riskLevel: ModerationRiskLevel.MEDIUM,
    pattern: /(深夜见|偏僻|单独来|不要告诉别人|私密地点)/i,
  },
];

@Injectable()
export class SafetyService {
  constructor(private readonly prisma: PrismaService) {}

  checkText(content: string): SafetyCheckResult {
    const categories = sensitiveRules
      .filter((rule) => rule.pattern.test(content))
      .map((rule) => rule.category);

    const riskLevel = sensitiveRules.some(
      (rule) => rule.pattern.test(content) && rule.riskLevel === ModerationRiskLevel.HIGH,
    )
      ? ModerationRiskLevel.HIGH
      : categories.length > 0
        ? ModerationRiskLevel.MEDIUM
        : ModerationRiskLevel.LOW;

    const action =
      riskLevel === ModerationRiskLevel.HIGH
        ? ModerationAction.BLOCK
        : riskLevel === ModerationRiskLevel.MEDIUM
          ? ModerationAction.REVIEW
          : ModerationAction.ALLOW;

    return {
      riskLevel,
      categories,
      action,
      reason: categories.length ? `命中安全规则：${categories.join("、")}` : "未命中明显风险规则。",
    };
  }

  hasContactLeakage(content: string) {
    return this.checkText(content).categories.includes("personal_contact_leakage");
  }

  async recordModeration(input: {
    targetType: string;
    targetId: string;
    content: string;
    extra?: Record<string, unknown>;
  }) {
    const result = this.checkText(input.content);

    return this.prisma.moderationResult.create({
      data: {
        targetType: input.targetType,
        targetId: input.targetId,
        riskLevel: result.riskLevel,
        categories: result.categories,
        action: result.action,
        rawResult: {
          reason: result.reason,
          contentHash: this.hash(input.content),
          ...input.extra,
        } as Prisma.InputJsonValue,
      },
    });
  }

  private hash(content: string) {
    return createHash("sha256").update(content).digest("hex");
  }
}
