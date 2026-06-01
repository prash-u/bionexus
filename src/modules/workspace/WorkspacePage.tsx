import { ArrowRight } from "lucide-react";
import { EntityCard } from "@/components/cards/EntityCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { ReasoningTrail } from "@/components/workspace/ReasoningTrail";
import { parkinsonsDemo } from "@/data/demo/parkinsons/program";
import { abstractionLayers, entityTypeLabels } from "@/data/ontology/entityTypes";

export function WorkspacePage() {
  const keyEntities = parkinsonsDemo.entities.filter((entity) =>
    ["gene-snca", "protein-alpha-syn", "pathway-proteostasis", "cell-dopaminergic-neuron", "tissue-basal-ganglia", "intervention-dbs"].includes(entity.id)
  );

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-cyan-200">Mission control</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">Parkinson's biological reasoning workspace</h1>
            <p className="mt-2 max-w-3xl text-slate-400">Move across abstraction layers without leaving the same conceptual map.</p>
          </div>
          <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100">Selected program: Parkinson's v0.1</span>
        </div>
      </GlassCard>
      <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Biological hierarchy</h2>
          <div className="mt-4 space-y-2">
            {abstractionLayers.map((layer, index) => (
              <div key={layer} className="flex items-center gap-3 rounded-lg border border-slate-700/35 bg-slate-950/35 p-3">
                <span className="w-6 text-xs text-cyan-200">{index + 1}</span>
                <span className="flex-1 text-sm text-slate-200">{entityTypeLabels[layer]}</span>
                {index < abstractionLayers.length - 1 ? <ArrowRight className="h-4 w-4 text-slate-600" /> : null}
              </div>
            ))}
          </div>
        </GlassCard>
        <div className="grid gap-4 md:grid-cols-2">
          {keyEntities.map((entity) => <EntityCard key={entity.id} entity={entity} />)}
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Current reasoning trail</h2>
          <div className="mt-4"><ReasoningTrail steps={parkinsonsDemo.program.defaultReasoningTrail} /></div>
        </GlassCard>
        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Next suggested exploration</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p>Compare proteostasis links from SNCA and GBA1.</p>
            <p>Open the graph and select basal ganglia circuitry.</p>
            <p>Generate an investor demonstration report from the current demo state.</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
