import { Injectable } from "@nestjs/common";
import { Card, OnlineMode, Profile, User, VerifiedStatus } from "@prisma/client";
import { MatchFactor, matchWeights } from "./matching.constants";

type CardWithUser = Card & {
  user: User & {
    profile: Profile | null;
  };
};

type ScoreInput = {
  currentProfile: Profile | null;
  currentTags: string[];
  candidate: CardWithUser;
};

@Injectable()
export class MatchingService {
  scoreCandidate(input: ScoreInput) {
    const factors: MatchFactor[] = [];
    let score = 0;

    const tagScore = this.scoreTags(input.currentTags, this.readStringArray(input.candidate.tags));
    if (tagScore > 0) factors.push("tags");
    score += tagScore;

    const locationScore = this.scoreLocation(input.currentProfile, input.candidate.user.profile);
    if (locationScore > 0) factors.push("location");
    score += locationScore;

    const scheduleScore = this.scoreSchedule(input.candidate.schedule);
    if (scheduleScore > 0) factors.push("schedule");
    score += scheduleScore;

    const budgetScore = this.scoreBudget(input.candidate);
    if (budgetScore > 0) factors.push("budget");
    score += budgetScore;

    const activityScore = this.scoreActivity(input.candidate.user.lastActiveAt);
    if (activityScore > 0) factors.push("activity");
    score += activityScore;

    const trustScore = this.scoreTrust(input.candidate.user.profile);
    if (trustScore > 0) factors.push("trust");
    score += trustScore;

    const preferenceScore = this.scorePreference(input.currentProfile, input.candidate);
    if (preferenceScore > 0) factors.push("preference");
    score += preferenceScore;

    const finalScore = Math.min(100, Math.max(0, Math.round(score + input.candidate.scoreBoost)));

    return {
      score: finalScore,
      matchedFactors: factors,
      reason: this.buildFallbackReason(input.candidate, factors),
    };
  }

  private scoreTags(currentTags: string[], candidateTags: string[]) {
    if (currentTags.length === 0 || candidateTags.length === 0)
      return Math.round(matchWeights.tags * 0.35);

    const normalizedCurrent = new Set(currentTags.map((tag) => tag.trim().toLowerCase()));
    const matched = candidateTags.filter((tag) =>
      normalizedCurrent.has(tag.trim().toLowerCase()),
    ).length;
    const ratio = matched / Math.max(1, Math.min(normalizedCurrent.size, candidateTags.length));

    return Math.round(matchWeights.tags * Math.min(1, ratio));
  }

  private scoreLocation(currentProfile: Profile | null, candidateProfile: Profile | null) {
    if (!currentProfile || !candidateProfile) return 0;
    if (currentProfile.school === candidateProfile.school) return matchWeights.location;
    if (currentProfile.city === candidateProfile.city)
      return Math.round(matchWeights.location * 0.7);
    return 0;
  }

  private scoreSchedule(schedule: unknown) {
    if (!schedule || typeof schedule !== "object") return 0;
    const text = "text" in schedule ? String(schedule.text ?? "") : "";
    return text ? matchWeights.schedule : Math.round(matchWeights.schedule * 0.3);
  }

  private scoreBudget(card: Card) {
    if (card.priceMin || card.priceMax) return matchWeights.budget;
    return Math.round(matchWeights.budget * 0.35);
  }

  private scoreActivity(lastActiveAt: Date | null) {
    if (!lastActiveAt) return 0;
    const ageInDays = (Date.now() - lastActiveAt.getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays <= 3) return matchWeights.activity;
    if (ageInDays <= 14) return Math.round(matchWeights.activity * 0.5);
    return 0;
  }

  private scoreTrust(profile: Profile | null) {
    if (!profile) return 0;
    if (profile.verifiedStatus === VerifiedStatus.PROVIDER_VERIFIED) return matchWeights.trust;
    if (profile.verifiedStatus === VerifiedStatus.STUDENT_VERIFIED)
      return Math.round(matchWeights.trust * 0.75);
    return Math.round(matchWeights.trust * 0.25);
  }

  private scorePreference(currentProfile: Profile | null, candidate: CardWithUser) {
    let score = 0;
    if (candidate.onlineMode === OnlineMode.HYBRID)
      score += Math.round(matchWeights.preference * 0.5);
    if (currentProfile?.relationshipBoundary && candidate.user.profile?.relationshipBoundary) {
      score += Math.round(matchWeights.preference * 0.5);
    }
    return Math.min(matchWeights.preference, score);
  }

  private readStringArray(value: unknown) {
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  }

  private buildFallbackReason(candidate: CardWithUser, factors: MatchFactor[]) {
    const tags = this.readStringArray(candidate.tags).slice(0, 2).join("和");
    const matched = new Set(factors);
    const pieces: string[] = [];

    if (tags) pieces.push(`TA 的标签包含${tags}`);
    if (matched.has("location")) pieces.push("学校或城市与你较接近");
    if (matched.has("schedule")) pieces.push("时间信息比较明确");
    if (matched.has("budget")) pieces.push("预算或报价可用于快速判断");
    if (matched.has("trust")) pieces.push("认证状态更可信");

    return pieces.length > 0
      ? `${pieces.join("，")}，适合作为优先了解对象。`
      : "TA 与你的专区需求一致，可以先查看卡片细节再决定是否右滑。";
  }
}
