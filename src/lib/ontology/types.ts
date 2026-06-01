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

export interface Evidence {
  id: string;
  label: string;
  summary: string;
  evidenceType: "curated_demo" | "review" | "mechanistic" | "observational" | "hypothesis";
  publicationIds: string[];
  confidence: number;
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

export interface ReportPayload {
  id: string;
  mode: "learner" | "researchBrief" | "executiveSummary" | "investorDemo";
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
