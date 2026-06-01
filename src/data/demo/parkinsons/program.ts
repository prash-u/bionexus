import type { DiseaseProgram } from "@/lib/ontology/types";
import { intendedUseStatement } from "@/lib/safety/intendedUse";
import { parkinsonsEntities, parkinsonsEvidence, parkinsonsPublications, parkinsonsSimulationStates } from "@/data/demo/parkinsons/entities";
import { parkinsonsRelationships } from "@/data/demo/parkinsons/relationships";

export const parkinsonsProgram: DiseaseProgram = {
  id: "parkinsons-v0",
  name: "Parkinson's / Parkinsonism",
  description: "A complete v0.1 vertical slice connecting genes, proteins, pathways, neural systems, phenotypes, interventions, and reports.",
  verticalSlice: "Parkinson's disease / parkinsonism",
  entityIds: parkinsonsEntities.map((entity) => entity.id),
  relationshipIds: parkinsonsRelationships.map((relationship) => relationship.id),
  simulationStateIds: parkinsonsSimulationStates.map((state) => state.id),
  defaultReasoningTrail: [
    "SNCA and GBA1 introduce molecular biology context.",
    "Alpha-synuclein and GCase connect protein function to proteostasis.",
    "Proteostasis and dopamine signaling bridge to dopaminergic neurons.",
    "Neural circuit changes are explored through basal ganglia and motor system nodes.",
    "Tremor and bradykinesia are represented as educational phenotype endpoints.",
    "Interventions are perturbations for simulation and communication, not recommendations."
  ],
  safetyStatement: intendedUseStatement
};

export const parkinsonsDemo = {
  program: parkinsonsProgram,
  entities: parkinsonsEntities,
  relationships: parkinsonsRelationships,
  evidence: parkinsonsEvidence,
  publications: parkinsonsPublications,
  simulations: parkinsonsSimulationStates
};
