import { zoneCodes, type ZoneCode } from "@linku/shared";
import { OnboardingStepper } from "../../components/onboarding-stepper";

function toZoneCode(zone?: string): ZoneCode | undefined {
  return zoneCodes.includes(zone as ZoneCode) ? (zone as ZoneCode) : undefined;
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: Promise<{ zone?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12">
      <section className="mb-8 max-w-3xl">
        <p className="text-sm font-black text-campus-grass">建卡</p>
        <h1 className="mt-4 font-display text-5xl font-black leading-tight md:text-6xl">
          一句话建卡，把需求说清楚。
        </h1>
        <p className="mt-5 text-lg leading-8 text-campus-ink/70">
          选一个专区，写下你想找的人。LinkU 会帮你整理成一张等待审核的卡片。
        </p>
      </section>
      <OnboardingStepper initialZone={toZoneCode(params?.zone)} />
    </main>
  );
}
