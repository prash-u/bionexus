import { useMemo, useState } from "react";
import { ReportPanel } from "@/components/reports/ReportPanel";
import { GlassCard } from "@/components/ui/GlassCard";
import { buildReport, reportModes } from "@/lib/reports/reportBuilder";
import type { ReportPayload } from "@/lib/ontology/types";
import { useWorkspace } from "@/lib/workspace/workspaceState";

const labels: Record<ReportPayload["mode"], string> = {
  learner: "Learner Report",
  researchBrief: "Research Brief",
  executiveSummary: "Executive Summary",
  investorDemo: "Investor Demonstration"
};

export function ReportsPage() {
  const { workspace } = useWorkspace();
  const [mode, setMode] = useState<ReportPayload["mode"]>("learner");
  const report = useMemo(() => buildReport(mode, workspace), [mode, workspace]);
  return (
    <div className="space-y-6">
      <GlassCard>
        <p className="text-sm uppercase tracking-[0.18em] text-cyan-200">Reports</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Generate communication-ready outputs</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {reportModes.map((item) => (
            <button key={item} className={mode === item ? "nexus-button" : "nexus-button-secondary"} onClick={() => setMode(item)}>
              {labels[item]}
            </button>
          ))}
        </div>
      </GlassCard>
      <ReportPanel report={report} />
    </div>
  );
}
