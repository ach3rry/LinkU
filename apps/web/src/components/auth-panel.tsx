"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "../lib/supabase";

type AuthPanelProps = {
  title?: string;
  subtitle?: string;
  onSignedIn?: () => void;
};

export function AuthPanel({
  title = "先登录，再开始匹配。",
  subtitle = "用邮箱创建账号，之后你的卡片、滑卡和联系申请都会留在自己的空间里。",
  onSignedIn,
}: AuthPanelProps) {
  const client = getSupabaseBrowserClient();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusText, setStatusText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!client || !isSupabaseConfigured()) {
      setStatusText("登录服务还没有配置好。");
      return;
    }

    if (!email.trim() || password.length < 6) {
      setStatusText("请输入邮箱，并使用至少 6 位密码。");
      return;
    }

    setIsSubmitting(true);
    setStatusText("");

    const credentials = {
      email: email.trim(),
      password,
    };
    const result =
      mode === "signin"
        ? await client.auth.signInWithPassword(credentials)
        : await client.auth.signUp(credentials);

    setIsSubmitting(false);

    if (result.error) {
      setStatusText(result.error.message);
      return;
    }

    setStatusText(mode === "signin" ? "已登录。" : "账号已创建，请查看邮箱确认。");
    onSignedIn?.();
  }

  return (
    <section className="rounded-[1.75rem] border border-campus-ink/10 bg-white/76 p-6 shadow-[0_24px_70px_rgba(23,33,26,0.08)]">
      <div className="flex gap-2">
        {(["signin", "signup"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMode(item)}
            className={`rounded-full px-4 py-2 text-sm font-black transition ${
              mode === item ? "bg-campus-ink text-campus-paper" : "bg-campus-ink/5"
            }`}
          >
            {item === "signin" ? "登录" : "注册"}
          </button>
        ))}
      </div>
      <h2 className="mt-6 font-display text-4xl font-black leading-tight">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-campus-ink/64">{subtitle}</p>
      <div className="mt-6 grid gap-3">
        <label className="grid gap-2 text-sm font-bold text-campus-ink/66">
          邮箱
          <input
            value={email}
            type="email"
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 rounded-2xl border border-campus-ink/10 bg-campus-paper/70 px-4 text-base font-normal text-campus-ink outline-none transition focus:border-campus-grass"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-campus-ink/66">
          密码
          <input
            value={password}
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 rounded-2xl border border-campus-ink/10 bg-campus-paper/70 px-4 text-base font-normal text-campus-ink outline-none transition focus:border-campus-grass"
          />
        </label>
      </div>
      <Button className="mt-5 w-full" size="lg" onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "请稍等" : mode === "signin" ? "登录" : "创建账号"}
      </Button>
      {statusText ? <p className="mt-3 text-sm font-bold text-campus-ink/62">{statusText}</p> : null}
    </section>
  );
}
