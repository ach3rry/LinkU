import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SafetyService } from "../safety/safety.service";
import { CreateReportInput } from "./reports.dto";

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly safetyService: SafetyService,
  ) {}

  listMine(userId: string) {
    return this.prisma.report.findMany({
      where: {
        reporterId: userId,
      },
      include: {
        targetUser: true,
        targetCard: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async create(userId: string, input: CreateReportInput) {
    const report = await this.prisma.report.create({
      data: {
        reporterId: userId,
        targetUserId: input.targetUserId,
        targetCardId: input.targetCardId,
        targetMessageId: input.targetMessageId,
        reason: input.reason,
        detail: input.detail,
      },
    });

    await this.safetyService.recordModeration({
      targetType: "report",
      targetId: report.id,
      content: `${input.reason}\n${input.detail ?? ""}`,
    });

    return report;
  }
}
