"use client";

import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { type GeneratedCardResponse, type ParsedDemandResponse } from "./api";

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
    },
    {
      onConflict: "id",
    },
  );

  if (error) {
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
      status: "PENDING",
      aiGenerated: false,
    })
    .select("id,title,status")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "卡片没有保存成功，请稍后再试。");
  }

  return data;
}
