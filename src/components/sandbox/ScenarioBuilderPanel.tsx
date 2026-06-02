import { ArrowDown, ArrowUp, ClipboardList, SlidersHorizontal, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { ComplexitySelector } from "@/components/ui/ComplexitySelector";
import { GlassCard } from "@/components/ui/GlassCard";
import type { BiologicalLayer, ParameterControlId } from "@/lib/ontology/types";
import { useSandbox } from "@/lib/sandbox/sandboxState";

const dataLayerOptions: Array<{ id: BiologicalLayer; label: string; example: string }> = [
  { id: "genes", label: "Gene / variant", example: "SNCA, GBA1, INSR, RPE65" },
  { id: "proteins", label: "Protein / biomarker", example: "alpha-synuclein, insulin receptor, IL-6" },
  { id: "pathways", label: "Pathway signal", example: "mitophagy, insulin signalling, cytokine signalling" },
  { id: "tissues", label: "Tissue or organ change", example: "retinal stress, liver metabolic load, basal ganglia loop" },
  { id: "phenotypes", label: "Observed phenotype", example: "tremor, glucose pressure, inflammation, visual function" },
  { id: "interventions", label: "Intervention or exposure", example: "DBS, exercise, sleep disruption, gene delivery" }
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
    description: "Explores a stabilising intervention by reducing inflammation, synchrony and oxidative pressure.",
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
  const [knownLayer, setKnownLayer] = useState<BiologicalLayer>("phenotypes");
  const [exampleText, setExampleText] = useState("Observed tremor + motor slowing after neural-circuit perturbation");
  const isHealthyBaseline = sandbox.activeScenarioId === "healthy-baseline";
  const readerMode = getReaderMode();
  const showMechanisticTrace = readerMode === "researcher" || readerMode === "expert";

  const topBacktrace = sandbox.simulationResult.backtraceCandidates.slice(0, 3);
  const topPhenotypes = sandbox.simulationResult.phenotypeEffects.slice(0, 3);
  const selectedLayer = dataLayerOptions.find((item) => item.id === knownLayer) ?? dataLayerOptions[0];
  const extrapolation = useMemo(() => buildExtrapolationCopy(knownLayer), [knownLayer]);
  const patterns = isHealthyBaseline ? healthyPatterns : evidencePatterns;
  const upstreamLabel = showMechanisticTrace ? "Trace upstream" : "Possible upstream factors";
  const downstreamLabel = showMechanisticTrace ? "Trace downstream" : "Possible downstream effects";

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
        <h2 className="text-lg font-semibold text-white">Scenario builder</h2>
      </div>
      <div className="space-y-5">
        <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/[0.055] p-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-cyan-200" />
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100">Fit the sandbox to an example</p>
          </div>
          <label className="mt-3 block text-sm text-slate-300">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-slate-500">What kind of data do you have?</span>
            <select className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" value={knownLayer} onChange={(event) => setKnownLayer(event.target.value as BiologicalLayer)}>
              {dataLayerOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <label className="mt-3 block text-sm text-slate-300">
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-slate-500">User example / condition being tested</span>
            <textarea
              className="min-h-24 w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm leading-6"
              value={exampleText}
              onChange={(event) => setExampleText(event.target.value)}
              placeholder={selectedLayer.example}
            />
          </label>
          <p className="mt-2 text-xs leading-5 text-slate-400">Example hints: {selectedLayer.example}</p>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">Adjust model state</p>
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

        <div className="rounded-lg border border-violet-300/20 bg-violet-300/[0.055] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-violet-100">Knowledge Path</p>
          <div className="mt-3 grid gap-3">
            <div className="rounded-md border border-white/10 bg-slate-950/35 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">
                <ArrowUp className="h-3.5 w-3.5" />
                {upstreamLabel}
              </div>
              <div className="space-y-2 text-sm text-slate-300">
                {isHealthyBaseline && !showMechanisticTrace ? (
                  <p>No dominant disruption selected.</p>
                ) : topBacktrace.map((candidate) => (
                  <p key={candidate.id}><strong className="text-white">{candidate.geneSymbol}</strong> via {candidate.linkedPathways.slice(0, 2).join(" / ")}</p>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-white/10 bg-slate-950/35 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100">
                <ArrowDown className="h-3.5 w-3.5" />
                {downstreamLabel}
              </div>
              <div className="space-y-2 text-sm text-slate-300">
                {topPhenotypes.map((effect) => (
                  <p key={effect.phenotype}><strong className="text-white">{effect.label}</strong> · {effect.magnitude}% relative effect</p>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">{extrapolation}</p>
        </div>

        <label className="block text-sm text-slate-300">
          <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-500">Preset scenario</span>
          <select className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2" value={sandbox.activeScenarioId} onChange={(event) => selectPreset(event.target.value)}>
            {sandbox.presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.title}</option>)}
          </select>
        </label>
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

function buildExtrapolationCopy(layer: BiologicalLayer) {
  if (layer === "genes") return "Starting from genes: BioNexus projects toward proteins, pathways, tissues, organs, phenotypes, scenarios and interventions.";
  if (layer === "proteins") return "Starting from proteins: the sandbox suggests possible gene context and projects pathway and tissue relationships.";
  if (layer === "pathways") return "Starting from pathways: the sandbox ranks upstream genes and downstream body systems most affected by the selected signal.";
  if (layer === "tissues") return "Starting from tissue or organ state: the sandbox suggests genes and pathways that could plausibly relate to the selected body-region signal.";
  if (layer === "phenotypes") return "Starting from phenotype: BioNexus walks backward toward candidate genes/pathways and forward toward scenario-level effects.";
  return "Starting from intervention or exposure: the sandbox treats it as a perturbation and shows possible pathway, organ and phenotype effects.";
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
