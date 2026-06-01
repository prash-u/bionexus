import { useState } from "react";
import { Activity, ArrowDown, ArrowUp, BrainCircuit, FlaskConical, Network, ScanHeart, Zap, type LucideIcon } from "lucide-react";
import { ScenarioNetworkGraph } from "@/components/graph/ScenarioNetworkGraph";
import { BiologicalLayerControls } from "@/components/sandbox/BiologicalLayerControls";
import { MolecularImportPanel } from "@/components/sandbox/MolecularImportPanel";
import { ParameterControlPanel } from "@/components/sandbox/ParameterControlPanel";
import { SandboxOutputPanel } from "@/components/sandbox/SandboxOutputPanel";
import { ScenarioBuilderPanel } from "@/components/sandbox/ScenarioBuilderPanel";
import { WholeBodyVisualization, type BodySystemFilterId, type BodyZoomLevel } from "@/components/sandbox/WholeBodyVisualization";
import { GlassCard } from "@/components/ui/GlassCard";
import { bodyRegionLabels } from "@/data/scenarios/presets";
import { neuralCircuitPresets } from "@/lib/neural/neuralEngine";
import { useSandbox } from "@/lib/sandbox/sandboxState";
import { useAppSettings } from "@/lib/storage/localStorage";

type SandboxView = "body" | "knowledge" | "activity" | "intervention";

const viewItems: Array<{ id: SandboxView; label: string; question: string; icon: LucideIcon }> = [
  { id: "body", label: "Body", question: "Where is it happening?", icon: ScanHeart },
  { id: "knowledge", label: "Knowledge Path", question: "Why is it happening?", icon: Network },
  { id: "activity", label: "Activity", question: "What is active right now?", icon: Activity },
  { id: "intervention", label: "Intervention", question: "What changes if I perturb it?", icon: FlaskConical }
];

const systemFilters: Array<{ id: BodySystemFilterId; label: string }> = [
  { id: "nervous", label: "Nervous" },
  { id: "musculoskeletal", label: "Musculoskeletal" },
  { id: "cardiovascular", label: "Cardiovascular" },
  { id: "respiratory", label: "Respiratory" },
  { id: "digestive", label: "Digestive" },
  { id: "endocrine", label: "Endocrine" },
  { id: "immune", label: "Immune / Lymphatic" },
  { id: "renal", label: "Renal" },
  { id: "ocular", label: "Ocular" }
];

const zoomLevels: Array<{ id: BodyZoomLevel; label: string }> = [
  { id: "wholeBody", label: "Whole Body" },
  { id: "system", label: "System" },
  { id: "region", label: "Region" },
  { id: "molecular", label: "Cellular/Molecular Context" }
];

export function BodySandboxPage() {
  const { sandbox, setModuleIncluded, applyNeuralCircuitPreset, updateNeuralStimulation, sendNeuralStateToBodySandbox } = useSandbox();
  const { userMode, complexityLevel } = useAppSettings();
  const [activeView, setActiveView] = useState<SandboxView>("body");
  const [interventionUnlocked, setInterventionUnlocked] = useState(false);
  const [activeSystems, setActiveSystems] = useState<BodySystemFilterId[]>(systemFilters.map((system) => system.id));
  const [zoomLevel, setZoomLevel] = useState<BodyZoomLevel>("wholeBody");
  const beginner = complexityLevel === "basic";
  const expert = complexityLevel === "expert" || userMode === "researcher";

  const viewOptions = interventionUnlocked ? viewItems : viewItems.filter((item) => item.id !== "intervention");

  const showIntervention = () => {
    setInterventionUnlocked(true);
    setActiveView("intervention");
    setModuleIncluded("interventions", true);
  };

  const toggleSystem = (id: BodySystemFilterId) => {
    setActiveSystems((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return [...current, id];
    });
  };

  return (
    <div className="space-y-5">
      <GlassCard className="overflow-hidden p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">SandboxState workspace</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Configure, observe, understand, perturb, export</h1>
            <p className="mt-2 max-w-4xl text-slate-400">
              One biological state drives the body view, knowledge path, activity layer, interventions and reports.
            </p>
          </div>
          <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">Current state</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{sandbox.simulationResult.summary}</p>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-[370px_minmax(0,1fr)]">
        <div className="space-y-4">
          <ScenarioBuilderPanel showInterventions={interventionUnlocked} />
          {!beginner ? <ParameterControlPanel /> : null}
        </div>

        <div className="space-y-4">
          <GlassCard className="p-3">
            <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-4">
              {viewOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`rounded-lg border p-3 text-left transition ${
                    activeView === item.id
                      ? "border-cyan-300/45 bg-cyan-300/12 text-cyan-50"
                      : "border-slate-700/45 bg-slate-950/35 text-slate-300 hover:border-violet-300/40"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{item.question}</span>
                </button>
              ))}
              {!interventionUnlocked ? (
                <button type="button" onClick={showIntervention} className="rounded-lg border border-emerald-300/35 bg-emerald-300/10 p-3 text-left text-emerald-100 transition hover:border-emerald-200/60">
                  <span className="flex items-center gap-2 text-sm font-semibold"><FlaskConical className="h-4 w-4" /> Test Intervention</span>
                  <span className="mt-1 block text-xs leading-5 text-emerald-100/70">Open what-if perturbations</span>
                </button>
              ) : null}
            </div>
          </GlassCard>

          {activeView === "body" ? (
            <BodyView
              activeSystems={activeSystems}
              zoomLevel={zoomLevel}
              onToggleSystem={toggleSystem}
              onSetZoom={setZoomLevel}
              beginner={beginner}
            />
          ) : null}
          {activeView === "knowledge" ? <KnowledgePathView expert={expert} /> : null}
          {activeView === "activity" ? (
            <ActivityView
              applyNeuralCircuitPreset={applyNeuralCircuitPreset}
              updateNeuralStimulation={updateNeuralStimulation}
              sendNeuralStateToBodySandbox={sendNeuralStateToBodySandbox}
            />
          ) : null}
          {activeView === "intervention" ? <InterventionView onHide={() => setActiveView("body")} /> : null}

          <SandboxOutputPanel />

          {expert ? (
            <GlassCard>
              <p className="mb-3 text-sm font-semibold text-white">Expert layers and imports</p>
              <BiologicalLayerControls />
              <div className="mt-4">
                <MolecularImportPanel />
              </div>
            </GlassCard>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function BodyView({
  activeSystems,
  zoomLevel,
  onToggleSystem,
  onSetZoom,
  beginner
}: {
  activeSystems: BodySystemFilterId[];
  zoomLevel: BodyZoomLevel;
  onToggleSystem: (id: BodySystemFilterId) => void;
  onSetZoom: (level: BodyZoomLevel) => void;
  beginner: boolean;
}) {
  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Body</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Where is it happening?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">The body is the anchor. Systems, regions, tissues and phenotypes are all projections of the active SandboxState.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {zoomLevels.map((level) => (
              <button key={level.id} type="button" className={zoomLevel === level.id ? "nexus-button px-3 py-1.5 text-xs" : "nexus-button-secondary px-3 py-1.5 text-xs"} onClick={() => onSetZoom(level.id)}>
                {level.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {systemFilters.map((system) => (
            <button
              key={system.id}
              type="button"
              className={activeSystems.includes(system.id) ? "nexus-button px-3 py-1.5 text-xs" : "nexus-button-secondary px-3 py-1.5 text-xs opacity-60"}
              onClick={() => onToggleSystem(system.id)}
            >
              {system.label}
            </button>
          ))}
        </div>
      </GlassCard>
      <WholeBodyVisualization activeSystems={activeSystems} zoomLevel={zoomLevel} compact={beginner} />
    </div>
  );
}

function KnowledgePathView({ expert }: { expert: boolean }) {
  const { activePreset, sandbox } = useSandbox();
  const upstream = sandbox.simulationResult.backtraceCandidates[0];
  const downstreamStart = activePreset.keyGenes[0] ?? upstream?.geneSymbol ?? "Biological signal";
  const downstream = [
    downstreamStart,
    activePreset.keyPathways[0] ?? "Pathway modulation",
    sandbox.simulationResult.organEffects[0]?.label ?? "Tissue state",
    sandbox.simulationResult.systemEffects[0]?.label ?? activePreset.affectedSystems[0] ?? "System response",
    sandbox.simulationResult.phenotypeEffects[0]?.label ?? "Phenotype"
  ];
  const upstreamPath = [
    sandbox.simulationResult.phenotypeEffects[0]?.label ?? "Observed phenotype",
    sandbox.simulationResult.systemEffects[0]?.label ?? "System dysfunction",
    bodyRegionLabels[sandbox.selectedRegionId],
    activePreset.keyPathways[0] ?? "Pathway signal",
    upstream?.geneSymbol ?? activePreset.keyGenes[0] ?? "Candidate gene"
  ];

  return (
    <div className="space-y-4">
      <GlassCard>
        <p className="text-xs uppercase tracking-[0.18em] text-violet-200">Knowledge Path</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Why is it happening?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">Reasoning paths are primary. Graphs are secondary evidence surfaces.</p>
      </GlassCard>
      <div className="grid gap-4 lg:grid-cols-2">
        <PathCard title="Trace Upstream" icon={ArrowUp} items={upstreamPath} />
        <PathCard title="Trace Downstream" icon={ArrowDown} items={downstream} />
      </div>
      {expert ? (
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <Network className="h-5 w-5 text-cyan-200" />
            <h3 className="text-lg font-semibold text-white">Secondary graph evidence</h3>
          </div>
          <ScenarioNetworkGraph />
        </GlassCard>
      ) : null}
    </div>
  );
}

function ActivityView({
  applyNeuralCircuitPreset,
  updateNeuralStimulation,
  sendNeuralStateToBodySandbox
}: {
  applyNeuralCircuitPreset: ReturnType<typeof useSandbox>["applyNeuralCircuitPreset"];
  updateNeuralStimulation: ReturnType<typeof useSandbox>["updateNeuralStimulation"];
  sendNeuralStateToBodySandbox: ReturnType<typeof useSandbox>["sendNeuralStateToBodySandbox"];
}) {
  const { sandbox } = useSandbox();
  const neural = sandbox.neuralCircuitState;
  const activityModes = ["Resting", "Sleeping", "Focused", "Active", "Motor Dysfunction", "Hyper-synchronous Activity"];

  return (
    <div className="space-y-4">
      <GlassCard>
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Activity</p>
        <h2 className="mt-1 text-xl font-semibold text-white">What is active right now?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">Neural Pulse concepts are now an activity layer over SandboxState, not a separate product.</p>
      </GlassCard>
      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassCard>
          <p className="mb-3 text-sm font-semibold text-white">Activity states</p>
          <div className="flex flex-wrap gap-2">
            {activityModes.map((mode) => <span key={mode} className="rounded-full border border-slate-600/40 bg-slate-950/40 px-3 py-1 text-xs text-slate-300">{mode}</span>)}
          </div>
          <div className="mt-5 space-y-2">
            {neuralCircuitPresets.map((preset) => (
              <button key={preset.id} type="button" className={neural.presetId === preset.id ? "nexus-button w-full justify-start" : "nexus-button-secondary w-full justify-start"} onClick={() => applyNeuralCircuitPreset(preset.id)}>
                {preset.label}
              </button>
            ))}
          </div>
          <button type="button" className="nexus-button mt-4 w-full" onClick={sendNeuralStateToBodySandbox}>
            <BrainCircuit className="h-4 w-4" />
            Sync activity to body
          </button>
        </GlassCard>
        <GlassCard className="overflow-hidden">
          <ActivityMap />
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <Metric label="Synchrony" value={neural.metrics.synchrony} />
            <Metric label="Tremor index" value={neural.metrics.tremorIndex} />
            <Metric label="Overload" value={neural.metrics.overloadRisk} />
            <Metric label="Suppression" value={neural.metrics.suppressionScore} />
          </div>
          <label className="mt-4 block text-sm text-slate-300">
            <span className="mb-2 flex justify-between"><strong className="text-white">Neural synchrony pressure</strong><span>{Math.round(neural.stimulation.noiseSeverity * 100)}%</span></span>
            <input className="w-full accent-violet-300" type="range" min={0.1} max={1} step={0.01} value={neural.stimulation.noiseSeverity} onChange={(event) => updateNeuralStimulation({ noiseSeverity: Number(event.target.value) })} />
          </label>
        </GlassCard>
      </div>
    </div>
  );
}

function InterventionView({ onHide }: { onHide: () => void }) {
  const { activePreset, sandbox, toggleIntervention } = useSandbox();
  const activeIds = new Set(sandbox.scenario.interventions.map((item) => item.id));

  return (
    <div className="space-y-4">
      <GlassCard>
        <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Intervention</p>
        <h2 className="mt-1 text-xl font-semibold text-white">What changes if I perturb the system?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">Interventions are optional what-if modulators. They are not recommendations.</p>
        <button type="button" className="nexus-button-secondary mt-4" onClick={onHide}>Return to body</button>
      </GlassCard>
      <div className="grid gap-4 md:grid-cols-2">
        {activePreset.interventions.map((intervention) => (
          <GlassCard key={intervention.id} className={activeIds.has(intervention.id) ? "border-emerald-300/35 bg-emerald-300/[0.055]" : undefined}>
            <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">{intervention.category}</span>
            <h3 className="mt-4 text-xl font-semibold text-white">{intervention.label}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">Target: {intervention.targetLayer}. System/pathway: {intervention.affectedPathwayOrSystem}. Direction: {intervention.expectedDirection}.</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-emerald-300" style={{ width: `${100 - intervention.uncertainty}%` }} /></div>
            <p className="mt-3 rounded-lg border border-amber-300/25 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">{intervention.safetyLanguage}</p>
            <button type="button" className="nexus-button mt-4 w-full" onClick={() => toggleIntervention(intervention)}>
              <Zap className="h-4 w-4" />
              {activeIds.has(intervention.id) ? "Remove perturbation" : "Apply what-if perturbation"}
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function PathCard({ title, icon: Icon, items }: { title: string; icon: LucideIcon; items: string[] }) {
  return (
    <GlassCard>
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-cyan-200" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center gap-3 rounded-lg border border-slate-700/40 bg-slate-950/35 p-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-xs text-cyan-100">{index + 1}</span>
            <span className="text-sm text-slate-200">{item}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function ActivityMap() {
  const { sandbox } = useSandbox();
  const synchrony = sandbox.neuralCircuitState.metrics.synchrony;
  const overload = sandbox.neuralCircuitState.metrics.overloadRisk;
  const suppression = sandbox.neuralCircuitState.metrics.suppressionScore;

  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-violet-300/15 bg-[#050917]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_24%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_58%_64%,rgba(168,85,247,0.18),transparent_34%)]" />
      <svg viewBox="0 0 680 360" className="relative h-[360px] w-full">
        <path d="M178 78c72-62 244-62 320 0 62 50 62 158-8 206-78 54-236 52-306 0-68-50-70-156-6-206Z" fill="rgba(15,23,42,0.78)" stroke="rgba(125,211,252,0.38)" strokeWidth="2" />
        {[
          [240, 144, "Frontal", synchrony],
          [340, 108, "Motor", sandbox.neuralCircuitState.metrics.tremorIndex],
          [448, 148, "Sensory", overload],
          [316, 234, "Basal loop", 1 - suppression],
          [410, 238, "Thalamic relay", synchrony * 0.8 + overload * 0.2]
        ].map(([x, y, label, value]) => (
          <g key={label as string}>
            <circle cx={x as number} cy={y as number} r={34 + (value as number) * 30} fill={(value as number) > 0.65 ? "#fb7185" : "#22d3ee"} opacity={0.12 + (value as number) * 0.28} />
            <circle cx={x as number} cy={y as number} r={15 + (value as number) * 12} fill={(value as number) > 0.65 ? "#fb7185" : "#67e8f9"} opacity="0.86" />
            <text x={x as number} y={(y as number) + 48} textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="700">{label as string}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-700/40 bg-slate-950/35 p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{Math.round(value * 100)}%</p>
    </div>
  );
}
