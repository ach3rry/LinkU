import { SubscriptionPlan } from "@prisma/client";

export const subscriptionPolicies = {
  [SubscriptionPlan.FREE]: {
    dailySwipeLimit: 50,
    dailyRightSwipeLimit: 10,
    canSeeWhoLikedMe: false,
    canUseAdvancedFilters: false,
    priorityBoost: 0,
  },
  [SubscriptionPlan.SEMESTER]: {
    dailySwipeLimit: 200,
    dailyRightSwipeLimit: 60,
    canSeeWhoLikedMe: true,
    canUseAdvancedFilters: true,
    priorityBoost: 5,
  },
  [SubscriptionPlan.PREMIUM_MOCK]: {
    dailySwipeLimit: 999,
    dailyRightSwipeLimit: 999,
    canSeeWhoLikedMe: true,
    canUseAdvancedFilters: true,
    priorityBoost: 10,
  },
} as const;
