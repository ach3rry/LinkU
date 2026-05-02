import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBlockInput } from "./blocks.dto";

@Injectable()
export class BlocksService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.block.findMany({
      where: {
        blockerId: userId,
      },
      include: {
        blockedUser: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  create(userId: string, input: CreateBlockInput) {
    if (userId === input.blockedUserId) {
      throw new BadRequestException("不能拉黑自己");
    }

    return this.prisma.block.upsert({
      where: {
        blockerId_blockedUserId: {
          blockerId: userId,
          blockedUserId: input.blockedUserId,
        },
      },
      create: {
        blockerId: userId,
        blockedUserId: input.blockedUserId,
        reason: input.reason,
      },
      update: {
        reason: input.reason,
      },
    });
  }

  async remove(userId: string, blockedUserId: string) {
    await this.prisma.block.deleteMany({
      where: {
        blockerId: userId,
        blockedUserId,
      },
    });

    return { success: true };
  }
}
