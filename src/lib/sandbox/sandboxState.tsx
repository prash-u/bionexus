/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { biologicalLayers, scenarioPresets } from "@/data/scenarios/presets";
import type {
  BaselineProfile,
  BiologicalLayer,
  BodyRegionId,
  BodySystemState,
  ModuleOutput,
  Perturbation,
  Predisposition,
  SandboxState,
  Scenario,
  ScenarioIntervention,
  ScenarioPreset
} from "@/lib/ontology/types";

const storageKey = "bionexus:sandbox-state:v1.1";

const now = () => new Date().toISOString();

const systemStatesFromPreset = (preset: ScenarioPreset): BodySystemState[] =>
  preset.systemEffects.map((effect, index) => ({
    id: `${preset.id}-system-${index}`,
    label: effect.system,
    status: effect.status === "stable" ? "stable" : effect.status === "modulated" ? "modulated" : effect.status === "suppressed" ? "watch" : "stressed",
    intensity: effect.magnitude,
    bodyRegionIds: preset.affectedRegions,
    summary: effect.label
  }));

const scenarioFromPreset = (preset: ScenarioPreset): Scenario => ({
  id: `scenario-${preset.id}`,
  title: preset.title,
  presetId: preset.id,
  baselineProfile: preset.baselineProfile,
  predispositions: preset.predispositions,
  perturbations: preset.perturbations,
  interventions: preset.interventions.slice(0, 1),
  activeLayers: biologicalLayers,
  notes: "Editable scenario generated from preset."
});

const moduleOutputs = (preset: ScenarioPreset): ModuleOutput[] => [
  { moduleId: "body-sandbox", title: "Body sandbox state", summary: `${preset.shortTitle} active across ${preset.affectedSystems.join(", ")}.`, includedInReport: true },
  { moduleId: "knowledge-graph", title: "Pathway context", summary: `Active pathways: ${preset.keyPathways.join(", ")}.`, includedInReport: true },
  { moduleId: "neural-circuit", title: "Neural module", summary: preset.category === "neural" ? "Motor circuit module contributes DBS/modulation context." : "Neural module available as optional context.", includedInReport: preset.category === "neural" }
];

const defaultState = (): SandboxState => {
  const preset = scenarioPresets[0];
  return {
    version: "1.1",
    activeScenarioId: preset.id,
    scenario: scenarioFromPreset(preset),
    presets: scenarioPresets,
    bodySystems: systemStatesFromPreset(preset),
    activeLayers: biologicalLayers,
    selectedRegionId: preset.affectedRegions[0],
    moduleOutputs: moduleOutputs(preset),
    updatedAt: now()
  };
};

const readState = () => {
  if (typeof window === "undefined") return defaultState();
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return defaultState();
  try {
    const parsed = JSON.parse(raw) as SandboxState;
    if (parsed.version !== "1.1" || !parsed.scenario) return defaultState();
    return { ...parsed, presets: scenarioPresets };
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
  setModuleIncluded: (moduleId: ModuleOutput["moduleId"], includedInReport: boolean) => void;
  resetSandbox: () => void;
}

const SandboxContext = createContext<SandboxContextValue | null>(null);

export function SandboxProvider({ children }: { children: ReactNode }) {
  const [sandbox, setSandbox] = useState(readState);

  const persist = (next: SandboxState) => {
    const stamped = { ...next, updatedAt: now(), presets: scenarioPresets };
    window.localStorage.setItem(storageKey, JSON.stringify(stamped));
    setSandbox(stamped);
  };

  const value = useMemo<SandboxContextValue>(() => {
    const activePreset = scenarioPresets.find((preset) => preset.id === sandbox.activeScenarioId) ?? scenarioPresets[0];

    return {
      sandbox,
      activePreset,
      selectPreset(id) {
        const preset = scenarioPresets.find((item) => item.id === id) ?? scenarioPresets[0];
        persist({
          ...sandbox,
          activeScenarioId: preset.id,
          scenario: scenarioFromPreset(preset),
          bodySystems: systemStatesFromPreset(preset),
          selectedRegionId: preset.affectedRegions[0],
          moduleOutputs: moduleOutputs(preset)
        });
      },
      toggleLayer(layer) {
        const activeLayers = sandbox.activeLayers.includes(layer)
          ? sandbox.activeLayers.filter((item) => item !== layer)
          : [...sandbox.activeLayers, layer];
        persist({ ...sandbox, activeLayers, scenario: { ...sandbox.scenario, activeLayers } });
      },
      selectRegion(id) {
        persist({ ...sandbox, selectedRegionId: id });
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
        window.localStorage.setItem(storageKey, JSON.stringify(next));
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
