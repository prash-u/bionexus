import { StructuredGraph } from "@/components/graph/StructuredGraph";
import { NetworkPulseImportPanel } from "@/components/graph/NetworkPulseImportPanel";
import { ScenarioNetworkGraph } from "@/components/graph/ScenarioNetworkGraph";
import { GlassCard } from "@/components/ui/GlassCard";
import { molecularProvenanceLabel } from "@/lib/molecular/importAdapters";
import { useSandbox } from "@/lib/sandbox/sandboxState";

export function KnowledgeGraphPage() {
  const { activePreset, sandbox } = useSandbox();
  return (
    <div className="space-y-6">
      <GlassCard>
        <p className="text-sm uppercase tracking-[0.18em] text-cyan-200">Scenario pathways</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{activePreset.shortTitle} relationship map</h1>
        <p className="mt-2 max-w-3xl text-slate-400">
          Review the selected scenario, active pathways, linked organs/systems, relationship confidence, evidence notes, and upstream/downstream links.
        </p>
      </GlassCard>
      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Active pathways</p><p className="mt-2 text-sm text-slate-200">{activePreset.keyPathways.join(", ")}</p></GlassCard>
        <GlassCard><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Linked systems</p><p className="mt-2 text-sm text-slate-200">{activePreset.affectedSystems.join(", ")}</p></GlassCard>
        <GlassCard><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Backtrace lead</p><p className="mt-2 text-sm text-slate-200">{sandbox.simulationResult.backtraceCandidates[0]?.geneSymbol ?? "No candidate"} from current body state{sandbox.activeNetworkPulseImportId ? " and imported network evidence" : ""}.</p></GlassCard>
      </div>
      <NetworkPulseImportPanel />
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Upstream candidates from body state</h2>
          <div className="mt-4 space-y-3">
            {sandbox.simulationResult.backtraceCandidates.slice(0, 5).map((candidate) => (
              <div key={candidate.id} className="rounded-lg border border-violet-300/15 bg-violet-300/[0.055] p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-white">{candidate.geneSymbol}</span>
                  <span className="font-mono text-xs text-violet-100">{Math.round(candidate.score * 100)}%</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-400">{candidate.reasoning}</p>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Molecule-carrying edges</h2>
          <div className="mt-4 space-y-3">
            {sandbox.simulationResult.molecularEdges.map((edge) => (
              <div key={edge.id} className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.055] p-3">
                <p className="font-semibold text-white">{edge.label}</p>
                <p className="mt-1 text-xs text-slate-400">{edge.payloads.map((payload) => `${payload.molecule}: ${payload.ratio}`).join(" · ")}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {edge.payloads.map((payload) => (
                    <span key={`${edge.id}-${payload.molecule}`} className="rounded-full border border-cyan-300/20 bg-slate-950/50 px-2 py-0.5 text-[10px] text-cyan-100">
                      {payload.molecule}: {molecularProvenanceLabel(payload)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
      <ScenarioNetworkGraph />
      <StructuredGraph />
    </div>
  );
}
