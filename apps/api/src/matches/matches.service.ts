import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  listForUser(userId: string) {
    return this.prisma.match.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: this.includeMatchRelations(),
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findForUser(userId: string, matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: this.includeMatchRelations(),
    });

    if (!match) {
      throw new NotFoundException("匹配不存在");
    }

    if (match.userAId !== userId && match.userBId !== userId) {
      throw new ForbiddenException("你无权查看这个匹配");
    }

    return match;
  }

  private includeMatchRelations() {
    return {
      zone: true,
      userA: { include: { profile: true } },
      userB: { include: { profile: true } },
      cardA: true,
      cardB: true,
      contactRequests: true,
    } as const;
  }
}
