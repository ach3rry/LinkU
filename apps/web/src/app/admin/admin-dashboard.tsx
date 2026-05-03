"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import {
  getApiAccessToken,
  getAdminPendingCards,
  getAdminReports,
  type AdminCardItem,
  type AdminReportItem,
} from "../../lib/api";
import { mockReports } from "../../lib/mock-data";
import {
  getSupabaseAdminCards,
  getSupabaseAdminReports,
  isSupabaseDirectMode,
  useSupabaseSession,
} from "../../lib/supabase";

const mockPendingCards: AdminCardItem[] = [
  {
    id: "card-pending-001",
    title: "想找英语口语搭子",
    subtitle: "边界清楚，一起练口语",
    zone: { name: "搭子专区" },
    status: "PENDING",
  },
  {
    id: "card-pending-002",
    title: "项目陪跑咨询",
    subtitle: "学长学姐专区，等待审核",
    zone: { name: "学长学姐专区" },
    status: "PENDING",
  },
];

function mapMockReports(): AdminReportItem[] {
  return mockReports.map((report) => ({
    id: report.id,
    reason: report.reason,
    detail: report.target,
    status: report.status,
    createdAt: new Date().toISOString(),
    targetCard: {
      title: report.target,
    },
  }));
}

export function AdminDashboard() {
  const { client: supabaseClient, isReady, session: supabaseSession } = useSupabaseSession();
  const [reports, setReports] = useState<AdminReportItem[]>(mapMockReports());
  const [cards, setCards] = useState<AdminCardItem[]>(mockPendingCards);
  const [statusText, setStatusText] = useState("正在读取审核数据...");

  useEffect(() => {
    let cancelled = false;

    async function loadAdminData() {
      if (!isReady) return;

      if (isSupabaseDirectMode() && supabaseClient) {
        if (!supabaseSession) {
          setStatusText("需要管理员登录后查看。");
          return;
        }

        try {
          const [supabaseReports, supabaseCards] = await Promise.all([
            getSupabaseAdminReports(supabaseClient, supabaseSession),
            getSupabaseAdminCards(supabaseClient, supabaseSession),
          ]);

          if (cancelled) return;

          setReports(supabaseReports);
          setCards(supabaseCards);
          setStatusText("审核数据已更新。");
        } catch (error) {
          if (cancelled) return;
          setStatusText(error instanceof Error ? error.message : "暂时无法读取审核数据。");
        }
        return;
      }

      try {
        const accessToken = await getApiAccessToken("admin");

        if (!accessToken) {
          setStatusText("需要管理员登录后查看。");
          return;
        }

        const [apiReports, apiCards] = await Promise.all([
          getAdminReports(accessToken),
          getAdminPendingCards(accessToken),
        ]);

        if (cancelled) return;

        setReports(apiReports);
        setCards(apiCards);
        setStatusText("审核数据已更新。");
      } catch {
        if (cancelled) return;
        setStatusText("暂时无法读取审核数据。");
      }
    }

    void loadAdminData();

    return () => {
      cancelled = true;
    };
  }, [isReady, supabaseClient, supabaseSession]);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12">
      <section className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-campus-grass">
            审核台
          </p>
          <h1 className="mt-4 font-display text-5xl font-black leading-tight md:text-6xl">
            管理后台先看风险，不追求复杂。
          </h1>
          <p className="mt-4 text-sm font-bold text-campus-ink/55">{statusText}</p>
        </div>
        <div className="rounded-full bg-campus-lime px-5 py-3 text-sm font-black">
          {reports.length} 个举报记录
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] bg-white/72 p-6">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-campus-coral" />
            <h2 className="font-display text-3xl font-black">举报列表</h2>
          </div>
          <div className="mt-6 divide-y divide-campus-ink/10">
            {reports.map((report) => (
              <article key={report.id} className="grid gap-3 py-5 md:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-black">
                    {report.targetCard?.title ?? report.targetUser?.nickname ?? "举报目标"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-campus-ink/65">
                    {report.reason}
                    {report.detail ? ` · ${report.detail}` : ""}
                  </p>
                </div>
                <span className="h-fit rounded-full bg-campus-ink/5 px-3 py-1 text-sm font-bold">
                  {report.status}
                </span>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-campus-ink p-6 text-campus-paper">
          <p className="text-sm font-black text-campus-lime">待审核卡片</p>
          <div className="mt-6 space-y-4">
            {cards.map((card) => (
              <article key={card.id} className="rounded-[1.5rem] bg-white/10 p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-campus-lime">
                  {card.zone.name}
                </p>
                <h3 className="mt-3 font-display text-2xl font-black">{card.title}</h3>
                <p className="mt-3 text-sm text-campus-paper/65">
                  {card.subtitle} · {card.status}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
