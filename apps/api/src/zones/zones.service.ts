import { Injectable } from "@nestjs/common";
import { ZoneCode } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

const zoneCodeToPublic: Record<ZoneCode, "tutoring" | "buddy" | "premium"> = {
  TUTORING: "tutoring",
  BUDDY: "buddy",
  PREMIUM: "premium"
};

@Injectable()
export class ZonesService {
  constructor(private readonly prisma: PrismaService) {}

  async listEnabled() {
    const zones = await this.prisma.zone.findMany({
      where: {
        enabled: true
      },
      orderBy: {
        name: "asc"
      }
    });

    return zones.map((zone) => ({
      ...zone,
      code: zoneCodeToPublic[zone.code]
    }));
  }
}

