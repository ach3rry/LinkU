"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
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
  getSupabaseMembership,
  getSupabaseProfile,
  getSupabaseUsage,
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

type ProfileForm = {
  school: string;
  city: string;
  grade: string;
  major: string;
  bio: string;
};

const emptyProfileForm: ProfileForm = {
  school: "",
  city: "",
  grade: "",
  major: "",
  bio: "",
};

function readTags(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function readMetadataString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toProfileForm(profile: SupabaseProfile | null, metadata: Record<string, unknown> = {}) {
  return {
    school: profile?.school ?? readMetadataString(metadata.school),
    city: profile?.city ?? readMetadataString(metadata.city),
    grade: profile?.grade ?? readMetadataString(metadata.grade),
    major: profile?.major ?? readMetadataString(metadata.major),
    bio: profile?.bio ?? readMetadataString(metadata.bio),
  };
}

export function ProfileDashboard() {
  const { client: supabaseClient, isReady, session, user } = useSupabaseSession();
  const [myCards, setMyCards] = useState<UserCard[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [profile, setProfile] = useState<SupabaseProfile | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfileForm);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("登录后可以补充学校、城市、年级和专业。");
  const [membership, setMembership] = useState(fallbackMembership);
  const [usage, setUsage] = useState(fallbackUsage);
  const [premiumEntries, setPremiumEntries] = useState<PremiumEntry[]>([]);
  const [token, setToken] = useState<string>();
  const [statusText, setStatusText] = useState("正在读取我的信息...");

  const nickname = user?.user_metadata?.nickname ?? user?.email?.split("@")[0] ?? mockProfile.nickname;
  const school = profile?.school ?? readMetadataString(user?.user_metadata?.school);
  const city = profile?.city ?? readMetadataString(user?.user_metadata?.city);
  const profileSummary = [school, city, profile?.grade, profile?.major].filter(Boolean).join(" · ");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Wait for session to be ready
      if (!isReady) return;

      // Not logged in
      if (!session) {
        setStatusText("登录后查看我的主页。");
        setProfile(null);
        setProfileForm(emptyProfileForm);
        setProfileMessage("登录后可以补充学校、城市、年级和专业。");
        return;
      }

      // Supabase direct mode
      if (isSupabaseDirectMode() && supabaseClient) {
        try {
          let profileLoadError: string | undefined;
          let membershipLoadError: string | undefined;
          let usageLoadError: string | undefined;
          const profilePromise = getSupabaseProfile(supabaseClient, session).catch((error: Error) => {
            console.error("[Profile] Profile query error:", error);
            profileLoadError = error.message;
            return null;
          });
          const membershipPromise = getSupabaseMembership(supabaseClient, session).catch((error: Error) => {
            console.error("[Profile] Membership query error:", error);
            membershipLoadError = error.message;
            return fallbackMembership;
          });
          const usagePromise = membershipPromise
            .then((loadedMembership) => getSupabaseUsage(supabaseClient, session, loadedMembership))
            .catch((error: Error) => {
              console.error("[Profile] Usage query error:", error);
              usageLoadError = error.message;
              return fallbackUsage;
            });

          const [profileResult, membershipResult, usageResult, cardsResult, matchesResult] = await Promise.all([
            profilePromise,
            membershipPromise,
            usagePromise,
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
          ]);

          if (cancelled) return;

          setProfile(profileResult);
          setProfileForm(toProfileForm(profileResult, session.user.user_metadata));
          setMembership(membershipResult);
          setUsage(usageResult);
          setProfileMessage(
            profileLoadError
              ? `资料读取失败: ${profileLoadError}`
              : profileResult
                ? "资料已同步，可以继续调整。"
                : "还没有资料，先补上学校和城市。",
          );

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

          if (!cardsResult.error) {
            setStatusText(
              membershipLoadError || usageLoadError
                ? `会员信息读取失败: ${membershipLoadError ?? usageLoadError}`
                : "我的信息已更新。",
            );
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

  function updateProfileForm(field: keyof ProfileForm, value: string) {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleProfileSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session || !supabaseClient) {
      setProfileMessage("请先登录，再保存资料。");
      return;
    }

    if (!isSupabaseDirectMode()) {
      setProfileMessage("当前数据模式暂不支持前端直连保存资料。");
      return;
    }

    if (!profileForm.school.trim() || !profileForm.city.trim()) {
      setProfileMessage("学校和城市是必填项。");
      return;
    }

    try {
      setIsSavingProfile(true);
      setProfileMessage("正在保存资料...");
      const savedProfile = await upsertSupabaseProfile(supabaseClient, session, profileForm);
      setProfile(savedProfile);
      setProfileForm(toProfileForm(savedProfile, session.user.user_metadata));
      setProfileMessage("资料已保存。");
      setStatusText("我的信息已更新。");
    } catch (error) {
      console.error("[Profile] Save profile error:", error);
      setProfileMessage(error instanceof Error ? error.message : "资料保存失败，请稍后再试。");
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

          <form className="rounded-[2rem] bg-white/72 p-6" onSubmit={handleProfileSave}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black text-campus-grass">我的资料</p>
                <h2 className="mt-2 font-display text-4xl font-black">学校信息</h2>
                <p className="mt-2 text-sm leading-6 text-campus-ink/60">
                  {profileSummary || "补充资料后，别人能更准确判断是否适合互助。"}
                </p>
              </div>
              <Button type="submit" size="sm" disabled={isSavingProfile || !session}>
                {isSavingProfile ? "保存中" : "保存"}
              </Button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-bold text-campus-ink/72">
                学校
                <input
                  className="mt-2 h-11 w-full rounded-2xl border border-campus-ink/10 bg-campus-paper px-4 text-sm font-semibold outline-none transition focus:border-campus-grass"
                  value={profileForm.school}
                  onChange={(event) => updateProfileForm("school", event.target.value)}
                  placeholder="例如：同济大学"
                  maxLength={60}
                  required
                />
              </label>
              <label className="text-sm font-bold text-campus-ink/72">
                城市
                <input
                  className="mt-2 h-11 w-full rounded-2xl border border-campus-ink/10 bg-campus-paper px-4 text-sm font-semibold outline-none transition focus:border-campus-grass"
                  value={profileForm.city}
                  onChange={(event) => updateProfileForm("city", event.target.value)}
                  placeholder="例如：上海"
                  maxLength={40}
                  required
                />
              </label>
              <label className="text-sm font-bold text-campus-ink/72">
                年级
                <input
                  className="mt-2 h-11 w-full rounded-2xl border border-campus-ink/10 bg-campus-paper px-4 text-sm font-semibold outline-none transition focus:border-campus-grass"
                  value={profileForm.grade}
                  onChange={(event) => updateProfileForm("grade", event.target.value)}
                  placeholder="例如：大二 / 研一"
                  maxLength={30}
                />
              </label>
              <label className="text-sm font-bold text-campus-ink/72">
                专业
                <input
                  className="mt-2 h-11 w-full rounded-2xl border border-campus-ink/10 bg-campus-paper px-4 text-sm font-semibold outline-none transition focus:border-campus-grass"
                  value={profileForm.major}
                  onChange={(event) => updateProfileForm("major", event.target.value)}
                  placeholder="例如：计算机科学"
                  maxLength={80}
                />
              </label>
            </div>
            <label className="mt-4 block text-sm font-bold text-campus-ink/72">
              简介
              <textarea
                className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-campus-ink/10 bg-campus-paper px-4 py-3 text-sm font-semibold leading-6 outline-none transition focus:border-campus-grass"
                value={profileForm.bio}
                onChange={(event) => updateProfileForm("bio", event.target.value)}
                placeholder="写一点学习方向、可提供的帮助，或你希望别人知道的边界。"
                maxLength={300}
              />
            </label>
            <p className="mt-3 text-sm leading-6 text-campus-ink/60">{profileMessage}</p>
          </form>

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
