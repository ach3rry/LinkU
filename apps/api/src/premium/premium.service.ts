import { Injectable } from "@nestjs/common";
import { CardStatus, ZoneCode } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PremiumService {
  constructor(private readonly prisma: PrismaService) {}

  async listEntries() {
    const zone = await this.prisma.zone.findUnique({
      where: {
        code: ZoneCode.PREMIUM,
      },
    });

    if (!zone) {
      return [];
    }

    return this.prisma.card.findMany({
      where: {
        zoneId: zone.id,
        status: CardStatus.ACTIVE,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: [{ scoreBoost: "desc" }, { createdAt: "desc" }],
      take: 12,
    });
  }
}
