import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ProfileUpsertInput, relationshipBoundaryMap } from "./profiles.dto";

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: {
        userId
      }
    });

    if (!profile) {
      throw new NotFoundException("还没有创建个人资料");
    }

    return profile;
  }

  upsertMine(userId: string, input: ProfileUpsertInput) {
    return this.prisma.profile.upsert({
      where: {
        userId
      },
      create: {
        userId,
        school: input.school,
        city: input.city,
        campus: input.campus,
        grade: input.grade,
        major: input.major,
        bio: input.bio,
        gender: input.gender,
        relationshipBoundary: relationshipBoundaryMap[input.relationshipBoundary],
        safetyPreference: input.safetyPreference as Prisma.InputJsonValue
      },
      update: {
        school: input.school,
        city: input.city,
        campus: input.campus,
        grade: input.grade,
        major: input.major,
        bio: input.bio,
        gender: input.gender,
        relationshipBoundary: relationshipBoundaryMap[input.relationshipBoundary],
        safetyPreference: input.safetyPreference as Prisma.InputJsonValue
      }
    });
  }
}
