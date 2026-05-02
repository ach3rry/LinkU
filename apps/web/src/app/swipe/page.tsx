import { SwipeExperience } from "./swipe-experience";

export default function SwipePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12">
      <section className="mb-8 max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-campus-grass">
          Swipe Demo
        </p>
        <h1 className="mt-4 font-display text-5xl font-black leading-tight md:text-6xl">
          论坛先放一边，先滑到合适的人。
        </h1>
        <p className="mt-5 text-lg leading-8 text-campus-ink/70">
          这一页先用 mock 卡片演示滑卡、匹配理由和匹配成功弹窗。下一阶段会接后端推荐和 swipe 记录。
        </p>
      </section>
      <SwipeExperience />
    </main>
  );
}
