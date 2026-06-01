import { ArrowRight, BrainCircuit, FileText, ScanHeart, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { bodyRegionLabels } from "@/data/scenarios/presets";
import { useSandbox } from "@/lib/sandbox/sandboxState";

export function ScenarioContinuityRail() {
  const { activePreset, sandbox } = useSandbox();
  const topCandidate = sandbox.simulationResult.backtraceCandidates[0];
  const neuralSent = Boolean(sandbox.neuralCircuitState.sentToBodyAt);

  return (
    <section className="border-b border-slate-800/70 bg-slate-950/30 px-4 py-2 backdrop-blur lg:px-8" aria-label="Active sandbox continuity">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2 text-xs text-slate-400">
        <Link to="/body-sandbox" className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-cyan-100 transition hover:border-cyan-200/50">
          <ScanHeart className="h-3.5 w-3.5" />
          {activePreset.shortTitle}
        </Link>
        <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
        <Link to="/body-sandbox" className="inline-flex items-center gap-2 rounded-full border border-slate-600/35 bg-slate-950/50 px-3 py-1 text-slate-200 transition hover:border-cyan-300/40">
          Region: {bodyRegionLabels[sandbox.selectedRegionId]}
        </Link>
        <ArrowRight className="hidden h-3.5 w-3.5 text-slate-600 sm:block" />
        <Link to="/body-sandbox" className="inline-flex items-center gap-2 rounded-full border border-slate-600/35 bg-slate-950/50 px-3 py-1 text-slate-200 transition hover:border-violet-300/40">
          <Share2 className="h-3.5 w-3.5 text-violet-200" />
          {topCandidate ? `${topCandidate.geneSymbol} backtrace` : "Graph ready"}
        </Link>
        <Link
          to="/body-sandbox"
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 transition ${
            neuralSent
              ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100 hover:border-emerald-200/50"
              : "border-slate-600/35 bg-slate-950/50 text-slate-300 hover:border-violet-300/40"
          }`}
        >
          <BrainCircuit className="h-3.5 w-3.5" />
          Neural {neuralSent ? "synced" : "available"}
        </Link>
        <Link to="/reports" className="ml-auto inline-flex items-center gap-2 rounded-full border border-violet-300/25 bg-violet-300/10 px-3 py-1 text-violet-100 transition hover:border-violet-200/50">
          <FileText className="h-3.5 w-3.5" />
          Report-ready
        </Link>
      </div>
    </section>
  );
}
