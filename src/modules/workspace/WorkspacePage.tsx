import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { EntityCard } from "@/components/cards/EntityCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { EntityAuthoringPanel } from "@/components/workspace/EntityAuthoringPanel";
import { HypothesisLab } from "@/components/workspace/HypothesisLab";
import { ReasoningTrail } from "@/components/workspace/ReasoningTrail";
import { abstractionLayers, entityTypeLabels } from "@/data/ontology/entityTypes";
import { useWorkspace } from "@/lib/workspace/workspaceState";

export function WorkspacePage() {
  const { workspace, addTrailStep, removeTrailStep, selectEntity } = useWorkspace();
  const keyEntities = workspace.entities.filter((entity) =>
    ["gene-snca", "protein-alpha-syn", "pathway-proteostasis", "cell-dopaminergic-neuron", "tissue-basal-ganglia", "intervention-dbs"].includes(entity.id)
  ).concat(workspace.entities.filter((entity) => entity.id.startsWith("user-")).slice(0, 4));
  const [trailDraft, setTrailDraft] = useState("");

  const addStep = () => {
    if (!trailDraft.trim()) return;
    addTrailStep(trailDraft.trim());
    setTrailDraft("");
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-cyan-200">Mission control</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">Ontology authoring workspace</h1>
            <p className="mt-2 max-w-3xl text-slate-400">Author objects, connect relationships, build hypotheses, and turn the map into reports.</p>
          </div>
          <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100">Scenario-linked ontology layer</span>
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
          {keyEntities.map((entity) => <EntityCard key={entity.id} entity={entity} onSelect={selectEntity} />)}
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <GlassCard>
          <h2 className="text-lg font-semibold text-white">Current reasoning trail</h2>
          <div className="mt-4"><ReasoningTrail steps={workspace.reasoningTrail} onRemove={removeTrailStep} /></div>
          <div className="mt-4 flex gap-2">
            <input className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm" placeholder="Add a reasoning step..." value={trailDraft} onChange={(event) => setTrailDraft(event.target.value)} />
            <button className="nexus-button" onClick={addStep}>Add</button>
          </div>
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
      <GlassCard>
        <h2 className="mb-4 text-lg font-semibold text-white">Author the map</h2>
        <EntityAuthoringPanel />
      </GlassCard>
      <GlassCard>
        <h2 className="mb-4 text-lg font-semibold text-white">Hypothesis lab</h2>
        <HypothesisLab />
      </GlassCard>
    </div>
  );
}
