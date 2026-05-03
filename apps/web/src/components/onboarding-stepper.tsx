"use client";

import { ZONES, type ZoneCode } from "@linku/shared";
import { useMemo, useState } from "react";
import {
  type GeneratedCardResponse,
  type ParsedDemandResponse,
  createGeneratedCard,
  generateCardDraft,
  mockLogin,
  parseDemand,
} from "../lib/api";
import { AIInsightBox } from "./ai-insight-box";
import { SafetyNotice } from "./safety-notice";
import { TagPill } from "./tag-pill";
import { Button } from "./ui/button";

const demandPlaceholders: Record<ZoneCode, string> = {
  tutoring: "例如：想找一个周末能线下教高数的学姐，预算 100/h 左右。",
  buddy: "例如：想找一个工作日晚上一起自习和吃晚饭的同校搭子，边界清楚一点。",
  premium: "例如：想约一位做过 AI 后端项目的学长，帮我改简历和梳理面试表达。",
};

const previewCopy: Record<
  ZoneCode,
  {
    intent: string;
    boundary: string;
    title: string;
    subtitle: string;
    tags: string[];
    meta: Array<{ label: string; value: string }>;
    tone: string;
  }
> = {
  tutoring: {
    intent: "寻找家教 / 提供家教",
    boundary: "学习目标、预算和时间先对齐，双向确认后再沟通",
    title: "高数基础复习家教匹配",
    subtitle: "按科目、预算、时间和线上/线下偏好生成家教卡片",
    tags: ["高等数学", "预算 100/h", "周末", "线下可约"],
    meta: [
      { label: "匹配重点", value: "科目、年级、预算、教学方式" },
      { label: "推荐字段", value: "价格区间 / 可约时间 / 认证状态" },
    ],
    tone: "表达清楚学习目标，让对方快速判断能否接单。",
  },
  buddy: {
    intent: "寻找校园搭子",
    boundary: "活动优先、边界清楚，不默认发展成 dating",
    title: "找一个节奏合拍的校园搭子",
    subtitle: "按活动类型、频率、地点和关系边界生成搭子卡片",
    tags: ["自习", "晚饭", "轻社交", "边界清楚"],
    meta: [
      { label: "匹配重点", value: "活动、频率、校区、社交边界" },
      { label: "推荐字段", value: "活动时间 / 线下地点 / 安全提醒" },
    ],
    tone: "把相处节奏说具体，减少尬聊和越界成本。",
  },
  premium: {
    intent: "寻找高价值经验咨询",
    boundary: "咨询主题、交付范围和价格预期先讲清楚",
    title: "Premium Match 经验咨询预约",
    subtitle: "按咨询主题、目标阶段和交付方式生成学长学姐卡片",
    tags: ["简历修改", "AI Coding", "项目表达", "Premium"],
    meta: [
      { label: "匹配重点", value: "方向、经验背景、交付形式、价格预期" },
      { label: "推荐字段", value: "服务范围 / 预约制 / mock 支付占位" },
    ],
    tone: "先明确要解决的问题，避免把高价值咨询聊散。",
  },
};

function pickTags(text: string, zone: ZoneCode) {
  const baseTags = previewCopy[zone].tags;
  const detectedTags = [
    /高数|数学|线代/.test(text) ? "高等数学" : undefined,
    /周末|晚上|工作日/.test(text) ? "时间明确" : undefined,
    /线下|校区|图书馆/.test(text) ? "线下可约" : undefined,
    /线上|远程/.test(text) ? "线上可约" : undefined,
    /简历|保研|考研|项目|coding|竞赛/i.test(text) ? "经验咨询" : undefined,
    /饭|自习|运动|台球|电影|搭子|黑客松|口语/i.test(text) ? "校园搭子" : undefined,
  ].filter(Boolean) as string[];

  return Array.from(new Set([...detectedTags, ...baseTags])).slice(0, 5);
}

function buildPreview(text: string, zone: ZoneCode) {
  const copy = previewCopy[zone];

  return {
    ...copy,
    zone,
    tags: pickTags(text, zone),
    description: text.trim() || "先输入一句需求，LinkU 会按当前专区生成更贴合的卡片预览。",
  };
}

function normalizeError(error: unknown) {
  const message = error instanceof Error ? error.message : "生成失败，请稍后重试";

  if (
    /Environment variable not found|DATABASE_URL|Can't reach database|P1001|P1012/i.test(message)
  ) {
    return "后端已接入 DeepSeek，但本地数据库还没配置好。请先配置 DATABASE_URL，并运行 pnpm db:push && pnpm db:seed。";
  }

  if (/专区不存在|尚未初始化/.test(message)) {
    return "数据库还没有 seed 三大专区。请运行 pnpm db:seed 后再试。";
  }

  return message;
}

export function OnboardingStepper({ initialZone }: { initialZone?: ZoneCode }) {
  const [selectedZone, setSelectedZone] = useState<ZoneCode>(initialZone ?? "tutoring");
  const [demand, setDemand] = useState("");
  const [generatedDraft, setGeneratedDraft] = useState<GeneratedCardResponse | null>(null);
  const [parsedDemand, setParsedDemand] = useState<ParsedDemandResponse | null>(null);
  const [savedCardId, setSavedCardId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("输入一句需求后，可以调用 DeepSeek 生成真实卡片。");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fallbackPreview = useMemo(() => buildPreview(demand, selectedZone), [demand, selectedZone]);
  const preview = generatedDraft
    ? {
        ...fallbackPreview,
        title: generatedDraft.title,
        subtitle: generatedDraft.subtitle,
        tags: generatedDraft.tags,
        description: generatedDraft.description,
        tone: generatedDraft.highlight,
      }
    : fallbackPreview;
  const activeZone = ZONES.find((zone) => zone.code === selectedZone);

  async function handleGenerateCard() {
    const text = demand.trim();

    if (!text) {
      setErrorText("先输入一句真实需求，再生成卡片。灰色文字只是占位示例。");
      return;
    }

    setIsGenerating(true);
    setErrorText(null);
    setSavedCardId(null);
    setStatusText("正在 mock 登录并调用 DeepSeek...");

    try {
      const login = await mockLogin("user");
      const parsed = await parseDemand(login.token, text);
      const zoneAlignedDemand: ParsedDemandResponse = {
        ...parsed,
        zone: selectedZone,
      };

      setParsedDemand(zoneAlignedDemand);
      setStatusText("DeepSeek 已完成需求解析，正在生成卡片草稿...");

      const draft = await generateCardDraft(login.token, zoneAlignedDemand);
      setGeneratedDraft(draft);
      setStatusText("AI 卡片草稿已生成，正在保存到我的卡片...");

      const card = await createGeneratedCard(login.token, {
        demand: zoneAlignedDemand,
        draft,
      });

      setSavedCardId(card.id);
      setStatusText("卡片已保存，状态为待审核。可以去个人中心或 Admin 查看。");
    } catch (error) {
      setErrorText(normalizeError(error));
      setStatusText("生成没有完成。");
    } finally {
      setIsGenerating(false);
    }
  }

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
            placeholder={demandPlaceholders[selectedZone]}
            onChange={(event) => {
              setDemand(event.target.value);
              setGeneratedDraft(null);
              setParsedDemand(null);
              setSavedCardId(null);
              setErrorText(null);
              setStatusText("输入一句需求后，可以调用 DeepSeek 生成真实卡片。");
            }}
            className="mt-3 min-h-36 w-full resize-none rounded-[1.5rem] border border-campus-ink/10 bg-white/80 p-4 leading-7 outline-none transition placeholder:text-campus-ink/38 focus:border-campus-grass"
          />
        </label>

        <Button
          className="mt-5 w-full"
          size="lg"
          onClick={handleGenerateCard}
          disabled={isGenerating}
        >
          {isGenerating ? "正在生成..." : "调用 DeepSeek 生成卡片"}
        </Button>
        <p className="mt-3 text-sm leading-6 text-campus-ink/56">
          当前使用 mock login + JWT。真实校园认证还没接入，MVP 阶段先用于本地闭环测试。
        </p>
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
              {preview.intent}
            </p>
            <p>
              <strong>关系边界：</strong>
              {preview.boundary}
            </p>
            {parsedDemand ? (
              <p>
                <strong>AI 状态：</strong>
                {parsedDemand.safetyRisk === "high" ? "高风险，建议先审核" : "可进入建卡流程"}
              </p>
            ) : null}
          </div>
        </AIInsightBox>

        <AIInsightBox title="生成状态">
          <div className="grid gap-2 text-sm leading-6">
            <p>{statusText}</p>
            {savedCardId ? (
              <p>
                <strong>卡片 ID：</strong>
                {savedCardId}
              </p>
            ) : null}
            {errorText ? <p className="font-black text-red-600">{errorText}</p> : null}
          </div>
        </AIInsightBox>

        <article className="rounded-[2rem] bg-campus-ink p-6 text-campus-paper shadow-[0_28px_100px_rgba(23,33,26,0.16)]">
          <p className="text-sm font-black text-campus-lime">
            {activeZone?.shortName} · 生成卡片预览
          </p>
          <h2 className="mt-5 font-display text-4xl font-black">{preview.title}</h2>
          <p className="mt-3 text-campus-paper/72">{preview.subtitle}</p>
          <p className="mt-5 leading-7 text-campus-paper/78">{preview.description}</p>
          <div className="mt-6 grid gap-3 border-y border-white/10 py-4 text-sm text-campus-paper/72 sm:grid-cols-2">
            {preview.meta.map((item) => (
              <p key={item.label}>
                <strong className="block text-campus-paper">{item.label}</strong>
                {item.value}
              </p>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-campus-paper/68">{preview.tone}</p>
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
