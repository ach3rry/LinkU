"use client";

import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import {
  type GeneratedCardResponse,
  type MembershipResponse,
  type ParsedDemandResponse,
  type UsageResponse,
} from "./api";

let browserClient: SupabaseClient | null = null;

const zoneCodeMap = {
  tutoring: "TUTORING",
  buddy: "BUDDY",
  premium: "PREMIUM",
} as const;

const onlineModeMap = {
  online: "ONLINE",
  offline: "OFFLINE",
  hybrid: "HYBRID",
} as const;

const subscriptionPolicies = {
  FREE: {
    dailySwipeLimit: 50,
    dailyRightSwipeLimit: 10,
    canSeeWhoLikedMe: false,
    canUseAdvancedFilters: false,
    priorityBoost: 0,
  },
  SEMESTER: {
    dailySwipeLimit: 200,
    dailyRightSwipeLimit: 60,
    canSeeWhoLikedMe: true,
    canUseAdvancedFilters: true,
    priorityBoost: 5,
  },
  PREMIUM_MOCK: {
    dailySwipeLimit: 999,
    dailyRightSwipeLimit: 999,
    canSeeWhoLikedMe: true,
    canUseAdvancedFilters: true,
    priorityBoost: 10,
  },
} as const;

type SubscriptionPlan = keyof typeof subscriptionPolicies;

function isSubscriptionPlan(value: unknown): value is SubscriptionPlan {
  return typeof value === "string" && value in subscriptionPolicies;
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isSupabaseDirectMode() {
  return process.env.NEXT_PUBLIC_LINKU_DATA_MODE === "supabase";
}

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        global: {
          headers: {
            "X-Client-Info": "linku-web/0.1.0",
          },
        },
      },
    );
  }

  return browserClient;
}

export function useSupabaseSession() {
  const client = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(!client);

  useEffect(() => {
    if (!client) return;

    let mounted = true;

    void client.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setIsReady(true);
    });

    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsReady(true);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [client]);

  return {
    client,
    isReady,
    session,
    token: session?.access_token,
    user: session?.user,
  };
}

export async function upsertCurrentSupabaseUser(client: SupabaseClient, session: Session) {
  const email = session.user.email?.toLowerCase();
  const metadata = session.user.user_metadata ?? {};
  const nickname =
    [metadata.nickname, metadata.full_name, metadata.name].find(
      (value): value is string => typeof value === "string" && value.trim().length > 0,
    ) ??
    email?.split("@")[0] ??
    "LinkU 用户";

  const { error } = await client.from("User").upsert(
    {
      id: session.user.id,
      email,
      nickname: nickname.slice(0, 24),
      role: "USER",
      status: "ACTIVE",
      lastActiveAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      onConflict: "id",
    },
  );

  if (error) {
    console.error("[Supabase] upsertCurrentSupabaseUser error:", error);
    throw new Error(error.message);
  }
}

export async function createSupabaseCard(
  client: SupabaseClient,
  session: Session,
  input: {
    demand: ParsedDemandResponse;
    draft: GeneratedCardResponse;
  },
) {
  await upsertCurrentSupabaseUser(client, session);

  const zoneCode = zoneCodeMap[input.demand.zone];
  const { data: zone, error: zoneError } = await client
    .from("Zone")
    .select("id")
    .eq("code", zoneCode)
    .eq("enabled", true)
    .single();

  if (zoneError || !zone) {
    throw new Error("专区数据还没有准备好，请先初始化基础数据。");
  }

  const type =
    input.demand.zone === "buddy"
      ? "buddy_request"
      : input.demand.zone === "premium"
        ? "premium_consultation"
        : input.demand.intent.includes("提供")
          ? "provide_tutoring"
          : "need_tutoring";

  const { data, error } = await client
    .from("Card")
    .insert({
      userId: session.user.id,
      zoneId: zone.id,
      type,
      title: input.draft.title,
      subtitle: input.draft.subtitle,
      description: input.draft.description,
      tags: input.draft.tags,
      priceMin: input.demand.budgetMin,
      priceMax: input.demand.budgetMax,
      schedule: input.demand.scheduleText ? { text: input.demand.scheduleText } : {},
      location: input.demand.location,
      onlineMode: onlineModeMap[input.demand.onlineMode],
      status: "ACTIVE",
      aiGenerated: false,
    })
    .select("id,title,status")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "卡片没有保存成功，请稍后再试。");
  }

  return data;
}

export type SupabaseProfile = {
  id: string;
  userId: string;
  school: string;
  city: string;
  grade?: string | null;
  major?: string | null;
  bio?: string | null;
  verifiedStatus: "UNVERIFIED" | "STUDENT_VERIFIED" | "PROVIDER_VERIFIED";
};

export type SupabaseProfileInput = {
  school: string;
  city: string;
  grade?: string;
  major?: string;
  bio?: string;
};

function trimOptional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function getSupabaseProfile(client: SupabaseClient, session: Session) {
  await upsertCurrentSupabaseUser(client, session);

  const { data, error } = await client
    .from("Profile")
    .select("id, userId, school, city, grade, major, bio, verifiedStatus")
    .eq("userId", session.user.id)
    .maybeSingle();

  if (error) {
    console.error("[Supabase] getSupabaseProfile error:", error);
    throw new Error(error.message);
  }

  return data as SupabaseProfile | null;
}

export async function upsertSupabaseProfile(
  client: SupabaseClient,
  session: Session,
  input: SupabaseProfileInput,
) {
  await upsertCurrentSupabaseUser(client, session);

  const school = input.school.trim();
  const city = input.city.trim();

  if (!school || !city) {
    throw new Error("学校和城市不能为空。");
  }

  const { data, error } = await client
    .from("Profile")
    .upsert(
      {
        userId: session.user.id,
        school,
        city,
        grade: trimOptional(input.grade),
        major: trimOptional(input.major),
        bio: trimOptional(input.bio),
        updatedAt: new Date().toISOString(),
      },
      {
        onConflict: "userId",
      },
    )
    .select("id, userId, school, city, grade, major, bio, verifiedStatus")
    .single();

  if (error || !data) {
    console.error("[Supabase] upsertSupabaseProfile error:", error);
    throw new Error(error?.message ?? "资料没有保存成功，请稍后再试。");
  }

  return data as SupabaseProfile;
}

export async function getSupabaseMembership(
  client: SupabaseClient,
  session: Session,
): Promise<MembershipResponse> {
  await upsertCurrentSupabaseUser(client, session);

  const { data, error } = await client
    .from("Subscription")
    .select("plan, status, source, startsAt, endsAt, createdAt")
    .eq("userId", session.user.id)
    .eq("status", "ACTIVE")
    .order("createdAt", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[Supabase] getSupabaseMembership error:", error);
    throw new Error(error.message);
  }

  const plan = isSubscriptionPlan(data?.plan) ? data.plan : "FREE";

  return {
    plan,
    status: typeof data?.status === "string" ? data.status : "ACTIVE",
    source: typeof data?.source === "string" ? data.source : "supabase",
    policy: subscriptionPolicies[plan],
  };
}

export async function getSupabaseUsage(
  client: SupabaseClient,
  session: Session,
  membership?: MembershipResponse,
): Promise<UsageResponse> {
  const activeMembership = membership ?? (await getSupabaseMembership(client, session));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [swipeResult, rightSwipeResult] = await Promise.all([
    client
      .from("Swipe")
      .select("id", { count: "exact", head: true })
      .eq("swiperId", session.user.id)
      .gte("createdAt", today.toISOString()),
    client
      .from("Swipe")
      .select("id", { count: "exact", head: true })
      .eq("swiperId", session.user.id)
      .eq("direction", "RIGHT")
      .gte("createdAt", today.toISOString()),
  ]);

  if (swipeResult.error || rightSwipeResult.error) {
    console.error("[Supabase] getSupabaseUsage error:", swipeResult.error ?? rightSwipeResult.error);
    throw new Error(swipeResult.error?.message ?? rightSwipeResult.error?.message ?? "用量读取失败。");
  }

  const swipeCount = swipeResult.count ?? 0;
  const rightSwipeCount = rightSwipeResult.count ?? 0;

  return {
    plan: activeMembership.plan,
    dailySwipeLimit: activeMembership.policy.dailySwipeLimit,
    dailyRightSwipeLimit: activeMembership.policy.dailyRightSwipeLimit,
    swipeCount,
    rightSwipeCount,
    swipeRemaining: Math.max(0, activeMembership.policy.dailySwipeLimit - swipeCount),
    rightSwipeRemaining: Math.max(0, activeMembership.policy.dailyRightSwipeLimit - rightSwipeCount),
  };
}

// ---- Supabase direct swipe/match/contact ----

export type SupabaseRecommendation = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: unknown;
  priceMin?: number | null;
  priceMax?: number | null;
  schedule: unknown;
  onlineMode: "ONLINE" | "OFFLINE" | "HYBRID";
  zone: { code: string; name: string };
  user: {
    id: string;
    nickname: string;
    profile?: {
      school: string;
      city: string;
      major?: string | null;
      grade?: string | null;
      verifiedStatus: string;
    } | null;
  };
};

export async function getSupabaseRecommendations(
  client: SupabaseClient,
  session: Session,
  zoneCode: string,
) {
  await upsertCurrentSupabaseUser(client, session);

  const supabaseZoneCode = zoneCodeMap[zoneCode as keyof typeof zoneCodeMap] ?? "TUTORING";

  // Get the zone
  const { data: zone, error: zoneError } = await client
    .from("Zone")
    .select("id, code, name")
    .eq("code", supabaseZoneCode)
    .eq("enabled", true)
    .single();

  if (zoneError || !zone) {
    return [];
  }

  // Get user's blocked users
  const { data: blocks } = await client
    .from("Block")
    .select("blockedUserId")
    .eq("blockerId", session.user.id);

  const blockedIds = (blocks ?? []).map((b) => b.blockedUserId);

  // Get cards already swiped by the user
  const { data: swiped } = await client
    .from("Swipe")
    .select("targetCardId")
    .eq("swiperId", session.user.id)
    .eq("zoneId", zone.id);

  const swipedIds = (swiped ?? []).map((s) => s.targetCardId);

  // Get active cards in the zone, excluding own, blocked, and swiped
  let query = client
    .from("Card")
    .select(
      "id, title, subtitle, description, tags, priceMin, priceMax, schedule, onlineMode, zone:Zone(code, name), user:User(id, nickname, profile:Profile(school, city, major, grade, verifiedStatus))",
    )
    .eq("zoneId", zone.id)
    .eq("status", "ACTIVE")
    .neq("userId", session.user.id)
    .limit(20);

  if (blockedIds.length > 0) {
    query = query.not("userId", "in", `(${blockedIds.join(",")})`);
  }

  if (swipedIds.length > 0) {
    query = query.not("id", "in", `(${swipedIds.join(",")})`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[Supabase] getSupabaseRecommendations error:", error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data as unknown as SupabaseRecommendation[];
}

export type SupabaseSwipeResult = {
  swipe: { id: string };
  match?: {
    id: string;
  } | null;
};

export async function createSupabaseSwipe(
  client: SupabaseClient,
  session: Session,
  targetCardId: string,
  direction: "left" | "right",
  zoneCode: string,
): Promise<SupabaseSwipeResult> {
  await upsertCurrentSupabaseUser(client, session);

  const supabaseZoneCode = zoneCodeMap[zoneCode as keyof typeof zoneCodeMap] ?? "TUTORING";
  const { data: zone } = await client
    .from("Zone")
    .select("id")
    .eq("code", supabaseZoneCode)
    .single();

  if (!zone) {
    throw new Error("专区数据不存在。");
  }

  // Insert the swipe
  const { data: swipe, error: swipeError } = await client
    .from("Swipe")
    .insert({
      swiperId: session.user.id,
      targetCardId,
      zoneId: zone.id,
      direction: direction === "right" ? "RIGHT" : "LEFT",
    })
    .select("id")
    .single();

  if (swipeError || !swipe) {
    console.error("[Supabase] createSupabaseSwipe error:", swipeError);
    throw new Error(swipeError?.message ?? "滑卡失败。");
  }

  // If left swipe, no match check needed
  if (direction === "left") {
    return { swipe, match: null };
  }

  // Right swipe: check if the target card's owner also right-swiped one of our cards
  // 1. Get the target card's owner
  const { data: targetCard } = await client
    .from("Card")
    .select("userId")
    .eq("id", targetCardId)
    .single();

  if (!targetCard) {
    return { swipe, match: null };
  }

  // 2. Get one of current user's active cards in this zone
  const { data: myCard } = await client
    .from("Card")
    .select("id")
    .eq("userId", session.user.id)
    .eq("zoneId", zone.id)
    .eq("status", "ACTIVE")
    .limit(1)
    .single();

  if (!myCard) {
    return { swipe, match: null };
  }

  // 3. Check if the target user already right-swiped our card
  const { data: existingSwipe } = await client
    .from("Swipe")
    .select("id")
    .eq("swiperId", targetCard.userId)
    .eq("targetCardId", myCard.id)
    .eq("direction", "RIGHT")
    .maybeSingle();

  if (!existingSwipe) {
    return { swipe, match: null };
  }

  // 4. Create match!
  const { data: match, error: matchError } = await client
    .from("Match")
    .insert({
      userAId: session.user.id,
      userBId: targetCard.userId,
      cardAId: myCard.id,
      cardBId: targetCardId,
      zoneId: zone.id,
      status: "ACTIVE",
      matchScore: 75,
    })
    .select("id")
    .single();

  if (matchError || !match) {
    return { swipe, match: null };
  }

  return { swipe, match };
}

export async function createSupabaseContactRequest(
  client: SupabaseClient,
  session: Session,
  matchId: string,
  message: string,
) {
  await upsertCurrentSupabaseUser(client, session);

  const { error } = await client.from("ContactRequest").insert({
    matchId,
    senderId: session.user.id,
    message,
    status: "PENDING",
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function createSupabaseBlock(
  client: SupabaseClient,
  session: Session,
  blockedUserId: string,
  reason?: string,
) {
  const { error } = await client.from("Block").insert({
    blockerId: session.user.id,
    blockedUserId,
    reason: reason ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function createSupabaseReport(
  client: SupabaseClient,
  session: Session,
  input: {
    targetUserId?: string;
    targetCardId?: string;
    reason: string;
    detail?: string;
  },
) {
  const { error } = await client.from("Report").insert({
    reporterId: session.user.id,
    targetUserId: input.targetUserId ?? null,
    targetCardId: input.targetCardId ?? null,
    reason: input.reason,
    detail: input.detail ?? null,
    status: "PENDING",
  });

  if (error) {
    throw new Error(error.message);
  }
}

export type SupabaseAdminReport = {
  id: string;
  reason: string;
  detail?: string | null;
  status: string;
  createdAt: string;
  targetCard?: {
    title: string;
  } | null;
  targetUser?: {
    nickname: string;
  } | null;
};

export type SupabaseAdminCard = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  zone: {
    name: string;
  };
};

export function isSupabaseAdminSession(session: Session) {
  const metadata = {
    ...session.user.app_metadata,
    ...session.user.user_metadata,
  };
  const adminEmails = (process.env.NEXT_PUBLIC_LINKU_ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return (
    metadata.linku_role === "admin" ||
    metadata.role === "admin" ||
    (session.user.email ? adminEmails.includes(session.user.email.toLowerCase()) : false)
  );
}

export async function getSupabaseAdminReports(client: SupabaseClient, session: Session) {
  if (!isSupabaseAdminSession(session)) {
    throw new Error("需要管理员登录后查看。");
  }

  const { data, error } = await client
    .from("Report")
    .select("id, reason, detail, status, createdAt, targetCard:Card(title), targetUser:User(nickname)")
    .order("createdAt", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[Supabase] getSupabaseAdminReports error:", error);
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as SupabaseAdminReport[];
}

export async function getSupabaseAdminCards(client: SupabaseClient, session: Session) {
  if (!isSupabaseAdminSession(session)) {
    throw new Error("需要管理员登录后查看。");
  }

  const { data, error } = await client
    .from("Card")
    .select("id, title, subtitle, status, zone:Zone(name)")
    .in("status", ["PENDING", "ACTIVE", "REJECTED"])
    .order("createdAt", { ascending: false })
    .limit(30);

  if (error) {
    console.error("[Supabase] getSupabaseAdminCards error:", error);
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as SupabaseAdminCard[];
}
