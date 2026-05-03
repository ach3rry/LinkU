"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AIInsightBox } from "../../components/ai-insight-box";
import { TagPill } from "../../components/tag-pill";
import { Button } from "../../components/ui/button";
import {
  createMockCheckout,
  getApiAccessToken,
  getMembership,
  getPremiumEntries,
  getUsage,
  type MembershipResponse,
  type PremiumEntry,
  type UsageResponse,
} from "../../lib/api";
import {
  getCurrentSupabaseProfile,
  isSupabaseDirectMode,
  upsertSupabaseProfile,
  type SupabaseProfile,
  useSupabaseSession,
} from "../../lib/supabase";
import { mockProfile } from "../../lib/mock-data";

const fallbackMembership: MembershipResponse = {
  plan: "FREE",
  status: "ACTIVE",
  source: "mock",
  policy: {
    dailySwipeLimit: 50,
    dailyRightSwipeLimit: 10,
    canSeeWhoLikedMe: false,
    canUseAdvancedFilters: false,
    priorityBoost: 0,
  },
};

const fallbackUsage: UsageResponse = {
  plan: "FREE",
  dailySwipeLimit: 50,
  dailyRightSwipeLimit: 10,
  swipeCount: 0,
  rightSwipeCount: 0,
  swipeRemaining: 50,
  rightSwipeRemaining: 10,
};

type UserCard = {
  id: string;
  title: string;
  subtitle: string;
  tags: unknown;
  status: string;
  zone: { code: string; name: string };
};

function readTags(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function ProfileDashboard() {
  const { client: supabaseClient, isReady, session, user } = useSupabaseSession();
  const [myCards, setMyCards] = useState<UserCard[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [profile, setProfile] = useState<SupabaseProfile | null>(null);
  const [profileForm, setProfileForm] = useState({
    school: "",
    city: "",
    grade: "",
    major: "",
    bio: "",
  });
  const [membership, setMembership] = useState(fallbackMembership);
  const [usage, setUsage] = useState(fallbackUsage);
  const [premiumEntries, setPremiumEntries] = useState<PremiumEntry[]>([]);
  const [token, setToken] = useState<string>();
  const [statusText, setStatusText] = useState("正在读取我的信息...");
  const [profileStatusText, setProfileStatusText] = useState("补充资料后，别人更容易判断是否合适。");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const nickname = user?.user_metadata?.nickname ?? user?.email?.split("@")[0] ?? mockProfile.nickname;
  const school = profile?.school ?? user?.user_metadata?.school ?? "";
  const city = profile?.city ?? user?.user_metadata?.city ?? "";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Wait for session to be ready
      if (!isReady) return;

      // Not logged in
      if (!session) {
        setStatusText("登录后查看我的主页。");
        return;
      }

      // Supabase direct mode
      if (isSupabaseDirectMode() && supabaseClient) {
        try {
          const [cardsResult, matchesResult, profileResult] = await Promise.all([
            supabaseClient
              .from("Card")
              .select("id, title, subtitle, tags, status, zone:Zone(code, name)")
              .eq("userId", session.user.id)
              .order("createdAt", { ascending: false }),
            supabaseClient
              .from("Match")
              .select("id", { count: "exact", head: true })
              .or(`userAId.eq.${session.user.id},userBId.eq.${session.user.id}`)
              .limit(1),
            getCurrentSupabaseProfile(supabaseClient, session),
          ]);

          if (cancelled) return;

          if (cardsResult.error) {
            console.error("[Profile] Card query error:", cardsResult.error);
            setStatusText(`读取卡片失败: ${cardsResult.error.message}`);
          } else if (cardsResult.data) {
            setMyCards(cardsResult.data as unknown as UserCard[]);
          }

          if (matchesResult.error) {
            console.error("[Profile] Match query error:", matchesResult.error);
          } else if (matchesResult.count !== null && matchesResult.count !== undefined) {
            setMatchCount(matchesResult.count);
          }

          setProfile(profileResult);
          setProfileForm({
            school: profileResult?.school ?? "",
            city: profileResult?.city ?? "",
            grade: profileResult?.grade ?? "",
            major: profileResult?.major ?? "",
            bio: profileResult?.bio ?? "",
          });

          if (!cardsResult.error) {
            setStatusText("我的信息已更新。");
          }
        } catch (err) {
          if (cancelled) return;
          console.error("[Profile] Load error:", err);
          setStatusText("暂时无法读取最新信息。");
        }
        return;
      }

      // API mode
      try {
        const accessToken = await getApiAccessToken();

        if (!accessToken) {
          setStatusText("登录后查看我的主页。");
          return;
        }

        const [membershipResponse, usageResponse, premiumResponse] = await Promise.all([
          getMembership(accessToken),
          getUsage(accessToken),
          getPremiumEntries(),
        ]);

        if (cancelled) return;

        setToken(accessToken);
        setMembership(membershipResponse);
        setUsage(usageResponse);
        setPremiumEntries(premiumResponse);
        setStatusText("我的信息已更新。");
      } catch {
        if (cancelled) return;
        setStatusText("暂时无法读取最新信息。");
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [supabaseClient, isReady, session]);

  async function handleSaveProfile() {
    if (!supabaseClient || !session) {
      setProfileStatusText("请先登录，再保存资料。");
      return;
    }

    if (!profileForm.school.trim() || !profileForm.city.trim()) {
      setProfileStatusText("学校和城市需要填写。");
      return;
    }

    setIsSavingProfile(true);
    setProfileStatusText("正在保存...");

    try {
      const savedProfile = await upsertSupabaseProfile(supabaseClient, session, profileForm);
      setProfile(savedProfile);
      setProfileForm({
        school: savedProfile.school,
        city: savedProfile.city,
        grade: savedProfile.grade ?? "",
        major: savedProfile.major ?? "",
        bio: savedProfile.bio ?? "",
      });
      setProfileStatusText("资料已保存。");
    } catch (error) {
      setProfileStatusText(error instanceof Error ? error.message : "资料没有保存成功。");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleMockCheckout() {
    if (!token) {
      setStatusText("请先登录，再查看会员。");
      return;
    }

    const result = await createMockCheckout(token);
    setStatusText(result.message);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12">
      <section className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="rounded-[2rem] bg-campus-ink p-7 text-campus-paper">
          <p className="text-sm font-black text-campus-lime">我的主页</p>
          <h1 className="mt-4 font-display text-5xl font-black">{nickname}</h1>
          <p className="mt-4 leading-7 text-campus-paper/72">
            {school ? `${school} · ${city}` : "登录后查看你的主页"}
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div>
              <p className="font-display text-4xl font-black">{myCards.length}</p>
              <p className="mt-1 text-xs text-campus-paper/60">卡片</p>
            </div>
            <div>
              <p className="font-display text-4xl font-black">{matchCount}</p>
              <p className="mt-1 text-xs text-campus-paper/60">匹配</p>
            </div>
            <div>
              <p className="font-display text-4xl font-black">{usage.rightSwipeRemaining}</p>
              <p className="mt-1 text-xs text-campus-paper/60">右滑余量</p>
            </div>
          </div>
          <Button asChild variant="secondary" className="mt-8 w-full">
            <Link href="/onboarding">更新我的卡片</Link>
          </Button>
        </aside>

        <section className="space-y-5">
          <AIInsightBox title="会员状态">
            <p>
              当前为 {membership.plan}，每日滑卡 {usage.swipeCount}/{usage.dailySwipeLimit}
              ，每日右滑 {usage.rightSwipeCount}/{usage.dailyRightSwipeLimit}。
            </p>
            <p className="mt-2">{statusText}</p>
            <Button className="mt-4" variant="secondary" onClick={handleMockCheckout}>
              查看学期会员
            </Button>
          </AIInsightBox>

          <div className="rounded-[2rem] bg-white/72 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black text-campus-grass">我的卡片</p>
                <h2 className="mt-2 font-display text-4xl font-black">正在展示的需求</h2>
              </div>
            </div>
            {myCards.length > 0 ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {myCards.map((card) => (
                  <article key={card.id} className="rounded-[1.5rem] bg-campus-paper p-5">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-campus-grass">
                      {card.zone?.name ?? card.status}
                    </p>
                    <h3 className="mt-3 font-display text-2xl font-black">{card.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-campus-ink/65">{card.subtitle}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {readTags(card.tags)
                        .slice(0, 3)
                        .map((tag) => (
                          <TagPill key={tag}>{tag}</TagPill>
                        ))}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm leading-7 text-campus-ink/60">
                还没有卡片。去建卡页面发布一张吧。
              </p>
            )}
          </div>

          <div className="rounded-[2rem] bg-white/72 p-6">
            <div>
              <p className="text-sm font-black text-campus-grass">我的资料</p>
              <h2 className="mt-2 font-display text-4xl font-black">让别人更快看懂你</h2>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-campus-ink/66">
                学校
                <input
                  value={profileForm.school}
                  onChange={(event) =>
                    setProfileForm((value) => ({ ...value, school: event.target.value }))
                  }
                  className="h-12 rounded-2xl border border-campus-ink/10 bg-campus-paper/70 px-4 text-base font-normal text-campus-ink outline-none transition focus:border-campus-grass"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-campus-ink/66">
                城市
                <input
                  value={profileForm.city}
                  onChange={(event) =>
                    setProfileForm((value) => ({ ...value, city: event.target.value }))
                  }
                  className="h-12 rounded-2xl border border-campus-ink/10 bg-campus-paper/70 px-4 text-base font-normal text-campus-ink outline-none transition focus:border-campus-grass"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-campus-ink/66">
                年级
                <input
                  value={profileForm.grade}
                  onChange={(event) =>
                    setProfileForm((value) => ({ ...value, grade: event.target.value }))
                  }
                  placeholder="例如：大二 / 研一"
                  className="h-12 rounded-2xl border border-campus-ink/10 bg-campus-paper/70 px-4 text-base font-normal text-campus-ink outline-none transition placeholder:text-campus-ink/35 focus:border-campus-grass"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-campus-ink/66">
                专业
                <input
                  value={profileForm.major}
                  onChange={(event) =>
                    setProfileForm((value) => ({ ...value, major: event.target.value }))
                  }
                  className="h-12 rounded-2xl border border-campus-ink/10 bg-campus-paper/70 px-4 text-base font-normal text-campus-ink outline-none transition focus:border-campus-grass"
                />
              </label>
            </div>
            <label className="mt-3 grid gap-2 text-sm font-bold text-campus-ink/66">
              简介
              <textarea
                value={profileForm.bio}
                onChange={(event) =>
                  setProfileForm((value) => ({ ...value, bio: event.target.value }))
                }
                placeholder="一句话说说你的学习方向、可约时间或匹配偏好。"
                className="min-h-24 resize-none rounded-2xl border border-campus-ink/10 bg-campus-paper/70 px-4 py-3 text-base font-normal leading-7 text-campus-ink outline-none transition placeholder:text-campus-ink/35 focus:border-campus-grass"
              />
            </label>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                {isSavingProfile ? "正在保存" : "保存资料"}
              </Button>
              <p className="text-sm font-bold text-campus-ink/56">{profileStatusText}</p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-campus-lime p-6">
            <p className="text-sm font-black text-campus-grass">学长学姐专区</p>
            <h2 className="mt-2 font-display text-4xl font-black">经验咨询先看清楚</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {premiumEntries.slice(0, 4).map((entry) => (
                <article key={entry.id} className="rounded-[1.25rem] bg-campus-paper/80 p-4">
                  <p className="font-black">{entry.title}</p>
                  <p className="mt-2 text-sm text-campus-ink/65">
                    {entry.user.nickname} · {entry.user.profile?.school ?? "学校待确认"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {readTags(entry.tags)
                      .slice(0, 3)
                      .map((tag) => (
                        <TagPill key={tag}>{tag}</TagPill>
                      ))}
                  </div>
                </article>
              ))}
              {premiumEntries.length === 0 ? (
                <p className="text-sm leading-7 text-campus-ink/70">
                  暂无学长学姐卡片。稍后再来看看。
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
