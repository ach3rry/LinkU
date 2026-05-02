import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CardStatus, SwipeDirection } from "@prisma/client";
import { MatchingService } from "../matching/matching.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSwipeInput } from "./swipes.dto";

@Injectable()
export class SwipesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matchingService: MatchingService,
  ) {}

  async swipe(userId: string, input: CreateSwipeInput) {
    const targetCard = await this.prisma.card.findUnique({
      where: { id: input.targetCardId },
      include: {
        zone: true,
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!targetCard || targetCard.status !== CardStatus.ACTIVE) {
      throw new NotFoundException("目标卡片不存在或不可滑动");
    }

    if (targetCard.userId === userId) {
      throw new BadRequestException("不能滑自己的卡片");
    }

    await this.ensureNotBlocked(userId, targetCard.userId);

    const direction = input.direction === "right" ? SwipeDirection.RIGHT : SwipeDirection.LEFT;

    const swipe = await this.prisma.swipe.upsert({
      where: {
        swiperId_targetCardId: {
          swiperId: userId,
          targetCardId: targetCard.id,
        },
      },
      create: {
        swiperId: userId,
        targetCardId: targetCard.id,
        zoneId: targetCard.zoneId,
        direction,
      },
      update: {
        direction,
      },
    });

    if (direction === SwipeDirection.LEFT) {
      return { swipe, match: null };
    }

    const myCard = await this.findMyMatchableCard(userId, targetCard.zoneId);

    if (!myCard) {
      return {
        swipe,
        match: null,
        hint: "你还没有这个专区的可匹配卡片，先创建或激活一张卡片。",
      };
    }

    const reciprocalSwipe = await this.prisma.swipe.findFirst({
      where: {
        swiperId: targetCard.userId,
        targetCardId: myCard.id,
        direction: SwipeDirection.RIGHT,
      },
    });

    if (!reciprocalSwipe) {
      return { swipe, match: null };
    }

    const existingMatch = await this.prisma.match.findFirst({
      where: {
        OR: [
          {
            userAId: userId,
            userBId: targetCard.userId,
            cardAId: myCard.id,
            cardBId: targetCard.id,
          },
          {
            userAId: targetCard.userId,
            userBId: userId,
            cardAId: targetCard.id,
            cardBId: myCard.id,
          },
        ],
      },
    });

    if (existingMatch) {
      return { swipe, match: existingMatch };
    }

    const [currentProfile, currentTags] = await Promise.all([
      this.prisma.profile.findUnique({ where: { userId } }),
      this.prisma.userTag.findMany({ where: { userId } }),
    ]);

    const score = this.matchingService.scoreCandidate({
      currentProfile,
      currentTags: currentTags.map((tag) => tag.tagValue),
      candidate: targetCard,
    });

    const match = await this.prisma.match.create({
      data: {
        userAId: userId,
        userBId: targetCard.userId,
        cardAId: myCard.id,
        cardBId: targetCard.id,
        zoneId: targetCard.zoneId,
        matchScore: score.score,
        matchReason: score.reason,
      },
    });

    return { swipe, match };
  }

  private async findMyMatchableCard(userId: string, zoneId: string) {
    return this.prisma.card.findFirst({
      where: {
        userId,
        zoneId,
        status: {
          in: [CardStatus.ACTIVE, CardStatus.PENDING],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  private async ensureNotBlocked(userId: string, targetUserId: string) {
    const block = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedUserId: targetUserId },
          { blockerId: targetUserId, blockedUserId: userId },
        ],
      },
    });

    if (block) {
      throw new ForbiddenException("你们之间存在拉黑关系，不能继续互动");
    }
  }
}
