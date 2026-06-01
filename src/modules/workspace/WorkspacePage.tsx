import { useState } from "react";
import { ArrowDown, ArrowUp, ScanHeart } from "lucide-react";
import { Link } from "react-router-dom";
import { EntityCard } from "@/components/cards/EntityCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { EntityAuthoringPanel } from "@/components/workspace/EntityAuthoringPanel";
import { HypothesisLab } from "@/components/workspace/HypothesisLab";
import { ReasoningTrail } from "@/components/workspace/ReasoningTrail";
import { useSandbox } from "@/lib/sandbox/sandboxState";
import { useWorkspace } from "@/lib/workspace/workspaceState";

export function WorkspacePage() {
  const { workspace, addTrailStep, removeTrailStep, selectEntity } = useWorkspace();
  const { activePreset, sandbox } = useSandbox();
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
          <div className="flex items-center gap-2">
            <ScanHeart className="h-5 w-5 text-cyan-200" />
            <h2 className="text-lg font-semibold text-white">Active sandbox bridge</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Workspace authoring is now anchored to the configured body sandbox instead of a static hierarchy poster.
          </p>
          <div className="mt-4 rounded-lg border border-cyan-300/20 bg-cyan-300/[0.055] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">Current scenario</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{activePreset.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{sandbox.simulationResult.summary}</p>
            <Link to="/body-sandbox" className="nexus-button mt-4 w-full">Fit user example in Body Sandbox</Link>
          </div>
          <div className="mt-4 grid gap-3">
            <div className="rounded-lg border border-white/10 bg-slate-950/35 p-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-violet-100">
                <ArrowUp className="h-3.5 w-3.5" />
                Upstream map
              </div>
              <div className="mt-2 space-y-2 text-sm text-slate-300">
                {sandbox.simulationResult.backtraceCandidates.slice(0, 3).map((candidate) => (
                  <p key={candidate.id}><strong className="text-white">{candidate.geneSymbol}</strong> · {candidate.linkedPathways.slice(0, 2).join(" / ")}</p>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-950/35 p-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-emerald-100">
                <ArrowDown className="h-3.5 w-3.5" />
                Downstream map
              </div>
              <div className="mt-2 space-y-2 text-sm text-slate-300">
                {sandbox.simulationResult.phenotypeEffects.slice(0, 3).map((effect) => (
                  <p key={effect.phenotype}><strong className="text-white">{effect.label}</strong> · {effect.magnitude}%</p>
                ))}
              </div>
            </div>
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
