import { ShieldCheck } from "lucide-react";
import { intendedUseStatement } from "@/lib/safety/intendedUse";

export function SafetyNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-lg border border-emerald-300/25 bg-emerald-300/10 p-4 text-sm text-emerald-50">
      <div className="mb-2 flex items-center gap-2 font-semibold">
        <ShieldCheck className="h-4 w-4" />
        Intended use
      </div>
      <p className={compact ? "text-xs leading-5 text-emerald-100/85" : "leading-6 text-emerald-100/90"}>
        {intendedUseStatement}
      </p>
    </div>
  );
}
