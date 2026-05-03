import { AuthPanel } from "../../components/auth-panel";

export default function AuthPage() {
  return (
    <main className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-6xl items-center gap-10 px-5 py-12 lg:grid-cols-[0.9fr_1.1fr]">
      <section>
        <p className="text-sm font-black text-campus-grass">LinkU</p>
        <h1 className="mt-4 font-display text-6xl font-black leading-[0.92] md:text-7xl">
          校园匹配，
          <span className="block text-campus-grass">先有分寸。</span>
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-8 text-campus-ink/68">
          建一张清楚的卡片，遇到合适的人，再决定要不要联系。
        </p>
      </section>
      <AuthPanel />
    </main>
  );
}
