import Link from "next/link";
import { AIInsightBox } from "../../components/ai-insight-box";
import { TagPill } from "../../components/tag-pill";
import { Button } from "../../components/ui/button";
import { mockProfile, mockRecommendations } from "../../lib/mock-data";

export default function ProfilePage() {
  const myCards = mockRecommendations.slice(0, 2);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12">
      <section className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="rounded-[2rem] bg-campus-ink p-7 text-campus-paper">
          <p className="text-sm font-black text-campus-lime">我的主页</p>
          <h1 className="mt-4 font-display text-5xl font-black">{mockProfile.nickname}</h1>
          <p className="mt-4 leading-7 text-campus-paper/72">
            {mockProfile.school} · {mockProfile.city} · {mockProfile.major}
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div>
              <p className="font-display text-4xl font-black">{mockProfile.cards}</p>
              <p className="mt-1 text-xs text-campus-paper/60">卡片</p>
            </div>
            <div>
              <p className="font-display text-4xl font-black">{mockProfile.matches}</p>
              <p className="mt-1 text-xs text-campus-paper/60">匹配</p>
            </div>
            <div>
              <p className="font-display text-4xl font-black">{mockProfile.rightSwipesLeft}</p>
              <p className="mt-1 text-xs text-campus-paper/60">右滑余量</p>
            </div>
          </div>
          <Button asChild variant="secondary" className="mt-8 w-full">
            <Link href="/onboarding">更新我的卡片</Link>
          </Button>
        </aside>

        <section className="space-y-5">
          <AIInsightBox title="会员状态">
            当前为 {mockProfile.membership}。MVP 阶段只展示会员状态和次数限制 mock，不接真实支付。
          </AIInsightBox>

          <div className="rounded-[2rem] bg-white/72 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black text-campus-grass">我的卡片</p>
                <h2 className="mt-2 font-display text-4xl font-black">正在展示的需求</h2>
              </div>
              <TagPill>{mockProfile.boundary}</TagPill>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {myCards.map((card) => (
                <article key={card.id} className="rounded-[1.5rem] bg-campus-paper p-5">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-campus-grass">
                    {card.zone}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-black">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-campus-ink/65">{card.subtitle}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {card.tags.slice(0, 3).map((tag) => (
                      <TagPill key={tag}>{tag}</TagPill>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
