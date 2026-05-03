import assert from "node:assert/strict";
import test from "node:test";
import { SubscriptionPlan } from "@prisma/client";
import { subscriptionPolicies } from "./subscription-policy";

test("free subscription keeps MVP usage limits conservative", () => {
  const policy = subscriptionPolicies[SubscriptionPlan.FREE];

  assert.equal(policy.dailySwipeLimit, 50);
  assert.equal(policy.dailyRightSwipeLimit, 10);
  assert.equal(policy.canSeeWhoLikedMe, false);
  assert.equal(policy.canUseAdvancedFilters, false);
});

test("premium mock policy unlocks the highest local demo limits", () => {
  const free = subscriptionPolicies[SubscriptionPlan.FREE];
  const semester = subscriptionPolicies[SubscriptionPlan.SEMESTER];
  const premium = subscriptionPolicies[SubscriptionPlan.PREMIUM_MOCK];

  assert.ok(semester.dailySwipeLimit > free.dailySwipeLimit);
  assert.ok(premium.dailySwipeLimit > semester.dailySwipeLimit);
  assert.ok(premium.dailyRightSwipeLimit > semester.dailyRightSwipeLimit);
  assert.equal(premium.canSeeWhoLikedMe, true);
  assert.equal(premium.canUseAdvancedFilters, true);
});
