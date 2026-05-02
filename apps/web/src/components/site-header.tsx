import Link from "next/link";
import { Button } from "./ui/button";

const navItems = [
  { href: "/zones", label: "专区" },
  { href: "/onboarding", label: "建卡" },
  { href: "/swipe", label: "滑卡" },
  { href: "/profile", label: "我的" },
  { href: "/admin", label: "审核台" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-campus-ink/10 bg-campus-paper/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link href="/" className="font-display text-3xl font-black tracking-tight">
          LinkU
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-bold text-campus-ink/70 transition hover:bg-campus-ink/5 hover:text-campus-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button asChild size="sm">
          <Link href="/onboarding">开始匹配</Link>
        </Button>
      </div>
    </header>
  );
}
