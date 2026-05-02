import { ShieldAlert } from "lucide-react";
import { mockReports } from "../../lib/mock-data";

const pendingCards = [
  {
    id: "card-pending-001",
    title: "想找英语口语搭子",
    zone: "搭子专区",
    moderation: "低风险",
    status: "待人工确认",
  },
  {
    id: "card-pending-002",
    title: "AI coding 陪跑咨询",
    zone: "学长学姐专区",
    moderation: "低风险",
    status: "Premium mock",
  },
];

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12">
      <section className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-campus-grass">
            Admin Mock
          </p>
          <h1 className="mt-4 font-display text-5xl font-black leading-tight md:text-6xl">
            管理后台先看风险，不追求复杂。
          </h1>
        </div>
        <div className="rounded-full bg-campus-lime px-5 py-3 text-sm font-black">
          2 个待审核举报
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] bg-white/72 p-6">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-campus-coral" />
            <h2 className="font-display text-3xl font-black">举报列表</h2>
          </div>
          <div className="mt-6 divide-y divide-campus-ink/10">
            {mockReports.map((report) => (
              <article key={report.id} className="grid gap-3 py-5 md:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-black">{report.target}</p>
                  <p className="mt-2 text-sm leading-6 text-campus-ink/65">{report.reason}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="rounded-full bg-campus-coral/15 px-3 py-1 font-black text-campus-coral">
                    {report.risk}
                  </span>
                  <span className="rounded-full bg-campus-ink/5 px-3 py-1 font-bold">
                    {report.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-campus-ink p-6 text-campus-paper">
          <p className="text-sm font-black text-campus-lime">待审核卡片</p>
          <div className="mt-6 space-y-4">
            {pendingCards.map((card) => (
              <article key={card.id} className="rounded-[1.5rem] bg-white/10 p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-campus-lime">
                  {card.zone}
                </p>
                <h3 className="mt-3 font-display text-2xl font-black">{card.title}</h3>
                <p className="mt-3 text-sm text-campus-paper/65">
                  AI 审核：{card.moderation} · {card.status}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
