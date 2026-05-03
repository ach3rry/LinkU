import { ZONES } from "@linku/shared";
import { ZoneCard } from "../../components/zone-card";

export default function ZonesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12">
      <section className="max-w-3xl">
        <p className="text-sm font-black text-campus-grass">专区</p>
        <h1 className="mt-4 font-display text-5xl font-black leading-tight md:text-6xl">
          先选专区，再把需求变成卡片。
        </h1>
        <p className="mt-5 text-lg leading-8 text-campus-ink/70">
          家教、搭子、学长学姐经验咨询，先把场景分清楚。
        </p>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {ZONES.map((zone) => (
          <ZoneCard key={zone.code} {...zone} />
        ))}
      </section>
    </main>
  );
}
