import { ArrowDown, ArrowUp, GitBranch, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { ComplexitySelector } from "@/components/ui/ComplexitySelector";
import { GlassCard } from "@/components/ui/GlassCard";
import type { BiologicalLayer, ParameterControlId } from "@/lib/ontology/types";
import { useSandbox } from "@/lib/sandbox/sandboxState";
import { defaultParameters, parameterControls } from "@/lib/sandbox/simulation";

type StartingPointLayer = BiologicalLayer | "scenario" | "molecule";
type TraceDirection = "forward" | "backward";

const dataLayerOptions: Array<{ id: StartingPointLayer; label: string; example: string }> = [
  { id: "scenario", label: "Scenario", example: "metabolic dysfunction, retinal degeneration, inflammatory activation" },
  { id: "genes", label: "Gene", example: "SNCA, GBA1, INSR, RPE65, RPGR" },
  { id: "proteins", label: "Protein", example: "alpha-synuclein, insulin receptor, rhodopsin" },
  { id: "molecule", label: "Molecule", example: "dopamine, insulin, IL-6, glucose, cortisol" },
  { id: "pathways", label: "Pathway", example: "mitophagy, insulin signalling, cytokine signalling" },
  { id: "organs", label: "Organ", example: "retina, liver, pancreas, brain, muscle" },
  { id: "systems", label: "System", example: "nervous system, endocrine system, immune system" },
  { id: "phenotypes", label: "Phenotype", example: "tremor, glucose regulation shift, inflammation, vision loss" },
  { id: "interventions", label: "Intervention", example: "DBS, exercise, sleep disruption, gene delivery" }
];

const evidencePatterns: Array<{
  id: string;
  label: string;
  description: string;
  patch: Partial<Record<ParameterControlId, number>>;
  pathwayBias: number;
}> = [
  {
    id: "neural-motor",
    label: "Motor / neural instability",
    description: "Raises neural synchrony and oxidative load to explore motor-circuit or tremor examples.",
    patch: { neuralSynchrony: 0.78, oxidativeStress: 0.52, mitochondrialFunction: 0.58 },
    pathwayBias: 0.26
  },
  {
    id: "metabolic-load",
    label: "Metabolic regulation stress",
    description: "Fits insulin/glucose examples by lowering signal integrity and increasing metabolic load.",
    patch: { insulinSensitivity: 0.26, metabolicLoad: 0.82, inflammation: 0.48, oxidativeStress: 0.46 },
    pathwayBias: 0.22
  },
  {
    id: "immune-inflammatory",
    label: "Inflammatory activation",
    description: "Fits cytokine or immune-activation examples by raising immune and tissue inflammation tone.",
    patch: { immuneActivation: 0.84, inflammation: 0.76, oxidativeStress: 0.5 },
    pathwayBias: 0.24
  },
  {
    id: "ocular-retinal",
    label: "Retinal / sensory stress",
    description: "Fits ocular degeneration or gene-therapy mechanism examples by increasing retinal stress.",
    patch: { retinalStress: 0.84, oxidativeStress: 0.48, inflammation: 0.38 },
    pathwayBias: 0.2
  },
  {
    id: "rescue-modulation",
    label: "Rescue / modulation",
    description: "Explores a stabilising intervention by reducing inflammation, synchrony and oxidative stress load.",
    patch: { inflammation: 0.22, neuralSynchrony: 0.32, oxidativeStress: 0.28, immuneActivation: 0.28, mitochondrialFunction: 0.78 },
    pathwayBias: -0.22
  }
];

const healthyPatterns: typeof evidencePatterns = [
  {
    id: "baseline-neural",
    label: "Neural activity",
    description: "Adjusts reference neural signalling without selecting a disease or disruption.",
    patch: { neuralSynchrony: 0.34, mitochondrialFunction: 0.72, oxidativeStress: 0.2 },
    pathwayBias: 0.04
  },
  {
    id: "baseline-metabolic",
    label: "Metabolic load",
    description: "Explores normal-range changes in glucose, liver and muscle energy balance.",
    patch: { insulinSensitivity: 0.7, metabolicLoad: 0.3, mitochondrialFunction: 0.7 },
    pathwayBias: 0.04
  },
  {
    id: "baseline-inflammatory",
    label: "Inflammatory tone",
    description: "Adjusts immune activity within a low-disruption reference state.",
    patch: { immuneActivation: 0.28, inflammation: 0.24, oxidativeStress: 0.22 },
    pathwayBias: 0.03
  },
  {
    id: "baseline-retinal",
    label: "Visual/retinal stress",
    description: "Explores mild visual-system load without implying retinal degeneration.",
    patch: { retinalStress: 0.3, oxidativeStress: 0.2, inflammation: 0.18 },
    pathwayBias: 0.02
  },
  {
    id: "baseline-support",
    label: "Recovery/support state",
    description: "Raises supportive physiology such as mitochondrial reserve and lower inflammatory tone.",
    patch: { inflammation: 0.16, immuneActivation: 0.2, oxidativeStress: 0.18, mitochondrialFunction: 0.82 },
    pathwayBias: -0.08
  }
];

export function ScenarioBuilderPanel({ showInterventions = false }: { showInterventions?: boolean }) {
  const { sandbox, activePreset, selectPreset, togglePredisposition, togglePerturbation, toggleIntervention, setPathwayTuning, applySandboxTuning } = useSandbox();
  const activePredispositions = new Set(sandbox.scenario.predispositions.map((item) => item.id));
  const activePerturbations = new Set(sandbox.scenario.perturbations.map((item) => item.id));
  const activeInterventions = new Set(sandbox.scenario.interventions.map((item) => item.id));
  const [knownLayer, setKnownLayer] = useState<StartingPointLayer>("phenotypes");
  const [exampleText, setExampleText] = useState("Observed tremor + motor slowing after neural-circuit perturbation");
  const [traceDirection, setTraceDirection] = useState<TraceDirection>("backward");
  const isHealthyBaseline = sandbox.activeScenarioId === "healthy-baseline";
  const readerMode = getReaderMode();
  const showMechanisticTrace = readerMode === "researcher" || readerMode === "expert";

  const topBacktrace = sandbox.simulationResult.backtraceCandidates.slice(0, 3);
  const topPhenotypes = sandbox.simulationResult.phenotypeEffects.slice(0, 3);
  const selectedLayer = dataLayerOptions.find((item) => item.id === knownLayer) ?? dataLayerOptions[0];
  const extrapolation = useMemo(() => buildExtrapolationCopy(knownLayer), [knownLayer]);
  const patterns = isHealthyBaseline ? healthyPatterns : evidencePatterns;
  const activeTrace = traceDirection === "backward"
    ? buildBackwardTrace(topBacktrace, activePreset, exampleText)
    : buildForwardTrace(topPhenotypes, activePreset, knownLayer, exampleText);
  const changedParameters = parameterControls
    .map((control) => ({ control, value: sandbox.parameters[control.id], baseline: defaultParameters[control.id] }))
    .filter(({ value, baseline }) => Math.abs(value - baseline) >= 0.04)
    .slice(0, 5);
  const changedPathways = Object.entries(sandbox.pathwayTuning).filter(([, value]) => Math.abs(value) >= 0.05).slice(0, 4);

  const applyPattern = (pattern: (typeof evidencePatterns)[number]) => {
    applySandboxTuning({
      parameters: pattern.patch,
      pathwayTuning: Object.fromEntries(activePreset.keyPathways.map((pathway) => {
        const current = sandbox.pathwayTuning[pathway] ?? 0;
        return [pathway, Math.max(-1, Math.min(1, current + pattern.pathwayBias))];
      }))
    });
  };

  return (
    <GlassCard className="h-full">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="h-5 w-5 text-cyan-200" />
        <div>
          <h2 className="text-lg font-semibold text-white">Biological Starting Point</h2>
          <p className="text-xs leading-5 text-slate-400">Start anywhere, then trace forward or backward through biology.</p>
        </div>
      </div>
      <div className="space-y-5">
        <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/[0.055] p-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-cyan-200" />
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">What are you starting from?</p>
          </div>
          <label className="mt-3 block text-sm text-slate-300">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-slate-500">Starting layer</span>
            <select className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" value={knownLayer} onChange={(event) => setKnownLayer(event.target.value as StartingPointLayer)}>
              {dataLayerOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <label className="mt-3 block text-sm text-slate-300">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-slate-500">Entity, observation or example</span>
            <textarea
              className="min-h-24 w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm leading-6"
              value={exampleText}
              onChange={(event) => setExampleText(event.target.value)}
              placeholder={selectedLayer.example}
            />
          </label>
          <p className="mt-2 text-xs leading-5 text-slate-400">Example hints: {selectedLayer.example}</p>
        </div>

        <div className="rounded-lg border border-violet-300/20 bg-violet-300/[0.055] p-4">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-violet-100" />
            <p className="text-xs uppercase tracking-[0.18em] text-violet-100">Reasoning direction</p>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              className={`rounded-md border p-3 text-left transition ${
                traceDirection === "backward" ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-50" : "border-white/10 bg-slate-950/35 text-slate-300 hover:border-cyan-300/35"
              }`}
              onClick={() => setTraceDirection("backward")}
            >
              <span className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">
                <ArrowUp className="h-3.5 w-3.5" />
                Trace backward
              </span>
              <span className="block text-sm font-semibold text-white">What could explain this?</span>
            </button>
            <button
              type="button"
              className={`rounded-md border p-3 text-left transition ${
                traceDirection === "forward" ? "border-emerald-300/50 bg-emerald-300/10 text-emerald-50" : "border-white/10 bg-slate-950/35 text-slate-300 hover:border-emerald-300/35"
              }`}
              onClick={() => setTraceDirection("forward")}
            >
              <span className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100">
                <ArrowDown className="h-3.5 w-3.5" />
                Trace forward
              </span>
              <span className="block text-sm font-semibold text-white">What could this affect?</span>
            </button>
          </div>
          <div className="mt-3 rounded-md border border-white/10 bg-slate-950/35 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Knowledge path</p>
            <div className="mt-3 space-y-2">
              {isHealthyBaseline && !showMechanisticTrace && traceDirection === "backward" ? (
                <p className="text-sm text-slate-300">No dominant disruption selected.</p>
              ) : activeTrace.map((step, index) => (
                <div key={`${step}-${index}`} className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-[10px] text-cyan-100">{index + 1}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">{extrapolation}</p>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">Reasoning templates</p>
          <div className="grid gap-2">
            {patterns.map((pattern) => (
              <button
                key={pattern.id}
                type="button"
                className="rounded-md border border-slate-700/50 bg-slate-950/35 p-3 text-left transition hover:border-cyan-300/45 hover:bg-cyan-300/[0.06]"
                onClick={() => applyPattern(pattern)}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Sparkles className="h-3.5 w-3.5 text-violet-200" />
                  {pattern.label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-400">{pattern.description}</span>
              </button>
            ))}
          </div>
        </div>

        <label className="block text-sm text-slate-300">
          <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-500">Preset scenario</span>
          <select className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" value={sandbox.activeScenarioId} onChange={(event) => selectPreset(event.target.value)}>
            {sandbox.presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.title}</option>)}
          </select>
        </label>
        <div className="rounded-lg border border-slate-700/50 bg-slate-950/40 p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Preset meaning</p>
          <p className="mt-2 text-sm font-semibold text-white">{activePreset.shortTitle}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">{activePreset.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {activePreset.affectedSystems.slice(0, 3).map((system) => (
              <span key={system} className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-2.5 py-1 text-[11px] text-cyan-100">{system}</span>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/[0.045] p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-100">User overrides</p>
          {changedParameters.length || changedPathways.length ? (
            <div className="mt-2 space-y-2">
              {changedParameters.map(({ control, value, baseline }) => (
                <div key={control.id} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-slate-950/35 px-2.5 py-2 text-xs">
                  <span className="text-slate-300">{control.label}</span>
                  <span className="font-mono text-emerald-100">{Math.round(baseline * 100)}% to {Math.round(value * 100)}%</span>
                </div>
              ))}
              {changedPathways.map(([pathway, value]) => (
                <div key={pathway} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-slate-950/35 px-2.5 py-2 text-xs">
                  <span className="text-slate-300">{pathway}</span>
                  <span className="font-mono text-emerald-100">{value > 0 ? "+" : ""}{value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs leading-5 text-slate-400">No user overrides yet. The sandbox is using the selected preset defaults.</p>
          )}
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">Baseline profile</p>
          <div className="rounded-lg border border-slate-700/50 bg-slate-950/40 p-3">
            <p className="text-sm font-semibold text-white">{sandbox.scenario.baselineProfile.label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">{sandbox.scenario.baselineProfile.description}</p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">Complexity level</p>
          <ComplexitySelector />
        </div>
        <ToggleList title="Predispositions" items={activePreset.predispositions} active={activePredispositions} onToggle={togglePredisposition} />
        <ToggleList title="Perturbations" items={activePreset.perturbations} active={activePerturbations} onToggle={togglePerturbation} />
        {showInterventions ? (
          <ToggleList title="Interventions" items={activePreset.interventions} active={activeInterventions} onToggle={toggleIntervention} />
        ) : null}
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">Pathway tuning</p>
          <div className="space-y-2">
            {activePreset.keyPathways.map((pathway) => {
              const value = sandbox.pathwayTuning[pathway] ?? 0;
              return (
                <label key={pathway} className="block rounded-md border border-slate-700/50 bg-slate-950/35 p-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-slate-200">{pathway}</span>
                    <span className="font-mono text-xs text-cyan-200">{value > 0 ? "+" : ""}{value.toFixed(2)}</span>
                  </div>
                  <input className="mt-3 w-full accent-violet-300" type="range" min={-1} max={1} step={0.05} value={value} onChange={(event) => setPathwayTuning(pathway, Number(event.target.value))} />
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function buildExtrapolationCopy(layer: StartingPointLayer) {
  if (layer === "scenario") return "Starting from scenario: BioNexus shows where the state appears in the body, then exposes upstream genes/pathways and downstream phenotype effects.";
  if (layer === "genes") return "Starting from genes: BioNexus projects toward proteins, pathways, tissues, organs, phenotypes, scenarios and interventions.";
  if (layer === "proteins") return "Starting from proteins: the sandbox suggests possible gene context and projects pathway and tissue relationships.";
  if (layer === "molecule") return "Starting from molecule: BioNexus traces candidate sources, affected proteins/pathways, body regions and phenotype-level consequences.";
  if (layer === "pathways") return "Starting from pathways: the sandbox ranks upstream genes and downstream body systems most affected by the selected signal.";
  if (layer === "organs") return "Starting from organ state: the atlas answers where, while the inspector traces genes, molecules, pathways and phenotypes that could relate to that region.";
  if (layer === "systems") return "Starting from system state: BioNexus maps affected organs, candidate pathways and phenotype consequences across the body.";
  if (layer === "tissues") return "Starting from tissue or organ state: the sandbox suggests genes and pathways that could plausibly relate to the selected body-region signal.";
  if (layer === "phenotypes") return "Starting from phenotype: BioNexus walks backward toward candidate genes/pathways and forward toward scenario-level effects.";
  return "Starting from intervention or exposure: the sandbox treats it as a perturbation and shows possible pathway, organ and phenotype effects.";
}

function buildBackwardTrace(topBacktrace: ReturnType<typeof useSandbox>["sandbox"]["simulationResult"]["backtraceCandidates"], activePreset: ReturnType<typeof useSandbox>["activePreset"], exampleText: string) {
  const candidate = topBacktrace[0];
  return [
    exampleText || "Selected observation",
    activePreset.phenotypeEffects[0]?.label ?? "Phenotype",
    activePreset.organEffects[0]?.label ?? "Tissue / organ state",
    activePreset.keyPathways[0] ?? candidate?.linkedPathways?.[0] ?? "Pathway",
    candidate?.geneSymbol ?? activePreset.keyGenes[0] ?? "Candidate gene"
  ];
}

function buildForwardTrace(
  topPhenotypes: ReturnType<typeof useSandbox>["sandbox"]["simulationResult"]["phenotypeEffects"],
  activePreset: ReturnType<typeof useSandbox>["activePreset"],
  layer: StartingPointLayer,
  exampleText: string
) {
  const start = exampleText || dataLayerOptions.find((option) => option.id === layer)?.example || "Selected entity";
  return [
    start,
    activePreset.keyGenes[0] ?? "Candidate gene",
    activePreset.keyPathways[0] ?? "Pathway",
    activePreset.organEffects[0]?.label ?? "Tissue / organ state",
    topPhenotypes[0]?.label ?? activePreset.phenotypeEffects[0]?.label ?? "Phenotype"
  ];
}

function getReaderMode() {
  if (typeof window === "undefined") return "student";
  const mode = window.localStorage.getItem("bionexus:user-mode") ?? window.localStorage.getItem("userMode");
  const complexity = window.localStorage.getItem("bionexus:complexity-level") ?? window.localStorage.getItem("complexityLevel");
  if (complexity === "expert") return "expert";
  if (mode === "researcher" || mode === "clinician" || complexity === "advanced") return "researcher";
  return "student";
}

function ToggleList<T extends { id: string; label: string; description?: string }>({
  title,
  items,
  active,
  onToggle
}: {
  title: string;
  items: T[];
  active: Set<string>;
  onToggle: (item: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            className={`w-full rounded-md border p-3 text-left transition ${
              active.has(item.id)
                ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-50"
                : "border-slate-700/50 bg-slate-950/35 text-slate-300 hover:border-violet-300/40"
            }`}
            onClick={() => onToggle(item)}
          >
            <span className="block text-sm font-semibold">{item.label}</span>
            {item.description ? <span className="mt-1 block text-xs leading-5 text-slate-400">{item.description}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
