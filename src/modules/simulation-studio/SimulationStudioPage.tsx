import { Activity } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { parkinsonsDemo } from "@/data/demo/parkinsons/program";

export function SimulationStudioPage() {
  return (
    <div className="space-y-6">
      <GlassCard>
        <p className="text-sm uppercase tracking-[0.18em] text-violet-200">Simulation studio</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Future home for neural, tremor, DBS, and pathway propagation modules</h1>
        <p className="mt-2 max-w-3xl text-slate-400">v0.1 creates the architecture and conceptual cards only. No clinical accuracy is claimed.</p>
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
