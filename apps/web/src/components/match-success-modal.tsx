"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { type MockRecommendation } from "../lib/mock-data";
import { Button } from "./ui/button";

const icebreakers = [
  "你好！我看到我们时间和需求挺匹配的，可以先简单聊聊具体安排吗？",
  "你的卡片里提到的方向正好是我现在需要的，我们可以先确认一下时间吗？",
  "很高兴匹配到你！如果方便的话，我想先发一个联系申请，简单说明一下我的情况。",
];

export function MatchSuccessModal({
  card,
  open,
  onClose,
  onContactRequest,
}: {
  card?: MockRecommendation;
  open: boolean;
  onClose: () => void;
  onContactRequest?: (message: string) => void;
}) {
  return (
    <AnimatePresence>
      {open && card ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-campus-ink/55 px-5 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.section
            className="w-full max-w-lg rounded-[2rem] bg-campus-paper p-6 shadow-2xl"
            initial={{ y: 28, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 18, scale: 0.97, opacity: 0 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black text-campus-grass">匹配成功</p>
                <h2 className="mt-2 font-display text-4xl font-black">可以发起联系申请了</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-white/70 p-2 text-campus-ink/60 transition hover:text-campus-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 rounded-[1.5rem] bg-white/72 p-5">
              <p className="font-black">{card.name}</p>
              <p className="mt-1 text-sm text-campus-ink/60">{card.title}</p>
            </div>

            <div className="mt-5 space-y-3">
              <p className="text-sm font-black text-campus-ink/55">AI 破冰话术</p>
              {icebreakers.map((text) => (
                <button
                  key={text}
                  className="block w-full rounded-2xl bg-white/72 p-4 text-left text-sm leading-6 text-campus-ink/78 transition hover:bg-white"
                >
                  {text}
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <Button className="flex-1" onClick={() => onContactRequest?.(icebreakers[0])}>
                发送联系申请
              </Button>
              <Button variant="secondary" className="flex-1" onClick={onClose}>
                继续滑卡
              </Button>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
