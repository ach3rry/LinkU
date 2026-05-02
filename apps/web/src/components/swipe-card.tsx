"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { type MockRecommendation } from "../lib/mock-data";
import { AIInsightBox } from "./ai-insight-box";
import { TagPill } from "./tag-pill";
import { TrustBadge } from "./trust-badge";

export function SwipeCard({
  card,
  onSwipe,
}: {
  card: MockRecommendation;
  onSwipe: (direction: "left" | "right") => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-11, 11]);

  return (
    <motion.article
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, rotate }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120) onSwipe("right");
        if (info.offset.x < -120) onSwipe("left");
      }}
      className="relative w-full max-w-md cursor-grab rounded-[2.25rem] bg-white p-6 shadow-[0_28px_110px_rgba(23,33,26,0.16)] active:cursor-grabbing"
      whileTap={{ scale: 0.98 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      initial={{ y: 24, opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.28 }}
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-campus-lime px-4 py-2 text-sm font-black">
          {card.matchScore}% 匹配
        </span>
        <TrustBadge verified={card.verified} />
      </div>

      <div className="mt-8">
        <p className="text-sm font-bold text-campus-ink/50">
          {card.school} · {card.role}
        </p>
        <h1 className="mt-3 font-display text-4xl font-black leading-tight">{card.title}</h1>
        <p className="mt-3 text-base font-bold text-campus-grass">{card.subtitle}</p>
        <p className="mt-5 leading-7 text-campus-ink/70">{card.description}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {card.tags.map((tag) => (
          <TagPill key={tag}>{tag}</TagPill>
        ))}
      </div>

      <dl className="mt-7 grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-campus-ink/45">时间</dt>
          <dd className="mt-1 font-black">{card.schedule}</dd>
        </div>
        <div>
          <dt className="text-campus-ink/45">方式</dt>
          <dd className="mt-1 font-black">{card.mode}</dd>
        </div>
        <div>
          <dt className="text-campus-ink/45">预算</dt>
          <dd className="mt-1 font-black">{card.price ?? "无"}</dd>
        </div>
      </dl>

      <div className="mt-7">
        <AIInsightBox title="AI 推荐理由">{card.reason}</AIInsightBox>
      </div>
    </motion.article>
  );
}
