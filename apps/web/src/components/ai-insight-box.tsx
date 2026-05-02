import { Sparkles } from "lucide-react";

export function AIInsightBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border border-campus-ink/10 bg-white/70 p-5 shadow-[0_20px_60px_rgba(23,33,26,0.08)]">
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-campus-grass">
        <Sparkles className="h-4 w-4" />
        {title}
      </div>
      <div className="text-sm leading-7 text-campus-ink/72">{children}</div>
    </section>
  );
}
