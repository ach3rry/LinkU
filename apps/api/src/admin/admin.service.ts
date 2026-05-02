import { Injectable } from "@nestjs/common";
import { CardStatus, ReportStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ReviewCardInput, ReviewReportInput, UpdateUserStatusInput } from "./admin.dto";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  listReports(status?: ReportStatus) {
    return this.prisma.report.findMany({
      where: status ? { status } : undefined,
      include: {
        reporter: true,
        targetUser: true,
        targetCard: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async reviewReport(adminId: string, reportId: string, input: ReviewReportInput) {
    const report = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: input.status,
      },
    });

    await this.recordAction(adminId, "review_report", "report", reportId, input.note);
    return report;
  }

  listPendingCards() {
    return this.prisma.card.findMany({
      where: {
        status: {
          in: [CardStatus.PENDING, CardStatus.REJECTED],
        },
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        zone: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async reviewCard(adminId: string, cardId: string, input: ReviewCardInput) {
    const card = await this.prisma.card.update({
      where: { id: cardId },
      data: {
        status: input.status,
      },
    });

    await this.recordAction(adminId, "review_card", "card", cardId, input.reason);
    return card;
  }

  async updateUserStatus(adminId: string, userId: string, input: UpdateUserStatusInput) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: input.status,
      },
    });

    await this.recordAction(adminId, "update_user_status", "user", userId, input.reason);
    return user;
  }

  listModerationResults() {
    return this.prisma.moderationResult.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });
  }

  private recordAction(
    adminId: string,
    action: string,
    targetType: string,
    targetId: string,
    note?: string,
  ) {
    return this.prisma.adminAction.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        note,
      },
    });
  }
}
