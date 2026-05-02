"use client";

import { useEffect, useMemo, useState } from "react";
import { MatchSuccessModal } from "../../components/match-success-modal";
import { SafetyNotice } from "../../components/safety-notice";
import { SwipeCard } from "../../components/swipe-card";
import { Button } from "../../components/ui/button";
import {
  createContactRequest,
  createBlock,
  createReport,
  createSwipe,
  getRecommendations,
  mockLogin,
  type ApiRecommendationItem,
} from "../../lib/api";
import { mockRecommendations, type MockRecommendation } from "../../lib/mock-data";

type DataMode = "loading" | "api" | "mock";

function readTags(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function readSchedule(value: unknown) {
  if (!value || typeof value !== "object") return "时间待确认";
  return "text" in value ? String(value.text ?? "时间待确认") : "时间待确认";
}

function mapRecommendation(item: ApiRecommendationItem): MockRecommendation {
  const profile = item.card.user.profile;
  const price =
    item.card.priceMin || item.card.priceMax
      ? `${item.card.priceMin ?? "?"}-${item.card.priceMax ?? "?"} / h`
      : undefined;

  return {
    id: item.card.id,
    targetUserId: item.card.user.id,
    zone: item.card.zone.code.toLowerCase() as MockRecommendation["zone"],
    name: item.card.user.nickname,
    school: profile?.school ?? "学校待确认",
    role: [profile?.major, profile?.grade].filter(Boolean).join(" ") || "校园用户",
    title: item.card.title,
    subtitle: item.card.subtitle,
    description: item.card.description,
    tags: readTags(item.card.tags),
    matchScore: item.score,
    reason: item.reason,
    price,
    schedule: readSchedule(item.card.schedule),
    mode:
      item.card.onlineMode === "ONLINE"
        ? "线上"
        : item.card.onlineMode === "OFFLINE"
          ? "线下"
          : "线上 / 线下",
    verified: profile?.verifiedStatus !== "UNVERIFIED",
  };
}

export function SwipeExperience() {
  const [index, setIndex] = useState(0);
  const [matchedCard, setMatchedCard] = useState<MockRecommendation>();
  const [matchId, setMatchId] = useState<string>();
  const [mode, setMode] = useState<DataMode>("loading");
  const [token, setToken] = useState<string>();
  const [cards, setCards] = useState<MockRecommendation[]>(mockRecommendations);
  const [statusText, setStatusText] = useState("正在尝试连接本地 API...");

  const current = cards[index % cards.length];
  const progress = useMemo(() => index + 1, [index]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapApiMode() {
      try {
        const login = await mockLogin();
        const recommendations = await getRecommendations(login.token, "tutoring");
        const apiCards = recommendations.items.map(mapRecommendation);

        if (cancelled) return;

        if (apiCards.length === 0) {
          setMode("mock");
          setStatusText("API 已连接，但暂无可推荐卡片，当前使用 mock Demo。");
          return;
        }

        setToken(login.token);
        setCards(apiCards);
        setMode("api");
        setStatusText("已连接后端推荐接口，左右滑会写入 API。");
      } catch {
        if (cancelled) return;
        setMode("mock");
        setStatusText("未检测到可用 API 或数据库，当前使用 mock Demo。");
      }
    }

    void bootstrapApiMode();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSwipe(direction: "left" | "right") {
    const swipedCard = current;

    if (mode === "api" && token) {
      try {
        const response = await createSwipe(token, swipedCard.id, direction);

        if (direction === "right" && response.match) {
          setMatchId(response.match.id);
          setMatchedCard(swipedCard);
        } else if (response.hint) {
          setStatusText(response.hint);
        }
      } catch (error) {
        setStatusText(error instanceof Error ? error.message : "滑卡失败，已保留当前 Demo 状态。");
      }
    }

    if (mode !== "api" && direction === "right" && swipedCard.matchScore >= 85) {
      setMatchedCard(swipedCard);
    }

    setIndex((value) => value + 1);
  }

  async function sendContactRequest(message: string) {
    if (!token || !matchId) {
      setStatusText("mock 模式下只展示联系申请入口，不写入后端。");
      return;
    }

    await createContactRequest(token, matchId, message);
    setStatusText("联系申请已发送。");
    setMatchedCard(undefined);
  }

  async function reportCurrentCard(card: MockRecommendation) {
    if (!token || mode !== "api") {
      setStatusText("mock 模式下已展示举报入口，接入 API 后会写入举报记录。");
      return;
    }

    await createReport(token, {
      targetCardId: card.id,
      targetUserId: card.targetUserId,
      reason: "用户主动举报",
      detail: "来自滑卡页的快速举报。",
    });
    setStatusText("举报已提交，管理员会在审核台处理。");
  }

  async function blockCurrentUser(card: MockRecommendation) {
    if (!token || mode !== "api" || !card.targetUserId) {
      setStatusText("mock 模式下已展示拉黑入口，接入 API 后会写入拉黑记录。");
      return;
    }

    await createBlock(token, card.targetUserId, "来自滑卡页的快速拉黑。");
    setStatusText("已拉黑该用户，后续推荐会过滤 TA 的卡片。");
    setIndex((value) => value + 1);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.7fr_1fr_0.72fr]">
      <aside className="space-y-5">
        <div className="rounded-[2rem] bg-white/72 p-6">
          <p className="text-sm font-black text-campus-grass">今日滑卡</p>
          <p className="mt-3 font-display text-5xl font-black">{progress}</p>
          <p className="mt-2 text-sm leading-6 text-campus-ink/62">
            {mode === "loading" ? "正在加载..." : statusText}
          </p>
        </div>
        <SafetyNotice />
      </aside>

      <section className="flex flex-col items-center">
        <SwipeCard
          key={`${current.id}-${index}`}
          card={current}
          onSwipe={handleSwipe}
          onReport={reportCurrentCard}
          onBlock={blockCurrentUser}
        />
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
        onContactRequest={sendContactRequest}
      />
    </div>
  );
}
