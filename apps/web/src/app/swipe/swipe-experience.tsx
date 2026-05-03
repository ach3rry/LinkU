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
  getApiAccessToken,
  getRecommendations,
  type ApiRecommendationItem,
} from "../../lib/api";
import {
  createSupabaseBlock,
  createSupabaseContactRequest,
  getSupabaseRecommendations,
  createSupabaseReport,
  createSupabaseSwipe,
  isSupabaseDirectMode,
  type SupabaseRecommendation,
  useSupabaseSession,
} from "../../lib/supabase";
import { mockRecommendations, type MockRecommendation } from "../../lib/mock-data";

type DataMode = "loading" | "api" | "supabase" | "mock";

function readTags(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function readSchedule(value: unknown) {
  if (!value || typeof value !== "object") return "时间待确认";
  return "text" in value ? String(value.text ?? "时间待确认") : "时间待确认";
}

function mapApiRecommendation(item: ApiRecommendationItem): MockRecommendation {
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

function mapSupabaseRecommendation(item: SupabaseRecommendation): MockRecommendation {
  const profile = item.user.profile;
  const price =
    item.priceMin || item.priceMax
      ? `${item.priceMin ?? "?"}-${item.priceMax ?? "?"} / h`
      : undefined;

  return {
    id: item.id,
    targetUserId: item.user.id,
    zone: item.zone.code.toLowerCase() as MockRecommendation["zone"],
    name: item.user.nickname,
    school: profile?.school ?? "学校待确认",
    role: [profile?.major, profile?.grade].filter(Boolean).join(" ") || "校园用户",
    title: item.title,
    subtitle: item.subtitle,
    description: item.description,
    tags: readTags(item.tags),
    matchScore: 75,
    reason: "同城、同专区、兴趣匹配",
    price,
    schedule: readSchedule(item.schedule),
    mode:
      item.onlineMode === "ONLINE"
        ? "线上"
        : item.onlineMode === "OFFLINE"
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
  const [cards, setCards] = useState<MockRecommendation[]>([]);
  const [statusText, setStatusText] = useState("正在读取推荐...");
  const [activeZone, setActiveZone] = useState<string>("tutoring");
  const { client: supabaseClient, isReady, session: supabaseSession } = useSupabaseSession();

  const current = cards.length ? cards[index % cards.length] : undefined;
  const progress = useMemo(() => index + 1, [index]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      // Wait for session to be ready
      if (!isReady) return;

      // Not logged in — fall through to API/mock
      if (!supabaseSession) {
        setMode("mock");
        setStatusText("登录后查看推荐。");
        return;
      }

      // Try Supabase direct mode first
      if (isSupabaseDirectMode() && supabaseClient) {
        try {
          const recs = await getSupabaseRecommendations(
            supabaseClient,
            supabaseSession,
            activeZone,
          );
          const mapped = recs.map(mapSupabaseRecommendation);

          if (cancelled) return;

          if (mapped.length === 0) {
            setMode("supabase");
            setStatusText("暂时没有新的推荐。发布一张卡片，让更多人找到你。");
            return;
          }

          setCards(mapped);
          setMode("supabase");
          setStatusText("推荐已准备好。");
          return;
        } catch (err) {
          if (cancelled) return;
          console.error("[Swipe] Supabase error:", err);
          // Fall through to API mode
        }
      }

      // Try API mode
      try {
        const accessToken = await getApiAccessToken();

        if (!accessToken) {
          if (cancelled) return;
          setMode("mock");
          setStatusText("登录后查看推荐。");
          return;
        }

        const recommendations = await getRecommendations(accessToken, activeZone);
        const apiCards = recommendations.items.map(mapApiRecommendation);

        if (cancelled) return;

        if (apiCards.length === 0) {
          setMode("mock");
          setStatusText("暂时没有新的推荐。");
          return;
        }

        setToken(accessToken);
        setCards(apiCards);
        setMode("api");
        setStatusText("推荐已准备好。");
      } catch {
        if (cancelled) return;
        if (process.env.NODE_ENV !== "production") {
          setCards(mockRecommendations);
          setMode("mock");
          setStatusText("本地体验已准备好。");
          return;
        }

        setMode("mock");
        setStatusText("暂时无法读取推荐，请稍后再试。");
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [activeZone, supabaseClient, supabaseSession]);

  async function handleSwipe(direction: "left" | "right") {
    if (!current) return;

    const swipedCard = current;

    if (mode === "supabase" && supabaseClient && supabaseSession) {
      try {
        const result = await createSupabaseSwipe(
          supabaseClient,
          supabaseSession,
          swipedCard.id,
          direction,
          swipedCard.zone,
        );

        if (direction === "right" && result.match) {
          setMatchId(result.match.id);
          setMatchedCard(swipedCard);
        }
      } catch (error) {
        setStatusText(error instanceof Error ? error.message : "滑卡没有完成，请稍后再试。");
      }
    } else if (mode === "api" && token) {
      try {
        const response = await createSwipe(token, swipedCard.id, direction);

        if (direction === "right" && response.match) {
          setMatchId(response.match.id);
          setMatchedCard(swipedCard);
        } else if (response.hint) {
          setStatusText(response.hint);
        }
      } catch (error) {
        setStatusText(error instanceof Error ? error.message : "滑卡没有完成，请稍后再试。");
      }
    } else if (mode !== "supabase" && mode !== "api" && direction === "right" && swipedCard.matchScore >= 85) {
      setMatchedCard(swipedCard);
    }

    setIndex((value) => value + 1);
  }

  async function sendContactRequest(message: string) {
    if (mode === "supabase" && supabaseClient && supabaseSession && matchId) {
      await createSupabaseContactRequest(supabaseClient, supabaseSession, matchId, message);
      setStatusText("联系申请已发送。");
      setMatchedCard(undefined);
      return;
    }

    if (!token || !matchId) {
      setStatusText("联系申请需要先完成匹配。");
      return;
    }

    await createContactRequest(token, matchId, message);
    setStatusText("联系申请已发送。");
    setMatchedCard(undefined);
  }

  async function reportCurrentCard(card: MockRecommendation) {
    if (mode === "supabase" && supabaseClient && supabaseSession) {
      await createSupabaseReport(supabaseClient, supabaseSession, {
        targetCardId: card.id,
        targetUserId: card.targetUserId,
        reason: "用户主动举报",
        detail: "来自滑卡页的快速举报。",
      });
      setStatusText("举报已提交，管理员会在审核台处理。");
      return;
    }

    if (!token || mode !== "api") {
      setStatusText("当前暂时不能提交举报。");
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
    if (!card.targetUserId) {
      setStatusText("当前暂时不能拉黑该用户。");
      return;
    }

    if (mode === "supabase" && supabaseClient && supabaseSession) {
      await createSupabaseBlock(supabaseClient, supabaseSession, card.targetUserId, "来自滑卡页的快速拉黑。");
      setStatusText("已拉黑该用户，后续推荐会过滤 TA 的卡片。");
      setIndex((value) => value + 1);
      return;
    }

    if (!token || mode !== "api") {
      setStatusText("当前暂时不能拉黑该用户。");
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
          <div className="mt-4 flex gap-2">
            {(["tutoring", "buddy", "premium"] as const).map((zone) => (
              <button
                key={zone}
                onClick={() => {
                  setActiveZone(zone);
                  setIndex(0);
                  setCards([]);
                  setStatusText("正在读取推荐...");
                  setMode("loading");
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  activeZone === zone
                    ? "bg-campus-ink text-campus-paper"
                    : "bg-campus-ink/5 text-campus-ink/60 hover:bg-campus-ink/10"
                }`}
              >
                {zone === "tutoring" ? "家教" : zone === "buddy" ? "搭子" : "学长学姐"}
              </button>
            ))}
          </div>
        </div>
        <SafetyNotice />
      </aside>

      <section className="flex flex-col items-center">
        {current ? (
          <>
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
          </>
        ) : (
          <div className="grid min-h-[32rem] w-full place-items-center rounded-[2rem] bg-white/70 p-8 text-center">
            <div>
              <h2 className="font-display text-4xl font-black">还没有可看的卡片</h2>
              <p className="mt-3 text-sm leading-7 text-campus-ink/62">{statusText}</p>
            </div>
          </div>
        )}
      </section>

      <aside className="rounded-[2rem] bg-campus-ink p-6 text-campus-paper">
        <p className="text-sm font-black text-campus-lime">推荐规则</p>
        <div className="mt-5 space-y-4 text-sm leading-7 text-campus-paper/76">
          <p>同专区、未滑过、未拉黑、审核通过，是推荐前置条件。</p>
          <p>时间、预算、地点、学校和标签越清楚，越容易遇到合适的人。</p>
          <p>不合适就跳过，想了解再右滑。</p>
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
