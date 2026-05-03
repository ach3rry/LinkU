import { SwipeExperience } from "./swipe-experience";

export default function SwipePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12">
      <section className="mb-8 max-w-3xl">
        <p className="text-sm font-black text-campus-grass">滑卡</p>
        <h1 className="mt-4 font-display text-5xl font-black leading-tight md:text-6xl">
          论坛先放一边，先滑到合适的人。
        </h1>
        <p className="mt-5 text-lg leading-8 text-campus-ink/70">
          看见合适的人就右滑，不合适就跳过。双向确认后再发起联系。
        </p>
      </section>
      <SwipeExperience />
    </main>
  );
}
