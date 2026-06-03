import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { GlassCard } from "@/components/ui/GlassCard";
import { bodyRegionLabels } from "@/data/scenarios/presets";
import { useSandbox } from "@/lib/sandbox/sandboxState";

export function SandboxOutputPanel() {
  const { activePreset, sandbox, setModuleIncluded } = useSandbox();
  const topGenes = sandbox.simulationResult.backtraceCandidates.slice(0, 4).map((item) => `${item.geneSymbol} (${Math.round(item.score * 100)}%)`);
  const topObservables = sandbox.simulationResult.observables
    .slice()
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 4)
    .map((item) => `${item.label}: ${Math.round(item.current * 100)}%`);
  const activeNetworkImport = sandbox.networkPulseImports.find((item) => item.id === sandbox.activeNetworkPulseImportId);
  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Current reasoning state</p>
          <h2 className="mt-1 text-lg font-semibold text-white">{sandbox.scenario.title}</h2>
        </div>
        <Link className="nexus-button" to="/reports"><FileText className="h-4 w-4" /> Report</Link>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <OutputBlock title="Affected systems" items={activePreset.affectedSystems} />
        <OutputBlock title="Key pathways" items={activePreset.keyPathways} />
        <OutputBlock title="Region relative effects" items={sandbox.simulationResult.organEffects.slice(0, 6).map((effect) => `${bodyRegionLabels[effect.organ]} ${effect.magnitude}%`)} />
        <OutputBlock title="Active interventions" items={sandbox.scenario.interventions.map((item) => item.label)} />
        <OutputBlock title="Observable shifts" items={topObservables} />
        <OutputBlock title="Backtraced genes" items={topGenes} />
        <OutputBlock title="Molecular edges" items={sandbox.simulationResult.molecularEdges.map((edge) => edge.label)} />
        <OutputBlock title="Network Pulse import" items={activeNetworkImport ? [activeNetworkImport.summary] : ["No imported network signal"]} />
        <OutputBlock title="Neural circuit state" items={[sandbox.neuralCircuitState.summary]} />
      </div>
      <div className="mt-4 rounded-lg border border-slate-700/40 bg-slate-950/35 p-4">
        <p className="mb-3 text-sm font-semibold text-white">Reasoning lenses included in report</p>
        <div className="space-y-2">
          {sandbox.moduleOutputs.map((output) => (
            <label key={output.moduleId} className="flex items-start gap-3 text-sm text-slate-300">
              <input type="checkbox" checked={output.includedInReport} onChange={(event) => setModuleIncluded(output.moduleId, event.target.checked)} />
              <span><strong className="text-white">{output.title}</strong><br /><span className="text-xs text-slate-400">{output.summary}</span></span>
            </label>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

function OutputBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-slate-700/40 bg-slate-950/35 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => <span key={item} className="rounded-full bg-slate-800/80 px-2.5 py-1 text-xs text-slate-200">{item}</span>)}
      </div>
    </div>
  );
}
