"use client";

import { ZONES } from "@linku/shared";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export function LandingStage() {
  return (
    <main>
      <section className="relative isolate flex min-h-[calc(100svh-4rem)] overflow-hidden px-5 py-10">
        <motion.div
          className="absolute inset-y-0 right-0 -z-10 hidden w-[52vw] rounded-bl-[4rem] bg-campus-ink lg:block"
          initial={{ x: 120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />

        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1fr_0.82fr]">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55 }}
          >
            <p className="mb-5 inline-flex rounded-full bg-campus-lime px-4 py-2 text-sm font-black">
              不发帖，不刷屏，只遇到合适的人
            </p>
            <h1 className="font-display text-6xl font-black leading-[0.92] tracking-tight md:text-8xl">
              LinkU
              <span className="block text-campus-grass">校园匹配</span>
              变轻一点。
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-campus-ink/72">
              输入一句需求，LinkU 帮你整理成卡片。双向确认后，再决定要不要联系。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/onboarding">
                  创建第一张卡片
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/swipe">先看看卡片</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="relative mx-auto w-full max-w-md"
            initial={{ rotate: -4, y: 30, opacity: 0 }}
            animate={{ rotate: 0, y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.7, ease: "easeOut" }}
          >
            <div className="rounded-[2.5rem] bg-campus-paper p-5 shadow-[0_34px_120px_rgba(0,0,0,0.24)]">
              <div className="rounded-[2rem] bg-white p-6">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-campus-lime px-3 py-1 text-xs font-black">
                    88% 匹配
                  </span>
                  <span className="text-xs font-bold text-campus-ink/45">LinkU</span>
                </div>
                <h2 className="mt-10 font-display text-4xl font-black leading-tight">
                  高数 / 线代耐心辅导
                </h2>
                <p className="mt-4 leading-7 text-campus-ink/70">
                  TA 擅长高数和线代，周末时间与你匹配，价格也在你的预算范围内。
                </p>
                <div className="mt-8 flex flex-wrap gap-2">
                  {["高等数学", "周末", "线下可约", "已认证"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-campus-ink/5 px-3 py-1 text-xs font-bold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-16 md:grid-cols-3">
        {ZONES.map((zone, index) => (
          <motion.div
            key={zone.code}
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: index * 0.08 }}
            className="border-t border-campus-ink/15 pt-6"
          >
            <p className="text-xs font-black uppercase tracking-[0.24em] text-campus-grass">
              {zone.code}
            </p>
            <h2 className="mt-3 font-display text-3xl font-black">{zone.name}</h2>
            <p className="mt-3 text-sm leading-7 text-campus-ink/68">{zone.promise}</p>
          </motion.div>
        ))}
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-20 md:grid-cols-2">
        <div className="rounded-[2rem] bg-white/72 p-7">
          <Sparkles className="h-6 w-6 text-campus-grass" />
          <h2 className="mt-5 font-display text-3xl font-black">先把需求讲清楚</h2>
          <p className="mt-3 leading-7 text-campus-ink/70">
            一句话就能开始，卡片会保留专区、时间、预算、地点和边界。
          </p>
        </div>
        <div className="rounded-[2rem] bg-campus-ink p-7 text-campus-paper">
          <ShieldCheck className="h-6 w-6 text-campus-lime" />
          <h2 className="mt-5 font-display text-3xl font-black">安全边界先行</h2>
          <p className="mt-3 leading-7 text-campus-paper/76">
            双向匹配后才能联系，搭子专区默认关系边界，举报、拉黑、内容审核从 MVP 就保留。
          </p>
        </div>
      </section>
    </main>
  );
}
