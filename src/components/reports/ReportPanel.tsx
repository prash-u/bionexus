import { ExportButton } from "@/components/reports/ExportButton";
import { GlassCard } from "@/components/ui/GlassCard";
import type { ReportPayload } from "@/lib/ontology/types";

export function ReportPanel({ report }: { report: ReportPayload }) {
  return (
    <GlassCard>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-200">Generated from Parkinson's demo state</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">{report.title}</h2>
        </div>
        <ExportButton markdown={report.markdown} />
      </div>
      <pre className="max-h-[58vh] overflow-auto whitespace-pre-wrap rounded-lg border border-slate-700/40 bg-slate-950/55 p-4 text-sm leading-6 text-slate-200">
        {report.markdown}
      </pre>
    </GlassCard>
  );
}
