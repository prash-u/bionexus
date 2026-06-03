/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { biologicalLayers, scenarioPresets } from "@/data/scenarios/presets";
import type {
  BaselineProfile,
  BiologicalLayer,
  BodyRegionId,
  BodySystemState,
  MolecularEdge,
  MolecularImportSnapshot,
  NetworkPulseImport,
  NeuralCircuitPresetId,
  NeuralStimulationSettings,
  ModuleOutput,
  ParameterControlId,
  Perturbation,
  Predisposition,
  SandboxState,
  Scenario,
  ScenarioIntervention,
  ScenarioPreset
} from "@/lib/ontology/types";
import { fetchReactomeReactionEdge, MolecularImportError, type FetchReactomeReactionEdgeInput } from "@/lib/molecular/liveImport";
import { applyNeuralPreset, buildNeuralCircuitState, createNeuralCircuitState, neuralStateToBodyPatch, updateNeuralStimulationState } from "@/lib/neural/neuralEngine";
import { createNetworkPulseImport, type NetworkPulseCsvInput } from "@/lib/network/networkPulseImport";
import { buildSandboxSimulationResult, defaultParameters } from "@/lib/sandbox/simulation";

const storageKey = "bionexus:sandbox-state:v1.5";

const now = () => new Date().toISOString();

const scenarioFromPreset = (preset: ScenarioPreset): Scenario => ({
  id: `scenario-${preset.id}`,
  title: preset.title,
  presetId: preset.id,
  baselineProfile: preset.baselineProfile,
  predispositions: preset.predispositions,
  perturbations: preset.perturbations,
  interventions: [],
  activeLayers: biologicalLayers,
  notes: "Editable scenario generated from preset."
});

const moduleOutputs = (preset: ScenarioPreset): ModuleOutput[] => [
  { moduleId: "body-sandbox", title: "Reasoning state", summary: `${preset.shortTitle} active across ${preset.affectedSystems.join(", ")}.`, includedInReport: true },
  { moduleId: "body-atlas", title: "Where lens", summary: "Whole-body atlas contributes selected organ and system context.", includedInReport: true },
  { moduleId: "knowledge-graph", title: "Why lens", summary: `Active pathways: ${preset.keyPathways.join(", ")}.`, includedInReport: true },
  { moduleId: "interventions", title: "Perturbation library", summary: "Interventions are hidden until the user asks a what-if question.", includedInReport: false },
  { moduleId: "neural-circuit", title: "Activity lens", summary: preset.category === "neural" ? "Motor circuit activity contributes modulation context." : "Neural activity available as optional context.", includedInReport: preset.category === "neural" }
];

const systemStatesFromResult = (preset: ScenarioPreset, result: SandboxState["simulationResult"]): BodySystemState[] =>
  result.systemEffects.map((effect, index) => ({
    id: `${preset.id}-system-${index}`,
    label: effect.system,
    status: effect.status === "stable" ? "stable" : effect.status === "modulated" ? "modulated" : effect.status === "suppressed" ? "watch" : "stressed",
    intensity: effect.magnitude,
    bodyRegionIds: preset.affectedRegions,
    summary: effect.label
  }));

const recalculate = (state: SandboxState, preset: ScenarioPreset): SandboxState => {
  const simulationResult = buildSandboxSimulationResult({
    preset,
    parameters: state.parameters,
    selectedRegionId: state.selectedRegionId,
    predispositions: state.scenario.predispositions,
    perturbations: state.scenario.perturbations,
    interventions: state.scenario.interventions,
    pathwayTuning: state.pathwayTuning,
    importedMolecularEdges: state.importedMolecularEdges,
    activeNetworkPulseImport: state.networkPulseImports.find((imported) => imported.id === state.activeNetworkPulseImportId)
  });

  return {
    ...state,
    simulationResult,
    bodySystems: systemStatesFromResult(preset, simulationResult),
    moduleOutputs: state.moduleOutputs.map((output) => {
      if (output.moduleId === "body-sandbox") return { ...output, title: "Reasoning state", summary: simulationResult.summary };
      if (output.moduleId === "knowledge-graph") return { ...output, title: "Why lens", summary: `Active pathway deltas: ${Object.keys(simulationResult.pathwayDeltas).join(", ")}. Network imports: ${state.networkPulseImports.length}.` };
      if (output.moduleId === "body-atlas") return { ...output, title: "Where lens", summary: `${simulationResult.organEffects.length} organ/tissue relative effects and ${simulationResult.molecularEdges.length} molecular relationships.` };
      if (output.moduleId === "interventions") return { ...output, summary: `${state.scenario.interventions.length} selected exploratory modulators.` };
      if (output.moduleId === "neural-circuit") {
        return {
          ...output,
          title: "Activity lens",
          summary: state.neuralCircuitState.sentToBodyAt
            ? `${state.neuralCircuitState.summary} Sent to Body Sandbox.`
            : state.neuralCircuitState.summary
        };
      }
      return output;
    })
  };
};

const stateForPreset = (preset: ScenarioPreset): SandboxState => {
  const selectedRegionId = preset.affectedRegions[0];
  const base: SandboxState = {
    version: "1.5",
    activeScenarioId: preset.id,
    scenario: scenarioFromPreset(preset),
    presets: scenarioPresets,
    bodySystems: [],
    activeLayers: biologicalLayers,
    selectedRegionId,
    selectedMolecularEdgeId: undefined,
    focus: { kind: "region", id: selectedRegionId },
    parameters: { ...defaultParameters },
    pathwayTuning: {},
    importedMolecularEdges: [],
    molecularImportSnapshots: [],
    molecularImportError: undefined,
    networkPulseImports: [],
    activeNetworkPulseImportId: undefined,
    networkPulseImportError: undefined,
    neuralCircuitState: createNeuralCircuitState(preset.category === "neural" ? "parkinsonian" : "generic-motor"),
    simulationResult: {
      id: "pending",
      summary: "",
      observables: [],
      organEffects: [],
      systemEffects: [],
      phenotypeEffects: [],
      pathwayDeltas: {},
      molecularEdges: [],
      backtraceCandidates: [],
      generatedAt: now()
    },
    moduleOutputs: moduleOutputs(preset),
    updatedAt: now()
  };
  return recalculate(base, preset);
};

const defaultState = (): SandboxState => stateForPreset(scenarioPresets[0]);

const readState = () => {
  if (typeof window === "undefined") return defaultState();
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return defaultState();
  try {
    const parsed = JSON.parse(raw) as SandboxState;
    if (parsed.version !== "1.5" || !parsed.scenario || !parsed.parameters || !parsed.neuralCircuitState) return defaultState();
    const preset = scenarioPresets.find((item) => item.id === parsed.activeScenarioId) ?? scenarioPresets[0];
    return recalculate({ ...parsed, presets: scenarioPresets }, preset);
  } catch {
    return defaultState();
  }
};

interface SandboxContextValue {
  sandbox: SandboxState;
  activePreset: ScenarioPreset;
  selectPreset: (id: string) => void;
  toggleLayer: (layer: BiologicalLayer) => void;
  selectRegion: (id: BodyRegionId) => void;
  setBaseline: (baselineProfile: BaselineProfile) => void;
  togglePredisposition: (predisposition: Predisposition) => void;
  togglePerturbation: (perturbation: Perturbation) => void;
  toggleIntervention: (intervention: ScenarioIntervention) => void;
  setParameter: (id: ParameterControlId, value: number) => void;
  setParameters: (patch: Partial<Record<ParameterControlId, number>>) => void;
  setPathwayTuning: (pathway: string, value: number) => void;
  setPathwayTuningPatch: (patch: Record<string, number>) => void;
  applySandboxTuning: (patch: {
    parameters?: Partial<Record<ParameterControlId, number>>;
    pathwayTuning?: Record<string, number>;
  }) => void;
  selectMolecularEdge: (id: string) => void;
  importReactomeEdge: (input: Omit<FetchReactomeReactionEdgeInput, "scenarioId" | "fetcher">) => Promise<void>;
  removeImportedMolecularEdge: (id: MolecularEdge["id"]) => void;
  clearMolecularImportError: () => void;
  importNetworkPulseCsv: (input: Omit<NetworkPulseCsvInput, "scenarioId">) => void;
  selectNetworkPulseImport: (id: NetworkPulseImport["id"]) => void;
  removeNetworkPulseImport: (id: NetworkPulseImport["id"]) => void;
  clearNetworkPulseImportError: () => void;
  applyNeuralCircuitPreset: (id: NeuralCircuitPresetId) => void;
  updateNeuralStimulation: (patch: Partial<NeuralStimulationSettings>) => void;
  sendNeuralStateToBodySandbox: () => void;
  setModuleIncluded: (moduleId: ModuleOutput["moduleId"], includedInReport: boolean) => void;
  resetSandbox: () => void;
}

const SandboxContext = createContext<SandboxContextValue | null>(null);

export function SandboxProvider({ children }: { children: ReactNode }) {
  const [sandbox, setSandbox] = useState(readState);

  const persist = (next: SandboxState, preset = scenarioPresets.find((item) => item.id === next.activeScenarioId) ?? scenarioPresets[0]) => {
    const stamped = recalculate({ ...next, updatedAt: now(), presets: scenarioPresets }, preset);
    if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify(stamped));
    setSandbox(stamped);
  };

  const value = useMemo<SandboxContextValue>(() => {
    const activePreset = scenarioPresets.find((preset) => preset.id === sandbox.activeScenarioId) ?? scenarioPresets[0];

    return {
      sandbox,
      activePreset,
      selectPreset(id) {
        const preset = scenarioPresets.find((item) => item.id === id) ?? scenarioPresets[0];
        persist(stateForPreset(preset), preset);
      },
      toggleLayer(layer) {
        const activeLayers = sandbox.activeLayers.includes(layer)
          ? sandbox.activeLayers.filter((item) => item !== layer)
          : [...sandbox.activeLayers, layer];
        persist({ ...sandbox, activeLayers, scenario: { ...sandbox.scenario, activeLayers } });
      },
      selectRegion(id) {
        persist({ ...sandbox, selectedRegionId: id, focus: { kind: "region", id } });
      },
      setBaseline(baselineProfile) {
        persist({ ...sandbox, scenario: { ...sandbox.scenario, baselineProfile } });
      },
      togglePredisposition(predisposition) {
        const exists = sandbox.scenario.predispositions.some((item) => item.id === predisposition.id);
        persist({
          ...sandbox,
          scenario: {
            ...sandbox.scenario,
            predispositions: exists
              ? sandbox.scenario.predispositions.filter((item) => item.id !== predisposition.id)
              : [...sandbox.scenario.predispositions, predisposition]
          }
        });
      },
      togglePerturbation(perturbation) {
        const exists = sandbox.scenario.perturbations.some((item) => item.id === perturbation.id);
        persist({
          ...sandbox,
          scenario: {
            ...sandbox.scenario,
            perturbations: exists
              ? sandbox.scenario.perturbations.filter((item) => item.id !== perturbation.id)
              : [...sandbox.scenario.perturbations, perturbation]
          }
        });
      },
      toggleIntervention(intervention) {
        const exists = sandbox.scenario.interventions.some((item) => item.id === intervention.id);
        persist({
          ...sandbox,
          scenario: {
            ...sandbox.scenario,
            interventions: exists
              ? sandbox.scenario.interventions.filter((item) => item.id !== intervention.id)
              : [...sandbox.scenario.interventions, intervention]
          }
        });
      },
      setParameter(id, value) {
        persist({ ...sandbox, parameters: { ...sandbox.parameters, [id]: Math.min(1, Math.max(0, value)) } });
      },
      setParameters(patch) {
        const parameters = { ...sandbox.parameters };
        Object.entries(patch).forEach(([id, value]) => {
          if (typeof value === "number") parameters[id as ParameterControlId] = Math.min(1, Math.max(0, value));
        });
        persist({ ...sandbox, parameters });
      },
      setPathwayTuning(pathway, value) {
        persist({ ...sandbox, pathwayTuning: { ...sandbox.pathwayTuning, [pathway]: Math.min(1, Math.max(-1, value)) }, focus: { kind: "pathway", id: pathway } });
      },
      setPathwayTuningPatch(patch) {
        const pathwayTuning = { ...sandbox.pathwayTuning };
        Object.entries(patch).forEach(([pathway, value]) => {
          pathwayTuning[pathway] = Math.min(1, Math.max(-1, value));
        });
        const firstPathway = Object.keys(patch)[0];
        persist({
          ...sandbox,
          pathwayTuning,
          focus: firstPathway ? { kind: "pathway", id: firstPathway } : sandbox.focus
        });
      },
      applySandboxTuning(patch) {
        const parameters = { ...sandbox.parameters };
        Object.entries(patch.parameters ?? {}).forEach(([id, value]) => {
          if (typeof value === "number") parameters[id as ParameterControlId] = Math.min(1, Math.max(0, value));
        });
        const pathwayTuning = { ...sandbox.pathwayTuning };
        Object.entries(patch.pathwayTuning ?? {}).forEach(([pathway, value]) => {
          pathwayTuning[pathway] = Math.min(1, Math.max(-1, value));
        });
        const firstPathway = Object.keys(patch.pathwayTuning ?? {})[0];
        persist({
          ...sandbox,
          parameters,
          pathwayTuning,
          focus: firstPathway ? { kind: "pathway", id: firstPathway } : sandbox.focus
        });
      },
      selectMolecularEdge(id) {
        persist({ ...sandbox, selectedMolecularEdgeId: id, focus: { kind: "molecularEdge", id } });
      },
      async importReactomeEdge(input) {
        persist({ ...sandbox, molecularImportError: undefined });
        try {
          const { edge, snapshot } = await fetchReactomeReactionEdge({
            ...input,
            scenarioId: sandbox.activeScenarioId
          });
          persist({
            ...sandbox,
            importedMolecularEdges: upsertEdge(sandbox.importedMolecularEdges, edge),
            molecularImportSnapshots: upsertSnapshot(sandbox.molecularImportSnapshots, snapshot),
            molecularImportError: undefined,
            selectedMolecularEdgeId: edge.id,
            focus: { kind: "molecularEdge", id: edge.id }
          });
        } catch (error) {
          const snapshot = error instanceof MolecularImportError ? error.snapshot : undefined;
          persist({
            ...sandbox,
            molecularImportError: error instanceof Error ? error.message : "Reactome import failed.",
            molecularImportSnapshots: snapshot ? upsertSnapshot(sandbox.molecularImportSnapshots, snapshot) : sandbox.molecularImportSnapshots
          });
        }
      },
      removeImportedMolecularEdge(id) {
        persist({
          ...sandbox,
          importedMolecularEdges: sandbox.importedMolecularEdges.filter((edge) => edge.id !== id),
          selectedMolecularEdgeId: sandbox.selectedMolecularEdgeId === id ? undefined : sandbox.selectedMolecularEdgeId,
          focus: sandbox.focus.kind === "molecularEdge" && sandbox.focus.id === id ? { kind: "region", id: sandbox.selectedRegionId } : sandbox.focus
        });
      },
      clearMolecularImportError() {
        persist({ ...sandbox, molecularImportError: undefined });
      },
      importNetworkPulseCsv(input) {
        try {
          const imported = createNetworkPulseImport({ ...input, scenarioId: sandbox.activeScenarioId });
          persist({
            ...sandbox,
            networkPulseImports: upsertNetworkImport(sandbox.networkPulseImports, imported),
            activeNetworkPulseImportId: imported.id,
            networkPulseImportError: undefined
          });
        } catch (error) {
          persist({ ...sandbox, networkPulseImportError: error instanceof Error ? error.message : "Network Pulse import failed." });
        }
      },
      selectNetworkPulseImport(id) {
        persist({ ...sandbox, activeNetworkPulseImportId: id, networkPulseImportError: undefined });
      },
      removeNetworkPulseImport(id) {
        const nextImports = sandbox.networkPulseImports.filter((item) => item.id !== id);
        persist({
          ...sandbox,
          networkPulseImports: nextImports,
          activeNetworkPulseImportId: sandbox.activeNetworkPulseImportId === id ? nextImports.find((item) => item.scenarioId === sandbox.activeScenarioId)?.id : sandbox.activeNetworkPulseImportId
        });
      },
      clearNetworkPulseImportError() {
        persist({ ...sandbox, networkPulseImportError: undefined });
      },
      applyNeuralCircuitPreset(id) {
        persist({ ...sandbox, neuralCircuitState: applyNeuralPreset(id) });
      },
      updateNeuralStimulation(patch) {
        persist({ ...sandbox, neuralCircuitState: updateNeuralStimulationState(sandbox.neuralCircuitState, patch) });
      },
      sendNeuralStateToBodySandbox() {
        const bodyPatch = neuralStateToBodyPatch(sandbox.neuralCircuitState);
        const nextNeuralState = buildNeuralCircuitState(
          sandbox.neuralCircuitState.presetId,
          sandbox.neuralCircuitState.stimulation,
          now()
        );
        persist({
          ...sandbox,
          selectedRegionId: "brain",
          focus: { kind: "region", id: "brain" },
          parameters: { ...sandbox.parameters, ...bodyPatch.parameters },
          neuralCircuitState: nextNeuralState,
          moduleOutputs: sandbox.moduleOutputs.map((output) =>
            output.moduleId === "neural-circuit"
              ? { ...output, includedInReport: true, summary: `${nextNeuralState.summary} ${bodyPatch.summary}` }
              : output
          )
        });
      },
      setModuleIncluded(moduleId, includedInReport) {
        persist({
          ...sandbox,
          moduleOutputs: sandbox.moduleOutputs.map((output) =>
            output.moduleId === moduleId ? { ...output, includedInReport } : output
          )
        });
      },
      resetSandbox() {
        const next = defaultState();
        if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify(next));
        setSandbox(next);
      }
    };
  }, [sandbox]);

  return <SandboxContext.Provider value={value}>{children}</SandboxContext.Provider>;
}

export function useSandbox() {
  const value = useContext(SandboxContext);
  if (!value) throw new Error("useSandbox must be used inside SandboxProvider");
  return value;
}

function upsertEdge(edges: MolecularEdge[], edge: MolecularEdge) {
  return [...edges.filter((item) => item.id !== edge.id), edge];
}

function upsertSnapshot(snapshots: MolecularImportSnapshot[], snapshot: MolecularImportSnapshot) {
  return [snapshot, ...snapshots.filter((item) => item.id !== snapshot.id)].slice(0, 8);
}

function upsertNetworkImport(imports: NetworkPulseImport[], imported: NetworkPulseImport) {
  return [imported, ...imports.filter((item) => item.id !== imported.id)].slice(0, 8);
}
