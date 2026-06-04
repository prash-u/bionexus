import { useState } from "react";
import { Activity, ArrowDown, ArrowUp, BrainCircuit, ChevronDown, ChevronUp, FlaskConical, Network, PanelLeftClose, PanelLeftOpen, Radar, ScanHeart, Zap, type LucideIcon } from "lucide-react";
import { ScenarioNetworkGraph } from "@/components/graph/ScenarioNetworkGraph";
import { BiologicalLayerControls } from "@/components/sandbox/BiologicalLayerControls";
import { MolecularImportPanel } from "@/components/sandbox/MolecularImportPanel";
import { ParameterControlPanel } from "@/components/sandbox/ParameterControlPanel";
import { SandboxOutputPanel } from "@/components/sandbox/SandboxOutputPanel";
import { ScenarioBuilderPanel } from "@/components/sandbox/ScenarioBuilderPanel";
import { WholeBodyVisualization, type BodySystemFilterId } from "@/components/sandbox/WholeBodyVisualization";
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

export function BodySandboxPage({ initialView = "body" }: { initialView?: SandboxView } = {}) {
  const { sandbox, setModuleIncluded, applyNeuralCircuitPreset, updateNeuralStimulation, sendNeuralStateToBodySandbox } = useSandbox();
  const { userMode, complexityLevel } = useAppSettings();
  const [activeView, setActiveView] = useState<SandboxView>(initialView);
  const [interventionUnlocked, setInterventionUnlocked] = useState(initialView === "intervention");
  const [activeSystems, setActiveSystems] = useState<BodySystemFilterId[]>(systemFilters.map((system) => system.id));
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
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
    <div className="min-h-[calc(100vh-5.5rem)] space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-300/15 bg-slate-950/55 px-4 py-3 shadow-[0_0_30px_rgba(34,211,238,0.06)]">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Body Sandbox Workspace</p>
          <h1 className="truncate text-lg font-semibold text-white">{sandboxHeadline(userMode, complexityLevel)}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-cyan-50">{sandbox.scenario.title}</span>
          <span className="hidden max-w-[48rem] truncate rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-slate-300 2xl:inline">{sandbox.simulationResult.summary}</span>
        </div>
      </div>

      <div
        className={`grid min-h-[calc(100vh-10rem)] gap-3 ${
          leftPanelCollapsed ? "xl:grid-cols-[4.25rem_minmax(0,1fr)]" : "xl:grid-cols-[minmax(17rem,18vw)_minmax(0,1fr)] 2xl:grid-cols-[minmax(18rem,19vw)_minmax(0,1fr)]"
        }`}
      >
        <aside className="min-w-0">
          <div className="sticky top-20 space-y-3">
            {leftPanelCollapsed ? (
              <GlassCard className="flex min-h-[34rem] flex-col items-center gap-4 p-3 text-center">
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] text-cyan-100 transition hover:border-cyan-200/45"
                  onClick={() => setLeftPanelCollapsed(false)}
                  aria-label="Expand biological starting point panel"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </button>
                <ScanHeart className="mt-2 h-5 w-5 text-cyan-200" />
                <FlaskConical className="h-5 w-5 text-emerald-200" />
                <Activity className="h-5 w-5 text-violet-200" />
                <span className="mt-2 [writing-mode:vertical-rl] text-xs uppercase tracking-[0.18em] text-slate-400">Reasoning start point</span>
              </GlassCard>
            ) : (
              <div className="max-h-[calc(100vh-11.5rem)] space-y-3 overflow-y-auto pr-1">
                <button
                  type="button"
                  className="float-right mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-300/20 bg-slate-950/65 text-cyan-100 transition hover:border-cyan-200/45"
                  onClick={() => setLeftPanelCollapsed(true)}
                  aria-label="Collapse biological starting point panel"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
                <ScenarioBuilderPanel showInterventions={interventionUnlocked} />
                {!beginner ? <ParameterControlPanel /> : null}
              </div>
            )}
          </div>
        </aside>

        <main className="min-w-0 space-y-3">
          <GlassCard className="p-2">
            <div className="flex flex-wrap items-center gap-2">
              {viewOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`rounded-lg border px-3 py-2 text-left transition ${
                    activeView === item.id
                      ? "border-cyan-300/45 bg-cyan-300/12 text-cyan-50"
                      : "border-slate-700/45 bg-slate-950/35 text-slate-300 hover:border-violet-300/40"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <span className="hidden text-xs leading-5 text-slate-500 2xl:block">{item.question}</span>
                </button>
              ))}
              {!interventionUnlocked ? (
                <button type="button" onClick={showIntervention} className="rounded-lg border border-emerald-300/35 bg-emerald-300/10 px-3 py-2 text-left text-emerald-100 transition hover:border-emerald-200/60">
                  <span className="flex items-center gap-2 text-sm font-semibold"><FlaskConical className="h-4 w-4" /> Test Intervention</span>
                </button>
              ) : null}
              <button type="button" className="ml-auto rounded-lg border border-violet-300/25 bg-violet-300/[0.08] px-3 py-2 text-xs font-semibold text-violet-100 transition hover:border-violet-200/50" onClick={() => setBottomDrawerOpen((value) => !value)}>
                {bottomDrawerOpen ? <ChevronDown className="mr-1 inline h-4 w-4" /> : <ChevronUp className="mr-1 inline h-4 w-4" />}
                Output drawer
              </button>
            </div>
          </GlassCard>

          {activeView === "body" ? (
            <BodyView
              activeSystems={activeSystems}
              onToggleSystem={toggleSystem}
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

          <BottomDrawer open={bottomDrawerOpen} expert={expert} />
        </main>
      </div>
    </div>
  );
}

function BodyView({
  activeSystems,
  onToggleSystem,
  beginner
}: {
  activeSystems: BodySystemFilterId[];
  onToggleSystem: (id: BodySystemFilterId) => void;
  beginner: boolean;
}) {
  return (
    <div className="space-y-3">
      <GlassCard className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Atlas Canvas</p>
            <h2 className="text-base font-semibold text-white">Where is it happening?</h2>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
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
        </div>
      </GlassCard>
      <WholeBodyVisualization activeSystems={activeSystems} compact={beginner} />
    </div>
  );
}

function BottomDrawer({ open, expert }: { open: boolean; expert: boolean }) {
  if (!open) {
    return (
      <GlassCard className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-violet-200">Bottom Drawer</p>
            <p className="text-sm text-slate-300">Simulation output, reports, metadata and export tools are tucked away until needed.</p>
          </div>
          <span className="rounded-full border border-violet-300/25 bg-violet-300/10 px-3 py-1 text-xs text-violet-100">Collapsed</span>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,0.75fr)]">
      <SandboxOutputPanel />
      {expert ? (
        <GlassCard>
          <p className="mb-3 text-sm font-semibold text-white">Expert layers and imports</p>
          <BiologicalLayerControls />
          <div className="mt-4">
            <MolecularImportPanel />
          </div>
        </GlassCard>
      ) : (
        <GlassCard>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Export workspace</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Report-ready sandbox state</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Reports and scenario exports are generated from the active SandboxState. Open the Reports module for full learner, educator, research, investor and scenario export formats.
          </p>
        </GlassCard>
      )}
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
  const sourceSignals = [
    { label: "Neural synchrony", value: sandbox.parameters.neuralSynchrony, tone: "cyan" },
    { label: "Mitochondrial reserve", value: sandbox.parameters.mitochondrialFunction, tone: "emerald" },
    { label: "Inflammatory tone", value: sandbox.parameters.inflammation, tone: "violet" },
    { label: "Oxidative stress", value: sandbox.parameters.oxidativeStress, tone: "rose" }
  ];

  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
      <GlassCard className="overflow-hidden p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Activity Lens</p>
            <h2 className="text-xl font-semibold text-white">Neural pulse state from sandbox signals</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">Circuit activity is a lens on the active biological state, not a separate simulator.</p>
          </div>
          <button type="button" className="nexus-button" onClick={sendNeuralStateToBodySandbox}>
            <BrainCircuit className="h-4 w-4" />
            Send activity to body
          </button>
        </div>
        <NeuralPulseMap />
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Metric label="Synchrony" value={neural.metrics.synchrony} />
          <Metric label="Tremor index" value={neural.metrics.tremorIndex} />
          <Metric label="Overload" value={neural.metrics.overloadRisk} />
          <Metric label="Suppression" value={neural.metrics.suppressionScore} />
        </div>
      </GlassCard>
      <aside className="space-y-3">
        <GlassCard>
          <p className="text-xs uppercase tracking-[0.18em] text-violet-200">Signal source</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Driven by BioNexus parameters</h3>
          <div className="mt-4 space-y-3">
            {sourceSignals.map((signal) => (
              <div key={signal.label} className="rounded-lg border border-white/10 bg-slate-950/45 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-slate-200">{signal.label}</span>
                  <span className="font-mono text-cyan-100">{Math.round(signal.value * 100)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className={`h-full rounded-full ${signal.tone === "emerald" ? "bg-emerald-300" : signal.tone === "violet" ? "bg-violet-300" : signal.tone === "rose" ? "bg-rose-300" : "bg-cyan-300"}`} style={{ width: `${Math.round(signal.value * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <p className="mb-3 text-sm font-semibold text-white">Circuit preset</p>
          <div className="space-y-2">
            {neuralCircuitPresets.map((preset) => (
              <button key={preset.id} type="button" className={neural.presetId === preset.id ? "nexus-button w-full justify-start" : "nexus-button-secondary w-full justify-start"} onClick={() => applyNeuralCircuitPreset(preset.id)}>
                {preset.label}
              </button>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Modulation field</p>
          <div className="mt-3 grid gap-3">
            <DBSMetric label="Amplitude" value={`${neural.stimulation.amplitude.toFixed(1)} a.u.`} />
            <DBSMetric label="Frequency" value={`${Math.round(neural.stimulation.frequency)} Hz`} />
            <DBSMetric label="Pulse width" value={`${Math.round(neural.stimulation.pulseWidth)} us`} />
          </div>
          <label className="mt-4 block text-sm text-slate-300">
            <span className="mb-2 flex justify-between"><strong className="text-white">Circuit synchrony</strong><span>{Math.round(neural.stimulation.noiseSeverity * 100)}%</span></span>
            <input className="w-full accent-violet-300" type="range" min={0.1} max={1} step={0.01} value={neural.stimulation.noiseSeverity} onChange={(event) => updateNeuralStimulation({ noiseSeverity: Number(event.target.value) })} />
          </label>
          <div className="mt-3 grid gap-3">
            <label className="block text-xs text-slate-400">
              <span className="mb-1 flex justify-between"><strong className="text-slate-200">Field strength</strong><span>{neural.stimulation.amplitude.toFixed(1)}</span></span>
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
      </aside>
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

function NeuralPulseMap() {
  const { sandbox } = useSandbox();
  const synchrony = sandbox.neuralCircuitState.metrics.synchrony;
  const overload = sandbox.neuralCircuitState.metrics.overloadRisk;
  const suppression = sandbox.neuralCircuitState.metrics.suppressionScore;
  const tremor = sandbox.neuralCircuitState.metrics.tremorIndex;
  const field = sandbox.neuralCircuitState.stimulation.amplitude / 5;
  const inflammation = sandbox.parameters.inflammation;
  const mitochondrialReserve = sandbox.parameters.mitochondrialFunction;

  return (
    <div className="relative min-h-[620px] overflow-hidden rounded-xl border border-violet-300/15 bg-[#050917]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(34,211,238,0.22),transparent_28%),radial-gradient(circle_at_68%_52%,rgba(168,85,247,0.22),transparent_34%),radial-gradient(circle_at_50%_82%,rgba(52,211,153,0.12),transparent_30%)]" />
      <div className="absolute right-4 top-4 z-10 rounded-full border border-cyan-300/25 bg-slate-950/70 px-3 py-1 text-xs text-cyan-100">
        <Radar className="mr-1 inline h-3.5 w-3.5" />
        Neural Pulse lens
      </div>
      <svg viewBox="0 0 980 620" className="relative h-[620px] w-full">
        <defs>
          <filter id="activityGlow"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="strongActivityGlow"><feGaussianBlur stdDeviation="12" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <linearGradient id="cortexShell" x1="0" x2="1"><stop offset="0%" stopColor="rgba(15,23,42,0.92)" /><stop offset="100%" stopColor="rgba(30,41,59,0.72)" /></linearGradient>
          <linearGradient id="pulseLine" x1="0" x2="1"><stop offset="0%" stopColor="#22d3ee" /><stop offset="50%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#34d399" /></linearGradient>
        </defs>
        <path d="M188 112c116-96 390-96 510 0 94 75 98 242-10 318-124 88-386 86-502 0-108-80-106-238 2-318Z" fill="url(#cortexShell)" stroke="rgba(125,211,252,0.42)" strokeWidth="2.5" />
        <path d="M260 116c26 62 30 132 8 198M388 84c-20 74-16 148 16 222M560 86c20 72 8 142-32 214M700 144c-44 52-62 116-56 190" fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth="2.5" />
        <path d="M486 126 C464 196 464 276 492 354" fill="none" stroke="rgba(34,211,238,0.42)" strokeWidth="6" strokeLinecap="round" strokeDasharray="9 12" />
        <path d="M570 128 C620 200 616 282 574 356" fill="none" stroke="rgba(168,85,247,0.38)" strokeWidth="6" strokeLinecap="round" strokeDasharray="9 12" />
        <path d="M494 354 C456 414 390 464 310 506 M574 356 C626 412 698 456 778 500" fill="none" stroke="url(#pulseLine)" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 10" opacity="0.66" />
        {[
          [292, 206, "Frontal regulation", inflammation * 0.4 + synchrony * 0.45],
          [472, 162, "Motor cortex", tremor],
          [646, 220, "Sensory integration", overload],
          [426, 392, "Basal ganglia", 1 - suppression],
          [588, 388, "Thalamic relay", synchrony * 0.8 + overload * 0.2],
          [746, 334, "Cerebellar loop", overload * 0.45 + synchrony * 0.35],
          [306, 506, "Motor output", tremor * 0.55 + (1 - mitochondrialReserve) * 0.2],
          [778, 500, "Peripheral feedback", synchrony * 0.35 + inflammation * 0.2]
        ].map(([x, y, label, value]) => (
          <g key={label as string}>
            <circle cx={x as number} cy={y as number} r={42 + (value as number) * 42} fill={(value as number) > 0.65 ? "#fb7185" : "#22d3ee"} opacity={0.1 + (value as number) * 0.24} filter="url(#strongActivityGlow)" />
            <circle cx={x as number} cy={y as number} r={14 + (value as number) * 16} fill={(value as number) > 0.65 ? "#fb7185" : "#67e8f9"} opacity="0.88" filter="url(#activityGlow)" />
            <circle cx={x as number} cy={y as number} r={26 + (value as number) * 18} fill="none" stroke={(value as number) > 0.65 ? "#fda4af" : "#67e8f9"} strokeWidth="1.2" opacity="0.45" strokeDasharray="4 7" />
            <text x={x as number} y={(y as number) + 58} textAnchor="middle" fill="#e2e8f0" fontSize="13" fontWeight="700">{label as string}</text>
          </g>
        ))}
        <g>
          <line x1="480" y1="70" x2="426" y2="392" stroke="rgba(52,211,153,0.72)" strokeWidth={2 + field * 4} />
          <line x1="572" y1="70" x2="588" y2="388" stroke="rgba(52,211,153,0.72)" strokeWidth={2 + field * 4} />
          <circle cx="480" cy="70" r={9 + field * 7} fill="#34d399" opacity="0.9" filter="url(#activityGlow)" />
          <circle cx="572" cy="70" r={9 + field * 7} fill="#34d399" opacity="0.9" filter="url(#activityGlow)" />
          <circle cx="506" cy="390" r={42 + field * 42} fill="none" stroke="#34d399" strokeWidth="2" opacity="0.35" />
          <text x="526" y="48" textAnchor="middle" fill="#a7f3d0" fontSize="13" fontWeight="800">Stimulation field</text>
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
