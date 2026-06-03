export type EntityType =
  | "gene"
  | "protein"
  | "pathway"
  | "cellType"
  | "tissue"
  | "organ"
  | "bodySystem"
  | "phenotype"
  | "disease"
  | "intervention";

export type RelationshipType =
  | "participates_in"
  | "encoded_by"
  | "affects"
  | "impacts"
  | "modulates"
  | "associated_with"
  | "supports"
  | "expressed_in"
  | "manifests_as"
  | "targets";

export type UserMode =
  | "student"
  | "educator"
  | "researcher"
  | "biotechDemo"
  | "clinicianExploratory";

export type ComplexityLevel = "basic" | "intermediate" | "advanced" | "expert";

export type BiologicalLayer =
  | "genes"
  | "proteins"
  | "pathways"
  | "cells"
  | "tissues"
  | "organs"
  | "systems"
  | "phenotypes"
  | "interventions";

export type ScenarioCategory =
  | "neural"
  | "metabolic"
  | "ocular"
  | "immune"
  | "cardiovascular"
  | "mitochondrial"
  | "environmental"
  | "custom";

export type BodyRegionId =
  | "brain"
  | "eye"
  | "thyroid"
  | "heart"
  | "lungs"
  | "liver"
  | "stomach"
  | "pancreas"
  | "intestine"
  | "gut"
  | "spleen"
  | "adipose"
  | "kidney"
  | "muscle"
  | "boneMarrow"
  | "skin"
  | "immune"
  | "peripheralNerves";

export interface Evidence {
  id: string;
  label: string;
  summary: string;
  evidenceType: "curated_demo" | "review" | "mechanistic" | "observational" | "hypothesis";
  publicationIds: string[];
  confidence: number;
}

export interface EvidenceItem extends Evidence {
  scenarioContext?: string;
  assumptions?: string[];
}

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue?: string;
  url?: string;
  notes?: string;
}

export interface BioEntity {
  id: string;
  type: EntityType;
  name: string;
  shortName?: string;
  layer: string;
  description: string;
  tags: string[];
  safetyNote?: string;
}

export interface Gene extends BioEntity {
  type: "gene";
  symbol: string;
  chromosome?: string;
}

export interface Protein extends BioEntity {
  type: "protein";
  encodedByGeneId: string;
}

export interface Pathway extends BioEntity {
  type: "pathway";
  pathwayClass: string;
}

export interface CellType extends BioEntity {
  type: "cellType";
  lineage?: string;
}

export interface Tissue extends BioEntity {
  type: "tissue";
}

export interface Organ extends BioEntity {
  type: "organ";
}

export interface BodySystem extends BioEntity {
  type: "bodySystem";
}

export interface Phenotype extends BioEntity {
  type: "phenotype";
}

export interface Disease extends BioEntity {
  type: "disease";
  demoScope: string;
}

export type InterventionCategory =
  | "Drug"
  | "DBS"
  | "Gene Therapy"
  | "Exercise"
  | "Diet"
  | "Sleep"
  | "Neural Interface"
  | "Prosthetic"
  | "Experimental";

export interface Intervention extends BioEntity {
  type: "intervention";
  category: InterventionCategory;
  framing: "exploratory" | "educational" | "simulation";
}

export type AnyBioEntity =
  | Gene
  | Protein
  | Pathway
  | CellType
  | Tissue
  | Organ
  | BodySystem
  | Phenotype
  | Disease
  | Intervention;

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  label: string;
  confidence: number;
  evidenceIds: string[];
  notes: string;
}

export interface EffectTrace {
  sourceEntityId: string;
  relationshipId?: string;
  confidence: number;
  evidenceIds: string[];
  scenarioContext: string;
  assumptions: string[];
}

export interface GeneSignal extends EffectTrace {
  symbol: string;
  direction: "up" | "down" | "variant" | "baseline" | "unknown";
  magnitude: number;
}

export interface ProteinSignal extends EffectTrace {
  protein: string;
  direction: "increased" | "decreased" | "misfolded" | "baseline" | "unknown";
  magnitude: number;
}

export interface PathwaySignal extends EffectTrace {
  pathway: string;
  direction: "activated" | "suppressed" | "dysregulated" | "rescued" | "baseline";
  magnitude: number;
}

export interface CellTypeEffect extends EffectTrace {
  cellType: string;
  effect: string;
  magnitude: number;
}

export interface TissueEffect extends EffectTrace {
  tissue: string;
  effect: string;
  magnitude: number;
}

export interface OrganEffect extends EffectTrace {
  organ: BodyRegionId;
  label: string;
  direction: "stress" | "activation" | "suppression" | "support" | "baseline";
  magnitude: number;
}

export interface SystemEffect extends EffectTrace {
  system: string;
  label: string;
  status: "stable" | "stressed" | "activated" | "suppressed" | "modulated";
  magnitude: number;
}

export interface PhenotypeEffect extends EffectTrace {
  phenotype: string;
  label: string;
  direction: "emerges" | "reduces" | "modulates" | "baseline";
  magnitude: number;
}

export interface BaselineProfile {
  id: string;
  label: string;
  description: string;
  assumptions: string[];
}

export interface Predisposition {
  id: string;
  label: string;
  targetLayer: BiologicalLayer;
  description: string;
  confidence: number;
}

export interface Perturbation {
  id: string;
  label: string;
  targetLayer: BiologicalLayer;
  direction: "increase" | "decrease" | "damage" | "inhibit" | "stimulate" | "rescue" | "modulate";
  description: string;
  magnitude: number;
}

export interface ScenarioIntervention {
  id: string;
  label: string;
  category: InterventionCategory | "CRISPR / Genetic Engineering" | "Environmental Modifier";
  targetLayer: BiologicalLayer;
  affectedPathwayOrSystem: string;
  expectedDirection: "increase" | "decrease" | "stabilise" | "modulate" | "uncertain";
  uncertainty: number;
  safetyLanguage: string;
  relatedScenarioIds: string[];
}

export type ParameterControlId =
  | "inflammation"
  | "insulinSensitivity"
  | "oxidativeStress"
  | "mitochondrialFunction"
  | "metabolicLoad"
  | "neuralSynchrony"
  | "immuneActivation"
  | "retinalStress";

export interface ParameterControlDefinition {
  id: ParameterControlId;
  label: string;
  value: number;
  lowLabel: string;
  highLabel: string;
  group?: "neural" | "immune" | "metabolic" | "ocular" | "cellular";
  description?: string;
  realWorldContext?: string;
  lowDescriptor?: string;
  highDescriptor?: string;
  inverse?: boolean;
}

export interface ObservableSeries {
  id: string;
  label: string;
  unit: string;
  baseline: number;
  current: number;
  delta: number;
  trend: number[];
}

export interface MolecularSource {
  database: "Reactome" | "WikiPathways" | "ChEBI" | "GO" | "Curated";
  id: string;
  label: string;
  url: string;
}

export interface MolecularPayload {
  molecule: string;
  moleculeClass: "small_molecule" | "protein" | "peptide_hormone" | "cytokine" | "neurotransmitter" | "gas" | "nucleic_acid" | "electrical_modulation";
  direction: "source_to_target" | "target_to_source" | "bidirectional" | "modulatory";
  ratio: string;
  ratioBasis: "database_stoichiometry" | "reaction_equivalent" | "physiological_relative" | "modulatory_signal" | "curated_placeholder";
  provenance: "database_exact" | "source_backed" | "curated_approximation";
  unit: string;
  sourceCompartment: string;
  targetCompartment: string;
  sources: MolecularSource[];
  confidence: number;
  assumptions: string[];
}

export interface MolecularImportSpec {
  id: string;
  source: MolecularSource["database"];
  endpoint: string;
  description: string;
  supportedPayloads: Array<"reaction_participants" | "physical_entities" | "gpml_interactions" | "molecule_identity">;
  offlinePolicy: "optional_live_fetch" | "curated_snapshot_required";
}

export interface MolecularImportSnapshot {
  id: string;
  source: MolecularSource["database"];
  query: string;
  label: string;
  status: "ready" | "failed";
  importedAt: string;
  edgeIds: string[];
  message?: string;
}

export interface MolecularEdge {
  id: string;
  scenarioIds: string[];
  sourceRegionId: BodyRegionId;
  targetRegionId: BodyRegionId;
  label: string;
  edgeKind: "transport" | "reaction" | "endocrine" | "neural" | "immune" | "gene_delivery" | "modulation";
  pathwayContext: string;
  payloads: MolecularPayload[];
  baseFlux: number;
  scenarioModifier: number;
  notes: string;
}

export interface NetworkGeneSignal {
  symbol: string;
  name: string;
  log2FC: number;
  pAdj: number;
  direction: "up" | "down";
}

export interface NetworkInteractionEdge {
  source: string;
  target: string;
  score: number;
}

export interface NetworkPathwaySignal {
  name: string;
  source: "KEGG" | "Reactome" | "GO:BP" | "Curated";
  pValue: number;
  genes: string[];
}

export interface NetworkPulseImport {
  id: string;
  label: string;
  source: string;
  importedAt: string;
  scenarioId: string;
  genes: NetworkGeneSignal[];
  edges: NetworkInteractionEdge[];
  pathways: NetworkPathwaySignal[];
  summary: string;
}

export type NeuralCircuitPresetId =
  | "parkinsonian"
  | "generic-motor"
  | "underpowered"
  | "therapeutic-window"
  | "overdriven";

export type NeuralSandboxMode = "tremor" | "stabilized";

export interface NeuralStimulationSettings {
  amplitude: number;
  frequency: number;
  pulseWidth: number;
  radius: number;
  noiseSeverity: number;
  enabled: boolean;
  mode: NeuralSandboxMode;
  electrodeId: string;
}

export interface NeuralCircuitMetrics {
  firingRate: number;
  synchrony: number;
  tremorIndex: number;
  stimulationDose: number;
  overloadRisk: number;
  suppressionScore: number;
  networkEntropy: number;
}

export interface NeuralCircuitAnalysis {
  stateLabel: "underpowered" | "therapeutic" | "overdriven" | "suppressed";
  effectiveness: number;
  suppressionPotential: number;
  overloadDrive: number;
  parameterEffects: {
    label: string;
    status: "low" | "good" | "high";
    detail: string;
  }[];
  teachingPoints: string[];
}

export interface NeuralCircuitState {
  presetId: NeuralCircuitPresetId;
  label: string;
  summary: string;
  stimulation: NeuralStimulationSettings;
  metrics: NeuralCircuitMetrics;
  analysis: NeuralCircuitAnalysis;
  sentToBodyAt?: string;
  updatedAt: string;
}

export interface BacktraceCandidate {
  id: string;
  geneSymbol: string;
  geneName: string;
  direction: "up" | "down" | "variant" | "dysregulated" | "unknown";
  linkedPathways: string[];
  linkedBodyRegions: BodyRegionId[];
  linkedPhenotypes: string[];
  score: number;
  confidence: number;
  evidenceIds: string[];
  reasoning: string;
  assumptions: string[];
}

export interface SandboxFocus {
  kind: "region" | "pathway" | "gene" | "intervention" | "molecularEdge" | null;
  id: string | null;
}

export interface SandboxSimulationResult {
  id: string;
  summary: string;
  observables: ObservableSeries[];
  organEffects: OrganEffect[];
  systemEffects: SystemEffect[];
  phenotypeEffects: PhenotypeEffect[];
  pathwayDeltas: Record<string, number>;
  molecularEdges: MolecularEdge[];
  backtraceCandidates: BacktraceCandidate[];
  generatedAt: string;
}

export interface BodySystemState {
  id: string;
  label: string;
  status: "stable" | "watch" | "stressed" | "modulated";
  intensity: number;
  bodyRegionIds: BodyRegionId[];
  summary: string;
}

export interface ReasoningTrail {
  id: string;
  steps: string[];
}

export interface ModuleOutput {
  moduleId: "body-sandbox" | "body-atlas" | "neural-circuit" | "knowledge-graph" | "interventions";
  title: string;
  summary: string;
  includedInReport: boolean;
}

export interface ScenarioPreset {
  id: string;
  title: string;
  shortTitle: string;
  category: ScenarioCategory;
  description: string;
  affectedSystems: string[];
  affectedRegions: BodyRegionId[];
  keyGenes: string[];
  keyPathways: string[];
  predispositions: Predisposition[];
  perturbations: Perturbation[];
  interventions: ScenarioIntervention[];
  baselineProfile: BaselineProfile;
  reasoningTrail: ReasoningTrail;
  organEffects: OrganEffect[];
  systemEffects: SystemEffect[];
  phenotypeEffects: PhenotypeEffect[];
  limitations: string[];
}

export interface Scenario {
  id: string;
  title: string;
  presetId?: string;
  baselineProfile: BaselineProfile;
  predispositions: Predisposition[];
  perturbations: Perturbation[];
  interventions: ScenarioIntervention[];
  activeLayers: BiologicalLayer[];
  notes: string;
}

export interface DiseaseProgram {
  id: string;
  name: string;
  description: string;
  verticalSlice: string;
  entityIds: string[];
  relationshipIds: string[];
  simulationStateIds: string[];
  defaultReasoningTrail: string[];
  safetyStatement: string;
}

export interface SimulationState {
  id: string;
  label: string;
  description: string;
  stateKind: "baseline" | "disease_model" | "perturbation";
  parameters: Record<string, number | string>;
  disclaimer: string;
}

export interface SandboxState {
  version: "1.5";
  activeScenarioId: string;
  scenario: Scenario;
  presets: ScenarioPreset[];
  bodySystems: BodySystemState[];
  activeLayers: BiologicalLayer[];
  selectedRegionId: BodyRegionId;
  selectedMolecularEdgeId?: string;
  focus: SandboxFocus;
  parameters: Record<ParameterControlId, number>;
  pathwayTuning: Record<string, number>;
  importedMolecularEdges: MolecularEdge[];
  molecularImportSnapshots: MolecularImportSnapshot[];
  molecularImportError?: string;
  networkPulseImports: NetworkPulseImport[];
  activeNetworkPulseImportId?: string;
  networkPulseImportError?: string;
  neuralCircuitState: NeuralCircuitState;
  simulationResult: SandboxSimulationResult;
  moduleOutputs: ModuleOutput[];
  updatedAt: string;
}

export interface ReportPayload {
  id: string;
  mode: "learner" | "educatorSummary" | "researchBrief" | "investorDemo" | "scenarioExport";
  title: string;
  markdown: string;
  generatedFromProgramId: string;
}

export interface ReasoningHypothesis {
  id: string;
  title: string;
  question: string;
  rationale: string;
  linkedEntityIds: string[];
  linkedRelationshipIds: string[];
  status: "draft" | "active" | "ready_for_report";
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceSimulationSettings {
  tremorAmplitude: number;
  dopamineTone: number;
  proteostasisStress: number;
  dbsModulation: number;
}

export interface BioWorkspaceState {
  version: "1.0";
  programId: string;
  entities: AnyBioEntity[];
  relationships: Relationship[];
  hypotheses: ReasoningHypothesis[];
  reasoningTrail: string[];
  selectedEntityId: string;
  selectedRelationshipId?: string;
  simulationSettings: WorkspaceSimulationSettings;
  updatedAt: string;
}
