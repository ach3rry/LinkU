import { ForbiddenException, Injectable } from "@nestjs/common";
import { SubscriptionPlan, SwipeDirection } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { subscriptionPolicies } from "./subscription-policy";

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMembership(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const plan = subscription?.plan ?? SubscriptionPlan.FREE;

    return {
      plan,
      status: subscription?.status ?? "ACTIVE",
      source: subscription?.source ?? "mock",
      startsAt: subscription?.startsAt,
      endsAt: subscription?.endsAt,
      policy: subscriptionPolicies[plan],
    };
  }

  async getUsage(userId: string) {
    const membership = await this.getMembership(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [swipeCount, rightSwipeCount] = await Promise.all([
      this.prisma.swipe.count({
        where: {
          swiperId: userId,
          createdAt: {
            gte: today,
          },
        },
      }),
      this.prisma.swipe.count({
        where: {
          swiperId: userId,
          direction: SwipeDirection.RIGHT,
          createdAt: {
            gte: today,
          },
        },
      }),
    ]);

    return {
      plan: membership.plan,
      dailySwipeLimit: membership.policy.dailySwipeLimit,
      dailyRightSwipeLimit: membership.policy.dailyRightSwipeLimit,
      swipeCount,
      rightSwipeCount,
      swipeRemaining: Math.max(0, membership.policy.dailySwipeLimit - swipeCount),
      rightSwipeRemaining: Math.max(0, membership.policy.dailyRightSwipeLimit - rightSwipeCount),
    };
  }

  async ensureCanSwipe(userId: string, direction: SwipeDirection) {
    const usage = await this.getUsage(userId);

    if (usage.swipeRemaining <= 0) {
      throw new ForbiddenException("今日滑卡次数已用完，MVP 阶段这是会员限制 mock。");
    }

    if (direction === SwipeDirection.RIGHT && usage.rightSwipeRemaining <= 0) {
      throw new ForbiddenException("今日右滑次数已用完，MVP 阶段这是会员限制 mock。");
    }
  }
}
