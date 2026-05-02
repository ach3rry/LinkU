import { cn } from "../lib/utils";

export function TagPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-campus-ink/10 bg-white/65 px-3 py-1 text-xs font-bold text-campus-ink/75",
        className,
      )}
    >
      {children}
    </span>
  );
}
