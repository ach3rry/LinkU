import { Injectable } from "@nestjs/common";
import { CardStatus } from "@prisma/client";
import { publicZoneToPrisma } from "../cards/cards.dto";
import { MatchingService } from "../matching/matching.service";
import { PrismaService } from "../prisma/prisma.service";
import { RecommendationQuery } from "./recommendations.dto";

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matchingService: MatchingService,
  ) {}

  async listForUser(userId: string, query: RecommendationQuery) {
    const zoneCode = publicZoneToPrisma[query.zone];

    const [currentProfile, currentTags, swipes, blocksMade, blocksReceived, zone] =
      await Promise.all([
        this.prisma.profile.findUnique({ where: { userId } }),
        this.prisma.userTag.findMany({ where: { userId } }),
        this.prisma.swipe.findMany({
          where: { swiperId: userId },
          select: { targetCardId: true },
        }),
        this.prisma.block.findMany({
          where: { blockerId: userId },
          select: { blockedUserId: true },
        }),
        this.prisma.block.findMany({
          where: { blockedUserId: userId },
          select: { blockerId: true },
        }),
        this.prisma.zone.findUnique({ where: { code: zoneCode } }),
      ]);

    if (!zone) {
      return { items: [] };
    }

    const swipedCardIds = swipes.map((swipe) => swipe.targetCardId);
    const blockedUserIds = [
      ...blocksMade.map((block) => block.blockedUserId),
      ...blocksReceived.map((block) => block.blockerId),
    ];

    const candidates = await this.prisma.card.findMany({
      where: {
        zoneId: zone.id,
        status: CardStatus.ACTIVE,
        userId: {
          not: userId,
          notIn: blockedUserIds,
        },
        id: {
          notIn: swipedCardIds,
        },
        user: {
          status: "ACTIVE",
        },
      },
      include: {
        zone: true,
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: [{ scoreBoost: "desc" }, { createdAt: "desc" }],
      take: Math.max(query.limit * 3, query.limit),
    });

    const currentTagValues = currentTags.map((tag) => tag.tagValue);

    const items = candidates
      .map((candidate) => {
        const score = this.matchingService.scoreCandidate({
          currentProfile,
          currentTags: currentTagValues,
          candidate,
        });

        return {
          card: candidate,
          ...score,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, query.limit);

    return { items };
  }
}
