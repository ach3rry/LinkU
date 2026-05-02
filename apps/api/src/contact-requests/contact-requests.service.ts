import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateContactRequestInput } from "./contact-requests.dto";

@Injectable()
export class ContactRequestsService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.contactRequest.create({
      data: {
        matchId: input.matchId,
        senderId: userId,
        message: input.message,
      },
    });
  }
}
