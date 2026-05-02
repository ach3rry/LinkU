"use client";

import { useMemo, useState } from "react";
import { MatchSuccessModal } from "../../components/match-success-modal";
import { SafetyNotice } from "../../components/safety-notice";
import { SwipeCard } from "../../components/swipe-card";
import { Button } from "../../components/ui/button";
import { mockRecommendations, type MockRecommendation } from "../../lib/mock-data";

export function SwipeExperience() {
  const [index, setIndex] = useState(0);
  const [matchedCard, setMatchedCard] = useState<MockRecommendation>();
  const current = mockRecommendations[index % mockRecommendations.length];

  const progress = useMemo(() => index + 1, [index]);

  function handleSwipe(direction: "left" | "right") {
    if (direction === "right" && current.matchScore >= 85) {
      setMatchedCard(current);
    }

    setIndex((value) => value + 1);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.7fr_1fr_0.72fr]">
      <aside className="space-y-5">
        <div className="rounded-[2rem] bg-white/72 p-6">
          <p className="text-sm font-black text-campus-grass">今日滑卡</p>
          <p className="mt-3 font-display text-5xl font-black">{progress}</p>
          <p className="mt-2 text-sm leading-6 text-campus-ink/62">
            Free Plan mock：每日右滑次数后续由后端限制。
          </p>
        </div>
        <SafetyNotice />
      </aside>

      <section className="flex flex-col items-center">
        <SwipeCard key={current.id} card={current} onSwipe={handleSwipe} />
        <div className="mt-7 flex gap-4">
          <Button variant="secondary" size="lg" onClick={() => handleSwipe("left")}>
            左滑跳过
          </Button>
          <Button size="lg" onClick={() => handleSwipe("right")}>
            右滑想联系
          </Button>
        </div>
      </section>

      <aside className="rounded-[2rem] bg-campus-ink p-6 text-campus-paper">
        <p className="text-sm font-black text-campus-lime">推荐规则</p>
        <div className="mt-5 space-y-4 text-sm leading-7 text-campus-paper/76">
          <p>同专区、未滑过、未拉黑、审核通过，是推荐前置过滤。</p>
          <p>匹配分先用规则评分：标签、学校距离、时间、预算、活跃度、认证和偏好。</p>
          <p>AI 只解释后端命中的事实，不直接决定安全逻辑。</p>
        </div>
      </aside>

      <MatchSuccessModal
        card={matchedCard}
        open={Boolean(matchedCard)}
        onClose={() => setMatchedCard(undefined)}
      />
    </div>
  );
}
