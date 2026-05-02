import { ShieldCheck } from "lucide-react";

export function SafetyNotice() {
  return (
    <aside className="rounded-[1.5rem] bg-campus-ink p-5 text-campus-paper">
      <div className="flex items-center gap-2 text-sm font-black text-campus-lime">
        <ShieldCheck className="h-4 w-4" />
        安全边界
      </div>
      <p className="mt-3 text-sm leading-7 text-campus-paper/78">
        LinkU 默认双向匹配后才允许联系申请，不直接暴露联系方式。线下见面建议选择校内公共空间，
        任何骚扰、擦边、诈骗或危险邀约都可以举报和拉黑。
      </p>
    </aside>
  );
}
