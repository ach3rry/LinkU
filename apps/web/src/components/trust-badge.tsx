export function TrustBadge({ verified }: { verified?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-campus-lime px-3 py-1 text-xs font-black text-campus-ink">
      <span className="h-2 w-2 rounded-full bg-campus-grass" />
      {verified ? "已认证" : "待认证"}
    </span>
  );
}
