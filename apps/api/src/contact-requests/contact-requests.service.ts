import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SafetyService } from "../safety/safety.service";
import { CreateContactRequestInput } from "./contact-requests.dto";

@Injectable()
export class ContactRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly safetyService: SafetyService,
  ) {}

  listForUser(userId: string) {
    return this.prisma.contactRequest.findMany({
      where: {
        match: {
          OR: [{ userAId: userId }, { userBId: userId }],
        },
      },
      include: {
        match: {
          include: {
            cardA: true,
            cardB: true,
            userA: true,
            userB: true,
          },
        },
        sender: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async create(userId: string, input: CreateContactRequestInput) {
    const match = await this.prisma.match.findUnique({
      where: { id: input.matchId },
    });

    if (!match) {
      throw new NotFoundException("匹配不存在，不能发起联系申请");
    }

    if (match.userAId !== userId && match.userBId !== userId) {
      throw new ForbiddenException("你无权在这个匹配里发起联系申请");
    }

    const safety = this.safetyService.checkText(input.message);

    if (this.safetyService.hasContactLeakage(input.message)) {
      await this.safetyService.recordModeration({
        targetType: "contact_request",
        targetId: `draft:${input.matchId}:${userId}`,
        content: input.message,
        extra: {
          reason: "联系申请中包含疑似联系方式",
        },
      });

      throw new BadRequestException("为了保护双方隐私，请先不要在联系申请里直接发送联系方式。");
    }

    if (safety.action === "BLOCK") {
      await this.safetyService.recordModeration({
        targetType: "contact_request",
        targetId: `draft:${input.matchId}:${userId}`,
        content: input.message,
      });

      throw new BadRequestException("联系申请包含高风险内容，已被安全规则拦截。");
    }

    const contactRequest = await this.prisma.contactRequest.create({
      data: {
        matchId: input.matchId,
        senderId: userId,
        message: input.message,
      },
    });

    await this.safetyService.recordModeration({
      targetType: "contact_request",
      targetId: contactRequest.id,
      content: input.message,
    });

    return contactRequest;
  }
}
