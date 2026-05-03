import { Injectable, NotFoundException } from "@nestjs/common";
import { CardStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CardCreateInput, publicOnlineModeToPrisma, publicZoneToPrisma } from "./cards.dto";

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async listMine(userId: string) {
    return this.prisma.card.findMany({
      where: {
        userId,
      },
      include: {
        zone: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async create(userId: string, input: CardCreateInput) {
    const zone = await this.prisma.zone.findUnique({
      where: {
        code: publicZoneToPrisma[input.zone],
      },
    });

    if (!zone) {
      throw new NotFoundException("专区不存在或尚未初始化");
    }

    return this.prisma.card.create({
      data: {
        userId,
        zoneId: zone.id,
        type: input.type,
        title: input.title,
        subtitle: input.subtitle,
        description: input.description,
        tags: input.tags,
        priceMin: input.priceMin,
        priceMax: input.priceMax,
        schedule: input.schedule as Prisma.InputJsonValue,
        location: input.location,
        onlineMode: publicOnlineModeToPrisma[input.onlineMode],
        status: CardStatus.ACTIVE,
        aiGenerated: input.aiGenerated,
      },
      include: {
        zone: true,
      },
    });
  }
}
