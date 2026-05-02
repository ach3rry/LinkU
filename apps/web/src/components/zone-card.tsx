import { type ZoneCode } from "@linku/shared";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "../lib/utils";

const zoneTone: Record<ZoneCode, string> = {
  tutoring: "bg-campus-lime",
  buddy: "bg-campus-coral text-white",
  premium: "bg-campus-ink text-campus-paper",
};

export function ZoneCard({
  code,
  name,
  description,
  promise,
}: {
  code: ZoneCode;
  name: string;
  description: string;
  promise: string;
}) {
  return (
    <Link
      href={`/onboarding?zone=${code}`}
      className={cn(
        "group flex min-h-72 flex-col justify-between rounded-[2rem] p-7 transition duration-300 hover:-translate-y-1",
        zoneTone[code],
      )}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-[0.24em] opacity-70">{code}</span>
          <ArrowUpRight className="h-5 w-5 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
        <h2 className="mt-8 font-display text-4xl font-black">{name}</h2>
        <p className="mt-4 max-w-sm text-sm leading-7 opacity-75">{description}</p>
      </div>
      <p className="mt-8 border-t border-current/15 pt-5 text-lg font-black leading-7">{promise}</p>
    </Link>
  );
}
