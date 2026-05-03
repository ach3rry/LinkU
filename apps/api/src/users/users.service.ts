import { Injectable, NotFoundException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type UpsertMockUserInput = {
  email: string;
  nickname: string;
  school: string;
  city: string;
  role: UserRole;
};

type UpsertAuthUserInput = {
  id: string;
  email?: string;
  nickname: string;
  role: UserRole;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertMockUser(input: UpsertMockUserInput) {
    const user = await this.prisma.user.upsert({
      where: {
        email: input.email,
      },
      create: {
        email: input.email,
        nickname: input.nickname,
        role: input.role,
        lastActiveAt: new Date(),
        profile: {
          create: {
            school: input.school,
            city: input.city,
          },
        },
      },
      update: {
        nickname: input.nickname,
        role: input.role,
        lastActiveAt: new Date(),
        profile: {
          upsert: {
            create: {
              school: input.school,
              city: input.city,
            },
            update: {
              school: input.school,
              city: input.city,
            },
          },
        },
      },
      include: {
        profile: true,
        subscriptions: true,
      },
    });

    return this.toPublicUser(user);
  }

  async upsertAuthUser(input: UpsertAuthUserInput) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: input.id }, ...(input.email ? [{ email: input.email }] : [])],
      },
    });

    const user = existingUser
      ? await this.prisma.user.update({
          where: {
            id: existingUser.id,
          },
          data: {
            email: input.email,
            nickname: input.nickname,
            role: input.role,
            lastActiveAt: new Date(),
          },
          include: {
            profile: true,
            subscriptions: true,
          },
        })
      : await this.prisma.user.create({
          data: {
            id: input.id,
            email: input.email,
            nickname: input.nickname,
            role: input.role,
            lastActiveAt: new Date(),
          },
          include: {
            profile: true,
            subscriptions: true,
          },
        });

    return this.toPublicUser(user);
  }

  async findPublicById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        profile: true,
        subscriptions: true,
      },
    });

    if (!user) {
      throw new NotFoundException("用户不存在");
    }

    return this.toPublicUser(user);
  }

  private toPublicUser(user: Awaited<ReturnType<typeof this.prisma.user.findFirst>> & object) {
    return user;
  }
}
