import { StructuredGraph } from "@/components/graph/StructuredGraph";
import { ScenarioNetworkGraph } from "@/components/graph/ScenarioNetworkGraph";
import { GlassCard } from "@/components/ui/GlassCard";
import { useSandbox } from "@/lib/sandbox/sandboxState";

export function KnowledgeGraphPage() {
  const { activePreset } = useSandbox();
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
        <GlassCard><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Import architecture</p><p className="mt-2 text-sm text-slate-200">Network Pulse Analyzer outputs should map to scenario pathway signals, relationships and evidence items.</p></GlassCard>
      </div>
      <ScenarioNetworkGraph />
      <StructuredGraph />
    </div>
  );
}
