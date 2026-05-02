"use client";

import { ZONES, type ZoneCode } from "@linku/shared";
import { useMemo, useState } from "react";
import { AIInsightBox } from "./ai-insight-box";
import { SafetyNotice } from "./safety-notice";
import { TagPill } from "./tag-pill";
import { Button } from "./ui/button";

const defaultDemand = "想找一个周末能线下教高数的学姐，预算 100/h 左右。";

function inferZone(text: string): ZoneCode {
  if (/简历|保研|考研|项目|coding|竞赛/i.test(text)) return "premium";
  if (/饭|自习|运动|台球|电影|搭子|黑客松|口语/i.test(text)) return "buddy";
  return "tutoring";
}

function buildPreview(text: string) {
  const zone = inferZone(text);
  const skills = text.includes("高数") ? ["高等数学", "周末", "线下可约"] : ["校园匹配", "AI 生成"];

  return {
    zone,
    title:
      zone === "buddy"
        ? "找一个节奏合拍的校园搭子"
        : zone === "premium"
          ? "寻找高价值经验咨询"
          : "想找高数家教带复习",
    subtitle: "AI fallback 预览，后续会接入真实 Provider",
    tags: skills,
    description: text,
  };
}

export function OnboardingStepper({ initialZone }: { initialZone?: ZoneCode }) {
  const [selectedZone, setSelectedZone] = useState<ZoneCode>(initialZone ?? "tutoring");
  const [demand, setDemand] = useState(defaultDemand);
  const preview = useMemo(() => buildPreview(demand), [demand]);
  const activeZone = ZONES.find((zone) => zone.code === selectedZone);

  return (
    <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="rounded-[2rem] bg-white/72 p-6 shadow-[0_24px_90px_rgba(23,33,26,0.08)]">
        <p className="text-sm font-black text-campus-grass">Step 1 / 3</p>
        <h1 className="mt-3 font-display text-4xl font-black">告诉 LinkU 你想匹配什么</h1>
        <div className="mt-6 grid gap-3">
          {ZONES.map((zone) => (
            <button
              key={zone.code}
              onClick={() => setSelectedZone(zone.code)}
              className={`rounded-2xl border p-4 text-left transition ${
                selectedZone === zone.code
                  ? "border-campus-ink bg-campus-lime"
                  : "border-campus-ink/10 bg-white/60 hover:bg-white"
              }`}
            >
              <span className="font-black">{zone.name}</span>
              <span className="mt-1 block text-sm text-campus-ink/60">{zone.description}</span>
            </button>
          ))}
        </div>

        <label className="mt-6 block">
          <span className="text-sm font-black text-campus-ink/60">一句话需求</span>
          <textarea
            value={demand}
            onChange={(event) => setDemand(event.target.value)}
            className="mt-3 min-h-36 w-full resize-none rounded-[1.5rem] border border-campus-ink/10 bg-white/80 p-4 leading-7 outline-none transition focus:border-campus-grass"
          />
        </label>

        <Button className="mt-5 w-full" size="lg">
          确认生成卡片
        </Button>
      </section>

      <section className="space-y-5">
        <AIInsightBox title="AI 解析预览">
          <div className="grid gap-3 text-sm">
            <p>
              <strong>专区：</strong>
              {activeZone?.name}
            </p>
            <p>
              <strong>意图：</strong>
              {selectedZone === "buddy" ? "寻找校园搭子" : "寻找资源匹配"}
            </p>
            <p>
              <strong>关系边界：</strong>
              学习 / 活动优先，双向确认后再联系
            </p>
          </div>
        </AIInsightBox>

        <article className="rounded-[2rem] bg-campus-ink p-6 text-campus-paper shadow-[0_28px_100px_rgba(23,33,26,0.16)]">
          <p className="text-sm font-black text-campus-lime">生成卡片预览</p>
          <h2 className="mt-5 font-display text-4xl font-black">{preview.title}</h2>
          <p className="mt-3 text-campus-paper/72">{preview.subtitle}</p>
          <p className="mt-5 leading-7 text-campus-paper/78">{preview.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {preview.tags.map((tag) => (
              <TagPill key={tag} className="border-white/10 bg-white/10 text-campus-paper">
                {tag}
              </TagPill>
            ))}
          </div>
        </article>

        <SafetyNotice />
      </section>
    </div>
  );
}
