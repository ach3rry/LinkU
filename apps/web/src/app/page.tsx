import { ZONES } from "@linku/shared";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
      <nav className="flex items-center justify-between">
        <span className="font-display text-3xl font-black tracking-tight">LinkU</span>
        <span className="rounded-full border border-campus-ink/15 bg-white/60 px-4 py-2 text-sm">
          AI Link MVP
        </span>
      </nav>

      <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-campus-lime px-4 py-2 text-sm font-bold">
            不发帖，不刷屏，只滑到合适的人
          </p>
          <h1 className="font-display text-6xl font-black leading-[0.95] tracking-tight md:text-7xl">
            AI 帮你在校园里更快匹配资源。
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-campus-ink/75">
            输入一句需求，LinkU 自动生成卡片、解释匹配理由，并在双向确认后解锁联系申请。
            MVP 阶段重点跑通家教和搭子匹配，Premium Match 先做展示与 mock。
          </p>
        </div>

        <div className="grid gap-4">
          {ZONES.map((zone) => (
            <article
              key={zone.code}
              className="rounded-[2rem] border border-campus-ink/10 bg-white/70 p-6 shadow-[0_24px_80px_rgba(23,33,26,0.10)] backdrop-blur"
            >
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-campus-grass">
                {zone.code}
              </p>
              <h2 className="mt-2 font-display text-3xl font-black">{zone.name}</h2>
              <p className="mt-3 leading-7 text-campus-ink/70">{zone.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

