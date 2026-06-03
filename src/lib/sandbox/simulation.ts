import { scenarioBacktraceSeeds } from "@/data/scenarios/backtraceKnowledge";
import { molecularEdges } from "@/data/scenarios/molecularEdges";
import type {
  BacktraceCandidate,
  BodyRegionId,
  MolecularEdge,
  NetworkPulseImport,
  ObservableSeries,
  OrganEffect,
  ParameterControlDefinition,
  ParameterControlId,
  Perturbation,
  Predisposition,
  SandboxSimulationResult,
  ScenarioIntervention,
  ScenarioPreset,
  SystemEffect
} from "@/lib/ontology/types";
import { rankNetworkGenes } from "@/lib/network/networkPulseImport";

export const parameterControls: ParameterControlDefinition[] = [
  {
    id: "neuralSynchrony",
    label: "Neural Synchrony",
    value: 0.42,
    lowLabel: "Stable",
    highLabel: "Oscillatory",
    group: "neural",
    description: "Adjusts the coherence of neural firing and motor-circuit signalling in the sandbox.",
    realWorldContext: "Exploratory analogues include EEG rhythm bands, tremor frequency observations and motor-circuit physiology models.",
    lowDescriptor: "Stable signalling",
    highDescriptor: "High synchrony / oscillatory"
  },
  {
    id: "inflammation",
    label: "Inflammatory Tone",
    value: 0.28,
    lowLabel: "Low",
    highLabel: "High",
    group: "immune",
    description: "Sets the background inflammatory load that can influence tissues, vessels, immune state and metabolism.",
    realWorldContext: "Real-world context might include CRP, IL-6, TNF-alpha or other inflammatory-marker panels.",
    lowDescriptor: "Low systemic tone",
    highDescriptor: "High cytokine tone"
  },
  {
    id: "immuneActivation",
    label: "Immune Activation",
    value: 0.34,
    lowLabel: "Quiet",
    highLabel: "Activated",
    group: "immune",
    description: "Controls immune-system activation and circulating immune signalling in the model.",
    realWorldContext: "Exploratory references include blood counts, cytokine panels, immune-cell activation markers and infection/inflammation context.",
    lowDescriptor: "Quiet surveillance",
    highDescriptor: "Activated immune state"
  },
  {
    id: "insulinSensitivity",
    label: "Insulin Sensitivity",
    value: 0.72,
    lowLabel: "Resistant",
    highLabel: "Sensitive",
    group: "metabolic",
    description: "Adjusts how responsive liver, muscle and adipose tissues are to insulin signalling.",
    realWorldContext: "Real-world tests can include fasting glucose/insulin, HOMA-IR, HbA1c or an oral glucose tolerance test.",
    lowDescriptor: "Low sensitivity / insulin resistant",
    highDescriptor: "High sensitivity / glucose uptake",
    inverse: true
  },
  {
    id: "metabolicLoad",
    label: "Metabolic Load",
    value: 0.32,
    lowLabel: "Low",
    highLabel: "High",
    group: "metabolic",
    description: "Represents carbohydrate/lipid handling load across liver, pancreas, adipose tissue and skeletal muscle.",
    realWorldContext: "Contextual tests might include HbA1c, lipid panel, fasting glucose, OGTT or continuous glucose trends.",
    lowDescriptor: "Low energy load",
    highDescriptor: "High glucose/lipid load"
  },
  {
    id: "mitochondrialFunction",
    label: "Mitochondrial Reserve",
    value: 0.74,
    lowLabel: "Low",
    highLabel: "High",
    group: "cellular",
    description: "Adjusts cellular energy reserve and stress resilience across tissues.",
    realWorldContext: "Research context can include lactate, exercise tolerance, oxygen-use assays or mitochondrial respiration studies.",
    lowDescriptor: "Low reserve",
    highDescriptor: "High reserve",
    inverse: true
  },
  {
    id: "oxidativeStress",
    label: "Oxidative Stress",
    value: 0.3,
    lowLabel: "Low",
    highLabel: "High",
    group: "cellular",
    description: "Controls reactive-stress load affecting neural, retinal, cardiovascular and metabolic tissues.",
    realWorldContext: "Research context can include oxidative-damage markers, antioxidant capacity assays or mitochondrial stress models.",
    lowDescriptor: "Low stress",
    highDescriptor: "High reactive load"
  },
  {
    id: "retinalStress",
    label: "Retinal Stress",
    value: 0.24,
    lowLabel: "Low",
    highLabel: "High",
    group: "ocular",
    description: "Adjusts visual-system and photoreceptor stress used in ocular scenario exploration.",
    realWorldContext: "Exploratory context might include OCT, visual-field testing, ERG or genetic retinal-disease mechanism studies.",
    lowDescriptor: "Low photoreceptor stress",
    highDescriptor: "High retinal stress"
  }
];

export const defaultParameters = Object.fromEntries(parameterControls.map((control) => [control.id, control.value])) as Record<ParameterControlId, number>;

const observableBaselines: Record<string, { label: string; unit: string; baseline: number }> = {
  inflammation: { label: "Inflammatory Tone", unit: "a.u.", baseline: 0.22 },
  glucosePressure: { label: "Glucose Regulation Load", unit: "a.u.", baseline: 0.24 },
  insulinSignal: { label: "Insulin Signal Integrity", unit: "a.u.", baseline: 0.74 },
  mitochondrialStress: { label: "Mitochondrial Stress", unit: "a.u.", baseline: 0.28 },
  neuralOscillation: { label: "Neural Oscillation Load", unit: "a.u.", baseline: 0.3 },
  retinalSignal: { label: "Retinal Signal Integrity", unit: "a.u.", baseline: 0.78 },
  systemStability: { label: "System Stability", unit: "a.u.", baseline: 0.82 }
};

type BuildInput = {
  preset: ScenarioPreset;
  parameters: Record<ParameterControlId, number>;
  selectedRegionId: BodyRegionId;
  predispositions: Predisposition[];
  perturbations: Perturbation[];
  interventions: ScenarioIntervention[];
  pathwayTuning: Record<string, number>;
  importedMolecularEdges?: MolecularEdge[];
  activeNetworkPulseImport?: NetworkPulseImport;
};

export function buildSandboxSimulationResult(input: BuildInput): SandboxSimulationResult {
  const pressure = systemPressure(input.parameters);
  const interventionRelief = input.interventions.reduce((sum, intervention) => sum + (100 - intervention.uncertainty) / 700, 0);
  const organEffects = computeOrganEffects(input, pressure, interventionRelief);
  const systemEffects = computeSystemEffects(input.preset.systemEffects, pressure, interventionRelief);
  const phenotypeEffects = input.preset.phenotypeEffects.map((effect) => ({
    ...effect,
    magnitude: clamp(Math.round(effect.magnitude + pressure * 18 - interventionRelief * 16), 0, 100)
  }));
  const pathwayDeltas = computePathwayDeltas(input, pressure, interventionRelief);
  const edges = activeMolecularEdges(input.preset.id, pressure, input.parameters, input.interventions, input.importedMolecularEdges ?? []);
  const backtraceCandidates = computeBacktrace(input, pressure, organEffects, pathwayDeltas);
  const observables = computeObservables(input.parameters, input.preset.category, pressure, interventionRelief);
  const leadOrgan = organEffects.reduce((best, effect) => (effect.magnitude > best.magnitude ? effect : best), organEffects[0] ?? fallbackOrgan(input.selectedRegionId));
  const leadGene = backtraceCandidates[0];

  return {
    id: `sim-${input.preset.id}`,
    summary: input.preset.id === "healthy-baseline"
      ? "Healthy Baseline shows a stable reference body state with no dominant disruption selected."
      : `${input.preset.shortTitle} shows the strongest relative effect at ${leadOrgan.label} and highlights ${leadGene?.geneSymbol ?? "candidate genes"} as one possible upstream factor under the current sandbox assumptions.`,
    observables,
    organEffects,
    systemEffects,
    phenotypeEffects,
    pathwayDeltas,
    molecularEdges: edges,
    backtraceCandidates,
    generatedAt: new Date().toISOString()
  };
}

function computeOrganEffects(input: BuildInput, pressure: number, interventionRelief: number) {
  const effectMap = new Map<BodyRegionId, OrganEffect>();
  input.preset.organEffects.forEach((effect) => effectMap.set(effect.organ, { ...effect }));

  const overlays: Partial<Record<BodyRegionId, number>> = {
    immune: input.parameters.immuneActivation * 36 + input.parameters.inflammation * 24,
    liver: input.parameters.metabolicLoad * 24 + input.parameters.inflammation * 14 + (1 - input.parameters.insulinSensitivity) * 18,
    pancreas: (1 - input.parameters.insulinSensitivity) * 26 + input.parameters.metabolicLoad * 15,
    muscle: (1 - input.parameters.insulinSensitivity) * 24 + input.parameters.neuralSynchrony * 12,
    adipose: input.parameters.metabolicLoad * 26 + input.parameters.inflammation * 8,
    brain: input.parameters.neuralSynchrony * 28 + input.parameters.oxidativeStress * 12,
    eye: input.parameters.retinalStress * 44,
    lungs: input.parameters.inflammation * 14 + input.parameters.immuneActivation * 12,
    heart: input.parameters.oxidativeStress * 12 + (1 - input.parameters.mitochondrialFunction) * 20,
    kidney: input.parameters.oxidativeStress * 12 + input.parameters.metabolicLoad * 8
  };

  Object.entries(overlays).forEach(([regionId, value]) => {
    const id = regionId as BodyRegionId;
    const original = effectMap.get(id);
    const magnitude = clamp(Math.round((original?.magnitude ?? 18) + value + pressure * 10 - interventionRelief * 20), 0, 100);
    effectMap.set(id, {
      ...(original ?? fallbackOrgan(id)),
      direction: magnitude > 66 ? "stress" : magnitude > 44 ? "activation" : original?.direction ?? "baseline",
      magnitude,
      label: original?.label ?? "Sandbox model activity"
    });
  });

  return Array.from(effectMap.values()).sort((a, b) => b.magnitude - a.magnitude);
}

function computeSystemEffects(effects: SystemEffect[], pressure: number, interventionRelief: number) {
  return effects.map((effect) => {
    const magnitude = clamp(Math.round(effect.magnitude + pressure * 12 - interventionRelief * 16), 0, 100);
    return {
      ...effect,
      magnitude,
      status: magnitude > 70 ? "stressed" as const : magnitude > 48 ? effect.status : "modulated" as const
    };
  });
}

function computePathwayDeltas(input: BuildInput, pressure: number, interventionRelief: number) {
  const deltas: Record<string, number> = {};
  input.preset.keyPathways.forEach((pathway, index) => {
    const tuning = input.pathwayTuning[pathway] ?? 0;
    const perturbation = input.perturbations.reduce((sum, item) => sum + (item.targetLayer === "pathways" ? item.magnitude / 180 : 0), 0);
    const intervention = input.interventions.reduce((sum, item) => sum + (item.targetLayer === "pathways" ? (100 - item.uncertainty) / 260 : 0), 0);
    deltas[pathway] = round(clamp(pressure * 0.38 + perturbation + tuning - intervention * 0.28 - interventionRelief * 0.08 - index * 0.03, -1, 1));
  });
  input.activeNetworkPulseImport?.pathways.forEach((pathway) => {
    const signal = pathway.genes.length / Math.max(1, input.activeNetworkPulseImport?.genes.length ?? 1);
    const pWeight = pathway.pValue > 0 ? Math.min(1, -Math.log10(pathway.pValue) / 10) : 1;
    deltas[pathway.name] = round(clamp((deltas[pathway.name] ?? 0) + signal * 0.34 + pWeight * 0.18 + pressure * 0.08, -1, 1));
  });
  return deltas;
}

function activeMolecularEdges(
  scenarioId: string,
  pressure: number,
  parameters: Record<ParameterControlId, number>,
  interventions: ScenarioIntervention[],
  importedMolecularEdges: MolecularEdge[]
): MolecularEdge[] {
  const selected = dedupeEdges([
    ...molecularEdges.filter((edge) => edge.scenarioIds.includes(scenarioId)),
    ...importedMolecularEdges.filter((edge) => edge.scenarioIds.includes(scenarioId))
  ]);
  const interventionModulation = interventions.reduce((sum, item) => sum + (item.expectedDirection === "stabilise" ? -0.08 : item.expectedDirection === "increase" ? 0.08 : 0.02), 0);
  return selected.map((edge) => ({
    ...edge,
    scenarioModifier: round(clamp(edge.scenarioModifier + pressure * 0.16 + interventionModulation + parameterEdgeBias(edge.edgeKind, parameters), -1, 1))
  }));
}

function dedupeEdges(edges: MolecularEdge[]) {
  const byId = new Map<string, MolecularEdge>();
  edges.forEach((edge) => byId.set(edge.id, edge));
  return Array.from(byId.values());
}

function computeBacktrace(input: BuildInput, pressure: number, organEffects: OrganEffect[], pathwayDeltas: Record<string, number>): BacktraceCandidate[] {
  const selectedOrgan = organEffects.find((effect) => effect.organ === input.selectedRegionId);
  const activePathways = new Set(Object.entries(pathwayDeltas).filter(([, delta]) => delta > 0.2).map(([name]) => name));
  const scoredCandidates = [
    ...networkPulseBacktrace(input, pressure, activePathways),
    ...scenarioBacktraceSeeds(input.preset, input.selectedRegionId)
  ]
    .map((candidate) => {
      const regionBoost = candidate.linkedBodyRegions.some((region) => organEffects.slice(0, 4).some((effect) => effect.organ === region)) ? 0.08 : 0;
      const pathwayBoost = candidate.linkedPathways.some((pathway) => activePathways.has(pathway) || input.preset.keyPathways.some((name) => name.includes(pathway) || pathway.includes(name))) ? 0.06 : 0;
      const selectedBoost = selectedOrgan && candidate.linkedBodyRegions.includes(selectedOrgan.organ) ? 0.08 : 0;
      const score = clamp(candidate.score + pressure * 0.16 + regionBoost + pathwayBoost + selectedBoost, 0, 1);
      return { ...candidate, score: round(score), confidence: round(clamp(candidate.confidence + pathwayBoost / 2, 0, 1)) };
    });

  return mergeBacktraceCandidates(scoredCandidates)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

function mergeBacktraceCandidates(candidates: BacktraceCandidate[]) {
  const byGene = new Map<string, BacktraceCandidate>();
  candidates.forEach((candidate) => {
    const existing = byGene.get(candidate.geneSymbol);
    if (!existing) {
      byGene.set(candidate.geneSymbol, candidate);
      return;
    }
    byGene.set(candidate.geneSymbol, {
      ...existing,
      direction: existing.direction === "unknown" ? candidate.direction : existing.direction,
      linkedPathways: unique([...existing.linkedPathways, ...candidate.linkedPathways]),
      linkedBodyRegions: unique([...existing.linkedBodyRegions, ...candidate.linkedBodyRegions]),
      linkedPhenotypes: unique([...existing.linkedPhenotypes, ...candidate.linkedPhenotypes]),
      score: Math.max(existing.score, candidate.score),
      confidence: round(clamp(Math.max(existing.confidence, candidate.confidence) + 0.04, 0, 1)),
      evidenceIds: unique([...existing.evidenceIds, ...candidate.evidenceIds]),
      reasoning: existing.evidenceIds.includes("network-pulse-import") ? existing.reasoning : `${existing.reasoning} ${candidate.reasoning}`,
      assumptions: unique([...existing.assumptions, ...candidate.assumptions])
    });
  });
  return Array.from(byGene.values());
}

function networkPulseBacktrace(input: BuildInput, pressure: number, activePathways: Set<string>): BacktraceCandidate[] {
  if (!input.activeNetworkPulseImport) return [];
  const rankedGenes = rankNetworkGenes(input.activeNetworkPulseImport).slice(0, 8);
  return rankedGenes.map((gene): BacktraceCandidate => {
    const linkedPathways = input.activeNetworkPulseImport?.pathways
      .filter((pathway) => pathway.genes.includes(gene.symbol))
      .map((pathway) => pathway.name) ?? [];
    const pathwayBoost = linkedPathways.some((pathway) => activePathways.has(pathway)) ? 0.08 : 0;
    const score = clamp(gene.score + pressure * 0.08 + pathwayBoost, 0, 1);
    return {
      id: `network-${input.activeNetworkPulseImport?.id}-${gene.symbol}`,
      geneSymbol: gene.symbol,
      geneName: gene.name,
      direction: gene.direction,
      linkedPathways: linkedPathways.length ? linkedPathways : input.preset.keyPathways.slice(0, 2),
      linkedBodyRegions: inferredRegions(input.preset.category),
      linkedPhenotypes: input.preset.phenotypeEffects.map((effect) => effect.phenotype),
      score: round(score),
      confidence: round(clamp(0.52 + Math.min(gene.degree, 5) * 0.045 + Math.min(gene.pathwayCount, 4) * 0.035, 0, 0.88)),
      evidenceIds: ["network-pulse-import"],
      reasoning: `${gene.symbol} enters the backtrace from imported Network Pulse-style evidence: log2FC ${gene.log2FC.toFixed(2)}, degree ${gene.degree}, ${gene.pathwayCount} linked pathway${gene.pathwayCount === 1 ? "" : "s"}.`,
      assumptions: [
        "Imported signal is user-provided exploratory data",
        "Network ranking uses fold-change magnitude, retained edge degree and pathway membership",
        "No diagnostic or patient-specific inference"
      ]
    };
  });
}

function inferredRegions(category: ScenarioPreset["category"]): BodyRegionId[] {
  if (category === "neural") return ["brain", "peripheralNerves", "muscle"];
  if (category === "metabolic") return ["pancreas", "liver", "muscle", "adipose"];
  if (category === "ocular") return ["eye", "brain"];
  if (category === "immune") return ["immune", "spleen", "boneMarrow", "liver"];
  if (category === "mitochondrial") return ["muscle", "heart", "brain"];
  if (category === "cardiovascular") return ["heart", "kidney", "lungs"];
  return ["brain", "liver", "immune"];
}

function computeObservables(parameters: Record<ParameterControlId, number>, category: ScenarioPreset["category"], pressure: number, interventionRelief: number): ObservableSeries[] {
  const targets: Record<string, number> = {
    inflammation: parameters.inflammation * 0.5 + parameters.immuneActivation * 0.5,
    glucosePressure: parameters.metabolicLoad * 0.44 + (1 - parameters.insulinSensitivity) * 0.46 + parameters.inflammation * 0.1,
    insulinSignal: parameters.insulinSensitivity + interventionRelief * 0.16,
    mitochondrialStress: parameters.oxidativeStress * 0.45 + (1 - parameters.mitochondrialFunction) * 0.55,
    neuralOscillation: parameters.neuralSynchrony + (category === "neural" ? 0.16 : 0),
    retinalSignal: 1 - clamp(parameters.retinalStress + (category === "ocular" ? 0.18 : 0), 0, 0.92),
    systemStability: 1 - clamp(pressure * 0.82 - interventionRelief * 0.28, 0, 0.92)
  };

  return Object.entries(observableBaselines).map(([id, baseline]) => buildSeries(id, baseline.label, baseline.unit, baseline.baseline, clamp(targets[id] ?? baseline.baseline, 0, 1)));
}

function buildSeries(id: string, label: string, unit: string, baseline: number, current: number): ObservableSeries {
  const delta = current - baseline;
  const trend = Array.from({ length: 9 }, (_, index) => {
    const t = index / 8;
    const eased = 1 - (1 - t) ** 2;
    const wave = Math.sin(index * 1.15 + baseline * 5) * 0.014;
    return Math.round(clamp(baseline + delta * eased + wave, 0, 1) * 100);
  });
  return { id, label, unit, baseline, current: round(current), delta: round(delta), trend };
}

function parameterEdgeBias(edgeKind: MolecularEdge["edgeKind"], parameters: Record<ParameterControlId, number>) {
  if (edgeKind === "immune") return parameters.immuneActivation * 0.12 + parameters.inflammation * 0.08;
  if (edgeKind === "endocrine") return (1 - parameters.insulinSensitivity) * 0.08 + parameters.metabolicLoad * 0.06;
  if (edgeKind === "neural") return parameters.neuralSynchrony * 0.12;
  if (edgeKind === "reaction") return parameters.retinalStress * 0.08 + parameters.oxidativeStress * 0.04;
  return parameters.oxidativeStress * 0.04;
}

function systemPressure(parameters: Record<ParameterControlId, number>) {
  return clamp(
    parameters.inflammation * 0.14 +
      (1 - parameters.insulinSensitivity) * 0.14 +
      parameters.oxidativeStress * 0.13 +
      (1 - parameters.mitochondrialFunction) * 0.13 +
      parameters.metabolicLoad * 0.14 +
      parameters.neuralSynchrony * 0.12 +
      parameters.immuneActivation * 0.12 +
      parameters.retinalStress * 0.08,
    0,
    1
  );
}

function fallbackOrgan(id: BodyRegionId): OrganEffect {
  return {
    organ: id,
    label: "Sandbox model activity",
    direction: "baseline",
    magnitude: 18,
    sourceEntityId: `region-${id}`,
    confidence: 0.48,
    evidenceIds: ["sandbox-computed"],
    scenarioContext: "Computed from sandbox parameters",
    assumptions: ["Exploratory state computation", "No patient-specific inference"]
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}
