import { useState } from "react";
import { Activity, ArrowDown, ArrowUp, BrainCircuit, FlaskConical, Network, Radar, ScanHeart, Zap, type LucideIcon } from "lucide-react";
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

export function BodySandboxPage({ initialView = "body" }: { initialView?: SandboxView } = {}) {
  const { sandbox, setModuleIncluded, applyNeuralCircuitPreset, updateNeuralStimulation, sendNeuralStateToBodySandbox } = useSandbox();
  const { userMode, complexityLevel } = useAppSettings();
  const [activeView, setActiveView] = useState<SandboxView>(initialView);
  const [interventionUnlocked, setInterventionUnlocked] = useState(initialView === "intervention");
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
            <h1 className="mt-2 text-3xl font-semibold text-white">{sandboxHeadline(userMode, complexityLevel)}</h1>
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

      <div className="grid gap-4 2xl:grid-cols-[430px_minmax(0,1fr)] xl:grid-cols-[390px_minmax(0,1fr)]">
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
      <GlassCard>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-cyan-200" />
            <div>
              <h3 className="text-lg font-semibold text-white">Scenario relationship graph</h3>
              <p className="mt-1 text-sm text-slate-400">Network Pulse style topology, driven by the active sandbox scenario.</p>
            </div>
          </div>
          {!expert ? <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">Simplified labels</span> : null}
        </div>
        <ScenarioNetworkGraph />
      </GlassCard>
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
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <DBSMetric label="Amplitude" value={`${neural.stimulation.amplitude.toFixed(1)} mA`} />
            <DBSMetric label="Frequency" value={`${Math.round(neural.stimulation.frequency)} Hz`} />
            <DBSMetric label="Pulse width" value={`${Math.round(neural.stimulation.pulseWidth)} us`} />
          </div>
          <label className="mt-4 block text-sm text-slate-300">
            <span className="mb-2 flex justify-between"><strong className="text-white">Neural synchrony level</strong><span>{Math.round(neural.stimulation.noiseSeverity * 100)}%</span></span>
            <input className="w-full accent-violet-300" type="range" min={0.1} max={1} step={0.01} value={neural.stimulation.noiseSeverity} onChange={(event) => updateNeuralStimulation({ noiseSeverity: Number(event.target.value) })} />
          </label>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <label className="block text-xs text-slate-400">
              <span className="mb-1 flex justify-between"><strong className="text-slate-200">DBS amplitude</strong><span>{neural.stimulation.amplitude.toFixed(1)}</span></span>
              <input className="w-full accent-cyan-300" type="range" min={0} max={5} step={0.1} value={neural.stimulation.amplitude} onChange={(event) => updateNeuralStimulation({ amplitude: Number(event.target.value) })} />
            </label>
            <label className="block text-xs text-slate-400">
              <span className="mb-1 flex justify-between"><strong className="text-slate-200">Frequency</strong><span>{Math.round(neural.stimulation.frequency)}</span></span>
              <input className="w-full accent-violet-300" type="range" min={60} max={190} step={1} value={neural.stimulation.frequency} onChange={(event) => updateNeuralStimulation({ frequency: Number(event.target.value) })} />
            </label>
            <label className="block text-xs text-slate-400">
              <span className="mb-1 flex justify-between"><strong className="text-slate-200">Pulse width</strong><span>{Math.round(neural.stimulation.pulseWidth)}</span></span>
              <input className="w-full accent-emerald-300" type="range" min={30} max={180} step={1} value={neural.stimulation.pulseWidth} onChange={(event) => updateNeuralStimulation({ pulseWidth: Number(event.target.value) })} />
            </label>
          </div>
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
    <div className="relative min-h-[430px] overflow-hidden rounded-lg border border-violet-300/15 bg-[#050917]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_24%,rgba(34,211,238,0.2),transparent_30%),radial-gradient(circle_at_58%_64%,rgba(168,85,247,0.2),transparent_34%)]" />
      <div className="absolute right-4 top-4 z-10 rounded-full border border-cyan-300/25 bg-slate-950/70 px-3 py-1 text-xs text-cyan-100">
        <Radar className="mr-1 inline h-3.5 w-3.5" />
        Cortical + DBS sandbox
      </div>
      <svg viewBox="0 0 760 430" className="relative h-[430px] w-full">
        <defs>
          <filter id="activityGlow"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <linearGradient id="cortexShell" x1="0" x2="1"><stop offset="0%" stopColor="rgba(15,23,42,0.92)" /><stop offset="100%" stopColor="rgba(30,41,59,0.72)" /></linearGradient>
        </defs>
        <path d="M174 92c85-76 301-76 390 0 72 62 72 196-10 256-92 68-286 66-372 0-82-62-84-194-8-256Z" fill="url(#cortexShell)" stroke="rgba(125,211,252,0.42)" strokeWidth="2" />
        <path d="M234 96c18 42 24 88 8 132M330 70c-12 54-10 102 8 148M450 72c12 48 4 96-22 142M556 114c-30 34-44 78-40 128" fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth="2" />
        <path d="M374 138 C344 194 342 253 376 306" fill="none" stroke="rgba(34,211,238,0.34)" strokeWidth="5" strokeLinecap="round" strokeDasharray="8 10" />
        <path d="M448 142 C484 196 484 252 452 306" fill="none" stroke="rgba(168,85,247,0.34)" strokeWidth="5" strokeLinecap="round" strokeDasharray="8 10" />
        {[
          [248, 154, "Frontal", synchrony],
          [365, 122, "Motor cortex", sandbox.neuralCircuitState.metrics.tremorIndex],
          [496, 160, "Sensory", overload],
          [344, 280, "Basal ganglia", 1 - suppression],
          [462, 278, "Thalamic relay", synchrony * 0.8 + overload * 0.2],
          [592, 234, "Cerebellar loop", overload * 0.45 + synchrony * 0.35]
        ].map(([x, y, label, value]) => (
          <g key={label as string}>
            <circle cx={x as number} cy={y as number} r={34 + (value as number) * 30} fill={(value as number) > 0.65 ? "#fb7185" : "#22d3ee"} opacity={0.12 + (value as number) * 0.28} />
            <circle cx={x as number} cy={y as number} r={15 + (value as number) * 12} fill={(value as number) > 0.65 ? "#fb7185" : "#67e8f9"} opacity="0.86" filter="url(#activityGlow)" />
            <text x={x as number} y={(y as number) + 48} textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="700">{label as string}</text>
          </g>
        ))}
        <g>
          <line x1="380" y1="66" x2="346" y2="278" stroke="rgba(52,211,153,0.72)" strokeWidth="3" />
          <line x1="448" y1="66" x2="462" y2="278" stroke="rgba(52,211,153,0.72)" strokeWidth="3" />
          <circle cx="380" cy="66" r="8" fill="#34d399" filter="url(#activityGlow)" />
          <circle cx="448" cy="66" r="8" fill="#34d399" filter="url(#activityGlow)" />
          <text x="414" y="48" textAnchor="middle" fill="#a7f3d0" fontSize="12" fontWeight="700">DBS leads</text>
        </g>
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

function DBSMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/[0.055] p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-emerald-100/70">{label}</p>
      <p className="mt-1 text-lg font-semibold text-emerald-50">{value}</p>
    </div>
  );
}

function sandboxHeadline(userMode: string, complexityLevel: string) {
  if (complexityLevel === "basic" || userMode === "student") return "Choose a body model, adjust settings, and see which systems respond";
  if (userMode === "researcher") return "Inspect scenario assumptions across molecular, tissue and system relationships";
  if (complexityLevel === "expert") return "Inspect ontology-linked entities, relationships, assumptions and sandbox state";
  return "Explore how genes, pathways, organs, systems and interventions connect";
}
