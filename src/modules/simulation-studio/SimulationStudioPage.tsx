import { Activity } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { parkinsonsDemo } from "@/data/demo/parkinsons/program";
import { useWorkspace } from "@/lib/workspace/workspaceState";

export function SimulationStudioPage() {
  const { workspace, updateSimulation } = useWorkspace();
  const { simulationSettings } = workspace;
  const coherence = Math.max(
    0,
    Math.min(100, 100 - simulationSettings.tremorAmplitude - simulationSettings.proteostasisStress / 4 + simulationSettings.dopamineTone / 2 + simulationSettings.dbsModulation / 3)
  );

  return (
    <div className="space-y-6">
      <GlassCard>
        <p className="text-sm uppercase tracking-[0.18em] text-violet-200">Simulation studio</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Future home for neural, tremor, DBS, and pathway propagation modules</h1>
        <p className="mt-2 max-w-3xl text-slate-400">Version 1.0 includes editable conceptual controls. No clinical accuracy is claimed.</p>
      </GlassCard>
      <GlassCard>
        <h2 className="text-lg font-semibold text-white">Interactive perturbation controls</h2>
        <p className="mt-2 text-sm text-slate-400">Adjust conceptual parameters and watch the workspace report snapshot change. This is an educational model.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {Object.entries(simulationSettings).map(([key, value]) => (
            <label key={key} className="rounded-lg border border-slate-700/40 bg-slate-950/35 p-4 text-sm text-slate-300">
              <span className="flex justify-between"><strong className="text-white">{key}</strong><span>{value}</span></span>
              <input className="mt-3 w-full" type="range" min="0" max="100" value={value} onChange={(event) => updateSimulation({ [key]: Number(event.target.value) })} />
            </label>
          ))}
        </div>
        <div className="mt-5 rounded-lg border border-cyan-300/25 bg-cyan-300/10 p-4">
          <p className="text-sm text-cyan-100">Conceptual motor coherence index</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-900">
            <div className="h-full rounded-full bg-cyan-300" style={{ width: `${coherence}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-400">{Math.round(coherence)} / 100, calculated from local slider values only.</p>
        </div>
      </GlassCard>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {parkinsonsDemo.simulations.map((state) => (
          <GlassCard key={state.id} className="flex flex-col">
            <Activity className="mb-4 h-6 w-6 text-cyan-200" />
            <h2 className="text-lg font-semibold text-white">{state.label}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{state.description}</p>
            <div className="mt-4 rounded-lg bg-slate-950/45 p-3 text-xs text-slate-300">
              {Object.entries(state.parameters).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-3 py-1"><span>{key}</span><strong>{value}</strong></div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-amber-100/80">{state.disclaimer}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
