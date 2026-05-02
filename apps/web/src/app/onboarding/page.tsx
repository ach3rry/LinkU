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
        <p className="text-sm font-black uppercase tracking-[0.24em] text-campus-grass">
          Onboarding
        </p>
        <h1 className="mt-4 font-display text-5xl font-black leading-tight md:text-6xl">
          一句话建卡，先把表达成本降下来。
        </h1>
        <p className="mt-5 text-lg leading-8 text-campus-ink/70">
          这里先用 fallback 规则模拟 AI Link。后续接入 Provider 后，解析和文案会走真实模型。
        </p>
      </section>
      <OnboardingStepper initialZone={toZoneCode(params?.zone)} />
    </main>
  );
}
